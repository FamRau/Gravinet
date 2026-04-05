// ══ APP INIT ══

async function init() {
  // Apply saved theme immediately (sync, avoids flash)
  setTheme(localStorage.getItem('gravinet_theme') || 'dark');
  setSaveStatus('saved');

  // Show version (major.minor only) — async IPC call, reliable in packaged AppImage
  window.electronAPI?.getVersion().then(ver => {
    const vEl = document.getElementById('app-version');
    if (vEl && ver) vEl.textContent = 'v' + ver.split('.').slice(0, 2).join('.');
  });

  // Load data from files (async IPC)
  await loadData();

  // Render initial state
  applyTranslations();
}

// Start when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  init();
});
