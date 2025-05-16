# News Trading AI Desktop

Applicazione desktop avanzata per la chat AI, analisi di notizie economiche e supporto al trading, sviluppata con Electron, React e Vite.

## 🚀 Funzionalità principali

- **Chat AI** con assistenti specializzati (finanza, news, trading, TradingView, Volsys)
- **Riconoscimento vocale**: invio messaggi tramite voce
- **Sintesi vocale**: lettura automatica delle risposte del bot
- **Personalizzazione vocale**: scegli voce, velocità e tono
- **Diagnostica microfono**: strumenti integrati per test e risoluzione problemi
- **Gestione API Key**: supporto OpenAI API key locale
- **Compatibilità**: funziona sia come app Electron che in browser (con alcune differenze)

## ⚡ Installazione e Avvio Rapido

```powershell
# Clona il repository
 git clone <repo-url>
 cd news-trading

# Installa le dipendenze
 npm install

# Avvia in modalità sviluppo
 npm run dev
```

## 🗂️ Struttura delle cartelle

```
├── electron/           # Codice Electron (main, preload)
├── src/                # Applicazione React (componenti, assets, config)
│   ├── components/Chat # Modulo chat vocale, assistenti, diagnostica
│   ├── config/         # Configurazione assistenti e prompt
│   └── ...
├── public/             # Asset statici
├── release/            # Build e pacchetti eseguibili
└── ...
```

## 📚 Documentazione

- [Documentazione Chat Vocale](src/components/Chat/README.md)
- [Guida Aggiornamenti](src/components/update/README.md)

## 💡 Note aggiuntive

- L'applicazione utilizza le API OpenAI: inserisci la tua API key nelle impostazioni.
- Per la migliore esperienza vocale, usa Chrome, Edge o l'app desktop.
- Diagnostica e suggerimenti vocali integrati nella sezione Chat.

## 🛠️ Personalizzazione

- Puoi aggiungere nuovi assistenti modificando `src/config/prompts.ts`.
- Tutti gli stili della chat sono modularizzati in `src/components/Chat/`.

## 📦 Build e rilascio

- Esegui `npm run build` per la build di produzione.
- I pacchetti eseguibili si trovano in `release/` dopo la build.

---
