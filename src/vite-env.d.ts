/// <reference types="vite/client" />

interface Window {
  // expose in the `electron/preload/index.ts`
  ipcRenderer: import('electron').IpcRenderer
  
  // API per il riconoscimento vocale in Electron
  electronSpeechAPI: {
    requestMicrophoneAccess: () => Promise<boolean>;
    checkMicrophoneAvailability: () => Promise<boolean>;
  }
}
