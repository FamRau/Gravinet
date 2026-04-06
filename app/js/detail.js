// ══ DETAIL PANEL + JOURNAL ══

function openDetail(shId) {
  document.getElementById('detail-overlay').dataset.shid = shId;
  _syncAutoContactTask(shId);
  _syncBirthdayTask(shId);
  renderDetailProfile(shId);
  renderDetailJournal(shId);
  document.querySelectorAll('.panel-tab').forEach((t, i) => t.classList.toggle('active', i === 0));
  document.getElementById('dtab-profil').style.display    = '';
  document.getElementById('dtab-journal').style.display   = 'none';
  document.getElementById('dtab-aufgaben').style.display  = 'none';
  document.getElementById('detail-overlay').classList.add('open');
}

function openDetailJournal(shId) {
  renderDetailProfile(shId);
  renderDetailJournal(shId);
  document.querySelectorAll('.panel-tab').forEach((t, i) => t.classList.toggle('active', i === 1));
  document.getElementById('dtab-profil').style.display    = 'none';
  document.getElementById('dtab-journal').style.display   = '';
  document.getElementById('dtab-aufgaben').style.display  = 'none';
  document.getElementById('detail-overlay').classList.add('open');
}

function openDetailAufgaben(shId) {
  renderDetailProfile(shId);
  renderDetailJournal(shId);
  renderDetailAufgaben(shId);
  document.querySelectorAll('.panel-tab').forEach((t, i) => t.classList.toggle('active', i === 2));
  document.getElementById('dtab-profil').style.display    = 'none';
  document.getElementById('dtab-journal').style.display   = 'none';
  document.getElementById('dtab-aufgaben').style.display  = '';
  document.getElementById('detail-overlay').classList.add('open');
}

function _syncBirthdayTask(shId) {
  const sh = stakeholders.find(x => x.id === shId); if (!sh) return;
  // Sync birthday task into every project item this stakeholder belongs to
  projects.forEach(proj => {
    const item = proj.items.find(i => i.shId === shId); if (!item) return;
    if (!item.aufgaben) item.aufgaben = [];
    const existIdx = item.aufgaben.findIndex(a => a.autoBirthday);
    if (!sh.geburtstag) {
      if (existIdx >= 0) item.aufgaben.splice(existIdx, 1);
      return;
    }
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const [, m, d] = sh.geburtstag.split('-').map(Number);
    let next = new Date(today.getFullYear(), m - 1, d);
    if (next < today) next = new Date(today.getFullYear() + 1, m - 1, d);
    const dateStr    = next.toISOString().slice(0, 10);
    const reminderD  = new Date(next.getTime() - 3 * 86400000).toISOString().slice(0, 10);
    const title      = t('auto_birthday_title') + shFullName(sh);
    const tag        = t('auto_birthday_tag');
    if (existIdx >= 0) {
      const ex = item.aufgaben[existIdx];
      if (!ex.done) { ex.date = dateStr; ex.reminder = reminderD; ex.title = title; ex.tag = tag; }
    } else {
      item.aufgaben.push({ id: nextAufgabeId++, title, date: dateStr, reminder: reminderD,
        interval: 365, tag, done: false, autoBirthday: true });
    }
  });
  saveNow();
}

function _contactIntervalDisplay(s) {
  const interval = getContactInterval(s);
  const isDefault = !s.contactInterval;
  const defaultSuffix = isDefault ? t('interval_default_suffix') : '';
  return `${t('detail_contact_interval_label')}: ${interval} ${t('days_label')}${defaultSuffix}`;
}

function _syncAutoContactTask(shId) {
  const sh   = stakeholders.find(x => x.id === shId); if (!sh) return;
  const proj = getActiveProject();
  const item = proj?.items.find(i => i.shId === shId); if (!item) return;
  if (!item.aufgaben) item.aufgaben = [];

  const interval = getContactInterval({ ...sh, ...item });
  const j = sh.journal || [];
  const lastEntry = j.length ? j.reduce((a, b) => a.date > b.date ? a : b) : null;
  const lastDate  = lastEntry ? new Date(lastEntry.date) : new Date();
  const nextDate  = new Date(lastDate.getTime() + interval * 86400000);
  const dateStr   = nextDate.toISOString().slice(0, 10);
  const reminderD = new Date(nextDate.getTime() - 86400000).toISOString().slice(0, 10);
  const title     = t('auto_contact_title');

  const existing = item.aufgaben.find(a => a.autoContact);
  if (existing) {
    if (!existing.done) {
      existing.date     = dateStr;
      existing.reminder = reminderD;
      existing.title    = title;
    }
  } else {
    item.aufgaben.unshift({
      id: nextAufgabeId++, title, date: dateStr, reminder: reminderD,
      interval: null, tag: t('auto_contact_tag'),
      done: false, autoContact: true
    });
  }
  saveNow();
}

function renderDetailProfile(shId) {
  const sh   = stakeholders.find(x => x.id === shId); if (!sh) return;
  const proj = getActiveProject();
  const item = proj?.items.find(i => i.shId === shId) || {};
  const s    = { ...sh, ...item, id: sh.id };
  const col  = HALTUNG_COLORS[s.haltung] || 'var(--muted)';
  const chips = [
    s.email      ? `<div class="contact-chip">✉ <a href="mailto:${esc(s.email)}">${esc(s.email)}</a></div>` : '',
    s.tel        ? `<div class="contact-chip">📞 <a href="tel:${esc(s.tel)}">${esc(s.tel)}</a></div>`       : '',
    s.geburtstag ? `<div class="contact-chip">🎂 ${fmtDate(s.geburtstag)}</div>`                           : ''
  ].join('');
  const hasProjectData = !!proj?.items.find(i => i.shId === shId);
  document.getElementById('dtab-profil').innerHTML = `
    <div class="detail-header">
      <div class="detail-avatar" style="background:${col}22;border:2px solid ${col}">${initials(shFullName(s))}</div>
      <div class="detail-name">
        <h2>${esc(shFullName(s))}</h2>
        <div class="role">${esc(s.rolle)}${hasProjectData ? ` · <span class="badge badge-${s.gruppe}">${t('badge_' + s.gruppe)}</span>` : ''}</div>
        ${chips ? `<div class="contact-row">${chips}</div>` : ''}
      </div>
    </div>
    ${hasProjectData ? `
    <div class="detail-grid">
      <div class="detail-card">
        <div class="detail-card-label">${t('detail_influence')}</div>
        <div class="detail-card-val" style="color:var(--accent)">${s.einfluss}/10</div>
        <div class="bar-track bar-einfluss" style="margin-top:8px;width:100%"><div class="bar-fill" style="width:${s.einfluss * 10}%"></div></div>
      </div>
      <div class="detail-card">
        <div class="detail-card-label">${t('detail_interest')}</div>
        <div class="detail-card-val" style="color:var(--accent2)">${s.interesse}/10</div>
        <div class="bar-track bar-interesse" style="margin-top:8px;width:100%"><div class="bar-fill" style="width:${s.interesse * 10}%"></div></div>
      </div>
      <div class="detail-card">
        <div class="detail-card-label">${t('detail_attitude')}</div>
        <div class="detail-card-val"><span class="badge badge-${s.haltung}">${t('badge_' + s.haltung)}</span></div>
      </div>
      <div class="detail-card">
        <div class="detail-card-label">${t('detail_strategy')}</div>
        <div class="detail-card-val" style="font-size:.85rem">${getStrategie(s)}</div>
      </div>
      <div class="detail-card">
        <div class="detail-card-label">${t('detail_beziehung')}</div>
        <div class="detail-card-val" style="color:var(--accent2);letter-spacing:2px;font-size:1rem">${'★'.repeat(s.beziehung || 3)}${'☆'.repeat(5 - (s.beziehung || 3))}</div>
      </div>
      <div class="detail-card">
        <div class="detail-card-label">${t('detail_contact_interval')}</div>
        <div class="detail-card-val" style="font-size:.88rem">${_contactIntervalDisplay(s)}</div>
      </div>
    </div>
    ${s.ziel ? `<div class="detail-section"><h3>${t('detail_goal')}</h3><p>${esc(s.ziel)}</p></div>` : ''}
    ${(s.massnahmen || []).length ? `<div class="detail-section"><h3>${t('detail_measures')}</h3><ul class="massnahmen-list">${s.massnahmen.map(m => `<li>${esc(m)}</li>`).join('')}</ul></div>` : ''}
    ` : ''}
    ${sh.notizen ? `<div class="detail-section detail-notes"><h3>📌 ${t('label_notes')}</h3><p class="detail-notes-text">${esc(sh.notizen)}</p></div>` : ''}
    <div style="display:flex;gap:12px;margin-top:20px;padding-top:18px;border-top:1px solid var(--border)">
      <button class="btn btn-primary" style="flex:1" onclick="closePanel('detail-overlay');openEditModal(${s.id})">${t('btn_edit_full')}</button>
    </div>`;
}

const JOURNAL_TYPES = ['meeting','email','call','talk','other'];

function journalTypeBadge(type) {
  if (!type) return '';
  return `<span class="journal-type-badge jtype-${type}">${t('jtype_' + type)}</span>`;
}

function renderDetailJournal(shId) {
  const sh = stakeholders.find(x => x.id === shId); if (!sh) return;
  const j  = sh.journal || [];
  const rows = [...j].reverse().map((e, ri) => {
    const realIdx = j.length - 1 - ri;
    return `<tr>
      <td style="white-space:nowrap;color:var(--muted);font-size:.78rem;font-family:var(--font-mono)">${fmtDateTime(e.date)}</td>
      <td>${journalTypeBadge(e.type)}</td>
      <td style="width:100%">${esc(e.text)}</td>
      <td><button class="aufgabe-del" onclick="deleteJournalEntry(${shId},${realIdx})" title="${t('btn_delete_short')}">✕</button></td>
    </tr>`;
  }).join('');
  const tableOrEmpty = j.length === 0
    ? `<div style="color:var(--muted);font-size:.85rem;padding:12px 0">${t('journal_empty')}</div>`
    : `<div class="aufgaben-table-wrap"><table class="aufgaben-table">
        <thead><tr>
          <th>${t('th_date')}</th>
          <th>${t('th_type')}</th>
          <th>${t('th_note')}</th>
          <th></th>
        </tr></thead>
        <tbody>${rows}</tbody>
      </table></div>`;
  document.getElementById('dtab-journal').innerHTML = `
    <div style="margin-bottom:16px">
      <h2 style="font-family:var(--font-serif);font-size:1.3rem;margin-bottom:4px">${t('detail_tab_journal')} – ${esc(shFullName(sh))}</h2>
      <div style="font-size:.8rem;color:var(--muted)">${j.length} ${t('journal_entries')}</div>
    </div>
    ${tableOrEmpty}
    <div class="journal-add-box" style="margin-top:20px">
      <div class="journal-add-label">${t('journal_new_entry')}</div>
      <div class="journal-type-row">
        ${JOURNAL_TYPES.map(type => `
          <button class="journal-type-btn" data-type="${type}" onclick="selectJournalType(this,'${shId}')">${t('jtype_' + type)}</button>
        `).join('')}
      </div>
      <textarea class="journal-textarea" id="journal-input-${shId}" placeholder="${t('journal_placeholder')}"></textarea>
      <button class="btn btn-primary" onclick="addJournalEntry(${shId})">${t('btn_save_entry')}</button>
    </div>`;
}

function selectJournalType(btn, shId) {
  document.querySelectorAll(`#dtab-journal .journal-type-btn`).forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
}

function addJournalEntry(shId) {
  const el   = document.getElementById('journal-input-' + shId);
  const text = el.value.trim(); if (!text) return;
  const sh   = stakeholders.find(x => x.id === shId); if (!sh) return;
  const activeType = document.querySelector('#dtab-journal .journal-type-btn.active');
  const type = activeType ? activeType.dataset.type : null;
  if (!sh.journal) sh.journal = [];
  sh.journal.push({ date: new Date().toISOString(), text, type });
  _syncAutoContactTask(shId); saveNow(); renderDetailJournal(shId); renderTable();
}

function deleteJournalEntry(shId, idx) {
  if (!confirm(t('confirm_delete_journal'))) return;
  const sh = stakeholders.find(x => x.id === shId); if (!sh) return;
  sh.journal.splice(idx, 1);
  saveNow(); renderDetailJournal(shId); renderTable();
}

// ── Aufgaben ──────────────────────────────────────────────────────────────────

function _intervalOptions(selected) {
  const opts = [['', t('aufgaben_no_repeat')], ['7','7 '+t('days_unit_short')], ['14','14 '+t('days_unit_short')],
    ['30','30 '+t('days_unit_short')], ['60','60 '+t('days_unit_short')], ['90','90 '+t('days_unit_short')],
    ['180','180 '+t('days_unit_short')], ['365','365 '+t('days_unit_short')]];
  return opts.map(([v,l]) => `<option value="${v}"${String(selected||'')==v?' selected':''}>${l}</option>`).join('');
}

let _showDoneAufgaben = false;

function toggleShowDoneAufgaben(shId) {
  _showDoneAufgaben = !_showDoneAufgaben;
  renderDetailAufgaben(shId);
}

function renderDetailAufgaben(shId) {
  const el = document.getElementById('dtab-aufgaben'); if (!el) return;
  const sh = stakeholders.find(x => x.id === shId); if (!sh) return;
  const proj = getActiveProject();
  const item = proj?.items.find(i => i.shId === shId);
  if (!item) { el.innerHTML = `<p style="color:var(--muted);padding:20px 0">${t('aufgaben_no_project')}</p>`; return; }
  const all = (item.aufgaben || []).slice().sort((a, b) => (a.date || '') < (b.date || '') ? -1 : 1);
  const doneCount = all.filter(a => a.done).length;
  const aufgaben = _showDoneAufgaben ? all : all.filter(a => !a.done);
  const today = new Date().toISOString().slice(0, 10);

  const taskRows = aufgaben.map(task => {
    const overdue   = !task.done && task.date && task.date < today;
    const remindDue = !task.done && task.reminder && task.reminder <= today;
    const autoRow   = !!(task.autoContact || task.autoBirthday);
    const autoIcon  = task.autoBirthday ? '🎂' : '🔄';
    return `<tr class="${task.done ? 'aufgabe-done' : ''}${overdue ? ' aufgabe-overdue' : ''}${autoRow ? ' aufgabe-auto' : ''}">
      <td class="aufgabe-td-check"><input type="checkbox" class="aufgabe-check" ${task.done ? 'checked' : ''} onchange="toggleAufgabe(${shId},${task.id},this.checked)"></td>
      <td class="aufgabe-td-title">${autoRow ? `<span class="aufgabe-auto-icon" title="${appLang==='en'?'Auto-generated':'Automatisch'}">${autoIcon}</span>` : ''}<input class="aufgabe-inline-input" type="text" value="${esc(task.title)}" onchange="saveAufgabeField(${shId},${task.id},'title',this.value)" ${task.done ? 'style="text-decoration:line-through;color:var(--muted)"' : ''}></td>
      <td class="aufgabe-td-date"><input class="aufgabe-inline-input aufgabe-inline-date${overdue ? ' overdue' : ''}" type="date" value="${task.date||''}" onchange="saveAufgabeField(${shId},${task.id},'date',this.value)"></td>
      <td class="aufgabe-td-date"><input class="aufgabe-inline-input aufgabe-inline-date${remindDue ? ' overdue' : ''}" type="date" value="${task.reminder||''}" onchange="saveAufgabeField(${shId},${task.id},'reminder',this.value)" title="${t('aufgaben_th_reminder')}"></td>
      <td class="aufgabe-td-interval"><select class="aufgabe-inline-select" onchange="saveAufgabeField(${shId},${task.id},'interval',this.value?parseInt(this.value):null)">${_intervalOptions(task.interval)}</select></td>
      <td class="aufgabe-td-tag"><input class="aufgabe-inline-input" type="text" value="${esc(task.tag||'')}" placeholder="${t('aufgaben_tag_placeholder')}" onchange="saveAufgabeField(${shId},${task.id},'tag',this.value)"></td>
      <td class="aufgabe-td-del">${autoRow ? '' : `<button class="aufgabe-del" onclick="deleteAufgabe(${shId},${task.id})">✕</button>`}</td>
    </tr>`;
  }).join('');

  el.innerHTML = `
    <div style="display:flex;align-items:center;gap:12px;margin-bottom:12px">
      <h2 style="font-family:var(--font-serif);font-size:1.3rem;flex:1">${t('detail_tab_aufgaben')} – ${esc(shFullName(sh))}</h2>
      ${doneCount > 0 ? `<button class="aufgabe-toggle-done${_showDoneAufgaben ? ' active' : ''}" onclick="toggleShowDoneAufgaben(${shId})">
        ${_showDoneAufgaben ? '🙈 ' : '✅ '}${_showDoneAufgaben ? (appLang==='en'?'Hide done':'Erledigte ausblenden') : (appLang==='en'?`Show done (${doneCount})`:`Erledigte anzeigen (${doneCount})`)}
      </button>` : ''}
    </div>
    <div class="aufgaben-table-wrap">
      <table class="aufgaben-table">
        <thead><tr>
          <th class="aufgabe-td-check">${t('aufgaben_th_done')}</th>
          <th class="aufgabe-td-title">${t('aufgaben_th_title')}</th>
          <th class="aufgabe-td-date">${t('aufgaben_th_date')}</th>
          <th class="aufgabe-td-date">${t('aufgaben_th_reminder')}</th>
          <th class="aufgabe-td-interval">${t('aufgaben_th_interval')}</th>
          <th class="aufgabe-td-tag">${t('aufgaben_th_tag')}</th>
          <th class="aufgabe-td-del"></th>
        </tr></thead>
        <tbody>${taskRows}</tbody>
        <tfoot><tr>
          <td class="aufgabe-td-check"></td>
          <td class="aufgabe-td-title"><input class="aufgabe-inline-input aufgabe-new-input" type="text" id="aufgabe-new-title-${shId}" placeholder="${t('aufgaben_title_placeholder')}" onkeydown="if(event.key==='Enter')addAufgabe(${shId})"></td>
          <td class="aufgabe-td-date"><input class="aufgabe-inline-input aufgabe-inline-date aufgabe-new-input" type="date" id="aufgabe-new-date-${shId}"></td>
          <td class="aufgabe-td-date"><input class="aufgabe-inline-input aufgabe-inline-date aufgabe-new-input" type="date" id="aufgabe-new-reminder-${shId}"></td>
          <td class="aufgabe-td-interval"><select class="aufgabe-inline-select aufgabe-new-input" id="aufgabe-new-interval-${shId}">${_intervalOptions('')}</select></td>
          <td class="aufgabe-td-tag"><input class="aufgabe-inline-input aufgabe-new-input" type="text" id="aufgabe-new-tag-${shId}" placeholder="${t('aufgaben_tag_placeholder')}"></td>
          <td class="aufgabe-td-del"><button class="aufgabe-add-btn" onclick="addAufgabe(${shId})">＋</button></td>
        </tr></tfoot>
      </table>
    </div>`;
}

function addAufgabe(shId) {
  const title = document.getElementById('aufgabe-new-title-' + shId)?.value.trim();
  if (!title) return;
  const date     = document.getElementById('aufgabe-new-date-' + shId)?.value || '';
  const reminder = document.getElementById('aufgabe-new-reminder-' + shId)?.value || '';
  const interval = parseInt(document.getElementById('aufgabe-new-interval-' + shId)?.value) || null;
  const tag      = document.getElementById('aufgabe-new-tag-' + shId)?.value.trim() || '';
  const proj = getActiveProject();
  const item = proj?.items.find(i => i.shId === shId); if (!item) return;
  if (!item.aufgaben) item.aufgaben = [];
  item.aufgaben.push({ id: nextAufgabeId++, title, date, reminder, interval, tag, done: false });
  saveNow(); renderDetailAufgaben(shId);
}

function saveAufgabeField(shId, aufgabeId, field, value) {
  const proj = getActiveProject();
  const item = proj?.items.find(i => i.shId === shId); if (!item) return;
  const task = item.aufgaben?.find(a => a.id === aufgabeId); if (!task) return;
  task[field] = value;
  saveNow();
}

function toggleAufgabe(shId, aufgabeId, done) {
  const proj = getActiveProject();
  const item = proj?.items.find(i => i.shId === shId); if (!item) return;
  const task = item.aufgaben?.find(a => a.id === aufgabeId); if (!task) return;
  task.done = done;
  if (done && task.interval) {
    const nextDate = new Date();
    if (task.date) {
      const base = new Date(task.date);
      nextDate.setTime(base.getTime() + task.interval * 86400000);
    } else {
      nextDate.setDate(nextDate.getDate() + task.interval);
    }
    item.aufgaben.push({
      id: nextAufgabeId++,
      title: task.title,
      date: nextDate.toISOString().slice(0, 10),
      interval: task.interval,
      done: false
    });
  }
  saveNow(); renderDetailAufgaben(shId);
}

function deleteAufgabe(shId, aufgabeId) {
  const proj = getActiveProject();
  const item = proj?.items.find(i => i.shId === shId); if (!item) return;
  item.aufgaben = (item.aufgaben || []).filter(a => a.id !== aufgabeId);
  saveNow(); renderDetailAufgaben(shId);
}
