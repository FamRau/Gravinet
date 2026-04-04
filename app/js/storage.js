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
      alert('Importfehler: ' + err.message);
    }
  };
  reader.readAsText(file);
  event.target.value = '';
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

      // Load each project file
      const loadedProjects = await Promise.all(
        (ws.projectIds || []).map(id => window.electronAPI.data.readProject(id))
      );
      projects = loadedProjects
        .filter(Boolean)
        .map(proj => ({
          ...proj,
          items: proj.items || [],
          plan:  (proj.plan || JSON.parse(JSON.stringify(DEFAULT_PLAN)))
                   .map(y => ({ ...y, items: y.items.map(i => ({ done: false, ...i })) }))
        }));

      if (!projects.length) {
        _initDefaultProject();
      }

      activeProjectId   = ws.activeProjectId || projects[0]?.id || '';
      orgName           = ws.orgName || orgName;
      nextStakeholderId = ws.nextStakeholderId || (Math.max(0, ...stakeholders.map(s => s.id)) + 1);
      nextProjectId     = ws.nextProjectId || (projects.length + 2);
      nextPlanId        = Math.max(ws.nextPlanId || 0, 6);
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
    projects = (p.projects || []).map(proj => {
      const plan = (proj.plan || JSON.parse(JSON.stringify(DEFAULT_PLAN)))
        .map(y => ({ ...y, items: y.items.map(i => ({ done: false, ...i })) }));
      return { ...proj, items: proj.items || [], plan };
    });
    if (!projects.length) _initDefaultProject();
    activeProjectId   = p.activeProjectId || projects[0]?.id || '';
    orgName           = p.orgName || orgName;
    nextStakeholderId = p.nextStakeholderId || (Math.max(0, ...stakeholders.map(s => s.id)) + 1);
    nextProjectId     = p.nextProjectId || (projects.length + 2);
    nextPlanId        = Math.max(p.nextPlanId || 0, 6);
  } else {
    // Very old single-project format
    const old = (p.stakeholders || []).map(s => ({
      email: '', tel: '', geburtstag: '', journal: [], ...s
    }));
    stakeholders = old.map(s => ({
      id: s.id, name: s.name, rolle: s.rolle,
      email: s.email || '', tel: s.tel || '',
      geburtstag: s.geburtstag || '', journal: s.journal || []
    }));
    const items = old.map(s => ({
      shId: s.id,
      gruppe:    s.gruppe    || 'intern',
      haltung:   s.haltung   || 'neutral',
      einfluss:  s.einfluss  || 5,
      interesse: s.interesse || 5,
      ziel:      s.ziel      || '',
      massnahmen: s.massnahmen || []
    }));
    const plan = (p.plan || JSON.parse(JSON.stringify(DEFAULT_PLAN)))
      .map(y => ({ ...y, items: y.items.map(i => ({ done: false, ...i })) }));
    projects          = [{ id: 'proj1', name: 'Stakeholder-Management', desc: '', items, plan }];
    activeProjectId   = 'proj1';
    orgName           = p.orgName || orgName;
    nextStakeholderId = p.nextId || (Math.max(0, ...stakeholders.map(s => s.id)) + 1);
    nextProjectId     = 2;
    nextPlanId        = 6;
  }
}
