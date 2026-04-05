process.env['ELECTRON_DISABLE_SECURITY_WARNINGS'] = 'true';
process.env['GTK_THEME'] = 'Adwaita:dark';

const { app, BrowserWindow, shell, Menu, nativeTheme, ipcMain } = require('electron');
const path = require('path');
const fs   = require('fs');
const os   = require('os');

// Pin userData to a fixed path so data survives AppImage updates and
// is never affected by app-name or package-name changes.
app.setPath('userData', path.join(os.homedir(), '.config', 'Gravinet'));

nativeTheme.themeSource = 'dark';

let win = null;

function createWindow() {
  win = new BrowserWindow({
    width: 1400, height: 900, minWidth: 900, minHeight: 600,
    title: 'Gravinet',
    icon: path.join(__dirname, 'app', 'icons', 'icon-512.png'),
    backgroundColor: '#0f1117',
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'),
    },
  });

  Menu.setApplicationMenu(null);
  win.loadFile(path.join(__dirname, 'app', 'index.html'));

  win.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });

  win.webContents.on('did-finish-load', () => {
    win.webContents.executeJavaScript('localStorage.getItem("gravinet_theme") || "dark"').then(theme => {
      if (theme === 'light') {
        nativeTheme.themeSource = 'light';
        process.env['GTK_THEME'] = 'Adwaita';
        win.setBackgroundColor('#f0f2f8');
      }
    });
  });
}

// ══ DATA DIRECTORY ══
// Each project gets its own JSON file under userData/projects/
// Contacts and workspace metadata are stored alongside.

function getDataDir()     { return app.getPath('userData'); }
function getProjectsDir() { return path.join(getDataDir(), 'projects'); }

function ensureDirs() {
  const pd = getProjectsDir();
  if (!fs.existsSync(pd)) fs.mkdirSync(pd, { recursive: true });
}

// ── Workspace ────────────────────────────────────────────────────────────────

ipcMain.handle('get-version',        () => app.getVersion());
ipcMain.handle('data:get-data-path', () => getDataDir());

ipcMain.handle('data:read-workspace', () => {
  try {
    const f = path.join(getDataDir(), 'workspace.json');
    return fs.existsSync(f) ? JSON.parse(fs.readFileSync(f, 'utf-8')) : null;
  } catch { return null; }
});

ipcMain.handle('data:write-workspace', (_, data) => {
  try {
    ensureDirs();
    fs.writeFileSync(path.join(getDataDir(), 'workspace.json'), JSON.stringify(data, null, 2), 'utf-8');
    return { ok: true };
  } catch (e) { return { ok: false, error: e.message }; }
});

// ── Contacts ─────────────────────────────────────────────────────────────────

ipcMain.handle('data:read-contacts', () => {
  try {
    const f = path.join(getDataDir(), 'contacts.json');
    return fs.existsSync(f) ? JSON.parse(fs.readFileSync(f, 'utf-8')) : null;
  } catch { return null; }
});

ipcMain.handle('data:write-contacts', (_, data) => {
  try {
    ensureDirs();
    fs.writeFileSync(path.join(getDataDir(), 'contacts.json'), JSON.stringify(data, null, 2), 'utf-8');
    return { ok: true };
  } catch (e) { return { ok: false, error: e.message }; }
});

// ── Projects ──────────────────────────────────────────────────────────────────

ipcMain.handle('data:list-projects', () => {
  try {
    ensureDirs();
    return fs.readdirSync(getProjectsDir())
      .filter(f => f.endsWith('.json'))
      .map(f => f.replace('.json', ''));
  } catch { return []; }
});

ipcMain.handle('data:read-project', (_, id) => {
  try {
    const f = path.join(getProjectsDir(), id + '.json');
    return fs.existsSync(f) ? JSON.parse(fs.readFileSync(f, 'utf-8')) : null;
  } catch { return null; }
});

ipcMain.handle('data:write-project', (_, id, data) => {
  try {
    ensureDirs();
    fs.writeFileSync(path.join(getProjectsDir(), id + '.json'), JSON.stringify(data, null, 2), 'utf-8');
    return { ok: true };
  } catch (e) { return { ok: false, error: e.message }; }
});

ipcMain.handle('data:delete-project', (_, id) => {
  try {
    const f = path.join(getProjectsDir(), id + '.json');
    if (fs.existsSync(f)) fs.unlinkSync(f);
    return { ok: true };
  } catch (e) { return { ok: false, error: e.message }; }
});

// ══ PDF PRINT ══
ipcMain.handle('print-pdf', async (event, { html, filename }) => {
  const tmpFile = path.join(os.tmpdir(), `gravinet-print-${Date.now()}.html`);
  const outFile = path.join(os.homedir(), 'Downloads', filename);
  try {
    fs.writeFileSync(tmpFile, html, 'utf-8');
    const printWin = new BrowserWindow({
      show: false,
      webPreferences: { nodeIntegration: false, contextIsolation: true },
    });
    await printWin.loadFile(tmpFile);
    await new Promise(r => setTimeout(r, 800));
    const data = await printWin.webContents.printToPDF({
      marginsType: 0, pageSize: 'A4', printBackground: true, landscape: false,
    });
    printWin.destroy();
    fs.unlinkSync(tmpFile);
    fs.writeFileSync(outFile, data);
    shell.showItemInFolder(outFile);
    return { ok: true, path: outFile };
  } catch (err) {
    try { fs.unlinkSync(tmpFile); } catch {}
    return { ok: false, error: err.message };
  }
});

// ══ NATIVE THEME SYNC ══
ipcMain.handle('set-native-theme', (event, theme) => {
  if (theme === 'light') {
    nativeTheme.themeSource = 'light';
    process.env['GTK_THEME'] = 'Adwaita';
    win.setBackgroundColor('#f0f2f8');
  } else {
    nativeTheme.themeSource = 'dark';
    process.env['GTK_THEME'] = 'Adwaita:dark';
    win.setBackgroundColor('#0f1117');
  }
});

app.whenReady().then(() => {
  createWindow();
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
