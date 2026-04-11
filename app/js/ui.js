// ══ UI HELPERS: navigation, status, org name, project selector ══

// ── Save status ───────────────────────────────────────────────────────────────

function setSaveStatus(state) {
  const dot = document.getElementById('save-dot');
  const lbl = document.getElementById('save-label');
  if (!dot || !lbl) return;
  if (state === 'saved')        { dot.className = 'save-dot'; lbl.textContent = t('save_saved'); }
  else if (state === 'pending') { dot.className = 'save-dot pending'; lbl.textContent = t('save_saving'); }
  else { dot.className = 'save-dot'; dot.style.background = 'var(--danger)'; lbl.textContent = t('save_error'); }
}

// ── Org name ──────────────────────────────────────────────────────────────────

function renderOrgName() {
  const sub = document.getElementById('org-subtitle');
  if (!sub) return;
  sub.innerHTML = `<span id="org-name-display">${esc(orgName)}</span><button class="org-edit-btn" onclick="startEditOrg()" title="${t('org_edit_title')}">✏</button>`;
}

function startEditOrg() {
  const sub = document.getElementById('org-subtitle');
  sub.innerHTML = `<input id="org-name-input" class="org-name-input" value="${esc(orgName)}"
    onkeydown="if(event.key==='Enter')saveOrgName();if(event.key==='Escape')renderOrgName()">
    <button class="org-save-btn" onclick="saveOrgName()">✓</button>`;
  const inp = document.getElementById('org-name-input');
  inp.focus(); inp.select();
}

function saveOrgName() {
  const inp = document.getElementById('org-name-input');
  if (inp) orgName = inp.value.trim() || orgName;
  renderOrgName();
  saveNow();
}

// ── Project selector ──────────────────────────────────────────────────────────

const PROJECT_TABS = new Set(['liste','matrix','journalsuche','plan']);

function updateHeaderProject(tabName) {
  const lbl      = document.getElementById('header-project-label');
  const dropdown = document.getElementById('nav-proj-dropdown');
  if (!lbl) return;
  if (!tabName || !PROJECT_TABS.has(tabName)) {
    lbl.textContent = t('tab_project'); // "Alle Projekte"
    if (dropdown) dropdown.style.display = 'none';
  } else {
    lbl.textContent = t('label_current_project') + ' ';
    if (dropdown) dropdown.style.display = '';
  }
}

function renderProjectSelector() {
  const label = document.getElementById('nav-project-name');
  const menu  = document.getElementById('nav-proj-menu');
  if (!label || !menu) return;
  label.textContent = getActiveProject()?.name || '';
  menu.innerHTML = projects.map(p =>
    `<button class="nav-proj-option${p.id === activeProjectId ? ' active' : ''}"
       onclick="switchProject('${p.id}');closeNavProjMenu()">${esc(p.name)}</button>`
  ).join('');
}

function toggleNavProjMenu() {
  document.getElementById('nav-proj-menu').classList.toggle('open');
}

function closeNavProjMenu() {
  document.getElementById('nav-proj-menu')?.classList.remove('open');
}

document.addEventListener('click', e => {
  if (!e.target.closest('#nav-proj-dropdown')) closeNavProjMenu();
});

function switchProject(id) {
  activeProjectId = id;
  saveNow();
  renderProjectSelector();
  renderTable();
  renderBirthdayAlerts();
  updateStats();
  updatePlanTabLabel();
  const activeTab = document.querySelector('nav .tab.active')?.getAttribute('onclick')?.match(/'(\w+)'\)/)?.[1];
  updateHeaderProject(activeTab);
}

// ── Tabs ──────────────────────────────────────────────────────────────────────

function switchTab(btn, name) {
  document.querySelectorAll('nav .tab').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
  document.getElementById('view-' + name).classList.add('active');
  if (btn) btn.classList.add('active');
  updateHeaderProject(name);
  if (name === 'matrix')        renderMatrix();
  if (name === 'dashboard')     renderDashboard();
  if (name === 'plan')          renderPlan();
  if (name === 'projekte')      renderProjectsView();
  if (name === 'kontakte')      renderKontakte();
  if (name === 'journalsuche')   { _jsDetailCtx = null; renderJsNewContactSelect(); renderJournalSearch(); renderJsDetailIfOpen(); }
  if (name === 'aufgabenview') {
    renderAvNewContactSelect();
    const intSel = document.getElementById('av-new-interval');
    if (intSel && !intSel.options.length) intSel.innerHTML = _intervalOptions('');
    renderAufgabenView();
  }
}

// ── Panel helpers ─────────────────────────────────────────────────────────────

function closePanel(id) {
  document.getElementById(id).classList.remove('open');
}

function switchPanelTab(btn, show, ...hide) {
  document.querySelectorAll('.panel-tab').forEach(t => t.classList.remove('active'));
  btn.classList.add('active');
  document.getElementById(show).style.display = '';
  hide.forEach(id => { const el = document.getElementById(id); if (el) el.style.display = 'none'; });
}

// ── Pill menus ────────────────────────────────────────────────────────────────

function togglePillMenu(wrapId, menuId) {
  const wrap = document.getElementById(wrapId);
  const menu = document.getElementById(menuId);
  const isOpen = menu.classList.contains('open');
  closePillMenus();
  if (!isOpen) { menu.classList.add('open'); wrap.classList.add('open'); }
}

function closePillMenus() {
  document.querySelectorAll('.pill-menu').forEach(m => m.classList.remove('open'));
  document.querySelectorAll('.pill-wrap').forEach(w => w.classList.remove('open'));
}

document.addEventListener('click', e => {
  if (!e.target.closest('.pill-wrap')) closePillMenus();
});

// ── Settings page ─────────────────────────────────────────────────────────────

function openSettings() {
  syncSettingsPage();
  document.getElementById('settings-overlay').classList.add('open');
}

function closeSettings() {
  document.getElementById('settings-overlay').classList.remove('open');
}

function switchSettingsCategory(btn, sectionId) {
  document.querySelectorAll('.settings-nav-item').forEach(b => b.classList.remove('active'));
  document.querySelectorAll('.settings-section').forEach(s => s.classList.remove('active'));
  btn.classList.add('active');
  document.getElementById(sectionId).classList.add('active');
}

function syncSettingsPage() {
  // Rebuild interval select
  const sel = document.getElementById('settings-warning-days');
  if (sel) {
    const vals = [14, 30, 60, 90, 180, 365];
    sel.innerHTML = vals.map(v => `<option value="${v}"${v === contactWarningDays ? ' selected' : ''}>${v} ${t('days_label')}</option>`).join('');
  }
  // Theme buttons
  const isDark = document.documentElement.getAttribute('data-theme') !== 'light';
  document.getElementById('theme-opt-dark')?.classList.toggle('active', isDark);
  document.getElementById('theme-opt-light')?.classList.toggle('active', !isDark);
  // Language buttons
  document.getElementById('lang-opt-de')?.classList.toggle('active', appLang === 'de');
  document.getElementById('lang-opt-en')?.classList.toggle('active', appLang === 'en');
  // Todoist fields
  const unEl = document.getElementById('todoist-username');
  if (unEl) unEl.value = todoistSettings.username || '';
  // Load token into field (masked)
  window.electronAPI?.todoist.getToken().then(tok => {
    const tokEl = document.getElementById('todoist-token');
    if (tokEl) tokEl.value = tok || '';
  });
  // Sync mode buttons
  ['none','start','30min','1hour'].forEach(m => {
    document.getElementById('tsync-' + m)?.classList.toggle('active', todoistSettings.syncMode === m);
  });
  // Load project list if settings page is opening on todoist category
  const tpSel = document.getElementById('todoist-project');
  if (tpSel && tpSel.options.length <= 1) loadTodoistProjects();
  // Fill import target dropdowns
  _fillTodoistImportSelects();
  // Re-apply translations (language may have changed)
  applyTranslations();
}

function setWarningDays(val) {
  contactWarningDays = parseInt(val);
  saveNow();
  renderTable();
}

// ── Keyboard shortcuts ────────────────────────────────────────────────────────

document.addEventListener('keydown', e => {
  // Esc: close any open overlay/panel
  if (e.key === 'Escape') {
    const settingsOpen = document.getElementById('settings-overlay');
    if (settingsOpen?.classList.contains('open')) { closeSettings(); return; }
    const jsModal = document.getElementById('js-new-modal');
    if (jsModal?.classList.contains('open')) { closeJsNewModal(); return; }
    const avModal = document.getElementById('av-new-modal');
    if (avModal?.classList.contains('open')) { closeAvNewModal(); return; }
    const open = document.querySelector('.overlay.open');
    if (open) { closePanel(open.id); return; }
    closePillMenus();
  }
  // Ctrl+F: focus the active view's search box
  if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
    const activeView = document.querySelector('.view.active');
    if (!activeView) return;
    const input = activeView.querySelector('input[type=text]');
    if (input) { e.preventDefault(); input.focus(); input.select(); }
  }
});

// ── Undo toast ────────────────────────────────────────────────────────────────

let _undoAction = null;
let _undoTimer  = null;

function showUndoToast(message, undoFn) {
  _undoAction = undoFn;
  clearTimeout(_undoTimer);
  let toast = document.getElementById('undo-toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'undo-toast';
    document.body.appendChild(toast);
  }
  toast.innerHTML = `<span>${esc(message)}</span><button onclick="triggerUndo()">${t('btn_undo')}</button>`;
  toast.classList.add('show');
  _undoTimer = setTimeout(() => { toast.classList.remove('show'); _undoAction = null; }, 5000);
}

function triggerUndo() {
  if (_undoAction) { _undoAction(); _undoAction = null; }
  clearTimeout(_undoTimer);
  const toast = document.getElementById('undo-toast');
  if (toast) toast.classList.remove('show');
}
