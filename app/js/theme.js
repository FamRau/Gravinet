// ══ THEME ══

function setTheme(t) {
  document.documentElement.setAttribute('data-theme', t);
  localStorage.setItem('gravinet_theme', t);
  const icon = document.getElementById('theme-icon');
  if (icon) icon.textContent = t === 'dark' ? '☽' : '☀';
  document.getElementById('theme-opt-dark')?.classList.toggle('active-opt', t === 'dark');
  document.getElementById('theme-opt-light')?.classList.toggle('active-opt', t === 'light');
  if (window.electronAPI?.setNativeTheme) window.electronAPI.setNativeTheme(t);
}
