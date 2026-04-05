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
    return `<div class="birthday-bar">🎂 <strong>${esc(s.name)}</strong> ${isToday ? t('birthday_alert_today') : t('birthday_alert_soon')} (${String(d).padStart(2, '0')}.${String(m).padStart(2, '0')}.)</div>`;
  }).join('');
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
      '<tr><td colspan="9" style="text-align:center;color:var(--muted);padding:40px">' + t('table_no_project') + '</td></tr>';
    return;
  }
  const q  = (document.getElementById('search')?.value || '').toLowerCase();
  const fg = document.getElementById('filter-gruppe')?.value  || '';
  const fh = document.getElementById('filter-haltung')?.value || '';
  const merged   = proj.items.map(item => getMerged(item)).filter(Boolean);
  const filtered = merged.filter(s => {
    if (q  && !s.name.toLowerCase().includes(q) && !s.rolle.toLowerCase().includes(q)) return false;
    if (fg && s.gruppe   !== fg) return false;
    if (fh && s.haltung  !== fh) return false;
    return true;
  });

  const HALTUNG_ORDER = { supportiv: 0, neutral: 1, kritisch: 2 };

  if (sortCol) {
    filtered.sort((a, b) => {
      let va, vb;
      if      (sortCol === 'name')      { va = a.name.toLowerCase();       vb = b.name.toLowerCase(); }
      else if (sortCol === 'gruppe')    { va = a.gruppe;                   vb = b.gruppe; }
      else if (sortCol === 'einfluss')  { va = a.einfluss;                 vb = b.einfluss; }
      else if (sortCol === 'interesse') { va = a.interesse;                vb = b.interesse; }
      else if (sortCol === 'haltung')   { va = HALTUNG_ORDER[a.haltung] ?? 9; vb = HALTUNG_ORDER[b.haltung] ?? 9; }
      else if (sortCol === 'strategie') { va = getStrategie(a);            vb = getStrategie(b); }
      else if (sortCol === 'journal')   { va = (a.journal||[]).length;     vb = (b.journal||[]).length; }
      else if (sortCol === 'kontakt')   { va = _lastContactTs(a);          vb = _lastContactTs(b); }
      if (va < vb) return -sortDir;
      if (va > vb) return  sortDir;
      return 0;
    });
  }

  // Update header indicators
  document.getElementById('th-name').innerHTML      = `${t('th_name')} ${_sortIndicator('name')}`;
  document.getElementById('th-gruppe').innerHTML    = `${t('th_gruppe')} ${_sortIndicator('gruppe')}`;
  document.getElementById('th-einfluss').innerHTML  = `${t('th_einfluss')} ${_sortIndicator('einfluss')}`;
  document.getElementById('th-interesse').innerHTML = `${t('th_interesse')} ${_sortIndicator('interesse')}`;
  document.getElementById('th-haltung').innerHTML   = `${t('th_haltung')} ${_sortIndicator('haltung')}`;
  document.getElementById('th-strategie').innerHTML = `${t('th_strategie')} ${_sortIndicator('strategie')}`;
  document.getElementById('th-journal').innerHTML   = `${t('th_journal')} ${_sortIndicator('journal')}`;
  document.getElementById('th-kontakt').innerHTML   = `${t('th_kontakt')} ${_sortIndicator('kontakt')}`;

  document.getElementById('table-body').innerHTML = filtered.length === 0
    ? `<tr><td colspan="9" style="text-align:center;color:var(--muted);padding:40px">${t('table_empty')} <a href="#" onclick="openPickerOverlay();return false" style="color:var(--accent)">${t('table_add_link')}</a></td></tr>`
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
          const cls = daysSince > contactWarningDays        ? 'overdue'
                    : daysSince > contactWarningDays * 0.6  ? 'warn'
                    :                                         'ok';
          return `<td><span class="contact-date">${label}</span> <span class="contact-age ${cls}">${daysSince}${t('days_unit')}</span></td>`;
        })();
        return `<tr onclick="openDetail(${s.id})">
          <td class="name-cell"><strong>${esc(s.name)}${bdChip}</strong><span>${esc(s.rolle)}</span></td>
          <td><span class="badge badge-${s.gruppe}">${t('badge_' + s.gruppe)}</span></td>
          <td><div class="score-wrap"><div class="bar-track bar-einfluss"><div class="bar-fill" style="width:${s.einfluss * 10}%"></div></div><span class="score-num">${s.einfluss}</span></div></td>
          <td><div class="score-wrap"><div class="bar-track bar-interesse"><div class="bar-fill" style="width:${s.interesse * 10}%"></div></div><span class="score-num">${s.interesse}</span></div></td>
          <td><span class="badge badge-${s.haltung}">${t('badge_' + s.haltung)}</span></td>
          <td style="font-size:.82rem;color:var(--muted)">${getStrategie(s)}</td>
          <td style="font-size:.8rem;color:var(--muted);font-family:var(--font-mono)">${jc > 0 ? `📓 ${jc}` : '–'}</td>
          ${lastContactCell}
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
    // Dot size based on Beziehungsstärke (1–5 → 22px–46px)
    const bez = s.beziehung || 3;
    const dotPx = 20 + bez * 5;
    dot.style.width  = dotPx + 'px';
    dot.style.height = dotPx + 'px';
    dot.style.fontSize = (0.55 + bez * 0.03) + 'rem';
    const stars = '★'.repeat(bez) + '☆'.repeat(5 - bez);
    const tipDir = dotTopPct < 25 ? 'tip-down' : 'tip-up';
    dot.innerHTML = `${initials(s.name)}<div class="dot-tooltip ${tipDir}"><strong>${esc(s.name)}</strong><br>${esc(s.rolle)}<br>${t('detail_influence')}: ${s.einfluss} · ${t('detail_interest')}: ${s.interesse}<br><span style="color:var(--accent2);letter-spacing:1px">${stars}</span></div>`;
    dot.onclick = () => openDetail(s.id);
    c.appendChild(dot);
  });
}

// ── Kontakte view ─────────────────────────────────────────────────────────────

function renderKontakte() {
  const q    = (document.getElementById('shdb-search')?.value || '').toLowerCase();
  const list = stakeholders.filter(sh => !q || sh.name.toLowerCase().includes(q) || sh.rolle.toLowerCase().includes(q));
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
          <td class="name-cell"><strong>${esc(sh.name)}${bdChip}</strong><span>${esc(sh.rolle)}</span></td>
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
      <div class="proj-card-meta">${p.items.length} Stakeholder · ${p.plan?.reduce((n, y) => n + y.items.length, 0) || 0} ${t('proj_plan_measures')}</div>
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

  // Birthdays: next 30 days
  const birthdays = stakeholders.map(sh => {
    const bd = daysUntilBirthday(sh.geburtstag);
    return (bd !== null && bd <= 30) ? { ...sh, daysUntilBd: bd } : null;
  }).filter(Boolean).sort((a, b) => a.daysUntilBd - b.daysUntilBd);

  // Recent journal entries across all stakeholders, newest first
  const recentEntries = [];
  stakeholders.forEach(sh => {
    (sh.journal || []).forEach(e => {
      recentEntries.push({ ...e, shId: sh.id, shName: sh.name, shRolle: sh.rolle });
    });
  });
  recentEntries.sort((a, b) => new Date(b.date) - new Date(a.date));
  const recent = recentEntries.slice(0, 8);

  const col = s => `background:${HALTUNG_COLORS[s.haltung]}22;border-left:3px solid ${HALTUNG_COLORS[s.haltung]}`;

  const overdueHtml = overdue.length === 0
    ? `<div class="dash-empty">${t('dash_no_overdue')}</div>`
    : overdue.map(s => `
      <div class="dash-card" style="${col(s)}" onclick="switchProject('${s.projId}');openDetail(${s.id})">
        <div class="dash-card-name">${esc(s.name)}</div>
        <div class="dash-card-meta">${esc(s.rolle)} · <span class="dash-proj-tag">${esc(s.projName)}</span></div>
        <div class="dash-card-age overdue">${s.daysSince === null ? t('dash_never') : s.daysSince + t('days_unit') + ' / ' + s.interval + t('days_unit')}</div>
      </div>`).join('');

  const dueSoonHtml = dueSoon.length === 0
    ? `<div class="dash-empty">${t('dash_no_soon')}</div>`
    : dueSoon.map(s => `
      <div class="dash-card" style="${col(s)}" onclick="switchProject('${s.projId}');openDetail(${s.id})">
        <div class="dash-card-name">${esc(s.name)}</div>
        <div class="dash-card-meta">${esc(s.rolle)} · <span class="dash-proj-tag">${esc(s.projName)}</span></div>
        <div class="dash-card-age warn">${s.daysSince}${t('days_unit')} / ${s.interval}${t('days_unit')}</div>
      </div>`).join('');

  const bdHtml = birthdays.length === 0
    ? `<div class="dash-empty">${t('dash_no_birthdays')}</div>`
    : birthdays.map(s => `
      <div class="dash-card" style="background:rgba(212,160,23,.07);border-left:3px solid var(--accent2)" onclick="openDetail(${s.id})">
        <div class="dash-card-name">🎂 ${esc(s.name)}</div>
        <div class="dash-card-meta">${esc(s.rolle)}</div>
        <div class="dash-card-age warn">${s.daysUntilBd === 0 ? t('birthday_today') : s.daysUntilBd + t('days_unit')}</div>
      </div>`).join('');

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
    <div class="dash-cols">
      <div class="dash-col">
        <div class="dash-section-title overdue">${t('dash_overdue')} <span class="dash-count">${overdue.length}</span></div>
        <div class="dash-list">${overdueHtml}</div>
      </div>
      <div class="dash-col">
        <div class="dash-section-title warn">${t('dash_due_soon')} <span class="dash-count">${dueSoon.length}</span></div>
        <div class="dash-list">${dueSoonHtml}</div>
      </div>
      <div class="dash-col">
        <div class="dash-section-title">${t('dash_birthdays')} <span class="dash-count">${birthdays.length}</span></div>
        <div class="dash-list">${bdHtml}</div>
      </div>
      <div class="dash-col">
        <div class="dash-section-title">${t('dash_recent')}</div>
        <div class="dash-list">${recentHtml}</div>
      </div>
    </div>`;
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
