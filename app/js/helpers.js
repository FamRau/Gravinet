// ══ PURE HELPERS ══

function getActiveProject() {
  return projects.find(p => p.id === activeProjectId) || projects[0];
}

function getMerged(item) {
  const sh = stakeholders.find(s => s.id === item.shId);
  if (!sh) return null;
  return { ...sh, ...item, id: sh.id };
}

function getStrategie(s) {
  return STRATEGIE_MAP[(s.einfluss >= 5 ? 'h' : 'n') + (s.interesse >= 5 ? 'h' : 'n')] || '–';
}

function initials(name) {
  return String(name || '').split(' ').map(w => w[0] || '').join('').slice(0, 2).toUpperCase();
}

function esc(t) {
  return String(t || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function fmtDate(d) {
  if (!d) return '';
  const [, m, day] = d.split('-');
  return `${day}.${m}.`;
}

function fmtDateTime(d) {
  const dt = new Date(d);
  return dt.toLocaleDateString('de-AT') + ' ' + dt.toLocaleTimeString('de-AT', { hour: '2-digit', minute: '2-digit' });
}

function daysUntilBirthday(geburtstag) {
  if (!geburtstag) return null;
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const [, m, d] = geburtstag.split('-').map(Number);
  let next = new Date(today.getFullYear(), m - 1, d);
  if (next < today) next = new Date(today.getFullYear() + 1, m - 1, d);
  return Math.round((next - today) / 86400000);
}
