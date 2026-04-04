// ══ APP INIT ══

async function init() {
  // Apply saved theme immediately (sync, avoids flash)
  setTheme(localStorage.getItem('gravinet_theme') || 'dark');
  setSaveStatus('saved');

  // Load data from files (async IPC)
  await loadData();

  // Render initial state
  renderAll();
  updatePlanTabLabel();
}

// Start when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  init();
});
