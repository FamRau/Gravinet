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
    return `<div class="birthday-bar">🎂 <strong>${esc(s.name)}</strong> hat ${isToday ? '<strong>heute</strong>' : 'bald'} Geburtstag (${String(d).padStart(2, '0')}.${String(m).padStart(2, '0')}.)</div>`;
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
      '<tr><td colspan="9" style="text-align:center;color:var(--muted);padding:40px">Kein Projekt ausgewählt.</td></tr>';
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
  document.getElementById('th-name').innerHTML      = `Name / Funktion ${_sortIndicator('name')}`;
  document.getElementById('th-gruppe').innerHTML    = `Gruppe ${_sortIndicator('gruppe')}`;
  document.getElementById('th-einfluss').innerHTML  = `Einfluss ${_sortIndicator('einfluss')}`;
  document.getElementById('th-interesse').innerHTML = `Interesse ${_sortIndicator('interesse')}`;
  document.getElementById('th-haltung').innerHTML   = `Haltung ${_sortIndicator('haltung')}`;
  document.getElementById('th-strategie').innerHTML = `Strategie ${_sortIndicator('strategie')}`;
  document.getElementById('th-journal').innerHTML   = `Journal ${_sortIndicator('journal')}`;
  document.getElementById('th-kontakt').innerHTML   = `Letzter Kontakt ${_sortIndicator('kontakt')}`;

  document.getElementById('table-body').innerHTML = filtered.length === 0
    ? `<tr><td colspan="9" style="text-align:center;color:var(--muted);padding:40px">Keine Stakeholder in diesem Projekt. <a href="#" onclick="openPickerOverlay();return false" style="color:var(--accent)">Hinzufügen →</a></td></tr>`
    : filtered.map(s => {
        const jc = (s.journal || []).length;
        const bd = daysUntilBirthday(s.geburtstag);
        const bdChip = bd !== null && bd <= 14
          ? `<span class="bday-chip">${bd === 0 ? '🎂 heute' : bd === 1 ? '🎂 morgen' : '🎂 ' + bd + 'd'}</span>` : '';
        const lastEntry = jc > 0 ? (s.journal || []).reduce((a, b) => a.date > b.date ? a : b) : null;
        const lastContactCell = (() => {
          if (!lastEntry) return '<td></td>';
          const d = new Date(lastEntry.date);
          const sixMonthsAgo = new Date(); sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
          const old   = d < sixMonthsAgo;
          const label = d.toLocaleDateString('de-AT', { day: '2-digit', month: '2-digit', year: 'numeric' });
          return `<td style="font-family:var(--font-mono);font-size:.78rem;color:${old ? 'var(--danger)' : 'var(--muted)'}">${label}</td>`;
        })();
        return `<tr onclick="openDetail(${s.id})">
          <td class="name-cell"><strong>${esc(s.name)}${bdChip}</strong><span>${esc(s.rolle)}</span></td>
          <td><span class="badge badge-${s.gruppe}">${s.gruppe.toUpperCase()}</span></td>
          <td><div class="score-wrap"><div class="bar-track bar-einfluss"><div class="bar-fill" style="width:${s.einfluss * 10}%"></div></div><span class="score-num">${s.einfluss}</span></div></td>
          <td><div class="score-wrap"><div class="bar-track bar-interesse"><div class="bar-fill" style="width:${s.interesse * 10}%"></div></div><span class="score-num">${s.interesse}</span></div></td>
          <td><span class="badge badge-${s.haltung}">${s.haltung.charAt(0).toUpperCase() + s.haltung.slice(1)}</span></td>
          <td style="font-size:.82rem;color:var(--muted)">${getStrategie(s)}</td>
          <td style="font-size:.8rem;color:var(--muted);font-family:var(--font-mono)">${jc > 0 ? `📓 ${jc}` : '–'}</td>
          ${lastContactCell}
          <td onclick="event.stopPropagation()">
            <div class="row-actions">
              <button class="row-btn" onclick="openEditModal(${s.id})">✏ Bearbeiten</button>
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
    ${ql(pT, pL, plotW / 2, plotH / 2, 'var(--accent2)', 'Zufriedenstellen')}
    ${ql(pT, midX, plotW / 2, plotH / 2, 'var(--accent3)', 'Aktiv einbinden')}
    ${ql(midY, pL, plotW / 2, plotH / 2, 'var(--muted)', 'Beobachten')}
    ${ql(midY, midX, plotW / 2, plotH / 2, 'var(--muted)', 'Informiert halten')}
    <div class="matrix-axis-x" style="bottom:${pB}%;left:${pL}%;right:${pR}%"></div>
    <div class="matrix-axis-y" style="left:${pL}%;top:${pT}%;bottom:${pB}%"></div>
    ${[1,2,3,4,5,6,7,8,9,10].map(v => `
      <span style="position:absolute;font-family:var(--font-mono);font-size:.6rem;color:var(--muted);bottom:${pB - 5.5}%;left:${pL + ((v - 1) / 9) * plotW}%;transform:translateX(-50%)">${v}</span>
      <span style="position:absolute;font-family:var(--font-mono);font-size:.6rem;color:var(--muted);left:${pL - 3.5}%;top:${pT + ((9 - (v - 1)) / 9) * plotH}%;transform:translateY(-50%)">${v}</span>
    `).join('')}
    <span class="axis-label x">Einfluss →</span>
    <span class="axis-label y">Interesse →</span>`;

  proj.items.map(item => getMerged(item)).filter(Boolean).forEach(s => {
    const dot = document.createElement('div'); dot.className = 'matrix-dot';
    const dotTopPct = dotT + ((9 - (s.interesse - 1)) / 9) * dotH;
    dot.style.left = (dotL + ((s.einfluss - 1) / 9) * dotW) + '%';
    dot.style.top  = dotTopPct + '%';
    const col = HALTUNG_COLORS[s.haltung];
    dot.style.background  = col + '22';
    dot.style.borderColor = col;
    dot.style.color       = col;
    const tipDir = dotTopPct < 25 ? 'tip-down' : 'tip-up';
    dot.innerHTML = `${initials(s.name)}<div class="dot-tooltip ${tipDir}"><strong>${esc(s.name)}</strong><br>${esc(s.rolle)}<br>Einfluss: ${s.einfluss} · Interesse: ${s.interesse}</div>`;
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
    ? `<tr><td colspan="6"><div class="shdb-empty">Noch keine Kontakte.<br>Lege deinen ersten Stakeholder an.</div></td></tr>`
    : list.map(sh => {
        const projTags = projects.filter(p => p.items.some(i => i.shId === sh.id))
          .map(p => `<span class="shdb-proj-tag">${esc(p.name)}</span>`).join('');
        const bd = daysUntilBirthday(sh.geburtstag);
        const bdChip = bd !== null && bd <= 14
          ? `<span class="bday-chip">${bd === 0 ? '🎂 heute' : bd === 1 ? '🎂 morgen' : '🎂 ' + bd + 'd'}</span>` : '';
        return `<tr>
          <td class="name-cell"><strong>${esc(sh.name)}${bdChip}</strong><span>${esc(sh.rolle)}</span></td>
          <td style="font-size:.83rem;color:var(--muted)">${sh.email ? `<a href="mailto:${esc(sh.email)}" style="color:inherit">${esc(sh.email)}</a>` : '-'}</td>
          <td style="font-size:.83rem;color:var(--muted)">${esc(sh.tel) || '-'}</td>
          <td style="font-size:.83rem;color:var(--muted)">${sh.geburtstag ? fmtDate(sh.geburtstag) : '-'}</td>
          <td>${projTags || '<span style="color:var(--muted);font-size:.75rem">–</span>'}</td>
          <td onclick="event.stopPropagation()">
            <div class="row-actions" style="opacity:1">
              <button class="row-btn" onclick="openKontaktEditModal(${sh.id})">✏ Bearbeiten</button>
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
      <div class="proj-card-name">${esc(p.name)}${p.id === activeProjectId ? '<span class="proj-card-badge">Aktiv</span>' : ''}</div>
      <div class="proj-card-meta">${p.items.length} Stakeholder · ${p.plan?.reduce((n, y) => n + y.items.length, 0) || 0} Planmaßnahmen</div>
      ${p.desc ? `<div class="proj-card-desc">${esc(p.desc)}</div>` : '<div class="proj-card-desc"></div>'}
      <div class="proj-card-actions">
        ${p.id !== activeProjectId
          ? `<button class="btn btn-primary" style="flex:1;padding:7px 14px;font-size:.82rem" onclick="switchProjectAndView('${p.id}')">Öffnen</button>`
          : `<button class="btn btn-secondary" style="flex:1;padding:7px 14px;font-size:.82rem" onclick="switchTab(document.querySelector('nav .tab'),'liste')">Zur Liste</button>`}
        <button class="btn btn-secondary" style="padding:7px 12px;font-size:.82rem" onclick="openProjModal('${p.id}')">✏</button>
        <button class="btn btn-danger"    style="padding:7px 12px;font-size:.82rem" onclick="deleteProjectById('${p.id}')">🗑</button>
      </div>
    </div>`).join('') +
    `<div class="proj-card proj-add-card" onclick="openProjModal()">
      <div class="proj-add-icon">+</div>
      <div style="font-size:.85rem">Neues Projekt</div>
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
}
