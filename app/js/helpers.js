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
  const key = STRATEGIE_MAP[(s.einfluss >= 5 ? 'h' : 'n') + (s.interesse >= 5 ? 'h' : 'n')];
  return key ? t(key) : '–';
}

// Returns the effective contact interval for a stakeholder item.
// Uses item-level override if set, otherwise the global setting.
function getContactInterval(s) {
  return s.contactInterval || contactWarningDays;
}

function initials(name) {
  return String(name || '').split(' ').map(w => w[0] || '').join('').slice(0, 2).toUpperCase();
}

function shFullName(sh) {
  if (!sh) return '';
  if (sh.vorname || sh.nachname) return ((sh.vorname || '') + ' ' + (sh.nachname || '')).trim();
  return sh.name || '';
}

function esc(t) {
  return String(t || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function fmtDate(d) {
  if (!d) return '';
  const parts = d.split('-');
  if (parts.length < 3) return d;
  const [, m, day] = parts;
  return `${day}.${m}.`;
}

function fmtDateTime(d) {
  const dt     = new Date(d);
  const locale = appLang === 'en' ? 'en-US' : 'de-AT';
  return dt.toLocaleDateString(locale) + ' ' + dt.toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' });
}

function daysUntilBirthday(geburtstag) {
  if (!geburtstag) return null;
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const [, m, d] = geburtstag.split('-').map(Number);
  let next = new Date(today.getFullYear(), m - 1, d);
  if (next < today) next = new Date(today.getFullYear() + 1, m - 1, d);
  return Math.round((next - today) / 86400000);
}
