// ══ DESKTOP NOTIFICATIONS ══
// Checks for overdue contacts and sends one grouped notification.
// Called on startup and every 4 hours while the app is open.

const NOTIFICATION_INTERVAL_MS = 4 * 60 * 60 * 1000; // 4 hours
let _notifTimer = null;

async function requestNotificationPermission() {
  if (!('Notification' in window)) return false;
  if (Notification.permission === 'granted') return true;
  if (Notification.permission === 'denied') return false;
  const result = await Notification.requestPermission();
  return result === 'granted';
}

function checkAndNotify() {
  if (!('Notification' in window) || Notification.permission !== 'granted') return;

  const now = Date.now();
  const today = new Date().toISOString().slice(0, 10);
  const overdue = [];
  const reminders = [];

  projects.forEach(proj => {
    proj.items.forEach(item => {
      const sh = stakeholders.find(s => s.id === item.shId); if (!sh) return;
      const s = { ...sh, ...item };
      const interval = getContactInterval(s);
      if (interval === -1) return; // no interval tracking
      const j = sh.journal || [];
      const lastEntry = j.length ? j.reduce((a, b) => a.date > b.date ? a : b) : null;
      const daysSince = lastEntry
        ? Math.floor((now - new Date(lastEntry.date).getTime()) / 86400000)
        : null;
      if (daysSince === null || daysSince > interval) {
        overdue.push({ name: shFullName(sh), daysSince, projName: proj.name });
      }
      (item.aufgaben || []).forEach(task => {
        if (!task.done && task.reminder && task.reminder <= today) {
          reminders.push({ name: shFullName(sh), taskTitle: task.title });
        }
      });
    });
  });

  if (reminders.length > 0) {
    const rTitle = appLang === 'en'
      ? `Gravinet – ${reminders.length} task reminder${reminders.length > 1 ? 's' : ''}`
      : `Gravinet – ${reminders.length} Aufgaben-Erinnerung${reminders.length > 1 ? 'en' : ''}`;
    const rBody = reminders.slice(0, 5).map(r => `${r.name}: ${r.taskTitle}`).join('\n')
      + (reminders.length > 5 ? `\n+${reminders.length - 5}…` : '');
    const rn = new Notification(rTitle, { body: rBody, icon: 'icons/icon-192.png' });
    rn.onclick = () => { window.focus(); switchTab(document.querySelector('nav .tab[onclick*=dashboard]'), 'dashboard'); };
  }

  if (overdue.length === 0) return;

  const title = appLang === 'en'
    ? `Gravinet – ${overdue.length} overdue task${overdue.length > 1 ? 's' : ''}`
    : `Gravinet – ${overdue.length} überfällige Aufgabe${overdue.length > 1 ? 'n' : ''}`;

  const names = overdue.slice(0, 5).map(o => {
    const age = o.daysSince === null
      ? (appLang === 'en' ? 'never contacted' : 'nie kontaktiert')
      : (appLang === 'en' ? `${o.daysSince}d ago` : `seit ${o.daysSince}T`);
    return `${o.name} (${age})`;
  });
  const more = overdue.length > 5
    ? (appLang === 'en' ? `\n+${overdue.length - 5} more…` : `\n+${overdue.length - 5} weitere…`)
    : '';

  const n = new Notification(title, {
    body: names.join('\n') + more,
    icon: 'icons/icon-192.png',
    silent: false,
  });

  n.onclick = () => {
    window.focus();
    switchTab(document.querySelector('nav .tab[onclick*=dashboard]'), 'dashboard');
  };
}

function startNotificationSchedule() {
  requestNotificationPermission().then(granted => {
    if (!granted) return;
    // Check immediately on start (after a short delay so data is loaded)
    setTimeout(checkAndNotify, 3000);
    // Then every 4 hours
    if (_notifTimer) clearInterval(_notifTimer);
    _notifTimer = setInterval(checkAndNotify, NOTIFICATION_INTERVAL_MS);
  });
}
