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
function fmtDateTimeP(d) { const dt = new Date(d); return dt.toLocaleDateString('de-AT') + ' ' + dt.toLocaleTimeString('de-AT', { hour: '2-digit', minute: '2-digit' }); }
function initialsP(name) { return String(name || '').split(' ').map(w => w[0] || '').join('').slice(0, 2).toUpperCase(); }
function getStrategieP(einfluss, interesse) {
  const m = { hh: 'Aktiv einbinden', hn: 'Zufriedenstellen', nh: 'Informiert halten', nn: 'Beobachten' };
  return m[(einfluss >= 5 ? 'h' : 'n') + (interesse >= 5 ? 'h' : 'n')] || '–';
}

// ── Print contacts ────────────────────────────────────────────────────────────

function openPrintContactsModal() {
  const el = document.getElementById('print-contacts-list');
  el.innerHTML = stakeholders.map(sh => `
    <label class="print-picker-row">
      <input type="checkbox" value="${sh.id}" checked>
      <div class="print-picker-row-info">
        <div class="print-picker-name">${escP(sh.name)}</div>
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
  if (!ids.length) { alert('Bitte mindestens einen Kontakt auswählen.'); return; }
  closePanel('print-contacts-overlay');

  const pages = ids.map(id => {
    const sh = stakeholders.find(s => s.id === id); if (!sh) return '';
    const projContexts = projects.map(p => {
      const item = p.items.find(i => i.shId === id);
      return item ? { ...item, projName: p.name } : null;
    }).filter(Boolean);
    const journal = [...(sh.journal || [])].sort((a, b) => new Date(b.date) - new Date(a.date));
    return `
    <div class="page page-break">
      <div class="report-header">
        <h1>${escP(sh.name)}</h1>
        <div class="report-meta">${escP(sh.rolle)}${projContexts.length ? ' · ' + projContexts.map(p => escP(p.projName)).join(', ') : ''}</div>
      </div>
      <div class="section">
        <h3>Grunddaten</h3>
        <div class="grid2">
          <div class="card"><div class="label">E-Mail</div><div class="val">${sh.email ? `<a href="mailto:${escP(sh.email)}" style="color:#2563eb">${escP(sh.email)}</a>` : '–'}</div></div>
          <div class="card"><div class="label">Telefon</div><div class="val">${escP(sh.tel) || '–'}</div></div>
          <div class="card"><div class="label">Geburtstag</div><div class="val">${fmtDateP(sh.geburtstag)}</div></div>
          <div class="card"><div class="label">Journal-Einträge</div><div class="val">${journal.length}</div></div>
        </div>
      </div>
      ${projContexts.length ? `
      <div class="section">
        <h3>Projektzuordnungen</h3>
        ${projContexts.map(item => `
          <div class="card" style="margin-bottom:8px">
            <div style="font-weight:600;font-size:10pt;margin-bottom:8px">${escP(item.projName)}</div>
            <div class="grid4">
              <div><div class="label">Gruppe</div><div><span class="badge badge-${item.gruppe}">${item.gruppe.toUpperCase()}</span></div></div>
              <div><div class="label">Haltung</div><div><span class="badge badge-${item.haltung}">${item.haltung.charAt(0).toUpperCase() + item.haltung.slice(1)}</span></div></div>
              <div><div class="label">Einfluss</div><div class="val" style="color:#2563eb">${item.einfluss}/10</div><div class="bar-bg"><div class="bar-fill-blue" style="width:${item.einfluss * 10}%"></div></div></div>
              <div><div class="label">Interesse</div><div class="val" style="color:#d97706">${item.interesse}/10</div><div class="bar-bg"><div class="bar-fill-amber" style="width:${item.interesse * 10}%"></div></div></div>
            </div>
            ${item.ziel ? `<div style="margin-top:6px"><div class="label">Strategisches Ziel</div><div style="font-size:9.5pt;margin-top:3px">${escP(item.ziel)}</div></div>` : ''}
            ${(item.massnahmen || []).length ? `<div style="margin-top:8px"><div class="label">Maßnahmen</div>${item.massnahmen.map(m => `<div class="massnahmen-item"><span class="arrow">→</span>${escP(m)}</div>`).join('')}</div>` : ''}
          </div>`).join('')}
      </div>` : ''}
      <div class="section">
        <h3>Journal (${journal.length} Einträge)</h3>
        ${journal.length === 0
          ? '<p style="color:#9ca3af;font-size:9pt">Keine Einträge vorhanden.</p>'
          : journal.map(e => `
            <div class="journal-entry">
              <div class="journal-date">${fmtDateTimeP(e.date)}</div>
              <div class="journal-text">${escP(e.text)}</div>
            </div>`).join('')}
      </div>
    </div>`;
  }).join('');

  const html = `<!DOCTYPE html><html lang="de"><head><meta charset="UTF-8">${printCSS()}<title>Kontaktdatenblätter</title></head><body>${pages}</body></html>`;
  const date = new Date().toISOString().slice(0, 10);
  const safeName = ids.length === 1
    ? stakeholders.find(s => s.id === ids[0])?.name.replace(/[^a-zA-Z0-9äöüÄÖÜß\s]/g, '').trim() || 'Kontakt'
    : `${ids.length}-Kontakte`;
  const result = await window.electronAPI.printPDF(html, `${safeName}-${date}.pdf`);
  if (!result.ok) alert('Fehler beim PDF-Erstellen: ' + result.error);
}

// ── Print project report ──────────────────────────────────────────────────────

async function printProjectReport() {
  const proj = getActiveProject(); if (!proj) return;
  const date   = new Date().toISOString().slice(0, 10);
  const merged = proj.items.map(item => {
    const sh = stakeholders.find(s => s.id === item.shId); if (!sh) return null;
    return { ...sh, ...item, id: sh.id };
  }).filter(Boolean);

  const tableRows = merged.map(s => `
    <tr>
      <td><strong>${escP(s.name)}</strong><br><span style="color:#6b748f;font-size:8pt">${escP(s.rolle)}</span></td>
      <td><span class="badge badge-${s.gruppe}">${s.gruppe.toUpperCase()}</span></td>
      <td><div class="bar-wrap"><div class="bar-track"><div style="width:${s.einfluss * 10}%;height:4px;background:#2563eb;border-radius:2px"></div></div><span style="font-family:'DM Mono',monospace;font-size:8pt">${s.einfluss}</span></div></td>
      <td><div class="bar-wrap"><div class="bar-track"><div style="width:${s.interesse * 10}%;height:4px;background:#d97706;border-radius:2px"></div></div><span style="font-family:'DM Mono',monospace;font-size:8pt">${s.interesse}</span></div></td>
      <td><span class="badge badge-${s.haltung}">${s.haltung.charAt(0).toUpperCase() + s.haltung.slice(1)}</span></td>
      <td style="font-size:8.5pt;color:#4b5563">${getStrategieP(s.einfluss, s.interesse)}</td>
    </tr>`).join('');

  const pL = 12, pB = 8, pT = 4, pR = 4;
  const COLORS = { supportiv: '#059669', neutral: '#6b748f', kritisch: '#dc2626' };
  const dots = merged.map(s => {
    const col  = COLORS[s.haltung] || '#6b748f';
    const left = pL + ((s.einfluss - 1) / 9) * (100 - pL - pR);
    const top  = pT + ((10 - s.interesse) / 9) * (100 - pT - pB);
    return `<div class="m-dot" style="left:${left}%;top:${top}%;background:${col}22;border-color:${col};color:${col}">${initialsP(s.name)}</div>`;
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
      <div class="report-meta">Projektbericht · Erstellt am ${fmtDateP(date)} · ${merged.length} Stakeholder</div>
    </div>
    <h2 style="margin-bottom:10px">Stakeholder-Liste</h2>
    <table>
      <thead><tr><th>Name / Funktion</th><th>Gruppe</th><th>Einfluss</th><th>Interesse</th><th>Haltung</th><th>Strategie</th></tr></thead>
      <tbody>${tableRows}</tbody>
    </table>
    <div class="page-break"></div>
    <div class="report-header" style="margin-top:0"><h2>Stakeholder-Matrix</h2></div>
    <div class="matrix-wrap">
      <div class="m-axis-x"></div>
      <div class="m-axis-y"></div>
      <div class="m-alabel" style="bottom:10px;right:10px">Einfluss →</div>
      <div class="m-alabel" style="top:10px;left:4px;writing-mode:vertical-rl;transform:rotate(180deg)">Interesse →</div>
      <div class="m-qlabel" style="top:${pT + 1}%;left:${pL + 1}%;color:#d97706">Zufriedenstellen</div>
      <div class="m-qlabel" style="top:${pT + 1}%;right:${pR + 1}%;text-align:right;color:#059669">Aktiv einbinden</div>
      <div class="m-qlabel" style="bottom:${pB + 1}%;left:${pL + 1}%;color:#9ca3af">Beobachten</div>
      <div class="m-qlabel" style="bottom:${pB + 1}%;right:${pR + 1}%;text-align:right;color:#9ca3af">Informiert halten</div>
      ${dots}
    </div>
    <div class="page-break"></div>
    <div class="report-header" style="margin-top:0"><h2>${proj.plan?.length || 0}-Jahres-Plan</h2></div>
    ${planHTML}
  </div>
  </body></html>`;

  const fname  = `${proj.name.replace(/[^a-zA-Z0-9äöüÄÖÜß\s]/g, '').trim()}-${date}.pdf`;
  const result = await window.electronAPI.printPDF(html, fname);
  if (!result.ok) alert('Fehler beim PDF-Erstellen: ' + result.error);
}
