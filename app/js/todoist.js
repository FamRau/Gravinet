// ══ TODOIST INTEGRATION ══
//
// Bidirektionale Synchronisierung: Gravinet ↔ Todoist
//
// Verknüpfung:  task.todoistId  speichert die Todoist-Task-ID.
//
// Sync-Regeln (pro Aufgabe):
//   ┌─ Hat todoistId ─────────────────────────────────────────────────────────
//   │  Remote AKTIV  → Pull: Titel + Datum von Todoist übernehmen
//   │                  Push: lokale Änderungen (Titel, Datum) an Todoist
//   │                  Push: lokal erledigt → in Todoist schließen
//   │  Remote FEHLT  → in Todoist erledigt/gelöscht → lokal als done markieren
//   │
//   ├─ Kein todoistId, lokal OFFEN → als neuen Task in Todoist anlegen
//   │
//   └─ Todoist-Task NICHT in Gravinet → in gewähltes Projekt/Kontakt importieren
//      (nur wenn Projekt gewählt & Import-Kontakt in todoistSettings gesetzt)
//
// Konflikte: Todoist gewinnt bei Titel/Datum; Gravinet gewinnt bei Erledigt-Status.

const TODOIST_API = 'https://api.todoist.com/api/v1';

let _todoistIntervalHandle = null;

// ── Settings helpers ──────────────────────────────────────────────────────────

function saveTodoistSettings() {
  const unEl = document.getElementById('todoist-username');
  if (unEl) todoistSettings.username = unEl.value.trim();
  saveNow();
}

async function saveTodoistToken() {
  const tokEl = document.getElementById('todoist-token');
  if (!tokEl) return;
  const token = tokEl.value.trim();
  const res = await window.electronAPI?.todoist.setToken(token);
  const statusEl = document.getElementById('todoist-token-status');
  if (statusEl) {
    statusEl.textContent = res?.ok ? t('todoist_token_saved') : (res?.error || '');
    statusEl.style.color = res?.ok ? 'var(--accent3)' : 'var(--danger)';
    setTimeout(() => { if (statusEl) statusEl.textContent = ''; }, 3000);
  }
}

async function loadTodoistProjects() {
  const sel = document.getElementById('todoist-project'); if (!sel) return;
  sel.innerHTML = `<option value="">${t('todoist_project_loading')}</option>`;
  try {
    const res  = await _todoistFetch('/projects');
    // API v1 returns { results: [...] } or plain array
    const list = Array.isArray(res) ? res : (res.results || res.projects || []);
    sel.innerHTML = `<option value="">${t('todoist_project_inbox')}</option>` +
      list.map(p => `<option value="${p.id}"${p.id === todoistSettings.projectId ? ' selected' : ''}>${p.name}</option>`).join('');
    if (todoistSettings.projectId) sel.value = todoistSettings.projectId;
  } catch (err) {
    sel.innerHTML = `<option value="">${t('todoist_sync_err')}: ${err.message}</option>`;
  }
}

function setTodoistImportTarget() {
  todoistSettings.importProjId = document.getElementById('todoist-import-proj')?.value || '';
  todoistSettings.importShId   = document.getElementById('todoist-import-sh')?.value  || '';
  saveNow();
}

function _fillTodoistImportSelects() {
  const projSel = document.getElementById('todoist-import-proj');
  const shSel   = document.getElementById('todoist-import-sh');
  if (!projSel || !shSel) return;

  // Projekte befüllen
  projSel.innerHTML = `<option value="">${t('todoist_import_none')}</option>` +
    projects.map(p => `<option value="${p.id}"${String(p.id) === String(todoistSettings.importProjId) ? ' selected' : ''}>${esc(p.name)}</option>`).join('');

  // Kontakte für gewähltes Projekt befüllen
  const selProjId = parseInt(projSel.value);
  const selProj   = projects.find(p => p.id === selProjId);
  shSel.innerHTML = `<option value="">—</option>` + (selProj?.items || []).map(item => {
    const sh = stakeholders.find(s => s.id === item.shId);
    if (!sh) return '';
    return `<option value="${sh.id}"${String(sh.id) === String(todoistSettings.importShId) ? ' selected' : ''}>${esc(shFullName(sh))}</option>`;
  }).join('');
}

function setTodoistProject(id, name) {
  todoistSettings.projectId   = id;
  todoistSettings.projectName = id ? name : '';
  saveNow();
}

function setTodoistSyncMode(mode) {
  todoistSettings.syncMode = mode;
  saveNow();
  syncSettingsPage();
  _applyTodoistSchedule();
}

// ── Schedule management ───────────────────────────────────────────────────────

function _applyTodoistSchedule() {
  if (_todoistIntervalHandle) { clearInterval(_todoistIntervalHandle); _todoistIntervalHandle = null; }
  const ms = todoistSettings.syncMode === '30min' ? 30 * 60 * 1000
           : todoistSettings.syncMode === '1hour' ? 60 * 60 * 1000
           : 0;
  if (ms > 0) _todoistIntervalHandle = setInterval(todoistSyncNow, ms);
}

async function startTodoistSync() {
  _applyTodoistSchedule();
  if (todoistSettings.syncMode !== 'none') await todoistSyncNow();
}

// ── API helpers ───────────────────────────────────────────────────────────────

async function _todoistFetch(path, options = {}) {
  const token = await window.electronAPI?.todoist.getToken();
  if (!token) throw new Error('Kein API Token');
  const res = await fetch(TODOIST_API + path, {
    ...options,
    headers: {
      'Authorization': 'Bearer ' + token,
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
  });
  if (!res.ok) {
    const msg = await res.text().catch(() => res.statusText);
    throw new Error(`Todoist ${res.status}: ${msg}`);
  }
  if (res.status === 204) return null;
  return res.json();
}

async function _createRemoteTask(task, shName, projName) {
  const autoLabel = task.autoBirthday ? '🎂 ' : task.autoContact ? '🔄 ' : '';
  const body = {
    content:     autoLabel + (shName ? `${shName}: ${task.title}` : task.title),
    description: [projName, task.notes || ''].filter(Boolean).join(' · '),
  };
  if (task.date)                    body.due_date   = task.date;
  if (todoistSettings.projectId)    body.project_id = todoistSettings.projectId;
  return _todoistFetch('/tasks', { method: 'POST', body: JSON.stringify(body) });
}

async function _updateRemoteTask(todoistId, fields) {
  if (!Object.keys(fields).length) return;
  return _todoistFetch('/tasks/' + todoistId, {
    method: 'POST',
    body: JSON.stringify(fields),
  });
}

// ── Main sync ─────────────────────────────────────────────────────────────────

function _setNavSyncStatus(state) {
  const dot = document.getElementById('sync-dot');
  const lbl = document.getElementById('sync-label');
  const nav = document.getElementById('todoist-nav-sync');
  if (!dot) return;
  dot.className = 'sync-dot ' + state;
  if (lbl) lbl.textContent = state === 'synced'  ? t('sync_ok')
                            : state === 'pending' ? t('sync_pending')
                            : state === 'error'   ? t('sync_error')
                            : '—';
  if (nav) nav.title = lbl?.textContent || 'Todoist';
}

async function todoistSyncNow() {
  const statusEl = document.getElementById('todoist-sync-status');
  const setStatus = (msg, color = 'var(--muted)') => {
    if (statusEl) { statusEl.textContent = msg; statusEl.style.color = color; }
  };
  _setNavSyncStatus('pending');
  setStatus(t('todoist_syncing'));

  try {
    const token = await window.electronAPI?.todoist.getToken();
    if (!token) { setStatus(appLang === 'en' ? 'No API token set.' : 'Kein API Token gesetzt.', 'var(--danger)'); return; }

    // Fetch all active tasks (optionally filtered by project)
    const params = todoistSettings.projectId ? `?project_id=${todoistSettings.projectId}` : '';
    const tasksRes    = await _todoistFetch('/tasks' + params);
    // API v1 may return { results: [...] } or plain array
    const remoteTasks = Array.isArray(tasksRes) ? tasksRes : (tasksRes.results || tasksRes.tasks || []);
    const remoteById  = Object.fromEntries(remoteTasks.map(r => [r.id, r]));

    // Collect all todoistIds already known in Gravinet
    const knownIds = new Set();
    for (const proj of projects)
      for (const item of proj.items)
        for (const task of (item.aufgaben || []))
          if (task.todoistId) knownIds.add(task.todoistId);

    let pushed = 0, pulled = 0;

    // ── Phase 1: sync all local tasks ──────────────────────────────────────────
    for (const proj of projects) {
      for (const item of proj.items) {
        const sh     = stakeholders.find(s => s.id === item.shId);
        const shName = sh ? shFullName(sh) : '';

        for (const task of (item.aufgaben || [])) {

          if (task.todoistId) {
            // ── Already linked ──────────────────────────────────────────────
            const remote = remoteById[task.todoistId];

            if (remote) {
              // Remote is ACTIVE
              const remoteDate = remote.due?.date || '';

              // PULL: Todoist gewinnt bei Titel und Datum
              const remoteTitle = remote.content.replace(/^[🎂🔄] /, '').replace(/^[^:]+: /, '');
              if (remoteTitle !== task.title) {
                task.title = remoteTitle;
                pulled++;
              }
              if (remoteDate !== (task.date || '')) {
                task.date = remoteDate;
                pulled++;
              }

              // PUSH: lokale Erledigung → Todoist schließen
              if (task.done) {
                await _todoistFetch('/tasks/' + task.todoistId + '/close', { method: 'POST' });
                pushed++;
              } else {
                // PUSH: lokale Änderungen (Notiz, kein Titel/Datum da Todoist gewinnt)
                const descNew = [shName, proj.name, task.notes || ''].filter(Boolean).join(' · ');
                if (descNew !== (remote.description || '')) {
                  await _updateRemoteTask(task.todoistId, { description: descNew });
                  pushed++;
                }
              }

            } else {
              // Remote FEHLT → in Todoist erledigt oder gelöscht
              if (!task.done) {
                task.done = true;
                pulled++;
              }
            }

          } else if (!task.done) {
            // ── Neu in Gravinet → in Todoist anlegen ───────────────────────
            const created = await _createRemoteTask(task, shName, proj.name);
            task.todoistId = created.id;
            pushed++;
          }
        }
      }
    }

    // ── Phase 2: neue Todoist-Tasks → in Gravinet importieren ─────────────────
    const newRemote = remoteTasks.filter(r => !knownIds.has(r.id));
    if (newRemote.length > 0 && todoistSettings.importShId && todoistSettings.importProjId) {
      const impProj = projects.find(p => p.id === parseInt(todoistSettings.importProjId));
      const impItem = impProj?.items.find(i => i.shId === parseInt(todoistSettings.importShId));
      if (impItem) {
        if (!impItem.aufgaben) impItem.aufgaben = [];
        for (const r of newRemote) {
          impItem.aufgaben.push({
            id:        nextAufgabeId++,
            title:     r.content.replace(/^[🎂🔄] /, '').replace(/^[^:]+: /, ''),
            date:      r.due?.date || '',
            reminder:  '',
            interval:  null,
            tag:       '',
            notes:     r.description || '',
            done:      false,
            todoistId: r.id,
          });
          pulled++;
        }
      }
    }

    saveNow();
    renderAufgabenView();

    const msg = `${t('todoist_sync_ok')} ↑${pushed} ↓${pulled}`;
    setStatus(msg, 'var(--accent3)');
    _setNavSyncStatus('synced');
    setTimeout(() => setStatus(''), 6000);

  } catch (err) {
    setStatus(t('todoist_sync_err') + ': ' + err.message, 'var(--danger)');
    _setNavSyncStatus('error');
  }
}
