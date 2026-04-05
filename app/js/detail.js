// ══ DETAIL PANEL + JOURNAL ══

function openDetail(shId) {
  renderDetailProfile(shId);
  renderDetailJournal(shId);
  document.querySelectorAll('.panel-tab').forEach((t, i) => t.classList.toggle('active', i === 0));
  document.getElementById('dtab-profil').style.display  = '';
  document.getElementById('dtab-journal').style.display = 'none';
  document.getElementById('detail-overlay').classList.add('open');
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
      <div class="detail-avatar" style="background:${col}22;border:2px solid ${col}">${initials(s.name)}</div>
      <div class="detail-name">
        <h2>${esc(s.name)}</h2>
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
    </div>
    ${s.ziel ? `<div class="detail-section"><h3>${t('detail_goal')}</h3><p>${esc(s.ziel)}</p></div>` : ''}
    ${(s.massnahmen || []).length ? `<div class="detail-section"><h3>${t('detail_measures')}</h3><ul class="massnahmen-list">${s.massnahmen.map(m => `<li>${esc(m)}</li>`).join('')}</ul></div>` : ''}
    ` : ''}
    <div style="display:flex;gap:12px;margin-top:20px;padding-top:18px;border-top:1px solid var(--border)">
      <button class="btn btn-primary" style="flex:1" onclick="closePanel('detail-overlay');openEditModal(${s.id})">${t('btn_edit_full')}</button>
    </div>`;
}

function renderDetailJournal(shId) {
  const sh = stakeholders.find(x => x.id === shId); if (!sh) return;
  const j  = sh.journal || [];
  const entries = j.length === 0
    ? `<div class="journal-empty">${t('journal_empty')}</div>`
    : `<div class="journal-list">${[...j].reverse().map((e, ri) => {
        const realIdx = j.length - 1 - ri;
        return `<div class="journal-entry">
          <div class="journal-entry-meta">
            <span class="journal-date">${fmtDateTime(e.date)}</span>
            <button class="journal-del" onclick="deleteJournalEntry(${shId},${realIdx})" title="Löschen">🗑</button>
          </div>
          <div class="journal-text">${esc(e.text)}</div>
        </div>`;
      }).join('')}</div>`;
  document.getElementById('dtab-journal').innerHTML = `
    <div style="margin-bottom:16px">
      <h2 style="font-family:var(--font-serif);font-size:1.3rem;margin-bottom:4px">${t('detail_tab_journal')} – ${esc(sh.name)}</h2>
      <div style="font-size:.8rem;color:var(--muted)">${j.length} ${t('journal_entries')}</div>
    </div>
    ${entries}
    <div class="journal-add-box">
      <div class="journal-add-label">${t('journal_new_entry')}</div>
      <textarea class="journal-textarea" id="journal-input-${shId}" placeholder="${t('journal_placeholder')}"></textarea>
      <button class="btn btn-primary" onclick="addJournalEntry(${shId})">${t('btn_save_entry')}</button>
    </div>`;
}

function addJournalEntry(shId) {
  const el   = document.getElementById('journal-input-' + shId);
  const text = el.value.trim(); if (!text) return;
  const sh   = stakeholders.find(x => x.id === shId); if (!sh) return;
  if (!sh.journal) sh.journal = [];
  sh.journal.push({ date: new Date().toISOString(), text });
  saveNow(); renderDetailJournal(shId); renderTable();
}

function deleteJournalEntry(shId, idx) {
  if (!confirm(t('confirm_delete_journal'))) return;
  const sh = stakeholders.find(x => x.id === shId); if (!sh) return;
  sh.journal.splice(idx, 1);
  saveNow(); renderDetailJournal(shId); renderTable();
}
