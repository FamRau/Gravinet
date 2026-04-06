// ══ STORAGE (file-based via Electron IPC) ══
//
// Data layout on disk (inside app.getPath('userData')):
//   workspace.json          – orgName, activeProjectId, counters, projectIds
//   contacts.json           – stakeholders array
//   projects/<id>.json      – one file per project (name, desc, items, plan)
//
// Migration: on first load we check for legacy localStorage data (gravinet_v1)
// and convert it automatically to the new file format.

// ── helpers ──────────────────────────────────────────────────────────────────

function _buildWorkspace() {
  return {
    version:            2,
    orgName,
    activeProjectId,
    projectIds:         projects.map(p => p.id),
    nextStakeholderId,
    nextProjectId,
    nextPlanId,
    nextAufgabeId,
    contactWarningDays,
    appLang,
    savedAt:            new Date().toISOString()
  };
}

// ── low-level write functions (return Promises) ───────────────────────────────

async function _writeWorkspace() {
  return window.electronAPI.data.writeWorkspace(_buildWorkspace());
}

async function _writeContacts() {
  return window.electronAPI.data.writeContacts(stakeholders);
}

async function _writeProject(projId) {
  const proj = projects.find(p => p.id === projId);
  if (!proj) return { ok: true };
  return window.electronAPI.data.writeProject(projId, proj);
}

// ── public API ────────────────────────────────────────────────────────────────

// Fire-and-forget save: writes workspace + contacts + active project.
// Callers do not need to await this.
function saveNow() {
  setSaveStatus('pending');
  const activeProjId = activeProjectId;
  Promise.all([
    _writeWorkspace(),
    _writeContacts(),
    activeProjId ? _writeProject(activeProjId) : Promise.resolve({ ok: true })
  ]).then(results => {
    const ok = results.every(r => r && r.ok !== false);
    setSaveStatus(ok ? 'saved' : 'error');
  }).catch(() => setSaveStatus('error'));
}

// Save a specific project file (used after creating / renaming a project).
async function saveProjectFile(projId) {
  return _writeProject(projId);
}

// Delete a project file (called before removing it from state).
async function deleteProjectFile(projId) {
  return window.electronAPI.data.deleteProject(projId);
}

// Export all data as a single JSON file (backwards-compatible with v1 format).
function exportJSON() {
  const data = JSON.stringify({
    version:          2,
    orgName,
    activeProjectId,
    nextStakeholderId,
    nextProjectId,
    nextPlanId,
    stakeholders,
    projects,
    savedAt:          new Date().toISOString()
  }, null, 2);
  const blob = new Blob([data], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'gravinet-backup-' + new Date().toISOString().slice(0, 10) + '.json';
  a.click();
}

// Import from a JSON backup (v1 or v2 format).
function importJSON(event) {
  const file = event.target.files[0]; if (!file) return;
  const reader = new FileReader();
  reader.onload = async e => {
    try {
      const parsed = JSON.parse(e.target.result);
      _applyParsedData(parsed);
      await Promise.all([
        _writeWorkspace(),
        _writeContacts(),
        ...projects.map(p => _writeProject(p.id))
      ]);
      renderAll();
      setSaveStatus('saved');
    } catch (err) {
      alert(t('alert_import_error') + err.message);
    }
  };
  reader.readAsText(file);
  event.target.value = '';
}

// ── CSV Export ───────────────────────────────────────────────────────────────

function exportCSV() {
  const cols = ['vorname','nachname','rolle','email','tel','geburtstag','notizen'];
  const header = cols.join(';');
  const rows = stakeholders.map(sh =>
    cols.map(c => {
      const v = String(sh[c] || '');
      return v.includes(';') || v.includes('"') || v.includes('\n')
        ? '"' + v.replace(/"/g, '""') + '"'
        : v;
    }).join(';')
  );
  const csv = '\uFEFF' + [header, ...rows].join('\r\n'); // BOM for Excel
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'gravinet-stakeholders-' + new Date().toISOString().slice(0, 10) + '.csv';
  a.click();
}

// ── CSV Import ────────────────────────────────────────────────────────────────

function importCSV(event) {
  const file = event.target.files[0]; if (!file) return;
  const reader = new FileReader();
  reader.onload = e => {
    try {
      const text = e.target.result.replace(/^\uFEFF/, ''); // strip BOM
      const lines = text.split(/\r?\n/).filter(l => l.trim());
      if (lines.length < 2) throw new Error('Empty file');

      const header = _csvSplit(lines[0]).map(h => h.trim().toLowerCase());
      const idx = f => header.indexOf(f);

      const parsed = lines.slice(1).map(line => {
        const cells = _csvSplit(line);
        // Support both old 'name' column and new 'vorname'/'nachname'
        const rawName = (cells[idx('name')] || '').trim();
        const vorname = (cells[idx('vorname')] || '').trim() || rawName.split(' ')[0] || '';
        const nachname = (cells[idx('nachname')] || '').trim() || rawName.split(' ').slice(1).join(' ') || '';
        return {
          vorname,
          nachname,
          rolle:      (cells[idx('rolle')]      || '').trim(),
          email:      (cells[idx('email')]      || '').trim(),
          tel:        (cells[idx('tel')]        || '').trim(),
          geburtstag: (cells[idx('geburtstag')] || '').trim(),
          notizen:    (cells[idx('notizen')]    || '').trim(),
        };
      }).filter(r => r.vorname || r.nachname);

      let added = 0, updated = 0;
      parsed.forEach(row => {
        const rowFullName = (row.vorname + ' ' + row.nachname).trim().toLowerCase();
        // Match by email (if set) or full name
        const existing = stakeholders.find(sh =>
          (row.email && sh.email && sh.email.toLowerCase() === row.email.toLowerCase()) ||
          shFullName(sh).toLowerCase() === rowFullName
        );
        if (existing) {
          existing.vorname    = row.vorname    || existing.vorname;
          existing.nachname   = row.nachname   || existing.nachname;
          existing.rolle      = row.rolle      || existing.rolle;
          existing.email      = row.email      || existing.email;
          existing.tel        = row.tel        || existing.tel;
          existing.geburtstag = row.geburtstag || existing.geburtstag;
          existing.notizen    = row.notizen    || existing.notizen;
          updated++;
        } else {
          stakeholders.push({ id: nextStakeholderId++, journal: [], ...row });
          added++;
        }
      });

      _writeContacts();
      _writeWorkspace();
      renderAll();
      setSaveStatus('saved');
      alert(
        appLang === 'en'
          ? `CSV imported: ${added} added, ${updated} updated.`
          : `CSV importiert: ${added} hinzugefügt, ${updated} aktualisiert.`
      );
    } catch (err) {
      alert(t('alert_import_error') + err.message);
    }
  };
  reader.readAsText(file, 'UTF-8');
  event.target.value = '';
}

function _csvSplit(line) {
  const result = [];
  let cur = '', inQ = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (inQ) {
      if (ch === '"' && line[i+1] === '"') { cur += '"'; i++; }
      else if (ch === '"') inQ = false;
      else cur += ch;
    } else {
      if (ch === '"') inQ = true;
      else if (ch === ';') { result.push(cur); cur = ''; }
      else cur += ch;
    }
  }
  result.push(cur);
  return result;
}

// ── load ─────────────────────────────────────────────────────────────────────

async function loadData() {
  try {
    // 1. Try to read workspace from file
    const ws = await window.electronAPI.data.readWorkspace();

    if (ws && ws.version === 2) {
      // Load contacts
      const rawContacts = await window.electronAPI.data.readContacts();
      stakeholders = (rawContacts || []).map(s => ({
        email: '', tel: '', geburtstag: '', journal: [], ...s
      }));
      stakeholders = stakeholders.map(s => {
        if (!s.vorname && !s.nachname && s.name) {
          const parts = s.name.split(' ');
          return { ...s, vorname: parts[0] || '', nachname: parts.slice(1).join(' ') || '' };
        }
        return s;
      });

      // Load each project file
      const loadedProjects = await Promise.all(
        (ws.projectIds || []).map(id => window.electronAPI.data.readProject(id))
      );
      projects = loadedProjects
        .filter(Boolean)
        .map(proj => ({
          ...proj,
          items: (proj.items || []).map(item => ({ aufgaben: [], ...item })),
          plan:  (proj.plan || JSON.parse(JSON.stringify(DEFAULT_PLAN)))
                   .map(y => ({ ...y, items: y.items.map(i => ({ done: false, ...i })) }))
        }));

      if (!projects.length) {
        _initDefaultProject();
      }

      activeProjectId   = ws.activeProjectId || projects[0]?.id || '';
      orgName           = ws.orgName || orgName;
      nextStakeholderId  = ws.nextStakeholderId || (Math.max(0, ...(stakeholders.length ? stakeholders.map(s => s.id) : [0])) + 1);
      nextProjectId      = ws.nextProjectId || (projects.length + 2);
      nextPlanId         = Math.max(ws.nextPlanId || 0, 6);
      nextAufgabeId      = ws.nextAufgabeId || 1;
      contactWarningDays = ws.contactWarningDays || 90;
      appLang            = ws.appLang || 'de';
      return;
    }

    // 2. No v2 files → try legacy localStorage migration
    const raw = localStorage.getItem(LEGACY_STORAGE_KEY);
    if (raw) {
      _applyParsedData(JSON.parse(raw));
      // Persist to files immediately
      await Promise.all([
        _writeWorkspace(),
        _writeContacts(),
        ...projects.map(p => _writeProject(p.id))
      ]);
      console.log('[Gravinet] Migrated data from localStorage to files.');
      return;
    }

    // 3. Fresh start
    _initDefaults();
    await Promise.all([
      _writeWorkspace(),
      _writeContacts(),
      _writeProject(projects[0].id)
    ]);

  } catch (err) {
    console.error('[Gravinet] loadData error:', err);
    _initDefaults();
  }
}

// ── private helpers ──────────────────────────────────────────────────────────

function _initDefaultProject() {
  projects = [{
    id:    'proj1',
    name:  'Mein erstes Projekt',
    desc:  '',
    items: [],
    plan:  JSON.parse(JSON.stringify(DEFAULT_PLAN))
  }];
  activeProjectId = 'proj1';
  nextProjectId   = 2;
}

function _initDefaults() {
  stakeholders      = [];
  _initDefaultProject();
  orgName           = 'Meine Organisation';
  nextStakeholderId = 1;
  nextPlanId        = 6;
}

// Apply a parsed JSON blob (v1 or v2 format) to global state.
function _applyParsedData(p) {
  if (p.projects) {
    // v1 multi-project or v2 combined export
    stakeholders = (p.stakeholders || []).map(s => ({
      email: '', tel: '', geburtstag: '', journal: [], ...s
    }));
    stakeholders = stakeholders.map(s => {
      if (!s.vorname && !s.nachname && s.name) {
        const parts = s.name.split(' ');
        return { ...s, vorname: parts[0] || '', nachname: parts.slice(1).join(' ') || '' };
      }
      return s;
    });
    projects = (p.projects || []).map(proj => {
      const plan = (proj.plan || JSON.parse(JSON.stringify(DEFAULT_PLAN)))
        .map(y => ({ ...y, items: y.items.map(i => ({ done: false, ...i })) }));
      return { ...proj, items: (proj.items || []).map(item => ({ aufgaben: [], ...item })), plan };
    });
    if (!projects.length) _initDefaultProject();
    activeProjectId   = p.activeProjectId || projects[0]?.id || '';
    orgName           = p.orgName || orgName;
    nextStakeholderId = p.nextStakeholderId || (Math.max(0, ...(stakeholders.length ? stakeholders.map(s => s.id) : [0])) + 1);
    nextProjectId     = p.nextProjectId || (projects.length + 2);
    nextPlanId        = Math.max(p.nextPlanId || 0, 6);
  } else {
    // Very old single-project format
    const old = (p.stakeholders || []).map(s => ({
      email: '', tel: '', geburtstag: '', journal: [], ...s
    }));
    stakeholders = old.map(s => {
      const parts = (s.name || '').split(' ');
      return {
        id: s.id, name: s.name,
        vorname: parts[0] || '', nachname: parts.slice(1).join(' ') || '',
        rolle: s.rolle,
        email: s.email || '', tel: s.tel || '',
        geburtstag: s.geburtstag || '', journal: s.journal || []
      };
    });
    const items = old.map(s => ({
      shId: s.id,
      gruppe:    s.gruppe    || 'intern',
      haltung:   s.haltung   || 'neutral',
      einfluss:  s.einfluss  || 5,
      interesse: s.interesse || 5,
      ziel:      s.ziel      || '',
      massnahmen: s.massnahmen || [],
      aufgaben: []
    }));
    const plan = (p.plan || JSON.parse(JSON.stringify(DEFAULT_PLAN)))
      .map(y => ({ ...y, items: y.items.map(i => ({ done: false, ...i })) }));
    projects          = [{ id: 'proj1', name: 'Stakeholder-Management', desc: '', items, plan }];
    activeProjectId   = 'proj1';
    orgName           = p.orgName || orgName;
    nextStakeholderId = p.nextId || (Math.max(0, ...(stakeholders.length ? stakeholders.map(s => s.id) : [0])) + 1);
    nextProjectId     = 2;
    nextPlanId        = 6;
  }
}
