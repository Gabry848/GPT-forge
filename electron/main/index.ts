import { app, BrowserWindow, shell, ipcMain, dialog } from 'electron'
import { createRequire } from 'node:module'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
import os from 'node:os'
import { update } from './update'
import fs from 'fs/promises'

const require = createRequire(import.meta.url)
const __dirname = path.dirname(fileURLToPath(import.meta.url))

// The built directory structure
//
// ├─┬ dist-electron
// │ ├─┬ main
// │ │ └── index.js    > Electron-Main
// │ └─┬ preload
// │   └── index.mjs   > Preload-Scripts
// ├─┬ dist
// │ └── index.html    > Electron-Renderer
//
process.env.APP_ROOT = path.join(__dirname, '../..')

export const MAIN_DIST = path.join(process.env.APP_ROOT, 'dist-electron')
export const RENDERER_DIST = path.join(process.env.APP_ROOT, 'dist')
export const VITE_DEV_SERVER_URL = process.env.VITE_DEV_SERVER_URL

process.env.VITE_PUBLIC = VITE_DEV_SERVER_URL
  ? path.join(process.env.APP_ROOT, 'public')
  : RENDERER_DIST

// Disable GPU Acceleration for Windows 7
if (os.release().startsWith('6.1')) app.disableHardwareAcceleration()

// Set application name for Windows 10+ notifications
if (process.platform === 'win32') app.setAppUserModelId(app.getName())

if (!app.requestSingleInstanceLock()) {
  app.quit()
  process.exit(0)
}

let win: BrowserWindow | null = null
const preload = path.join(__dirname, '../preload/index.mjs')
const indexHtml = path.join(RENDERER_DIST, 'index.html')

async function createWindow() {
  win = new BrowserWindow({
    title: 'GPT Forge',
    icon: path.join(process.env.VITE_PUBLIC, 'favicon.ico'),
    webPreferences: {
      preload,
      // Sicurezza: contextIsolation abilitato per usare contextBridge
      contextIsolation: true,
      // Sicurezza: nodeIntegration disabilitato (usa solo preload)
      nodeIntegration: false,
    },
  })

  // Gestione delle autorizzazioni per microfono e audio
  win.webContents.session.setPermissionRequestHandler((webContents, permission, callback) => {
    const allowedPermissions = ['media', 'microphone', 'audioCapture'];
    if (allowedPermissions.includes(permission)) {
      callback(true); // Autorizza l'accesso al microfono e audio
    } else {
      callback(false); // Nega altre autorizzazioni
    }
  });

  if (VITE_DEV_SERVER_URL) { // #298
    win.loadURL(VITE_DEV_SERVER_URL)
    // Open devTool if the app is not packaged
    // win.webContents.openDevTools() // Commentato per disabilitare l'apertura automatica
  } else {
    win.loadFile(indexHtml)
  }

  // Test actively push message to the Electron-Renderer
  win.webContents.on('did-finish-load', () => {
    win?.webContents.send('main-process-message', new Date().toLocaleString())
  })

  // Make all links open with the browser, not with the application
  win.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('https:')) shell.openExternal(url)
    return { action: 'deny' }
  })

  // Auto update
  update(win)
}

app.whenReady().then(createWindow)

app.on('window-all-closed', () => {
  win = null
  if (process.platform !== 'darwin') app.quit()
})

app.on('second-instance', () => {
  if (win) {
    // Focus on the main window if the user tried to open another
    if (win.isMinimized()) win.restore()
    win.focus()
  }
})

app.on('activate', () => {
  const allWindows = BrowserWindow.getAllWindows()
  if (allWindows.length) {
    allWindows[0].focus()
  } else {
    createWindow()
  }
})

// New window example arg: new windows url
ipcMain.handle('open-win', (_, arg) => {
  const childWindow = new BrowserWindow({
    webPreferences: {
      preload,
      nodeIntegration: true,
      contextIsolation: false,
    },
  })

  if (VITE_DEV_SERVER_URL) {
    childWindow.loadURL(`${VITE_DEV_SERVER_URL}#${arg}`)
  } else {
    childWindow.loadFile(indexHtml, { hash: arg })
  }
})

// Gestori IPC per la gestione dei file delle chat

// Seleziona una cartella
ipcMain.handle('select-folder', async () => {
  const result = await dialog.showOpenDialog({
    properties: ['openDirectory'],
    title: 'Seleziona cartella per salvare le chat'
  })
  return result
})

// Valida il percorso di salvataggio
ipcMain.handle('validate-chat-save-path', async (_, savePath: string) => {
  try {
    await fs.access(savePath, fs.constants.F_OK | fs.constants.W_OK)
    return true
  } catch {
    return false
  }
})

// Apri cartella nell'esplora file
ipcMain.handle('open-folder', async (_, folderPath: string) => {
  try {
    await shell.openPath(folderPath)
    return true
  } catch {
    return false
  }
})

// Salva file di chat
ipcMain.handle('save-chat-file', async (_, savePath: string, chatData: any) => {
  try {
    const fileName = `chat_${chatData.id}.json`
    const filePath = path.join(savePath, fileName)
    await fs.writeFile(filePath, JSON.stringify(chatData, null, 2), 'utf8')
    return true
  } catch (error) {
    console.error('Errore nel salvataggio chat:', error)
    return false
  }
})

// Carica cronologia chat
ipcMain.handle('load-chat-history', async (_, savePath: string) => {
  try {
    const files = await fs.readdir(savePath)
    const chatFiles = files.filter(file => file.startsWith('chat_') && file.endsWith('.json'))
    
    const chats = []
    for (const file of chatFiles) {
      try {
        const filePath = path.join(savePath, file)
        const content = await fs.readFile(filePath, 'utf8')
        const chatData = JSON.parse(content)
        chats.push(chatData)
      } catch (error) {
        console.error(`Errore nel caricamento del file ${file}:`, error)
      }
    }
    
    return chats
  } catch (error) {
    console.error('Errore nel caricamento cronologia:', error)
    return []
  }
})

// Elimina file di chat
ipcMain.handle('delete-chat-file', async (_, savePath: string, chatId: string) => {
  try {
    const fileName = `chat_${chatId}.json`
    const filePath = path.join(savePath, fileName)
    await fs.unlink(filePath)
    return true
  } catch (error) {
    console.error('Errore nell\'eliminazione chat:', error)
    return false
  }
})

// Cancella tutta la cronologia
ipcMain.handle('clear-chat-history', async (_, savePath: string) => {
  try {
    const files = await fs.readdir(savePath)
    const chatFiles = files.filter(file => file.startsWith('chat_') && file.endsWith('.json'))
    
    for (const file of chatFiles) {
      const filePath = path.join(savePath, file)
      await fs.unlink(filePath)
    }
    
    return true
  } catch (error) {
    console.error('Errore nella cancellazione cronologia:', error)
    return false
  }
})

// Esporta tutte le chat
ipcMain.handle('export-all-chats', async (_, savePath: string) => {
  try {
    const files = await fs.readdir(savePath)
    const chatFiles = files.filter(file => file.startsWith('chat_') && file.endsWith('.json'))
    
    const chats = []
    for (const file of chatFiles) {
      try {
        const filePath = path.join(savePath, file)
        const content = await fs.readFile(filePath, 'utf8')
        const chatData = JSON.parse(content)
        chats.push(chatData)
      } catch (error) {
        console.error(`Errore nel caricamento del file ${file}:`, error)
      }
    }
    
    if (chats.length === 0) {
      return false
    }
    
    const result = await dialog.showSaveDialog({
      title: 'Esporta tutte le chat',
      defaultPath: `chat_export_${new Date().toISOString().split('T')[0]}.json`,
      filters: [
        { name: 'JSON Files', extensions: ['json'] },
        { name: 'All Files', extensions: ['*'] }
      ]
    })
    
    if (!result.canceled && result.filePath) {
      await fs.writeFile(result.filePath, JSON.stringify(chats, null, 2), 'utf8')
      return true
    }
    
    return false
  } catch (error) {
    console.error('Errore nell\'esportazione:', error)
    return false
  }
})
