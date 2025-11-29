import { app, BrowserWindow, shell, ipcMain, dialog, safeStorage } from 'electron'
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

// FIX CRITICO: Rimosso handler open-win con nodeIntegration=true (vulnerabilità RCE)
// Se necessario ri-implementare con le stesse impostazioni di sicurezza della finestra principale

// ===== GESTIONE SICURA API KEY con safeStorage =====

// Salva API key in modo sicuro (cifrata)
ipcMain.handle('secure-set-api-key', async (_, apiKey: string) => {
  try {
    if (!safeStorage.isEncryptionAvailable()) {
      console.error('Encryption not available on this system')
      return { success: false, error: 'Encryption not available' }
    }

    const buffer = safeStorage.encryptString(apiKey)
    const userDataPath = app.getPath('userData')
    const keyPath = path.join(userDataPath, 'api_key.enc')

    await fs.writeFile(keyPath, buffer)
    return { success: true }
  } catch (error) {
    console.error('Error saving API key:', error)
    return { success: false, error: String(error) }
  }
})

// Recupera API key cifrata
ipcMain.handle('secure-get-api-key', async () => {
  try {
    const userDataPath = app.getPath('userData')
    const keyPath = path.join(userDataPath, 'api_key.enc')

    try {
      const buffer = await fs.readFile(keyPath)
      const apiKey = safeStorage.decryptString(buffer)
      return { success: true, apiKey }
    } catch (error) {
      // File non esiste o errore di lettura
      return { success: true, apiKey: null }
    }
  } catch (error) {
    console.error('Error reading API key:', error)
    return { success: false, error: String(error) }
  }
})

// Rimuovi API key
ipcMain.handle('secure-remove-api-key', async () => {
  try {
    const userDataPath = app.getPath('userData')
    const keyPath = path.join(userDataPath, 'api_key.enc')

    try {
      await fs.unlink(keyPath)
    } catch {
      // File già non esistente, ok
    }

    return { success: true }
  } catch (error) {
    console.error('Error removing API key:', error)
    return { success: false, error: String(error) }
  }
})

// ===== HELPER per validazione path =====
function isValidPath(userPath: string, basePath: string): boolean {
  try {
    const normalized = path.normalize(userPath)
    const resolved = path.resolve(basePath, normalized)
    return resolved.startsWith(basePath)
  } catch {
    return false
  }
}

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
    // FIX: Validazione path per prevenire path traversal
    const normalized = path.normalize(folderPath)
    if (!path.isAbsolute(normalized)) {
      console.error('Invalid path: must be absolute')
      return false
    }

    await shell.openPath(normalized)
    return true
  } catch (error) {
    console.error('Error opening folder:', error)
    return false
  }
})

// Salva file di chat
ipcMain.handle('save-chat-file', async (_, savePath: string, chatData: any) => {
  try {
    // FIX: Validazione path
    const normalizedSavePath = path.normalize(savePath)
    if (!path.isAbsolute(normalizedSavePath)) {
      console.error('Invalid save path: must be absolute')
      return false
    }

    // Validazione chatData.id per prevenire path traversal
    if (!chatData?.id || typeof chatData.id !== 'string' || chatData.id.includes('..') || chatData.id.includes('/') || chatData.id.includes('\\')) {
      console.error('Invalid chat ID')
      return false
    }

    const fileName = `chat_${chatData.id}.json`
    const filePath = path.join(normalizedSavePath, fileName)

    // Verifica che il path finale sia dentro la cartella di save
    if (!filePath.startsWith(normalizedSavePath)) {
      console.error('Path traversal attempt detected')
      return false
    }

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
    // FIX: Validazione path
    const normalizedSavePath = path.normalize(savePath)
    if (!path.isAbsolute(normalizedSavePath)) {
      console.error('Invalid save path: must be absolute')
      return []
    }

    const files = await fs.readdir(normalizedSavePath)
    const chatFiles = files.filter(file => file.startsWith('chat_') && file.endsWith('.json'))

    const chats = []
    for (const file of chatFiles) {
      try {
        // FIX: Validazione filename per prevenire path traversal
        if (file.includes('..') || file.includes('/') || file.includes('\\')) {
          console.error(`Invalid filename: ${file}`)
          continue
        }

        const filePath = path.join(normalizedSavePath, file)

        // Verifica che il path sia dentro la cartella
        if (!filePath.startsWith(normalizedSavePath)) {
          console.error(`Path traversal attempt: ${file}`)
          continue
        }

        const content = await fs.readFile(filePath, 'utf8')

        // FIX: Gestione errori JSON.parse
        try {
          const chatData = JSON.parse(content)
          chats.push(chatData)
        } catch (jsonError) {
          console.error(`Invalid JSON in file ${file}:`, jsonError)
        }
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
    // FIX: Validazione path
    const normalizedSavePath = path.normalize(savePath)
    if (!path.isAbsolute(normalizedSavePath)) {
      console.error('Invalid save path: must be absolute')
      return false
    }

    // FIX: Validazione chatId
    if (!chatId || typeof chatId !== 'string' || chatId.includes('..') || chatId.includes('/') || chatId.includes('\\')) {
      console.error('Invalid chat ID')
      return false
    }

    const fileName = `chat_${chatId}.json`
    const filePath = path.join(normalizedSavePath, fileName)

    // Verifica che il path sia dentro la cartella
    if (!filePath.startsWith(normalizedSavePath)) {
      console.error('Path traversal attempt detected')
      return false
    }

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
    // FIX: Validazione path
    const normalizedSavePath = path.normalize(savePath)
    if (!path.isAbsolute(normalizedSavePath)) {
      console.error('Invalid save path: must be absolute')
      return false
    }

    const files = await fs.readdir(normalizedSavePath)
    const chatFiles = files.filter(file => file.startsWith('chat_') && file.endsWith('.json'))

    for (const file of chatFiles) {
      // FIX: Validazione filename
      if (file.includes('..') || file.includes('/') || file.includes('\\')) {
        console.error(`Invalid filename: ${file}`)
        continue
      }

      const filePath = path.join(normalizedSavePath, file)

      // Verifica che il path sia dentro la cartella
      if (!filePath.startsWith(normalizedSavePath)) {
        console.error(`Path traversal attempt: ${file}`)
        continue
      }

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
    // FIX: Validazione path
    const normalizedSavePath = path.normalize(savePath)
    if (!path.isAbsolute(normalizedSavePath)) {
      console.error('Invalid save path: must be absolute')
      return false
    }

    const files = await fs.readdir(normalizedSavePath)
    const chatFiles = files.filter(file => file.startsWith('chat_') && file.endsWith('.json'))

    const chats = []
    for (const file of chatFiles) {
      try {
        // FIX: Validazione filename
        if (file.includes('..') || file.includes('/') || file.includes('\\')) {
          console.error(`Invalid filename: ${file}`)
          continue
        }

        const filePath = path.join(normalizedSavePath, file)

        // Verifica che il path sia dentro la cartella
        if (!filePath.startsWith(normalizedSavePath)) {
          console.error(`Path traversal attempt: ${file}`)
          continue
        }

        const content = await fs.readFile(filePath, 'utf8')

        // FIX: Gestione errori JSON.parse
        try {
          const chatData = JSON.parse(content)
          chats.push(chatData)
        } catch (jsonError) {
          console.error(`Invalid JSON in file ${file}:`, jsonError)
        }
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
