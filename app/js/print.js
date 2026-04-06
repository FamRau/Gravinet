// ══ PDF PRINTING ══

function printCSS() {
  return `
    <style>
      @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Mono:wght@400;500&family=Outfit:wght@300;400;500;600&display=swap');
      *{box-sizing:border-box;margin:0;padding:0}
      body{font-family:'Outfit',sans-serif;font-size:10pt;color:#1a1f35;background:#fff;line-height:1.5}
      h1{font-family:'DM Serif Display',serif;font-size:20pt;margin-bottom:4px}
      h2{font-family:'DM Serif Display',serif;font-size:14pt;margin-bottom:8px}
      h3{font-family:'DM Mono',monospace;font-size:7.5pt;text-transform:uppercase;letter-spacing:.1em;color:#6b748f;margin-bottom:6px}
      .page{padding:20mm 18mm;max-width:210mm;margin:0 auto}
      .page-break{page-break-after:always;break-after:page}
      .card{background:#f8f9fc;border:1px solid #c8d0e8;border-radius:8px;padding:14px;margin-bottom:10px}
      .grid2{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:12px}
      .grid4{display:grid;grid-template-columns:1fr 1fr 1fr 1fr;gap:8px;margin-bottom:12px}
      .label{font-family:'DM Mono',monospace;font-size:7pt;text-transform:uppercase;letter-spacing:.08em;color:#6b748f;margin-bottom:2px}
      .val{font-size:10pt;font-weight:500}
      .badge{display:inline-block;padding:2px 8px;border-radius:20px;font-size:7.5pt;font-weight:600;font-family:'DM Mono',monospace}
      .badge-intern{background:#dbeafe;color:#1d4ed8}
      .badge-extern{background:#fef3c7;color:#92400e}
      .badge-supportiv{background:#d1fae5;color:#065f46}
      .badge-neutral{background:#e5e7eb;color:#4b5563}
      .badge-kritisch{background:#fee2e2;color:#991b1b}
      .bar-bg{background:#e5e7eb;border-radius:4px;height:6px;margin-top:4px}
      .bar-fill-blue{background:#2563eb;border-radius:4px;height:6px}
      .bar-fill-amber{background:#d97706;border-radius:4px;height:6px}
      .section{margin-bottom:14px}
      .journal-entry{border-left:3px solid #c8d0e8;padding:8px 12px;margin-bottom:8px;background:#f8f9fc}
      .journal-date{font-family:'DM Mono',monospace;font-size:7.5pt;color:#6b748f;margin-bottom:3px}
      .journal-text{font-size:9.5pt;white-space:pre-wrap;color:#2a3048}
      .massnahmen-item{padding:5px 0;border-bottom:1px solid #e5e7eb;font-size:9.5pt;display:flex;gap:8px}
      .massnahmen-item:last-child{border-bottom:none}
      .arrow{color:#2563eb;flex-shrink:0}
      table{width:100%;border-collapse:collapse;font-size:9pt;margin-bottom:14px}
      thead th{text-align:left;padding:7px 10px;font-family:'DM Mono',monospace;font-size:7pt;text-transform:uppercase;letter-spacing:.08em;color:#6b748f;border-bottom:2px solid #c8d0e8;background:#f0f2f8}
      tbody td{padding:8px 10px;border-bottom:1px solid #e5e7eb;vertical-align:middle}
      tbody tr:last-child td{border-bottom:none}
      .bar-wrap{display:flex;align-items:center;gap:6px}
      .bar-track{width:50px;height:4px;background:#e5e7eb;border-radius:2px}
      .matrix-wrap{width:100%;aspect-ratio:1/.75;position:relative;border:1px solid #c8d0e8;border-radius:8px;overflow:hidden;background:#f8f9fc;margin-bottom:14px}
      .m-dot{position:absolute;transform:translate(-50%,-50%);width:30px;height:30px;border-radius:50%;border:2px solid;display:flex;align-items:center;justify-content:center;font-family:'DM Mono',monospace;font-size:7pt;font-weight:700}
      .m-axis-x{position:absolute;bottom:40px;left:60px;right:20px;height:1px;background:#c8d0e8}
      .m-axis-y{position:absolute;bottom:40px;top:20px;left:60px;width:1px;background:#c8d0e8}
      .m-qlabel{position:absolute;font-family:'DM Mono',monospace;font-size:7pt;color:#6b748f;text-transform:uppercase}
      .m-alabel{position:absolute;font-family:'DM Mono',monospace;font-size:7pt;color:#9ca3af}
      .plan-year{margin-bottom:18px;break-inside:avoid}
      .plan-year-header{display:flex;align-items:center;gap:10px;margin-bottom:10px;padding-bottom:8px;border-bottom:2px solid #2563eb}
      .year-badge{font-family:'DM Mono',monospace;font-size:7.5pt;background:#dbeafe;color:#1d4ed8;padding:2px 10px;border-radius:20px}
      .plan-item{display:flex;align-items:flex-start;gap:8px;padding:6px 0;border-bottom:1px solid #e5e7eb;font-size:9pt}
      .plan-item:last-child{border-bottom:none}
      .plan-item.done .plan-text{text-decoration:line-through;color:#9ca3af}
      .plan-q{font-family:'DM Mono',monospace;font-size:7pt;color:#d97706;min-width:24px;padding-top:2px}
      .check-circle{width:14px;height:14px;border-radius:50%;border:1.5px solid #c8d0e8;flex-shrink:0;margin-top:1px;display:flex;align-items:center;justify-content:center;font-size:8pt}
      .check-circle.done{background:#059669;border-color:#059669;color:#fff}
      .report-header{border-bottom:3px solid #2563eb;padding-bottom:14px;margin-bottom:20px}
      .report-meta{font-family:'DM Mono',monospace;font-size:8pt;color:#6b748f;margin-top:4px}
      @media print{body{-webkit-print-color-adjust:exact;print-color-adjust:exact}}
    </style>`;
}

function escP(t)       { return String(t || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }
function fmtDateP(d)   { if (!d) return '–'; const [y, m, day] = d.split('-'); return `${day}.${m}.${y}`; }
function fmtDateTimeP(d) { const dt = new Date(d); const loc = appLang === 'en' ? 'en-US' : 'de-AT'; return dt.toLocaleDateString(loc) + ' ' + dt.toLocaleTimeString(loc, { hour: '2-digit', minute: '2-digit' }); }
function initialsP(name) { return String(name || '').split(' ').map(w => w[0] || '').join('').slice(0, 2).toUpperCase(); }
function getStrategieP(einfluss, interesse) {
  const key = { hh: 'strat_engage', hn: 'strat_satisfy', nh: 'strat_inform', nn: 'strat_monitor' };
  return t(key[(einfluss >= 5 ? 'h' : 'n') + (interesse >= 5 ? 'h' : 'n')] || 'strat_monitor');
}

// ── Print contacts ────────────────────────────────────────────────────────────

function openPrintContactsModal() {
  const el = document.getElementById('print-contacts-list');
  el.innerHTML = stakeholders.map(sh => `
    <label class="print-picker-row">
      <input type="checkbox" value="${sh.id}" checked>
      <div class="print-picker-row-info">
        <div class="print-picker-name">${escP(shFullName(sh))}</div>
        <div class="print-picker-rolle">${escP(sh.rolle)}</div>
      </div>
    </label>`).join('');
  document.getElementById('print-contacts-overlay').classList.add('open');
}

function printContactsToggleAll() {
  const boxes = document.querySelectorAll('#print-contacts-list input[type=checkbox]');
  const anyUnchecked = [...boxes].some(b => !b.checked);
  boxes.forEach(b => b.checked = anyUnchecked);
}

async function doPrintContacts() {
  const boxes = document.querySelectorAll('#print-contacts-list input[type=checkbox]:checked');
  const ids   = [...boxes].map(b => parseInt(b.value));
  if (!ids.length) { alert(t('alert_select_contact')); return; }
  closePanel('print-contacts-overlay');

  const pages = ids.map(id => {
    const sh = stakeholders.find(s => s.id === id); if (!sh) return '';
    const fullName = shFullName(sh);
    const projContexts = projects.map(p => {
      const item = p.items.find(i => i.shId === id);
      return item ? { ...item, projName: p.name } : null;
    }).filter(Boolean);
    const journal = [...(sh.journal || [])].sort((a, b) => new Date(b.date) - new Date(a.date));
    return `
    <div class="page page-break">
      <div class="report-header">
        <h1>${escP(fullName)}</h1>
        <div class="report-meta">${escP(sh.rolle)}${projContexts.length ? ' · ' + projContexts.map(p => escP(p.projName)).join(', ') : ''}</div>
      </div>
      <div class="section">
        <h3>${t('print_basic_data')}</h3>
        <div class="grid2">
          <div class="card"><div class="label">E-Mail</div><div class="val">${sh.email ? `<a href="mailto:${escP(sh.email)}" style="color:#2563eb">${escP(sh.email)}</a>` : '–'}</div></div>
          <div class="card"><div class="label">Telefon</div><div class="val">${escP(sh.tel) || '–'}</div></div>
          <div class="card"><div class="label">Geburtstag</div><div class="val">${fmtDateP(sh.geburtstag)}</div></div>
          <div class="card"><div class="label">Journal-Einträge</div><div class="val">${journal.length}</div></div>
        </div>
        ${sh.notizen ? `<div class="card" style="border-left:3px solid #d97706;background:#fffbeb"><div class="label">📌 ${t('label_notes')}</div><div style="font-size:9.5pt;margin-top:4px;white-space:pre-wrap;line-height:1.6">${escP(sh.notizen)}</div></div>` : ''}
      </div>
      ${projContexts.length ? `
      <div class="section">
        <h3>${t('print_proj_assignments')}</h3>
        ${projContexts.map(item => `
          <div class="card" style="margin-bottom:8px">
            <div style="font-weight:600;font-size:10pt;margin-bottom:8px">${escP(item.projName)}</div>
            <div class="grid4">
              <div><div class="label">${t('print_col_group')}</div><div><span class="badge badge-${item.gruppe}">${t('badge_' + item.gruppe)}</span></div></div>
              <div><div class="label">${t('print_col_attitude')}</div><div><span class="badge badge-${item.haltung}">${t('badge_' + item.haltung)}</span></div></div>
              <div><div class="label">${t('print_col_influence')}</div><div class="val" style="color:#2563eb">${item.einfluss}/10</div><div class="bar-bg"><div class="bar-fill-blue" style="width:${item.einfluss * 10}%"></div></div></div>
              <div><div class="label">${t('print_col_interest')}</div><div class="val" style="color:#d97706">${item.interesse}/10</div><div class="bar-bg"><div class="bar-fill-amber" style="width:${item.interesse * 10}%"></div></div></div>
            </div>
            ${item.ziel ? `<div style="margin-top:6px"><div class="label">${t('print_goal_label')}</div><div style="font-size:9.5pt;margin-top:3px">${escP(item.ziel)}</div></div>` : ''}
            ${(item.massnahmen || []).length ? `<div style="margin-top:8px"><div class="label">${t('print_measures_label')}</div>${item.massnahmen.map(m => `<div class="massnahmen-item"><span class="arrow">→</span>${escP(m)}</div>`).join('')}</div>` : ''}
            ${(item.aufgaben || []).length ? `
<div style="margin-top:8px">
  <div class="label">${t('print_aufgaben_label')}</div>
  ${item.aufgaben.map(a => `
    <div style="display:flex;align-items:baseline;gap:6px;padding:3px 0;${a.done ? 'text-decoration:line-through;color:#9ca3af' : ''}">
      <span style="font-size:9pt">${a.done ? '☑' : '☐'}</span>
      <span style="font-size:9pt">${escP(a.title)}</span>
      ${a.date ? `<span style="font-size:8pt;color:#6b7280">${a.date}</span>` : ''}
      ${a.interval ? `<span style="font-size:8pt;color:#6b7280">🔁 ${a.interval}d</span>` : ''}
    </div>`).join('')}
</div>` : ''}
          </div>`).join('')}
      </div>` : ''}
      <div class="section">
        <h3>${t('print_journal_section')} (${journal.length} ${t('print_journal_entries')})</h3>
        ${journal.length === 0
          ? `<p style="color:#9ca3af;font-size:9pt">${t('print_no_journal')}</p>`
          : journal.map(e => `
            <div class="journal-entry">
              <div class="journal-date">${fmtDateTimeP(e.date)}</div>
              <div class="journal-text">${escP(e.text)}</div>
            </div>`).join('')}
      </div>
    </div>`;
  }).join('');

  const html = `<!DOCTYPE html><html lang="${appLang === 'en' ? 'en' : 'de'}"><head><meta charset="UTF-8">${printCSS()}<title>${t('nav_print_contacts')}</title></head><body>${pages}</body></html>`;
  const date = new Date().toISOString().slice(0, 10);
  const safeName = ids.length === 1
    ? shFullName(stakeholders.find(s => s.id === ids[0])).replace(/[^a-zA-Z0-9äöüÄÖÜß\s]/g, '').trim() || 'Kontakt'
    : `${ids.length}-Kontakte`;
  const result = await window.electronAPI.printPDF(html, `${safeName}-${date}.pdf`);
  if (!result.ok) alert(t('alert_pdf_error') + result.error);
}

// ── Print project report ──────────────────────────────────────────────────────

async function printProjectReport() {
  const proj = getActiveProject(); if (!proj) return;
  const date   = new Date().toISOString().slice(0, 10);
  const merged = proj.items.map(item => {
    const sh = stakeholders.find(s => s.id === item.shId); if (!sh) return null;
    return { ...sh, ...item, id: sh.id };
  }).filter(Boolean);

  const tableRows = merged.map(s => {
    const bez = s.beziehung || 3;
    const stars = '★'.repeat(bez) + '☆'.repeat(5 - bez);
    return `
    <tr>
      <td><strong>${escP(shFullName(s))}</strong><br><span style="color:#6b748f;font-size:8pt">${escP(s.rolle)}</span></td>
      <td><span class="badge badge-${s.gruppe}">${t('badge_' + s.gruppe)}</span></td>
      <td><div class="bar-wrap"><div class="bar-track"><div style="width:${s.einfluss * 10}%;height:4px;background:#2563eb;border-radius:2px"></div></div><span style="font-family:'DM Mono',monospace;font-size:8pt">${s.einfluss}</span></div></td>
      <td><div class="bar-wrap"><div class="bar-track"><div style="width:${s.interesse * 10}%;height:4px;background:#d97706;border-radius:2px"></div></div><span style="font-family:'DM Mono',monospace;font-size:8pt">${s.interesse}</span></div></td>
      <td><span class="badge badge-${s.haltung}">${t('badge_' + s.haltung)}</span></td>
      <td style="font-size:8.5pt;color:#4b5563">${getStrategieP(s.einfluss, s.interesse)}</td>
      <td style="color:#d97706;letter-spacing:1px;font-size:9pt">${stars}</td>
      ${s.notizen ? `<td style="font-size:8pt;color:#4b5563;max-width:120px">${escP(s.notizen.length > 80 ? s.notizen.slice(0,80)+'…' : s.notizen)}</td>` : '<td style="color:#9ca3af">–</td>'}
    </tr>`;
  }).join('');

  const pL = 12, pB = 8, pT = 4, pR = 4;
  const COLORS = { supportiv: '#059669', neutral: '#6b748f', kritisch: '#dc2626' };
  const dots = merged.map(s => {
    const col  = COLORS[s.haltung] || '#6b748f';
    const left = pL + ((s.einfluss - 1) / 9) * (100 - pL - pR);
    const top  = pT + ((10 - s.interesse) / 9) * (100 - pT - pB);
    return `<div class="m-dot" style="left:${left}%;top:${top}%;background:${col}22;border-color:${col};color:${col}">${initialsP(shFullName(s))}</div>`;
  }).join('');

  const planHTML = (proj.plan || []).map(y => `
    <div class="plan-year">
      <div class="plan-year-header">
        <span class="year-badge">${escP(y.label)}</span>
        <div>
          <div style="font-weight:600;font-size:10pt">${escP(y.title)}</div>
          <div style="font-size:8pt;color:#6b748f;font-family:'DM Mono',monospace">${escP(y.year)}</div>
        </div>
      </div>
      ${y.items.map(item => `
        <div class="plan-item${item.done ? ' done' : ''}">
          <div class="check-circle${item.done ? ' done' : ''}">${item.done ? '✓' : ''}</div>
          <span class="plan-q">${escP(item.q)}</span>
          <span class="plan-text">${escP(item.text)}</span>
        </div>`).join('')}
    </div>`).join('');

  const html = `<!DOCTYPE html><html lang="de"><head><meta charset="UTF-8">${printCSS()}<title>${escP(proj.name)}</title></head><body>
  <div class="page">
    <div class="report-header">
      <h1>${escP(proj.name)}</h1>
      <div class="report-meta">${t('print_report_created')} ${fmtDateP(date)} · ${merged.length} ${t('print_report_stakeholders')}</div>
    </div>
    <h2 style="margin-bottom:10px">${t('print_stakeholder_list')}</h2>
    <table>
      <thead><tr><th>${t('print_col_name')}</th><th>${t('print_col_group')}</th><th>${t('print_col_influence')}</th><th>${t('print_col_interest')}</th><th>${t('print_col_attitude')}</th><th>${t('print_col_strategy')}</th><th>${t('detail_beziehung')}</th><th>${t('label_notes')}</th></tr></thead>
      <tbody>${tableRows}</tbody>
    </table>
    <div class="page-break"></div>
    <div class="report-header" style="margin-top:0"><h2>${t('print_matrix_section')}</h2></div>
    <div class="matrix-wrap">
      <div class="m-axis-x"></div>
      <div class="m-axis-y"></div>
      <div class="m-alabel" style="bottom:10px;right:10px">${t('matrix_axis_influence')}</div>
      <div class="m-alabel" style="top:10px;left:4px;writing-mode:vertical-rl;transform:rotate(180deg)">${t('matrix_axis_interest')}</div>
      <div class="m-qlabel" style="top:${pT + 1}%;left:${pL + 1}%;color:#d97706">${t('matrix_satisfy')}</div>
      <div class="m-qlabel" style="top:${pT + 1}%;right:${pR + 1}%;text-align:right;color:#059669">${t('matrix_engage')}</div>
      <div class="m-qlabel" style="bottom:${pB + 1}%;left:${pL + 1}%;color:#9ca3af">${t('matrix_monitor')}</div>
      <div class="m-qlabel" style="bottom:${pB + 1}%;right:${pR + 1}%;text-align:right;color:#9ca3af">${t('matrix_inform')}</div>
      ${dots}
    </div>
    <div class="page-break"></div>
    <div class="report-header" style="margin-top:0"><h2>${t('tab_plan_label').replace('{n}', proj.plan?.length || 0)}</h2></div>
    ${planHTML}
    ${(() => {
      const itemsWithTasks = merged.filter(s => {
        const item = proj.items.find(i => i.shId === s.id);
        return (item?.aufgaben || []).length > 0;
      });
      if (!itemsWithTasks.length) return '';
      return `<div class="page-break"></div>
    <div class="report-header" style="margin-top:0"><h2>${t('print_aufgaben_chapter')}</h2></div>
    ${itemsWithTasks.map(s => {
      const item = proj.items.find(i => i.shId === s.id);
      return `<div class="card" style="margin-bottom:10px">
        <div style="font-weight:600;font-size:10pt;margin-bottom:8px">${escP(shFullName(s))}</div>
        ${(item.aufgaben || []).map(a => `
          <div style="display:flex;align-items:baseline;gap:6px;padding:3px 0;${a.done ? 'text-decoration:line-through;color:#9ca3af' : ''}">
            <span style="font-size:9pt">${a.done ? '☑' : '☐'}</span>
            <span style="font-size:9pt">${escP(a.title)}</span>
            ${a.date ? `<span style="font-size:8pt;color:#6b7280">${a.date}</span>` : ''}
            ${a.interval ? `<span style="font-size:8pt;color:#6b7280">🔁 ${a.interval}d</span>` : ''}
          </div>`).join('')}
      </div>`;
    }).join('')}`;
    })()}
  </div>
  </body></html>`;

  const fname  = `${proj.name.replace(/[^a-zA-Z0-9äöüÄÖÜß\s]/g, '').trim()}-${date}.pdf`;
  const result = await window.electronAPI.printPDF(html, fname);
  if (!result.ok) alert(t('alert_pdf_error') + result.error);
}

// ── Print dashboard ───────────────────────────────────────────────────────────

async function printDashboard() {
  const date = new Date().toISOString().slice(0, 10);
  const now  = Date.now();
  const COLORS = { supportiv: '#059669', neutral: '#6b748f', kritisch: '#dc2626' };

  const all = [];
  projects.forEach(proj => {
    proj.items.forEach(item => {
      const sh = stakeholders.find(s => s.id === item.shId); if (!sh) return;
      const s = { ...sh, ...item, id: sh.id, projName: proj.name };
      const interval = getContactInterval(s);
      const j = sh.journal || [];
      const lastEntry = j.length ? j.reduce((a, b) => a.date > b.date ? a : b) : null;
      const daysSince = lastEntry ? Math.floor((now - new Date(lastEntry.date).getTime()) / 86400000) : null;
      all.push({ ...s, interval, daysSince });
    });
  });

  const overdue  = all.filter(s => s.daysSince === null || s.daysSince > s.interval).sort((a,b)=>(b.daysSince??99999)-(a.daysSince??99999));
  const dueSoon  = all.filter(s => s.daysSince !== null && s.daysSince > s.interval*0.6 && s.daysSince <= s.interval).sort((a,b)=>b.daysSince-a.daysSince);
  const birthdays = stakeholders.map(sh => { const bd=daysUntilBirthday(sh.geburtstag); return (bd!==null&&bd<=30)?{...sh,daysUntilBd:bd}:null; }).filter(Boolean).sort((a,b)=>a.daysUntilBd-b.daysUntilBd);

  const cardRow = (s, ageHtml) => {
    const col = COLORS[s.haltung] || '#6b748f';
    return `<tr><td style="padding:7px 10px;border-bottom:1px solid #e5e7eb;border-left:3px solid ${col}"><strong>${escP(shFullName(s))}</strong><br><span style="font-size:8pt;color:#6b748f">${escP(s.rolle)} · ${escP(s.projName||'')}</span></td><td style="padding:7px 10px;border-bottom:1px solid #e5e7eb;font-family:'DM Mono',monospace;font-size:8pt;white-space:nowrap">${ageHtml}</td></tr>`;
  };

  const overdueRows  = overdue.map(s => cardRow(s, `<span style="color:#dc2626">${s.daysSince===null?t('dash_never'):s.daysSince+t('days_unit')+' / '+s.interval+t('days_unit')}</span>`)).join('');
  const dueSoonRows  = dueSoon.map(s => cardRow(s, `<span style="color:#d97706">${s.daysSince}${t('days_unit')} / ${s.interval}${t('days_unit')}</span>`)).join('');
  const bdRows       = birthdays.map(s => `<tr><td style="padding:7px 10px;border-bottom:1px solid #e5e7eb">🎂 <strong>${escP(shFullName(s))}</strong><br><span style="font-size:8pt;color:#6b748f">${escP(s.rolle)}</span></td><td style="padding:7px 10px;border-bottom:1px solid #e5e7eb;font-family:'DM Mono',monospace;font-size:8pt;color:#d97706">${s.daysUntilBd===0?t('birthday_today'):s.daysUntilBd+t('days_unit')}</td></tr>`).join('');

  const section = (title, color, rows, emptyKey) => `
    <div style="margin-bottom:24px;break-inside:avoid">
      <h3 style="font-family:'DM Mono',monospace;font-size:8pt;text-transform:uppercase;letter-spacing:.1em;color:${color};margin-bottom:8px;padding-bottom:6px;border-bottom:2px solid ${color}">${title}</h3>
      ${rows ? `<table style="width:100%;border-collapse:collapse"><tbody>${rows}</tbody></table>` : `<p style="color:#9ca3af;font-size:9pt">${t(emptyKey)}</p>`}
    </div>`;

  const html = `<!DOCTYPE html><html lang="${appLang==='en'?'en':'de'}"><head><meta charset="UTF-8">${printCSS()}<title>Dashboard</title></head><body>
  <div class="page">
    <div class="report-header">
      <h1>📊 ${appLang==='en'?'Dashboard':'Dashboard'}</h1>
      <div class="report-meta">${t('print_report_created')} ${fmtDateP(date)}</div>
    </div>
    ${section(t('dash_overdue'), '#dc2626', overdueRows, 'dash_no_overdue')}
    ${section(t('dash_due_soon'), '#d97706', dueSoonRows, 'dash_no_soon')}
    ${section(t('dash_birthdays'), '#2563eb', bdRows, 'dash_no_birthdays')}
  </div></body></html>`;

  const result = await window.electronAPI.printPDF(html, `gravinet-dashboard-${date}.pdf`);
  if (!result.ok) alert(t('alert_pdf_error') + result.error);
}
