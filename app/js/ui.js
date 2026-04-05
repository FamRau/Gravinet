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
  sub.innerHTML = `<span id="org-name-display">${esc(orgName)}</span><button class="org-edit-btn" onclick="startEditOrg()" title="Bezeichnung bearbeiten">✏</button>`;
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
}

// ── Tabs ──────────────────────────────────────────────────────────────────────

function switchTab(btn, name) {
  document.querySelectorAll('nav .tab').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
  document.getElementById('view-' + name).classList.add('active');
  if (btn) btn.classList.add('active');
  if (name === 'matrix')   renderMatrix();
  if (name === 'plan')     renderPlan();
  if (name === 'projekte') renderProjectsView();
  if (name === 'kontakte') renderKontakte();
}

// ── Panel helpers ─────────────────────────────────────────────────────────────

function closePanel(id) {
  document.getElementById(id).classList.remove('open');
}

function switchPanelTab(btn, showId, hideId) {
  document.querySelectorAll('.panel-tab').forEach(t => t.classList.remove('active'));
  btn.classList.add('active');
  document.getElementById(showId).style.display = '';
  document.getElementById(hideId).style.display = 'none';
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

// ── Settings menu sync ────────────────────────────────────────────────────────

function syncSettingsMenu() {
  // Sync interval select
  const sel = document.getElementById('inline-warning-days');
  if (sel) {
    // Rebuild options with translated day label
    const vals = [14, 30, 60, 90, 180, 365];
    sel.innerHTML = vals.map(v => `<option value="${v}"${v === contactWarningDays ? ' selected' : ''}>${v} ${t('days_label')}</option>`).join('');
  }
  // Theme active indicator
  const isDark = document.documentElement.getAttribute('data-theme') !== 'light';
  document.getElementById('theme-opt-dark')?.classList.toggle('active-opt', isDark);
  document.getElementById('theme-opt-light')?.classList.toggle('active-opt', !isDark);
  // Language active indicator
  document.getElementById('lang-opt-de')?.classList.toggle('active-opt', appLang === 'de');
  document.getElementById('lang-opt-en')?.classList.toggle('active-opt', appLang === 'en');
}

function setWarningDays(val) {
  contactWarningDays = parseInt(val);
  saveNow();
  renderTable();
}
