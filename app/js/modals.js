// ══ MODALS: picker, link, new stakeholder, edit, delete, kontakt, project ══

// ── Picker ────────────────────────────────────────────────────────────────────

function openPickerOverlay() {
  document.getElementById('picker-search').value = '';
  renderPickerList();
  document.getElementById('picker-overlay').classList.add('open');
}

function renderPickerList() {
  const proj      = getActiveProject();
  const linkedIds = new Set((proj?.items || []).map(i => i.shId));
  const q         = document.getElementById('picker-search').value.toLowerCase();
  const available = stakeholders.filter(sh => {
    const name = shFullName(sh).toLowerCase();
    return !linkedIds.has(sh.id) &&
      (!q || name.includes(q) || (sh.rolle || '').toLowerCase().includes(q));
  });
  const el = document.getElementById('picker-list');
  el.innerHTML = available.length === 0
    ? `<div class="picker-empty">${t('picker_all_added')}</div>`
    : available.map(sh => `
      <div class="picker-item">
        <div class="picker-item-info">
          <div class="picker-item-name">${esc(shFullName(sh))}</div>
          <div class="picker-item-rolle">${esc(sh.rolle)}</div>
        </div>
        <button class="btn btn-primary" style="padding:6px 14px;font-size:.8rem" onclick="openLinkModal(${sh.id})">${t('btn_picker_add')}</button>
      </div>`).join('');
}

// ── Link (add existing stakeholder to project) ────────────────────────────────

function openLinkModal(shId) {
  const sh = stakeholders.find(s => s.id === shId); if (!sh) return;
  closePanel('picker-overlay');
  document.getElementById('link-shid').value              = shId;
  document.getElementById('link-title').textContent       = shFullName(sh);
  document.getElementById('link-subtitle').textContent    = sh.rolle + ' ' + t('link_subtitle_suffix');
  document.getElementById('link-einfluss').value          = 5;
  document.getElementById('link-einfluss-val').textContent = 5;
  document.getElementById('link-interesse').value          = 5;
  document.getElementById('link-interesse-val').textContent = 5;
  document.getElementById('link-gruppe').value   = 'intern';
  document.getElementById('link-haltung').value  = 'neutral';
  document.getElementById('link-ziel').value     = '';
  document.getElementById('link-massnahmen').value = '';
  document.getElementById('link-beziehung').value          = 3;
  document.getElementById('link-beziehung-val').textContent = 3;
  document.getElementById('link-contact-interval').value    = '';
  document.getElementById('link-overlay').classList.add('open');
}

function confirmLink() {
  const shId = parseInt(document.getElementById('link-shid').value);
  const proj = getActiveProject(); if (!proj) return;
  if (proj.items.find(i => i.shId === shId)) { closePanel('link-overlay'); return; }
  const ciVal = parseInt(document.getElementById('link-contact-interval').value);
  proj.items.push({
    shId,
    gruppe:          document.getElementById('link-gruppe').value,
    haltung:         document.getElementById('link-haltung').value,
    einfluss:        parseInt(document.getElementById('link-einfluss').value),
    interesse:       parseInt(document.getElementById('link-interesse').value),
    beziehung:       Math.min(5, Math.max(1, parseInt(document.getElementById('link-beziehung').value) || 3)),
    contactInterval: ciVal || null,
    ziel:            document.getElementById('link-ziel').value,
    massnahmen:      document.getElementById('link-massnahmen').value.split('\n').map(m => m.trim()).filter(Boolean),
    aufgaben:        []
  });
  saveNow(); closePanel('link-overlay');
  renderTable(); renderBirthdayAlerts();
}

// ── New stakeholder ───────────────────────────────────────────────────────────

function openNewStakeholderModal() {
  document.getElementById('new-sh-overlay').classList.add('open');
}

function addNewStakeholder() {
  const vorname = document.getElementById('f-vorname').value.trim();
  const nachname = document.getElementById('f-nachname').value.trim();
  if (!vorname && !nachname) { alert(t('alert_name_required')); return; }
  const shId = nextStakeholderId++;
  stakeholders.push({
    id:         shId,
    vorname,
    nachname,
    rolle:      document.getElementById('f-rolle').value,
    email:      document.getElementById('f-email').value,
    tel:        document.getElementById('f-tel').value,
    geburtstag: document.getElementById('f-geburtstag').value,
    notizen:    document.getElementById('f-notizen').value,
    journal:    []
  });
  const proj = getActiveProject();
  if (proj) {
    const fCi = parseInt(document.getElementById('f-contact-interval').value);
    proj.items.push({
      shId,
      gruppe:          document.getElementById('f-gruppe').value,
      haltung:         document.getElementById('f-haltung').value,
      einfluss:        parseInt(document.getElementById('f-einfluss').value),
      interesse:       parseInt(document.getElementById('f-interesse').value),
      beziehung:       Math.min(5, Math.max(1, parseInt(document.getElementById('f-beziehung').value) || 3)),
      contactInterval: fCi || null,
      ziel:            document.getElementById('f-ziel').value,
      massnahmen:      document.getElementById('f-massnahmen').value.split('\n').map(m => m.trim()).filter(Boolean),
      aufgaben:        []
    });
  }
  saveNow(); closePanel('new-sh-overlay');
  ['f-vorname','f-nachname','f-rolle','f-email','f-tel','f-geburtstag','f-ziel','f-massnahmen','f-notizen'].forEach(id => {
    document.getElementById(id).value = '';
  });
  ['f-einfluss','f-interesse'].forEach(id => { document.getElementById(id).value = 5; });
  document.getElementById('f-einfluss-val').textContent = 5;
  document.getElementById('f-interesse-val').textContent = 5;
  document.getElementById('f-beziehung').value = 3;
  document.getElementById('f-beziehung-val').textContent = 3;
  document.getElementById('f-contact-interval').value = '';
  renderTable(); renderBirthdayAlerts();
}

// ── Edit (project context) ────────────────────────────────────────────────────

function openEditModal(shId) {
  const sh   = stakeholders.find(x => x.id === shId); if (!sh) return;
  const proj = getActiveProject();
  const item = proj?.items.find(i => i.shId === shId) || {};
  document.getElementById('e-shid').value      = shId;
  document.getElementById('e-vorname').value   = sh.vorname || '';
  document.getElementById('e-nachname').value  = sh.nachname || '';
  document.getElementById('e-rolle').value     = sh.rolle;
  document.getElementById('e-email').value     = sh.email    || '';
  document.getElementById('e-tel').value       = sh.tel      || '';
  document.getElementById('e-geburtstag').value = sh.geburtstag || '';
  document.getElementById('e-gruppe').value    = item.gruppe  || 'intern';
  document.getElementById('e-haltung').value   = item.haltung || 'neutral';
  document.getElementById('e-einfluss').value  = item.einfluss  || 5;
  document.getElementById('e-einfluss-val').textContent = item.einfluss  || 5;
  document.getElementById('e-interesse').value = item.interesse || 5;
  document.getElementById('e-interesse-val').textContent = item.interesse || 5;
  document.getElementById('e-ziel').value      = item.ziel   || '';
  document.getElementById('e-massnahmen').value = (item.massnahmen || []).join('\n');
  document.getElementById('e-notizen').value    = sh.notizen || '';
  document.getElementById('e-beziehung').value          = item.beziehung  || 3;
  document.getElementById('e-beziehung-val').textContent = item.beziehung  || 3;
  document.getElementById('e-contact-interval').value    = item.contactInterval || '';
  document.getElementById('edit-overlay').classList.add('open');
}

function saveEdit() {
  const shId = parseInt(document.getElementById('e-shid').value);
  const vorname = document.getElementById('e-vorname').value.trim();
  const nachname = document.getElementById('e-nachname').value.trim();
  if (!vorname && !nachname) { alert(t('alert_name_required')); return; }
  const shIdx = stakeholders.findIndex(x => x.id === shId); if (shIdx === -1) return;
  stakeholders[shIdx] = {
    ...stakeholders[shIdx], vorname, nachname,
    rolle:      document.getElementById('e-rolle').value,
    email:      document.getElementById('e-email').value,
    tel:        document.getElementById('e-tel').value,
    geburtstag: document.getElementById('e-geburtstag').value,
    notizen:    document.getElementById('e-notizen').value,
  };
  const proj    = getActiveProject();
  const itemIdx = proj?.items.findIndex(i => i.shId === shId) ?? -1;
  if (itemIdx !== -1) {
    const eCi = parseInt(document.getElementById('e-contact-interval').value);
    proj.items[itemIdx] = {
      ...proj.items[itemIdx],
      gruppe:          document.getElementById('e-gruppe').value,
      haltung:         document.getElementById('e-haltung').value,
      einfluss:        parseInt(document.getElementById('e-einfluss').value),
      interesse:       parseInt(document.getElementById('e-interesse').value),
      beziehung:       Math.min(5, Math.max(1, parseInt(document.getElementById('e-beziehung').value) || 3)),
      contactInterval: eCi || null,
      ziel:            document.getElementById('e-ziel').value,
      massnahmen:      document.getElementById('e-massnahmen').value.split('\n').map(m => m.trim()).filter(Boolean)
    };
  }
  _syncBirthdayTask(shId);
  saveNow(); closePanel('edit-overlay');
  renderTable(); renderMatrix(); renderBirthdayAlerts();
}

function removeFromProject() {
  const shId = parseInt(document.getElementById('e-shid').value);
  closePanel('edit-overlay');
  removeStakeholderFromProject(shId);
}

function removeStakeholderFromProject(shId) {
  const proj = getActiveProject(); if (!proj) return;
  const sh   = stakeholders.find(x => x.id === shId);
  if (!sh || !confirm(t('confirm_remove_sh').replace('{name}', shFullName(sh)))) return;
  const itemBackup = proj.items.find(i => i.shId === shId);
  proj.items = proj.items.filter(i => i.shId !== shId);
  saveNow(); renderTable(); renderMatrix(); renderBirthdayAlerts();
  showUndoToast(
    (appLang === 'en' ? `"${shFullName(sh)}" removed from project` : `„${shFullName(sh)}" aus Projekt entfernt`),
    () => {
      if (itemBackup && !proj.items.find(i => i.shId === shId)) proj.items.push(itemBackup);
      saveNow(); renderTable(); renderMatrix(); renderBirthdayAlerts();
    }
  );
}

function deleteFromEdit() {
  const shId = parseInt(document.getElementById('e-shid').value);
  closePanel('edit-overlay');
  deleteStakeholder(shId);
}

function deleteStakeholder(shId) {
  const sh = stakeholders.find(x => x.id === shId);
  if (!sh || !confirm(t('confirm_delete_sh').replace('{name}', shFullName(sh)))) return;
  const shBackup   = JSON.parse(JSON.stringify(sh));
  const itemBackup = projects.map(p => ({ projId: p.id, item: p.items.find(i => i.shId === shId) })).filter(x => x.item);
  stakeholders = stakeholders.filter(x => x.id !== shId);
  projects.forEach(p => { p.items = p.items.filter(i => i.shId !== shId); });
  saveNow(); renderTable(); renderMatrix(); renderBirthdayAlerts(); renderKontakte();
  showUndoToast(
    (appLang === 'en' ? `"${shFullName(sh)}" deleted` : `„${shFullName(sh)}" gelöscht`),
    () => {
      stakeholders.push(shBackup);
      itemBackup.forEach(({ projId, item }) => {
        const p = projects.find(x => x.id === projId);
        if (p && !p.items.find(i => i.shId === shId)) p.items.push(item);
      });
      saveNow(); renderAll();
    }
  );
}

// ── Kontakt edit (central DB only) ───────────────────────────────────────────

function openNewKontaktModal() {
  document.getElementById('ke-shid').value = '';
  ['ke-vorname','ke-nachname','ke-rolle','ke-email','ke-tel','ke-geburtstag'].forEach(id => {
    document.getElementById(id).value = '';
  });
  document.getElementById('kontakt-edit-overlay').classList.add('open');
}

function openKontaktEditModal(shId) {
  const sh = stakeholders.find(x => x.id === shId); if (!sh) return;
  document.getElementById('ke-shid').value      = shId;
  document.getElementById('ke-vorname').value   = sh.vorname || '';
  document.getElementById('ke-nachname').value  = sh.nachname || '';
  document.getElementById('ke-rolle').value     = sh.rolle;
  document.getElementById('ke-email').value     = sh.email    || '';
  document.getElementById('ke-tel').value       = sh.tel      || '';
  document.getElementById('ke-geburtstag').value = sh.geburtstag || '';
  document.getElementById('ke-notizen').value   = sh.notizen  || '';
  document.getElementById('kontakt-edit-overlay').classList.add('open');
}

function saveKontakt() {
  const shId = parseInt(document.getElementById('ke-shid').value);
  const vorname = document.getElementById('ke-vorname').value.trim();
  const nachname = document.getElementById('ke-nachname').value.trim();
  if (!vorname && !nachname) { alert(t('alert_name_required')); return; }
  if (shId) {
    const idx = stakeholders.findIndex(x => x.id === shId); if (idx === -1) return;
    stakeholders[idx] = {
      ...stakeholders[idx], vorname, nachname,
      rolle:      document.getElementById('ke-rolle').value,
      email:      document.getElementById('ke-email').value,
      tel:        document.getElementById('ke-tel').value,
      geburtstag: document.getElementById('ke-geburtstag').value,
      notizen:    document.getElementById('ke-notizen').value,
    };
  } else {
    stakeholders.push({
      id:         nextStakeholderId++,
      vorname,
      nachname,
      rolle:      document.getElementById('ke-rolle').value,
      email:      document.getElementById('ke-email').value,
      tel:        document.getElementById('ke-tel').value,
      geburtstag: document.getElementById('ke-geburtstag').value,
      notizen:    document.getElementById('ke-notizen').value,
      journal:    []
    });
  }
  const savedId = shId || stakeholders[stakeholders.length - 1].id;
  _syncBirthdayTask(savedId);
  saveNow(); closePanel('kontakt-edit-overlay');
  renderKontakte(); renderTable(); renderBirthdayAlerts();
}

function deleteKontakt() {
  const shId = parseInt(document.getElementById('ke-shid').value);
  closePanel('kontakt-edit-overlay');
  deleteStakeholder(shId);
}

// ── Project modal ─────────────────────────────────────────────────────────────

function openProjModal(id) {
  const isEdit = !!id;
  document.getElementById('proj-modal-title').textContent = isEdit ? t('proj_modal_edit') : t('proj_modal_new');
  document.getElementById('pm-del-btn').style.display = isEdit ? '' : 'none';
  const proj = isEdit ? projects.find(p => p.id === id) : null;
  document.getElementById('pm-id').value   = id   || '';
  document.getElementById('pm-name').value = proj?.name || '';
  document.getElementById('pm-desc').value = proj?.desc || '';
  document.getElementById('proj-modal-overlay').classList.add('open');
}

async function saveProject() {
  const id   = document.getElementById('pm-id').value;
  const name = document.getElementById('pm-name').value.trim();
  const desc = document.getElementById('pm-desc').value.trim();
  if (!name) { alert(t('alert_proj_name')); return; }
  if (id) {
    const p = projects.find(x => x.id === id);
    if (p) { p.name = name; p.desc = desc; }
    await saveProjectFile(id);
  } else {
    const newId = 'proj' + nextProjectId++;
    const newProj = { id: newId, name, desc, items: [], plan: JSON.parse(JSON.stringify(DEFAULT_PLAN)) };
    projects.push(newProj);
    activeProjectId = newId;
    await saveProjectFile(newId);
  }
  saveNow(); closePanel('proj-modal-overlay');
  renderProjectSelector(); renderProjectsView(); renderTable(); renderBirthdayAlerts();
}

async function deleteProjectById(id) {
  const p = projects.find(x => x.id === id);
  if (!p || !confirm(t('confirm_delete_proj').replace('{name}', p.name))) return;
  await deleteProjectFile(id);
  projects = projects.filter(x => x.id !== id);
  if (activeProjectId === id) activeProjectId = projects[0]?.id || '';
  saveNow(); renderProjectSelector(); renderProjectsView(); renderTable(); renderBirthdayAlerts();
}

function deleteProject() {
  const id = document.getElementById('pm-id').value;
  closePanel('proj-modal-overlay');
  deleteProjectById(id);
}
