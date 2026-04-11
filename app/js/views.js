// ══ VIEWS: table, matrix, stats, birthday alerts, contacts, projects ══

// ── Stats ─────────────────────────────────────────────────────────────────────

function updateStats() {
  const proj  = getActiveProject();
  const items = proj ? proj.items.map(i => getMerged(i)).filter(Boolean) : [];
  document.getElementById('stat-total').textContent     = items.length;
  document.getElementById('stat-supportiv').textContent = items.filter(s => s.haltung === 'supportiv').length;
  document.getElementById('stat-kritisch').textContent  = items.filter(s => s.haltung === 'kritisch').length;
}

// ── Birthday alerts ───────────────────────────────────────────────────────────

function renderBirthdayAlerts() {
  const today = new Date(); const mm = today.getMonth() + 1, dd = today.getDate();
  const proj  = getActiveProject(); if (!proj) return;
  const soon  = proj.items.map(item => getMerged(item)).filter(s => {
    if (!s || !s.geburtstag) return false;
    const [, m, d] = s.geburtstag.split('-').map(Number);
    const diff = (m - mm) * 30 + (d - dd);
    return diff >= 0 && diff <= 14;
  });
  const el = document.getElementById('birthday-alerts'); if (!el) return;
  el.innerHTML = soon.map(s => {
    const [, m, d] = s.geburtstag.split('-').map(Number);
    const isToday = m === mm && d === dd;
    return `<div class="birthday-bar">🎂 <strong>${esc(shFullName(s))}</strong> ${isToday ? t('birthday_alert_today') : t('birthday_alert_soon')} (${String(d).padStart(2, '0')}.${String(m).padStart(2, '0')}.)</div>`;
  }).join('');
}

// ── Inline editing ────────────────────────────────────────────────────────────

function saveInlineField(shId, field, value) {
  const proj = getActiveProject(); if (!proj) return;
  const itemIdx = proj.items.findIndex(i => i.shId === shId);
  if (itemIdx === -1) return;
  proj.items[itemIdx][field] = value;
  saveNow();
  renderTable();
  renderMatrix();
}

function openInlineJournal(shId) {
  const cell = document.getElementById('jcell-' + shId); if (!cell) return;
  cell.innerHTML = `<div class="inline-journal-form">
    <textarea id="ijtext-${shId}" class="inline-journal-ta" rows="2" placeholder="${t('journal_placeholder')}"></textarea>
    <button class="inline-journal-save" onclick="saveInlineJournal(${shId})">✓ ${t('btn_save_entry')}</button>
  </div>`;
  cell.querySelector('textarea').focus();
}

function saveInlineJournal(shId) {
  const el = document.getElementById('ijtext-' + shId);
  const text = el?.value.trim(); if (!text) return;
  const sh = stakeholders.find(x => x.id === shId); if (!sh) return;
  if (!sh.journal) sh.journal = [];
  sh.journal.push({ date: new Date().toISOString(), text, type: 'other' });
  saveNow(); renderTable();
}

// ── Table sort ────────────────────────────────────────────────────────────────

function setSortCol(col) {
  if (sortCol === col) {
    sortDir = -sortDir;
  } else {
    sortCol = col;
    sortDir = 1;
  }
  renderTable();
}

function _sortIndicator(col) {
  if (sortCol !== col) return '<span class="sort-icon">⇅</span>';
  return `<span class="sort-icon active">${sortDir === 1 ? '▲' : '▼'}</span>`;
}

function _lastContactTs(s) {
  const j = s.journal || [];
  if (!j.length) return 0;
  return Math.max(...j.map(e => new Date(e.date).getTime()));
}

// ── Table ─────────────────────────────────────────────────────────────────────

function renderTable() {
  const proj = getActiveProject();
  if (!proj) {
    document.getElementById('table-body').innerHTML =
      '<tr><td colspan="10" style="text-align:center;color:var(--muted);padding:40px">' + t('table_no_project') + '</td></tr>';
    return;
  }
  const q  = (document.getElementById('search')?.value || '').toLowerCase();
  const fg = document.getElementById('filter-gruppe')?.value  || '';
  const fh = document.getElementById('filter-haltung')?.value || '';
  const merged   = proj.items.map(item => getMerged(item)).filter(Boolean);
  const filtered = merged.filter(s => {
    if (q  && !shFullName(s).toLowerCase().includes(q) && !s.rolle.toLowerCase().includes(q)) return false;
    if (fg && s.gruppe   !== fg) return false;
    if (fh && s.haltung  !== fh) return false;
    return true;
  });

  const HALTUNG_ORDER = { supportiv: 0, neutral: 1, kritisch: 2 };

  if (sortCol) {
    filtered.sort((a, b) => {
      let va, vb;
      if      (sortCol === 'name')      { va = shFullName(a).toLowerCase(); vb = shFullName(b).toLowerCase(); }
      else if (sortCol === 'gruppe')    { va = a.gruppe;                   vb = b.gruppe; }
      else if (sortCol === 'einfluss')  { va = a.einfluss;                 vb = b.einfluss; }
      else if (sortCol === 'interesse') { va = a.interesse;                vb = b.interesse; }
      else if (sortCol === 'haltung')   { va = HALTUNG_ORDER[a.haltung] ?? 9; vb = HALTUNG_ORDER[b.haltung] ?? 9; }
      else if (sortCol === 'strategie') { va = getStrategie(a);            vb = getStrategie(b); }
      else if (sortCol === 'beziehung')  { va = a.beziehung || 3;           vb = b.beziehung || 3; }
      else if (sortCol === 'kontakt')   { va = _lastContactTs(a);          vb = _lastContactTs(b); }
      else if (sortCol === 'journal')   { va = (a.journal||[]).length;     vb = (b.journal||[]).length; }
      if (va < vb) return -sortDir;
      if (va > vb) return  sortDir;
      return 0;
    });
  }

  // Update header indicators
  document.getElementById('th-name').innerHTML       = `${t('th_name')} ${_sortIndicator('name')}`;
  document.getElementById('th-gruppe').innerHTML     = `${t('th_gruppe')} ${_sortIndicator('gruppe')}`;
  document.getElementById('th-einfluss').innerHTML   = `${t('th_einfluss')} ${_sortIndicator('einfluss')}`;
  document.getElementById('th-interesse').innerHTML  = `${t('th_interesse')} ${_sortIndicator('interesse')}`;
  document.getElementById('th-haltung').innerHTML    = `${t('th_haltung')} ${_sortIndicator('haltung')}`;
  document.getElementById('th-strategie').innerHTML  = `${t('th_strategie')} ${_sortIndicator('strategie')}`;
  document.getElementById('th-beziehung').innerHTML  = `${t('th_beziehung')} ${_sortIndicator('beziehung')}`;
  document.getElementById('th-kontakt').innerHTML    = `${t('th_kontakt')} ${_sortIndicator('kontakt')}`;
  document.getElementById('th-journal').innerHTML    = `${t('th_journal')} ${_sortIndicator('journal')}`;

  const proj2 = getActiveProject();
  const isEmpty = proj2 && proj2.items.length === 0 && !q && !fg && !fh;
  if (isEmpty) {
    document.getElementById('table-body').innerHTML = `
      <tr><td colspan="10" style="padding:0">
        <div class="onboarding-box">
          <div class="onboarding-icon">🚀</div>
          <h3 class="onboarding-title">${t('onboard_title')}</h3>
          <p class="onboarding-text">${t('onboard_text')}</p>
          <div class="onboarding-steps">
            <div class="onboarding-step"><span class="onboarding-num">1</span>${t('onboard_step1')}</div>
            <div class="onboarding-step"><span class="onboarding-num">2</span>${t('onboard_step2')}</div>
            <div class="onboarding-step"><span class="onboarding-num">3</span>${t('onboard_step3')}</div>
          </div>
          <button class="btn btn-primary" style="margin-top:20px" onclick="openPickerOverlay()">${t('btn_add')}</button>
        </div>
      </td></tr>`;
    updateStats(); return;
  }
  document.getElementById('table-body').innerHTML = filtered.length === 0
    ? `<tr><td colspan="10" style="text-align:center;color:var(--muted);padding:40px">${t('table_empty')} <a href="#" onclick="openPickerOverlay();return false" style="color:var(--accent)">${t('table_add_link')}</a></td></tr>`
    : filtered.map(s => {
        const jc = (s.journal || []).length;
        const bd = daysUntilBirthday(s.geburtstag);
        const bdChip = bd !== null && bd <= 14
          ? `<span class="bday-chip">${bd === 0 ? '🎂 ' + t('birthday_today') : bd === 1 ? '🎂 ' + t('birthday_tomorrow') : '🎂 ' + bd + t('days_unit')}</span>` : '';
        const lastEntry = jc > 0 ? (s.journal || []).reduce((a, b) => a.date > b.date ? a : b) : null;
        const lastContactCell = (() => {
          if (!lastEntry) return '<td><span style="color:var(--muted);font-family:var(--font-mono);font-size:.78rem">–</span></td>';
          const d = new Date(lastEntry.date);
          const daysSince = Math.floor((Date.now() - d.getTime()) / 86400000);
          const locale = appLang === 'en' ? 'en-US' : 'de-AT';
          const label = d.toLocaleDateString(locale, { day: '2-digit', month: '2-digit', year: 'numeric' });
          const interval = getContactInterval(s);
          const cls = daysSince > interval        ? 'overdue'
                    : daysSince > interval * 0.6  ? 'warn'
                    :                               'ok';
          return `<td><span class="contact-date">${label}</span> <span class="contact-age ${cls}">${daysSince}${t('days_unit')}</span></td>`;
        })();
        const bez = s.beziehung || 3;
        const journalCell = jc > 0
          ? `<td class="journal-col" onclick="event.stopPropagation();openDetailJournal(${s.id})" style="cursor:pointer" title="${jc} ${t('th_journal')}"><span style="font-size:1rem">📄</span></td>`
          : `<td class="journal-col" onclick="event.stopPropagation()" id="jcell-${s.id}"><button class="inline-journal-btn" onclick="openInlineJournal(${s.id})">✎</button></td>`;
        const rowCol = HALTUNG_COLORS[s.haltung];
        const rowStyle = s.haltung === 'neutral'
          ? ''
          : `background:${rowCol}0d;border-left:3px solid ${rowCol}88;`;
        const hCls = s.haltung === 'supportiv' ? 'hs' : s.haltung === 'kritisch' ? 'hk' : 'hn';
        return `<tr onclick="openDetail(${s.id})" style="${rowStyle}">
          <td class="name-cell"><strong>${esc(shFullName(s))}${bdChip}</strong><span>${esc(s.rolle)}</span></td>
          <td onclick="event.stopPropagation()">
            <select class="inline-select" onchange="saveInlineField(${s.id},'gruppe',this.value)">
              <option value="intern" ${s.gruppe==='intern'?'selected':''}>${t('badge_intern')}</option>
              <option value="extern" ${s.gruppe==='extern'?'selected':''}>${t('badge_extern')}</option>
            </select>
          </td>
          <td onclick="event.stopPropagation()">
            <div class="inline-range-wrap">
              <input type="range" min="1" max="10" value="${s.einfluss}" class="inline-range"
                oninput="this.nextElementSibling.textContent=this.value"
                onchange="saveInlineField(${s.id},'einfluss',parseInt(this.value))">
              <span class="inline-range-val">${s.einfluss}</span>
            </div>
          </td>
          <td onclick="event.stopPropagation()">
            <div class="inline-range-wrap">
              <input type="range" min="1" max="10" value="${s.interesse}" class="inline-range"
                oninput="this.nextElementSibling.textContent=this.value"
                onchange="saveInlineField(${s.id},'interesse',parseInt(this.value))">
              <span class="inline-range-val">${s.interesse}</span>
            </div>
          </td>
          <td onclick="event.stopPropagation()">
            <select class="inline-select ${hCls}" onchange="saveInlineField(${s.id},'haltung',this.value)">
              <option value="supportiv" ${s.haltung==='supportiv'?'selected':''}>${t('badge_supportiv')}</option>
              <option value="neutral"   ${s.haltung==='neutral'  ?'selected':''}>${t('badge_neutral')}</option>
              <option value="kritisch"  ${s.haltung==='kritisch' ?'selected':''}>${t('badge_kritisch')}</option>
            </select>
          </td>
          <td style="font-size:.82rem;color:var(--muted)">${getStrategie(s)}</td>
          <td onclick="event.stopPropagation()" class="inline-stars">
            ${[1,2,3,4,5].map(i=>`<span class="${i<=bez?'on':'off'}" onclick="saveInlineField(${s.id},'beziehung',${i})">${i<=bez?'★':'☆'}</span>`).join('')}
          </td>
          ${lastContactCell}
          ${journalCell}
          <td onclick="event.stopPropagation()">
            <div class="row-actions">
              <button class="row-btn" onclick="openEditModal(${s.id})">${t('btn_edit')}</button>
              <button class="row-btn del" onclick="removeStakeholderFromProject(${s.id})">✕</button>
            </div>
          </td>
        </tr>`;
      }).join('');

  updateStats();
}

// ── Matrix ────────────────────────────────────────────────────────────────────

function renderMatrix() {
  const proj = getActiveProject(); if (!proj) return;
  const c = document.getElementById('matrix');
  const pL = 10, pB = 9, pT = 4, pR = 3;
  const dotPad = 4;
  const plotW = 100 - pL - pR, plotH = 100 - pT - pB;
  const midX = pL + plotW / 2, midY = pT + plotH / 2;
  const dotL = pL + dotPad, dotR = 100 - pR - dotPad;
  const dotT = pT + dotPad, dotB = 100 - pB - dotPad;
  const dotW = dotR - dotL, dotH = dotB - dotT;

  const ql = (top, left, w, h, col, txt) =>
    `<span style="position:absolute;top:${top}%;left:${left}%;width:${w}%;height:${h}%;display:flex;align-items:center;justify-content:center;font-family:var(--font-mono);font-size:.82rem;font-weight:600;text-transform:uppercase;letter-spacing:.06em;color:${col};opacity:.55;text-align:center;pointer-events:none">${txt}</span>`;

  c.innerHTML = `
    <div style="position:absolute;left:${pL}%;top:${pT}%;width:${plotW / 2}%;height:${plotH / 2}%;background:rgba(212,160,23,.08);border-right:1px dashed rgba(212,160,23,.25);border-bottom:1px dashed rgba(212,160,23,.25)"></div>
    <div style="position:absolute;left:${midX}%;top:${pT}%;width:${plotW / 2}%;height:${plotH / 2}%;background:rgba(30,201,122,.09);border-bottom:1px dashed rgba(30,201,122,.28)"></div>
    <div style="position:absolute;left:${pL}%;top:${midY}%;width:${plotW / 2}%;height:${plotH / 2}%;background:rgba(120,128,160,.05);border-right:1px dashed rgba(120,128,160,.22)"></div>
    <div style="position:absolute;left:${midX}%;top:${midY}%;width:${plotW / 2}%;height:${plotH / 2}%;background:rgba(120,128,160,.05)"></div>
    ${ql(pT, pL, plotW / 2, plotH / 2, 'var(--accent2)', t('matrix_satisfy'))}
    ${ql(pT, midX, plotW / 2, plotH / 2, 'var(--accent3)', t('matrix_engage'))}
    ${ql(midY, pL, plotW / 2, plotH / 2, 'var(--muted)', t('matrix_monitor'))}
    ${ql(midY, midX, plotW / 2, plotH / 2, 'var(--muted)', t('matrix_inform'))}
    <div class="matrix-axis-x" style="bottom:${pB}%;left:${pL}%;right:${pR}%"></div>
    <div class="matrix-axis-y" style="left:${pL}%;top:${pT}%;bottom:${pB}%"></div>
    ${[1,2,3,4,5,6,7,8,9,10].map(v => `
      <span style="position:absolute;font-family:var(--font-mono);font-size:.6rem;color:var(--muted);bottom:${pB - 5.5}%;left:${pL + ((v - 1) / 9) * plotW}%;transform:translateX(-50%)">${v}</span>
      <span style="position:absolute;font-family:var(--font-mono);font-size:.6rem;color:var(--muted);left:${pL - 3.5}%;top:${pT + ((9 - (v - 1)) / 9) * plotH}%;transform:translateY(-50%)">${v}</span>
    `).join('')}
    <span class="axis-label x">${t('matrix_axis_influence')}</span>
    <span class="axis-label y">${t('matrix_axis_interest')}</span>`;

  proj.items.map(item => getMerged(item)).filter(Boolean).forEach(s => {
    const dot = document.createElement('div'); dot.className = 'matrix-dot';
    const dotTopPct = dotT + ((9 - (s.interesse - 1)) / 9) * dotH;
    dot.style.left = (dotL + ((s.einfluss - 1) / 9) * dotW) + '%';
    dot.style.top  = dotTopPct + '%';
    const col = HALTUNG_COLORS[s.haltung];
    dot.style.background  = col + '22';
    dot.style.borderColor = col;
    dot.style.color       = col;
    // Dot size and border weight based on relationship strength (1–5 → 24px–56px)
    const bez = s.beziehung || 3;
    const dotPx = 16 + bez * 8;
    dot.style.width       = dotPx + 'px';
    dot.style.height      = dotPx + 'px';
    dot.style.fontSize    = (0.5 + bez * 0.06) + 'rem';
    dot.style.borderWidth = (1 + bez * 0.5) + 'px';
    dot.style.opacity     = (0.6 + bez * 0.08).toString();
    if (bez >= 4) dot.style.boxShadow = `0 0 ${bez * 4}px ${col}66`;
    const stars = '★'.repeat(bez) + '☆'.repeat(5 - bez);
    const tipDir = dotTopPct < 25 ? 'tip-down' : 'tip-up';
    dot.innerHTML = `${initials(shFullName(s))}<div class="dot-tooltip ${tipDir}"><strong>${esc(shFullName(s))}</strong><br>${esc(s.rolle)}<br>${t('detail_influence')}: ${s.einfluss} · ${t('detail_interest')}: ${s.interesse}<br><span style="color:var(--accent2);letter-spacing:1px">${stars}</span></div>`;
    dot.onclick = () => openDetail(s.id);
    c.appendChild(dot);
  });
}

// ── Kontakte view ─────────────────────────────────────────────────────────────

function renderKontakte() {
  const q    = (document.getElementById('shdb-search')?.value || '').toLowerCase();
  const list = stakeholders.filter(sh => !q || shFullName(sh).toLowerCase().includes(q) || (sh.rolle || '').toLowerCase().includes(q));
  const el   = document.getElementById('shdb-body'); if (!el) return;
  el.innerHTML = list.length === 0
    ? `<tr><td colspan="6"><div class="shdb-empty">${t('contacts_empty')}</div></td></tr>`
    : list.map(sh => {
        const projTags = projects.filter(p => p.items.some(i => i.shId === sh.id))
          .map(p => `<span class="shdb-proj-tag">${esc(p.name)}</span>`).join('');
        const bd = daysUntilBirthday(sh.geburtstag);
        const bdChip = bd !== null && bd <= 14
          ? `<span class="bday-chip">${bd === 0 ? '🎂 ' + t('birthday_today') : bd === 1 ? '🎂 ' + t('birthday_tomorrow') : '🎂 ' + bd + t('days_unit')}</span>` : '';
        return `<tr>
          <td class="name-cell"><strong>${esc(shFullName(sh))}${bdChip}</strong><span>${esc(sh.rolle)}</span></td>
          <td style="font-size:.83rem;color:var(--muted)">${sh.email ? `<a href="mailto:${esc(sh.email)}" style="color:inherit">${esc(sh.email)}</a>` : '-'}</td>
          <td style="font-size:.83rem;color:var(--muted)">${esc(sh.tel) || '-'}</td>
          <td style="font-size:.83rem;color:var(--muted)">${sh.geburtstag ? fmtDate(sh.geburtstag) : '-'}</td>
          <td>${projTags || '<span style="color:var(--muted);font-size:.75rem">–</span>'}</td>
          <td onclick="event.stopPropagation()">
            <div class="row-actions" style="opacity:1">
              <button class="row-btn" onclick="openKontaktEditModal(${sh.id})">${t('btn_edit')}</button>
              <button class="row-btn del" onclick="deleteStakeholder(${sh.id})">✕</button>
            </div>
          </td>
        </tr>`;
      }).join('');
}

// ── Projects view ─────────────────────────────────────────────────────────────

function renderProjectsView() {
  const el = document.getElementById('proj-cards-container'); if (!el) return;
  el.innerHTML = projects.map(p => `
    <div class="proj-card${p.id === activeProjectId ? ' is-active' : ''}">
      <div class="proj-card-name">${esc(p.name)}${p.id === activeProjectId ? `<span class="proj-card-badge">${t('proj_active_badge')}</span>` : ''}</div>
      <div class="proj-card-meta">${p.items.length} ${t('proj_stakeholder_count')} · ${p.plan?.reduce((n, y) => n + y.items.length, 0) || 0} ${t('proj_plan_measures')}</div>
      ${p.desc ? `<div class="proj-card-desc">${esc(p.desc)}</div>` : '<div class="proj-card-desc"></div>'}
      <div class="proj-card-actions">
        ${p.id !== activeProjectId
          ? `<button class="btn btn-primary" style="flex:1;padding:7px 14px;font-size:.82rem" onclick="switchProjectAndView('${p.id}')">${t('btn_open')}</button>`
          : `<button class="btn btn-secondary" style="flex:1;padding:7px 14px;font-size:.82rem" onclick="switchTab(document.querySelector('nav .tab'),'liste')">${t('btn_to_list')}</button>`}
        <button class="btn btn-secondary" style="padding:7px 12px;font-size:.82rem" onclick="openProjModal('${p.id}')">✏</button>
        <button class="btn btn-danger"    style="padding:7px 12px;font-size:.82rem" onclick="deleteProjectById('${p.id}')">🗑</button>
      </div>
    </div>`).join('') +
    `<div class="proj-card proj-add-card" onclick="openProjModal()">
      <div class="proj-add-icon">+</div>
      <div style="font-size:.85rem">${t('btn_new_project')}</div>
    </div>`;
}

// ── Dashboard ─────────────────────────────────────────────────────────────────

function renderDashboard() {
  const el = document.getElementById('dash-body'); if (!el) return;
  const now = Date.now();

  // Build enriched list of all items across all projects
  const all = [];
  projects.forEach(proj => {
    proj.items.forEach(item => {
      const sh = stakeholders.find(s => s.id === item.shId); if (!sh) return;
      const s = { ...sh, ...item, id: sh.id, projName: proj.name, projId: proj.id };
      const interval = getContactInterval(s);
      const j = sh.journal || [];
      const lastEntry = j.length ? j.reduce((a, b) => a.date > b.date ? a : b) : null;
      const daysSince = lastEntry ? Math.floor((now - new Date(lastEntry.date).getTime()) / 86400000) : null;
      all.push({ ...s, interval, daysSince, lastEntry });
    });
  });

  // Overdue: never contacted OR daysSince > interval
  const overdue = all
    .filter(s => s.daysSince === null || s.daysSince > s.interval)
    .sort((a, b) => (b.daysSince ?? 99999) - (a.daysSince ?? 99999));

  // Due soon: 60–100% of interval (not yet overdue)
  const dueSoon = all
    .filter(s => s.daysSince !== null && s.daysSince > s.interval * 0.6 && s.daysSince <= s.interval)
    .sort((a, b) => b.daysSince - a.daysSince);

  // Aufgaben: all open tasks across all projects, sorted by date
  const aufgabenList = [];
  projects.forEach(proj => {
    proj.items.forEach(item => {
      const sh = stakeholders.find(s => s.id === item.shId); if (!sh) return;
      (item.aufgaben || []).filter(a => !a.done).forEach(a => {
        aufgabenList.push({ ...a, shName: shFullName(sh), shId: sh.id, projId: proj.id });
      });
    });
  });
  aufgabenList.sort((a, b) => (a.date || '9999') < (b.date || '9999') ? -1 : 1);

  // Recent journal entries across all stakeholders, newest first
  const recentEntries = [];
  stakeholders.forEach(sh => {
    (sh.journal || []).forEach(e => {
      recentEntries.push({ ...e, shId: sh.id, shName: shFullName(sh), shRolle: sh.rolle });
    });
  });
  recentEntries.sort((a, b) => new Date(b.date) - new Date(a.date));
  const recent = recentEntries.slice(0, 8);

  const today = new Date().toISOString().slice(0, 10);

  // Column 1: overdue tasks (date < today)
  const aufgabenOverdue = aufgabenList.filter(a => a.date && a.date < today);
  const overdueHtml = aufgabenOverdue.length === 0
    ? `<div class="dash-empty">${t('dash_no_overdue')}</div>`
    : aufgabenOverdue.map(a => {
        const isBd = !!a.autoBirthday;
        return `<div class="dash-card${isBd ? '" style="background:rgba(212,160,23,.07)' : ''}" onclick="switchProject('${a.projId}');openDetailAufgaben(${a.shId})">
          <div class="dash-card-name">${esc(a.title)}</div>
          <div class="dash-card-meta">${esc(a.shName)}${a.tag ? ` · <span class="dash-proj-tag">${esc(a.tag)}</span>` : ''}</div>
          <div class="dash-card-age overdue">${a.date}</div>
        </div>`;
      }).join('');

  // Column 2: tasks due soon (today or within next 14 days, not overdue)
  const in14 = new Date(); in14.setDate(in14.getDate() + 14);
  const in14Str = in14.toISOString().slice(0, 10);
  const aufgabenSoon = aufgabenList.filter(a => a.date && a.date >= today && a.date <= in14Str);
  const dueSoonHtml = aufgabenSoon.length === 0
    ? `<div class="dash-empty">${t('dash_no_soon')}</div>`
    : aufgabenSoon.map(a => {
        const remind = a.reminder && a.reminder <= today;
        return `<div class="dash-card" onclick="switchProject('${a.projId}');openDetailAufgaben(${a.shId})">
          <div class="dash-card-name">${esc(a.title)}</div>
          <div class="dash-card-meta">${esc(a.shName)}${a.tag ? ` · <span class="dash-proj-tag">${esc(a.tag)}</span>` : ''}</div>
          <div class="dash-card-age warn">${a.date}${remind ? ' 🔔' : ''}</div>
        </div>`;
      }).join('');

  // Column 3: all open tasks
  const aufgabenHtml = aufgabenList.length === 0
    ? `<div class="dash-empty">${t('dash_aufgaben_empty')}</div>`
    : aufgabenList.map(a => {
        const isOverdue = a.date && a.date < today;
        const remind    = a.reminder && a.reminder <= today;
        return `<div class="dash-card" onclick="switchProject('${a.projId}');openDetailAufgaben(${a.shId})">
          <div class="dash-card-name">${esc(a.title)}</div>
          <div class="dash-card-meta">${esc(a.shName)}${a.tag ? ` · <span class="dash-proj-tag">${esc(a.tag)}</span>` : ''}</div>
          <div class="dash-card-age${isOverdue ? ' overdue' : remind ? ' warn' : ''}">${a.date || '–'}${remind ? ' 🔔' : ''}</div>
        </div>`;
      }).join('');

  const recentHtml = recent.length === 0
    ? `<div class="dash-empty">${t('dash_no_recent')}</div>`
    : recent.map(e => `
      <div class="dash-card" style="cursor:default">
        <div class="dash-card-name">${esc(e.shName)}</div>
        <div class="dash-card-meta">${esc(e.shRolle)}</div>
        <div class="dash-card-text">${esc(e.text.length > 80 ? e.text.slice(0, 80) + '…' : e.text)}</div>
        <div class="dash-card-date">${fmtDateTime(e.date)}</div>
      </div>`).join('');

  el.innerHTML = `
    <div class="dash-search-wrap">
      <input class="dash-search-input" id="dash-search" type="text"
        placeholder="${t('dash_search_placeholder')}"
        oninput="renderDashboardSearch(this.value)">
      <div id="dash-search-results" class="dash-search-results" style="display:none"></div>
    </div>
    <div class="dash-cols">
      <div class="dash-col">
        <div class="dash-section-title overdue">${t('dash_overdue')} <span class="dash-count">${aufgabenOverdue.length}</span></div>
        <div class="dash-list">${overdueHtml}</div>
      </div>
      <div class="dash-col">
        <div class="dash-section-title warn">${t('dash_due_soon')} <span class="dash-count">${aufgabenSoon.length}</span></div>
        <div class="dash-list">${dueSoonHtml}</div>
      </div>
      <div class="dash-col">
        <div class="dash-section-title">${t('dash_all_tasks')} <span class="dash-count">${aufgabenList.length}</span></div>
        <div class="dash-list">${aufgabenHtml}</div>
      </div>
      <div class="dash-col">
        <div class="dash-section-title">${t('dash_recent')}</div>
        <div class="dash-list">${recentHtml}</div>
      </div>
    </div>`;
}

function renderDashboardSearch(q) {
  const resultsEl = document.getElementById('dash-search-results'); if (!resultsEl) return;
  q = q.trim().toLowerCase();
  if (!q) { resultsEl.style.display = 'none'; resultsEl.innerHTML = ''; return; }

  const now = Date.now();
  const matches = [];
  stakeholders.forEach(sh => {
    if (!shFullName(sh).toLowerCase().includes(q) && !(sh.rolle || '').toLowerCase().includes(q)) return;
    const projContexts = projects.map(p => {
      const item = p.items.find(i => i.shId === sh.id); if (!item) return null;
      const s = { ...sh, ...item };
      const interval = getContactInterval(s);
      const j = sh.journal || [];
      const lastEntry = j.length ? j.reduce((a, b) => a.date > b.date ? a : b) : null;
      const daysSince = lastEntry ? Math.floor((now - new Date(lastEntry.date).getTime()) / 86400000) : null;
      const cls = daysSince === null || daysSince > interval ? 'overdue'
                : daysSince > interval * 0.6 ? 'warn' : 'ok';
      return { projName: p.name, projId: p.id, item, daysSince, cls, interval };
    }).filter(Boolean);
    matches.push({ sh, projContexts });
  });

  if (matches.length === 0) {
    resultsEl.innerHTML = `<div class="dash-search-empty">${t('dash_search_empty')}</div>`;
    resultsEl.style.display = 'block';
    return;
  }

  resultsEl.innerHTML = matches.map(({ sh, projContexts }) => {
    const projTags = projContexts.map(ctx => {
      const ageLabel = ctx.daysSince === null
        ? `<span class="contact-age overdue">${t('dash_never')}</span>`
        : `<span class="contact-age ${ctx.cls}">${ctx.daysSince}${t('days_unit')}</span>`;
      return `<span class="dash-search-proj" onclick="switchProject('${ctx.projId}');openDetail(${sh.id})">
        <span class="dash-proj-tag">${esc(ctx.projName)}</span>${ageLabel}
      </span>`;
    }).join('');
    const bd = daysUntilBirthday(sh.geburtstag);
    const bdChip = bd !== null && bd <= 14
      ? `<span class="bday-chip">${bd === 0 ? '🎂 ' + t('birthday_today') : bd === 1 ? '🎂 ' + t('birthday_tomorrow') : '🎂 ' + bd + t('days_unit')}</span>` : '';
    return `<div class="dash-search-row" onclick="openDetail(${sh.id})">
      <div class="dash-search-name">${esc(shFullName(sh))}${bdChip} <span class="dash-search-rolle">${esc(sh.rolle)}</span></div>
      <div class="dash-search-projs">${projTags || '<span style="color:var(--muted);font-size:.75rem">–</span>'}</div>
    </div>`;
  }).join('');
  resultsEl.style.display = 'block';
}

// ── Journal Search ────────────────────────────────────────────────────────────

function renderJsNewContactSelect() {
  const sel = document.getElementById('js-new-contact'); if (!sel) return;
  const cur = sel.value;
  const sorted = [...stakeholders].sort((a, b) => shFullName(a).localeCompare(shFullName(b)));
  sel.innerHTML = `<option value="">${t('js_select_contact')}</option>`
    + sorted.map(sh => `<option value="${sh.id}"${sh.id == cur ? ' selected' : ''}>${esc(shFullName(sh))}</option>`).join('');
}

function addJournalFromSearch() {
  const shId   = parseInt(document.getElementById('js-new-contact')?.value);
  const type   = document.getElementById('js-new-type')?.value || null;
  const textEl = document.getElementById('js-new-text');
  const text   = textEl?.value.trim();
  if (!shId || !text) return;
  const sh = stakeholders.find(s => s.id === shId); if (!sh) return;
  if (!sh.journal) sh.journal = [];
  sh.journal.push({ date: new Date().toISOString(), text, type: type || null });
  _syncAutoContactTask(shId);
  _syncBirthdayTask(shId);
  saveNow();
  textEl.value = '';
  renderJournalSearch();
  renderTable();
}

function renderJournalSearch() {
  const el = document.getElementById('journal-search-body'); if (!el) return;
  const q    = (document.getElementById('js-query')?.value || '').toLowerCase();
  const type = document.getElementById('js-type')?.value || '';

  const projItemIds = new Set((getActiveProject()?.items || []).map(i => i.shId));
  const all = [];
  stakeholders.filter(sh => projItemIds.has(sh.id)).forEach(sh => {
    (sh.journal || []).forEach((e, idx) => {
      if (type && e.type !== type) return;
      if (q && !e.text.toLowerCase().includes(q) && !shFullName(sh).toLowerCase().includes(q)) return;
      all.push({ sh, e, idx });
    });
  });
  all.sort((a, b) => new Date(b.e.date) - new Date(a.e.date));

  if (all.length === 0) {
    el.innerHTML = `<div style="color:var(--muted);padding:30px 0;text-align:center">${t('journal_search_empty')}</div>`;
    return;
  }

  el.innerHTML = all.map(({ sh, e, idx }) => {
    const hi = s => q ? s.replace(new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g,'\\$&'), 'gi'), m => `<mark class="js-hi">${m}</mark>`) : s;
    return `<div class="js-row" onclick="openDetailJournal(${sh.id})">
      <div class="js-row-head">
        <span class="js-row-name">${esc(shFullName(sh))}</span>
        <span class="js-row-date">${fmtDateTime(e.date)}</span>
        ${e.type ? `<span class="journal-type-badge jtype-${e.type}">${t('jtype_' + e.type)}</span>` : ''}
      </div>
      <div class="js-row-rolle">${esc(sh.rolle)}</div>
      <div class="js-row-text">${hi(esc(e.text))}</div>
    </div>`;
  }).join('');
}

// ── Aufgaben View ─────────────────────────────────────────────────────────────

function renderAvNewContactSelect() {
  const sel = document.getElementById('av-new-contact'); if (!sel) return;
  const cur = sel.value;
  const sorted = [...stakeholders].sort((a, b) => shFullName(a).localeCompare(shFullName(b)));
  sel.innerHTML = `<option value="">${t('js_select_contact')}</option>`
    + sorted.map(sh => `<option value="${sh.id}"${sh.id == cur ? ' selected' : ''}>${esc(shFullName(sh))}</option>`).join('');
  sel.value = cur;
  renderAvNewProjSelect();
}

function renderAvNewProjSelect() {
  const contSel = document.getElementById('av-new-contact');
  const projSel = document.getElementById('av-new-proj'); if (!projSel) return;
  const shId = parseInt(contSel?.value);
  const cur  = projSel.value;
  const shProjects = isNaN(shId) ? [] : projects.filter(p => p.items.some(i => i.shId == shId));
  projSel.innerHTML = `<option value="">${t('js_select_project')}</option>`
    + shProjects.map(p => `<option value="${p.id}"${p.id == cur ? ' selected' : ''}>${esc(p.name)}</option>`).join('');
  projSel.value = shProjects.find(p => p.id == cur) ? cur : (shProjects.length === 1 ? String(shProjects[0].id) : '');
}

function openAvNewModal() {
  renderAvNewContactSelect();
  const intSel = document.getElementById('av-new-interval');
  if (intSel && !intSel.options.length) intSel.innerHTML = _intervalOptions('');
  document.getElementById('av-new-modal').classList.add('open');
  setTimeout(() => document.getElementById('av-new-title')?.focus(), 80);
}

function closeAvNewModal() {
  document.getElementById('av-new-modal').classList.remove('open');
}

function addAufgabeFromView() {
  const shId  = parseInt(document.getElementById('av-new-contact')?.value);
  const projId = parseInt(document.getElementById('av-new-proj')?.value);
  const title  = document.getElementById('av-new-title')?.value.trim();
  if (!shId || !projId || !title) {
    const fields = [
      { id: 'av-new-contact', empty: !shId },
      { id: 'av-new-proj',    empty: !projId },
      { id: 'av-new-title',   empty: !title },
    ];
    fields.forEach(({ id, empty }) => {
      const el = document.getElementById(id);
      if (!el) return;
      if (empty) {
        el.classList.add('input-error');
        el.addEventListener('input', () => el.classList.remove('input-error'), { once: true });
        el.addEventListener('change', () => el.classList.remove('input-error'), { once: true });
      }
    });
    return;
  }
  const proj = projects.find(p => p.id == projId); if (!proj) return;
  const item = proj.items.find(i => i.shId == shId); if (!item) return;
  if (!item.aufgaben) item.aufgaben = [];
  const date     = document.getElementById('av-new-date')?.value || '';
  const reminder = document.getElementById('av-new-reminder')?.value || '';
  const interval = parseInt(document.getElementById('av-new-interval')?.value) || null;
  const tag      = document.getElementById('av-new-tag')?.value.trim() || '';
  item.aufgaben.push({ id: nextAufgabeId++, title, date, reminder, interval, tag, done: false });
  saveNow();
  closeAvNewModal();
  // Reset fields
  ['av-new-title','av-new-date','av-new-reminder','av-new-tag'].forEach(id => { const el = document.getElementById(id); if (el) el.value = ''; });
  const intEl = document.getElementById('av-new-interval');
  if (intEl) intEl.value = '';
  renderAufgabenView();
}

function renderAufgabenView() {
  const el = document.getElementById('av-body'); if (!el) return;
  const q      = (document.getElementById('av-query')?.value || '').toLowerCase();
  const status = document.getElementById('av-status')?.value || 'open';
  const projId = document.getElementById('av-proj')?.value || '';
  const tag    = document.getElementById('av-tag')?.value || '';
  const today  = new Date().toISOString().slice(0, 10);

  // Collect all tasks with context
  const all = [];
  projects.forEach(proj => {
    proj.items.forEach(item => {
      const sh = stakeholders.find(s => s.id === item.shId); if (!sh) return;
      (item.aufgaben || []).forEach(a => {
        all.push({ ...a, shName: shFullName(sh), shId: sh.id, shRolle: sh.rolle, projId: proj.id, projName: proj.name });
      });
    });
  });

  // Populate project filter (preserve selection)
  const projSel = document.getElementById('av-proj');
  if (projSel && projSel.options.length <= 1) {
    projects.forEach(p => {
      const opt = document.createElement('option');
      opt.value = p.id; opt.textContent = p.name;
      projSel.appendChild(opt);
    });
  }

  // Populate tag filter (preserve selection)
  const tagSel = document.getElementById('av-tag');
  if (tagSel && tagSel.options.length <= 1) {
    const tags = [...new Set(all.map(a => a.tag).filter(Boolean))].sort();
    tags.forEach(tg => {
      const opt = document.createElement('option');
      opt.value = tg; opt.textContent = tg;
      tagSel.appendChild(opt);
    });
  }

  // Filter
  const filtered = all.filter(a => {
    if (status === 'open' && a.done) return false;
    if (status === 'done' && !a.done) return false;
    if (projId && String(a.projId) !== String(projId)) return false;
    if (tag && a.tag !== tag) return false;
    if (q && !a.title.toLowerCase().includes(q) && !a.shName.toLowerCase().includes(q) && !(a.tag||'').toLowerCase().includes(q)) return false;
    return true;
  });

  const sort = document.getElementById('av-sort')?.value || 'date';
  filtered.sort((a, b) => {
    if (sort === 'title') return (a.title||'').localeCompare(b.title||'');
    if (sort === 'name')  return (a.shName||'').localeCompare(b.shName||'');
    return (a.date || '9999') < (b.date || '9999') ? -1 : 1;
  });

  if (filtered.length === 0) {
    el.innerHTML = `<div style="color:var(--muted);padding:30px 0;text-align:center">${t('av_empty')}</div>`;
    return;
  }

  const hi = s => q ? s.replace(new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g,'\\$&'), 'gi'), m => `<mark class="js-hi">${m}</mark>`) : s;

  el.innerHTML = filtered.map(a => {
    const overdue   = !a.done && a.date && a.date < today;
    const autoIcon  = a.autoBirthday ? '🎂 ' : a.autoContact ? '🔄 ' : '';
    const isSelected = _avDetailCtx && _avDetailCtx.aufgabeId === a.id && _avDetailCtx.projId === a.projId;
    const dateLabel = a.date ? `<span class="av-row-date${overdue ? ' overdue' : ''}">${a.date}</span>` : '';
    const autoRow = !!(a.autoBirthday || a.autoContact);
    return `<div class="js-row${a.done ? ' aufgabe-done' : ''}${isSelected ? ' av-selected' : ''}" data-sh="${a.shId}" data-proj="${a.projId}" data-id="${a.id}" onclick="selectAvDetail(${a.shId},'${a.projId}',${a.id})">
      <input type="checkbox" class="av-list-check" ${a.done ? 'checked' : ''} onclick="event.stopPropagation()" onchange="toggleAufgabeGlobal('${a.projId}',${a.shId},${a.id},this.checked)">
      <div class="js-row-body">
        <div class="js-row-head">
          <span class="js-row-name">${overdue ? '⚠️ ' : ''}${autoIcon}${hi(esc(a.title))}</span>
          ${dateLabel}
        </div>
        <div class="av-row-sh-name">${hi(esc(a.shName))}</div>
      </div>
      ${autoRow ? '' : `<button class="av-row-del" onclick="event.stopPropagation();deleteAufgabeGlobal(${a.projId},${a.shId},${a.id})" title="${t('btn_delete')}">✕</button>`}
    </div>`;
  }).join('');

  // Auto-select first task if nothing selected yet
  if (!_avDetailCtx && filtered.length > 0) {
    const first = filtered[0];
    selectAvDetail(first.shId, first.projId, first.id);
  }
}

// ── Aufgaben view detail panel ────────────────────────────────────────────────

let _avDetailCtx = null;

function selectAvDetail(shId, projId, aufgabeId) {
  _avDetailCtx = { shId, projId: parseInt(projId), aufgabeId };
  renderAufgabenView();
  // Ensure the row is highlighted even if isSelected check missed it (e.g. type mismatch)
  document.querySelectorAll('#av-body .js-row').forEach(r => r.classList.remove('av-selected'));
  const sel = document.querySelector(`#av-body .js-row[data-id="${aufgabeId}"]`);
  if (sel) sel.classList.add('av-selected');
  renderAvDetailIfOpen();
}

function renderAvDetailIfOpen() {
  if (!_avDetailCtx) return;
  const el = document.getElementById('av-detail'); if (!el) return;
  const { shId, projId, aufgabeId } = _avDetailCtx;

  const savedProj = activeProjectId;
  activeProjectId = projId;

  const sh   = stakeholders.find(s => s.id === shId);
  const proj = getActiveProject();
  const item = proj?.items.find(i => i.shId === shId);
  const task = item?.aufgaben?.find(a => a.id === aufgabeId);

  if (!sh || !task) { el.innerHTML = `<div class="av-detail-empty">${t('av_detail_select')}</div>`; activeProjectId = savedProj; return; }

  const today = new Date().toISOString().slice(0, 10);
  const overdue = !task.done && task.date && task.date < today;

  // ── Top card: selected task fields ──
  const topCard = `
    <div class="av-detail-task-card">
      <div class="av-detail-task-title"${overdue ? ' style="color:var(--danger)"' : ''}>${esc(task.title)}</div>
      <div class="av-detail-fields">
        <div class="av-detail-field">
          <div class="av-detail-field-label">${t('aufgaben_th_date')}</div>
          <input type="date" value="${task.date||''}" onchange="saveAufgabeFieldGlobal(${projId},${shId},${aufgabeId},'date',this.value)">
        </div>
        <div class="av-detail-field">
          <div class="av-detail-field-label">${t('aufgaben_th_reminder')}</div>
          <input type="date" value="${task.reminder||''}" onchange="saveAufgabeFieldGlobal(${projId},${shId},${aufgabeId},'reminder',this.value)">
        </div>
        <div class="av-detail-field">
          <div class="av-detail-field-label">${t('aufgaben_th_interval')}</div>
          <select onchange="saveAufgabeFieldGlobal(${projId},${shId},${aufgabeId},'interval',this.value?parseInt(this.value):null)">${_intervalOptions(task.interval)}</select>
        </div>
        <div class="av-detail-field">
          <div class="av-detail-field-label">${t('aufgaben_th_tag')}</div>
          <input type="text" value="${esc(task.tag||'')}" placeholder="${t('aufgaben_tag_placeholder')}" onchange="saveAufgabeFieldGlobal(${projId},${shId},${aufgabeId},'tag',this.value)">
        </div>
        <div class="av-detail-field av-detail-field-notes">
          <div class="av-detail-field-label">${t('aufgaben_th_notes')}</div>
          <textarea onchange="saveAufgabeFieldGlobal(${projId},${shId},${aufgabeId},'notes',this.value)">${esc(task.notes||'')}</textarea>
        </div>
      </div>
    </div>`;

  // ── Bottom: all tasks of this contact ──
  const allTasks = (item.aufgaben || []).slice().sort((a, b) => (a.date||'9999') < (b.date||'9999') ? -1 : 1);
  const doneCount = allTasks.filter(a => a.done).length;
  const visibleTasks = _showDoneAufgaben ? allTasks : allTasks.filter(a => !a.done);
  const taskRows = visibleTasks.map(tk => {
    const od = !tk.done && tk.date && tk.date < today;
    const autoRow = !!(tk.autoContact || tk.autoBirthday);
    const autoIcon = tk.autoBirthday ? '🎂' : '🔄';
    const isSel = tk.id === aufgabeId;
    return `<tr class="${tk.done ? 'aufgabe-done' : ''}${od ? ' aufgabe-overdue' : ''}${autoRow ? ' aufgabe-auto' : ''}${isSel ? ' av-task-sel' : ''} av-task-clickable" onclick="selectAvDetail(${shId},'${projId}',${tk.id})">
      <td class="aufgabe-td-check" onclick="event.stopPropagation()"><input type="checkbox" class="aufgabe-check" ${tk.done ? 'checked' : ''} onchange="toggleAufgabeGlobal('${projId}',${shId},${tk.id},this.checked)"></td>
      <td class="aufgabe-td-title">${autoRow ? `<span class="aufgabe-auto-icon">${autoIcon}</span>` : ''}<span style="font-size:.84rem${tk.done ? ';text-decoration:line-through;color:var(--muted)' : ''}">${esc(tk.title)}</span></td>
      <td class="aufgabe-td-del" onclick="event.stopPropagation()">${autoRow ? '' : `<button class="aufgabe-del" onclick="deleteAufgabeGlobal(${projId},${shId},${tk.id})">✕</button>`}</td>
    </tr>`;
  }).join('');

  el.innerHTML = `
    ${topCard}
    <div class="av-detail-section-sep">
      <span class="av-detail-section-sep-name">${esc(shFullName(sh))}</span>
      <span class="av-detail-section-sep-label">${t('av_weitere_aufgaben')}</span>
      ${doneCount > 0 ? `<button class="aufgabe-toggle-done${_showDoneAufgaben?' active':''}" style="margin-left:auto" onclick="toggleShowDoneAufgaben(${shId})">
        ${_showDoneAufgaben?(appLang==='en'?'Hide done':'Erledigte ausblenden'):(appLang==='en'?`Done (${doneCount})`:`Erledigt (${doneCount})`)}
      </button>` : ''}
    </div>
    <div class="aufgaben-table-wrap">
      <table class="aufgaben-table">
        <tbody>${taskRows}</tbody>
        <tfoot><tr>
          <td class="aufgabe-td-check"></td>
          <td class="aufgabe-td-title"><input class="aufgabe-inline-input aufgabe-new-input" type="text" id="aufgabe-new-title-avd-${shId}" placeholder="${t('aufgaben_title_placeholder')}" onkeydown="if(event.key==='Enter')addAufgabeGlobal(${projId},${shId})"></td>
          <td class="aufgabe-td-del"><button class="aufgabe-add-btn" onclick="addAufgabeGlobal(${projId},${shId})">＋</button></td>
        </tr></tfoot>
      </table>
    </div>`;

  activeProjectId = savedProj;
}

function saveAufgabeFieldGlobal(projId, shId, aufgabeId, field, value) {
  const savedProj = activeProjectId;
  activeProjectId = parseInt(projId);
  saveAufgabeField(shId, aufgabeId, field, value);
  activeProjectId = savedProj;
  renderAufgabenView();
}

function deleteAufgabeGlobal(projId, shId, aufgabeId) {
  const savedProj = activeProjectId;
  activeProjectId = parseInt(projId);
  deleteAufgabe(shId, aufgabeId);
  activeProjectId = savedProj;
}

function addAufgabeGlobal(projId, shId) {
  const title = document.getElementById(`aufgabe-new-title-avd-${shId}`)?.value.trim();
  if (!title) return;
  const savedProj = activeProjectId;
  activeProjectId = parseInt(projId);
  const proj = getActiveProject();
  const item = proj?.items.find(i => i.shId === shId); if (!item) { activeProjectId = savedProj; return; }
  if (!item.aufgaben) item.aufgaben = [];
  item.aufgaben.push({ id: nextAufgabeId++, title, date: '', reminder: '', interval: null, tag: '', done: false });
  saveNow();
  activeProjectId = savedProj;
  renderAvDetailIfOpen();
  renderAufgabenView();
}

function toggleAufgabeGlobal(projId, shId, aufgabeId, done) {
  const savedProj = activeProjectId;
  activeProjectId = parseInt(projId);
  toggleAufgabe(shId, aufgabeId, done);
  activeProjectId = savedProj;
}

function switchProjectAndView(id) {
  activeProjectId = id;
  saveNow();
  switchTab(document.querySelector('nav .tab'), 'liste');
  renderProjectSelector();
  renderTable();
  renderBirthdayAlerts();
  updateStats();
  updatePlanTabLabel();
}

// ── Convenience: re-render everything ────────────────────────────────────────

function renderAll() {
  renderOrgName();
  renderProjectSelector();
  renderTable();
  renderBirthdayAlerts();
  updatePlanTabLabel();
  renderKontakte();
  renderProjectsView();
  renderDashboard();
}
