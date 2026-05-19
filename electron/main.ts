import { app, BrowserWindow, ipcMain, dialog } from 'electron'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// IPC Handlers
ipcMain.handle('dialog:saveFile', async (_, content: string, defaultPath: string) => {
  const { canceled, filePath } = await dialog.showSaveDialog({
    title: 'Save Setlist',
    defaultPath,
    filters: [{ name: 'JSON Files', extensions: ['json'] }]
  })

  if (!canceled && filePath) {
    const fs = await import('node:fs/promises')
    try {
      await fs.writeFile(filePath, content, 'utf-8')
      return { success: true, filePath }
    } catch (error: unknown) {
      return { success: false, error: error instanceof Error ? error.message : String(error) }
    }
  }
  return { success: false, error: 'User canceled' }
})

// Dist directory paths
process.env.DIST = join(__dirname, '../dist')
process.env.VITE_PUBLIC = app.isPackaged
  ? process.env.DIST
  : join(process.env.DIST, '../public')

const VITE_DEV_SERVER_URL = process.env['VITE_DEV_SERVER_URL']
const ICON_PATH = join(process.env.VITE_PUBLIC || '', 'build.png')

let win: BrowserWindow | null
let splash: BrowserWindow | null

function createSplash() {
  splash = new BrowserWindow({
    width: 480,
    height: 300,
    transparent: false,
    frame: false,
    resizable: false,
    alwaysOnTop: true,
    center: true,
    icon: ICON_PATH,
    webPreferences: { nodeIntegration: false, contextIsolation: true },
  })

  // Inline HTML splash — no external file needed
  const splashHTML = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8" />
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body {
            width: 480px; height: 300px;
            background: linear-gradient(160deg, #0A84FF 0%, #003d99 100%);
            display: flex; flex-direction: column;
            align-items: center; justify-content: center;
            font-family: -apple-system, BlinkMacSystemFont, 'Inter', 'Segoe UI', sans-serif;
            -webkit-font-smoothing: antialiased;
          }
          .icon {
            margin-bottom: 18px;
            opacity: 0.95;
          }
          svg { width: 48px; height: 48px; }
          h1 {
            color: #ffffff;
            font-size: 32px;
            font-weight: 700;
            letter-spacing: -0.5px;
          }
          p {
            color: rgba(255,255,255,0.55);
            font-size: 13px;
            margin-top: 8px;
            letter-spacing: 0.2px;
          }
          .dot {
            display: inline-block;
            width: 6px; height: 6px;
            border-radius: 50%;
            background: rgba(255,255,255,0.6);
            animation: pulse 1.2s ease-in-out infinite;
            margin: 20px 3px 0;
          }
          .dot:nth-child(2) { animation-delay: 0.2s; }
          .dot:nth-child(3) { animation-delay: 0.4s; }
          @keyframes pulse {
            0%, 100% { opacity: 0.3; transform: scale(0.8); }
            50% { opacity: 1; transform: scale(1); }
          }
        </style>
      </head>
      <body>
        <div class="icon">
          <svg viewBox="0 0 48 48" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <rect x="7" y="4" width="34" height="40" rx="4"/>
            <path d="M14 14h20M14 22h20M14 30h14"/>
          </svg>
        </div>
        <h1>StreamBible</h1>
        <p>Loading your broadcast environment…</p>
        <div>
          <span class="dot"></span>
          <span class="dot"></span>
          <span class="dot"></span>
        </div>
      </body>
    </html>
  `

  splash.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(splashHTML)}`)
}

function createWindow() {
  win = new BrowserWindow({
    width: 1280,
    height: 800,
    show: false, // Hidden until ready — avoids white flash
    title: 'StreamBible',
    icon: ICON_PATH,
    webPreferences: {
      preload: join(__dirname, 'preload.mjs'),
      nodeIntegration: false,
      contextIsolation: true,
    },
  })

  win.setMenu(null)

  if (VITE_DEV_SERVER_URL) {
    win.loadURL(VITE_DEV_SERVER_URL)
  } else {
    win.loadFile(join(process.env.DIST || '', 'index.html'))
  }

  // Once the main window is ready, destroy the splash and show main
  win.once('ready-to-show', () => {
    if (splash && !splash.isDestroyed()) {
      splash.destroy()
      splash = null
    }
    win?.show()
  })
}

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
    win = null
  }
})

app.whenReady().then(() => {
  createSplash()
  createWindow()
})
