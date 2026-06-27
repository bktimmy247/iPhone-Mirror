const { app, BrowserWindow, ipcMain, shell } = require('electron');
const path = require('path');
const { spawn, execFile } = require('child_process');
const net = require('net');

let mainWindow;
let uxplayProcess = null;
let isRunning = false;

const UXPLAY_PATH = app.isPackaged 
  ? path.join(process.resourcesPath, 'uxplay.exe')
  : path.join(__dirname, '..', 'uxplay-src', 'build', 'uxplay.exe');

const MSYS2_UCRT64_BIN = 'C:\\tools\\msys64\\ucrt64\\bin';

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    title: 'iPhone Mirror - AirPlay Receiver',
    backgroundColor: '#1a1a2e',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false
    },
    icon: path.join(__dirname, 'icon.png')
  });

  mainWindow.loadFile('index.html');
  
  // Remove menu bar
  mainWindow.setMenuBarVisibility(false);

  mainWindow.on('closed', () => {
    stopUxplay();
    mainWindow = null;
  });
}

function getPrimaryNetwork() {
  const interfaces = require('os').networkInterfaces();
  const badNames = /vEthernet|Virtual|Loopback|Host-Only|VMware|VirtualBox|Npcap|Tailscale|ZeroTier/i;
  const candidates = [];

  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      if (iface.family !== 'IPv4' || iface.internal) continue;
      if (iface.address.startsWith('169.254.')) continue;
      candidates.push({
        name,
        address: iface.address,
        mac: (iface.mac || '').replace(/-/g, ':').toUpperCase(),
        virtual: badNames.test(name)
      });
    }
  }

  // Prefer the real LAN adapter over Hyper-V / host-only adapters.
  const preferred = candidates.find(c => !c.virtual && c.address.startsWith('192.168.'))
    || candidates.find(c => !c.virtual)
    || candidates[0];

  return preferred || { name: 'loopback', address: '127.0.0.1', mac: '' };
}

function getLocalIP() {
  return getPrimaryNetwork().address;
}

function startUxplay(options = {}) {
  if (isRunning) {
    mainWindow.webContents.send('uxplay-status', { running: true, message: 'Already running' });
    return;
  }

  const network = getPrimaryNetwork();
  const localIP = network.address;
  const serverName = options.name || 'iPhone Mirror';
  
  // Build uxplay arguments
  const args = [];
  if (options.name) args.push('-n', options.name);
  // Avoid '@hostname' suffix so the iPhone list is clean and stable.
  args.push('-nh');
  // Force the real LAN adapter MAC. Without this, UxPlay can pick Hyper-V/vEthernet
  // (00:15:5d:...) and advertise on the wrong interface.
  if (network.mac && network.mac !== '00:00:00:00:00:00') args.push('-m', network.mac);
  if (options.fullscreen) args.push('-fs');
  // Windows-friendly sinks.
  args.push('-vs', 'd3d11videosink');
  if (options.noAudio) {
    args.push('-as', '0');
  } else {
    args.push('-as', 'wasapisink');
  }
  
  // Set environment to include MSYS2 UCRT64 bin (for GStreamer DLLs)
  const env = { ...process.env };
  env.PATH = MSYS2_UCRT64_BIN + ';' + (env.PATH || '');
  // GStreamer plugins live under ucrt64\lib\gstreamer-1.0, not ucrt64\bin.
  // If this points to the wrong folder, UxPlay starts then exits with "Required gstreamer plugin 'libav' not found".
  env.GST_PLUGIN_PATH = 'C:\\tools\\msys64\\ucrt64\\lib\\gstreamer-1.0';

  console.log('Network selected:', network);
  console.log('Starting uxplay:', UXPLAY_PATH, args.join(' '));
  
  uxplayProcess = spawn(UXPLAY_PATH, args, {
    env: env,
    cwd: path.dirname(UXPLAY_PATH),
    windowsHide: false
  });

  isRunning = true;

  uxplayProcess.stdout.on('data', (data) => {
    const text = data.toString().trim();
    console.log('uxplay:', text);
    mainWindow.webContents.send('uxplay-log', { type: 'stdout', text, timestamp: Date.now() });
    
    if (text.includes('Listening') || text.includes('started')) {
      mainWindow.webContents.send('uxplay-status', { 
        running: true, 
        ip: localIP,
        message: `AirPlay ready at ${localIP} (${network.name})`
      });
    }
  });

  uxplayProcess.stderr.on('data', (data) => {
    const text = data.toString().trim();
    console.error('uxplay err:', text);
    mainWindow.webContents.send('uxplay-log', { type: 'stderr', text, timestamp: Date.now() });
  });

  uxplayProcess.on('close', (code) => {
    console.log('uxplay exited with code', code);
    isRunning = false;
    uxplayProcess = null;
    mainWindow.webContents.send('uxplay-status', { running: false, message: 'Stopped' });
  });

  mainWindow.webContents.send('uxplay-status', { 
    running: true, 
    ip: localIP,
    name: serverName,
    message: `Starting AirPlay server "${serverName}" at ${localIP} (${network.name})...`
  });
}

function stopUxplay() {
  if (uxplayProcess) {
    uxplayProcess.kill('SIGTERM');
    setTimeout(() => {
      if (uxplayProcess) {
        uxplayProcess.kill('SIGKILL');
      }
    }, 3000);
    isRunning = false;
  }
}

app.whenReady().then(() => {
  createWindow();
  
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  stopUxplay();
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('before-quit', () => {
  stopUxplay();
});

// IPC handlers
ipcMain.handle('start-uxplay', (event, options) => {
  startUxplay(options);
  return { ok: true };
});

ipcMain.handle('stop-uxplay', () => {
  stopUxplay();
  return { ok: true };
});

ipcMain.handle('get-ip', () => {
  return getLocalIP();
});

ipcMain.handle('open-airplay-guide', () => {
  shell.openExternal('https://support.apple.com/en-us/HT204289');
  return { ok: true };
});