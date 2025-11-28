import { ipcRenderer, contextBridge } from 'electron'

// ===== FIX CRITICO: Whitelist canali IPC permessi =====
const ALLOWED_CHANNELS = [
  'main-process-message',
  'select-folder',
  'validate-chat-save-path',
  'open-folder',
  'save-chat-file',
  'load-chat-history',
  'delete-chat-file',
  'clear-chat-history',
  'export-all-chats',
  'secure-set-api-key',
  'secure-get-api-key',
  'secure-remove-api-key',
] as const

// --------- Expose some API to the Renderer process ---------
contextBridge.exposeInMainWorld('ipcRenderer', {
  on(...args: Parameters<typeof ipcRenderer.on>) {
    const [channel, listener] = args
    // FIX: Validazione canale
    if (!ALLOWED_CHANNELS.includes(channel as any)) {
      console.error(`IPC channel '${channel}' not allowed`)
      throw new Error(`IPC channel '${channel}' not allowed`)
    }
    return ipcRenderer.on(channel, (event, ...args) => listener(event, ...args))
  },
  off(...args: Parameters<typeof ipcRenderer.off>) {
    const [channel, ...omit] = args
    // FIX: Validazione canale
    if (!ALLOWED_CHANNELS.includes(channel as any)) {
      console.error(`IPC channel '${channel}' not allowed`)
      throw new Error(`IPC channel '${channel}' not allowed`)
    }
    return ipcRenderer.off(channel, ...omit)
  },
  send(...args: Parameters<typeof ipcRenderer.send>) {
    const [channel, ...omit] = args
    // FIX: Validazione canale
    if (!ALLOWED_CHANNELS.includes(channel as any)) {
      console.error(`IPC channel '${channel}' not allowed`)
      throw new Error(`IPC channel '${channel}' not allowed`)
    }
    return ipcRenderer.send(channel, ...omit)
  },
  invoke(...args: Parameters<typeof ipcRenderer.invoke>) {
    const [channel, ...omit] = args
    // FIX: Validazione canale
    if (!ALLOWED_CHANNELS.includes(channel as any)) {
      console.error(`IPC channel '${channel}' not allowed`)
      throw new Error(`IPC channel '${channel}' not allowed`)
    }
    return ipcRenderer.invoke(channel, ...omit)
  },

  // You can expose other APTs you need here.
  // ...
})

// Esponi API specifiche per il riconoscimento vocale e la sintesi
contextBridge.exposeInMainWorld('electronSpeechAPI', {
  // Funzione per richiedere l'accesso al microfono
  requestMicrophoneAccess: async () => {
    try {
      // Richiede esplicitamente il permesso per il microfono
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      });

      // Verifica se lo stream è attivo
      const tracks = stream.getAudioTracks();
      const hasActiveTracks = tracks.some(track => track.enabled && track.readyState === 'live');

      // Log delle informazioni per debug
      console.log('Stream microfono:', stream);
      console.log('Tracce audio:', tracks.map(t => ({
        label: t.label,
        enabled: t.enabled,
        muted: t.muted,
        readyState: t.readyState
      })));

      // Rilascia lo stream dopo aver ottenuto il permesso
      stream.getTracks().forEach(track => track.stop());

      return hasActiveTracks;
    } catch (error) {
      console.error('Errore nell\'accesso al microfono:', error);
      return false;
    }
  },

  // Verifica se il microfono è disponibile
  checkMicrophoneAvailability: async () => {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      return devices.some(device => device.kind === 'audioinput');
    } catch (error) {
      console.error('Errore nel controllo dei dispositivi audio:', error);
      return false;
    }
  }
});

// ===== FIX CRITICO: API per gestione sicura API key =====
contextBridge.exposeInMainWorld('secureStorage', {
  setApiKey: (apiKey: string) => ipcRenderer.invoke('secure-set-api-key', apiKey),
  getApiKey: () => ipcRenderer.invoke('secure-get-api-key'),
  removeApiKey: () => ipcRenderer.invoke('secure-remove-api-key'),
});

// --------- Preload scripts loading ---------
function domReady(condition: DocumentReadyState[] = ['complete', 'interactive']) {
  return new Promise(resolve => {
    if (condition.includes(document.readyState)) {
      resolve(true)
    } else {
      document.addEventListener('readystatechange', () => {
        if (condition.includes(document.readyState)) {
          resolve(true)
        }
      })
    }
  })
}

const safeDOM = {
  append(parent: HTMLElement, child: HTMLElement) {
    if (!Array.from(parent.children).find(e => e === child)) {
      return parent.appendChild(child)
    }
  },
  remove(parent: HTMLElement, child: HTMLElement) {
    if (Array.from(parent.children).find(e => e === child)) {
      return parent.removeChild(child)
    }
  },
}

/**
 * https://tobiasahlin.com/spinkit
 * https://connoratherton.com/loaders
 * https://projects.lukehaas.me/css-loaders
 * https://matejkustec.github.io/SpinThatShit
 */
function useLoading() {
  const className = `loaders-css__square-spin`
  const styleContent = `
@keyframes square-spin {
  25% { transform: perspective(100px) rotateX(180deg) rotateY(0); }
  50% { transform: perspective(100px) rotateX(180deg) rotateY(180deg); }
  75% { transform: perspective(100px) rotateX(0) rotateY(180deg); }
  100% { transform: perspective(100px) rotateX(0) rotateY(0); }
}
.${className} > div {
  animation-fill-mode: both;
  width: 50px;
  height: 50px;
  background: #fff;
  animation: square-spin 3s 0s cubic-bezier(0.09, 0.57, 0.49, 0.9) infinite;
}
.app-loading-wrap {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #282c34;
  z-index: 9;
}
    `
  const oStyle = document.createElement('style')
  const oDiv = document.createElement('div')

  oStyle.id = 'app-loading-style'
  oStyle.innerHTML = styleContent
  oDiv.className = 'app-loading-wrap'
  oDiv.innerHTML = `<div class="${className}"><div></div></div>`

  return {
    appendLoading() {
      safeDOM.append(document.head, oStyle)
      safeDOM.append(document.body, oDiv)
    },
    removeLoading() {
      safeDOM.remove(document.head, oStyle)
      safeDOM.remove(document.body, oDiv)
    },
  }
}

// ----------------------------------------------------------------------

const { appendLoading, removeLoading } = useLoading()
domReady().then(appendLoading)

window.onmessage = (ev) => {
  ev.data.payload === 'removeLoading' && removeLoading()
}

setTimeout(removeLoading, 4999)