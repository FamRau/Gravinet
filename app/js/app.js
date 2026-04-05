// ══ APP INIT ══

async function init() {
  // Apply saved theme immediately (sync, avoids flash)
  setTheme(localStorage.getItem('gravinet_theme') || 'dark');
  setSaveStatus('saved');

  // Show version (major.minor only) — async IPC call, reliable in packaged AppImage
  window.electronAPI?.getVersion().then(ver => {
    const vEl = document.getElementById('app-version');
    if (vEl && ver) vEl.textContent = 'v' + ver;
  });

  // Load data from files (async IPC)
  await loadData();

  // Render initial state and open dashboard on start
  applyTranslations();
  switchTab(document.querySelector('nav .tab[onclick*=dashboard]'), 'dashboard');

  // Start desktop notification schedule for overdue contacts
  startNotificationSchedule();
}

// Start when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  init();
});
