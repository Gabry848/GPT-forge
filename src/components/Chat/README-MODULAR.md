# Struttura Modulare del Componente Chat

Il componente Chat è stato ristrutturato in una architettura modulare per migliorare la leggibilità, la manutenibilità e la riutilizzabilità del codice.

## Struttura dei Componenti

### Componenti Principali

1. **`index.tsx`** - Componente principale che gestisce lo stato e orchestra tutti i sotto-componenti
2. **`ChatHeader.tsx`** - Intestazione della chat con titolo e pulsante impostazioni
3. **`SettingsModal.tsx`** - Modal delle impostazioni con contenuto dinamico basato sui tab

### Componenti delle Impostazioni

4. **`SettingsSidebar.tsx`** - Sidebar di navigazione con tab delle impostazioni
5. **`AssistantSettings.tsx`** - Configurazione degli assistenti e prompt personalizzati
6. **`ModelSettings.tsx`** - Selezione e configurazione dei modelli AI
7. **`CustomModelsSettings.tsx`** - Gestione dei modelli personalizzati salvati
8. **`ApiSettings.tsx`** - Configurazione delle chiavi API
9. **`ActionsSettings.tsx`** - Azioni di sistema (clear chat, export, reset)

### Componenti di UI

10. **`MessagesContainer.tsx`** - Container principale per la visualizzazione dei messaggi
11. **`MessageBubble.tsx`** - Singolo messaggio con supporto per Markdown e copia codice
12. **`InputArea.tsx`** - Area di input con controlli vocali e invio messaggi
13. **`CustomPromptForm.tsx`** - Form per la configurazione di prompt personalizzati
14. **`AssistantSelector.tsx`** - Selettore rapido dell'assistente
15. **`CreateModelModal.tsx`** - Modal dedicato per la creazione di nuovi modelli

## Vantaggi della Struttura Modulare

### 🔧 Manutenibilità
- **Separazione delle responsabilità**: Ogni componente ha un ruolo specifico e ben definito
- **Facilità di debug**: Gli errori sono isolati in componenti specifici
- **Refactoring semplificato**: Modifiche a un componente non influenzano gli altri

### 🔄 Riutilizzabilità
- **Componenti standalone**: Ogni componente può essere riutilizzato in altre parti dell'applicazione
- **Props ben definite**: Interfacce chiare per l'integrazione con altri componenti
- **Logica encapsulata**: Ogni componente gestisce la propria logica interna

### 📖 Leggibilità
- **File più piccoli**: Codice più facile da leggere e comprendere
- **Nomi descrittivi**: Ogni file ha un nome che descrive chiaramente il suo scopo
- **Struttura logica**: I componenti sono organizzati per funzionalità

### 🚀 Sviluppo
- **Sviluppo parallelo**: Team multipli possono lavorare su componenti diversi
- **Testing isolato**: Ogni componente può essere testato indipendentemente
- **Hot reload più veloce**: Modifiche a singoli componenti causano reload più rapidi

## Gestione dello Stato

### Stato Centralizzato
Il componente principale (`index.tsx`) mantiene tutto lo stato applicativo e passa le props necessarie ai sotto-componenti attraverso una chiara gerarchia.

### Props Drilling
Utilizziamo il pattern di props drilling per mantenere la semplicità e la tracciabilità del flusso di dati.

### Handlers Centralizzati
Tutti gli event handlers sono definiti nel componente principale e passati come props ai componenti figli.

## Pattern di Design

### Composizione
I componenti sono progettati per essere composti insieme, permettendo flessibilità nella struttura dell'UI.

### Single Responsibility
Ogni componente ha una singola responsabilità ben definita.

### Props Interface
Ogni componente espone un'interfaccia TypeScript chiara e ben documentata.

## File Structure

```
src/components/Chat/
├── index.tsx                    # Componente principale
├── components/                  # Sotto-componenti modulari
│   ├── ChatHeader.tsx
│   ├── SettingsModal.tsx
│   ├── SettingsSidebar.tsx
│   ├── AssistantSettings.tsx
│   ├── ModelSettings.tsx
│   ├── CustomModelsSettings.tsx
│   ├── ApiSettings.tsx
│   ├── ActionsSettings.tsx
│   ├── MessagesContainer.tsx
│   ├── MessageBubble.tsx
│   ├── InputArea.tsx
│   ├── CustomPromptForm.tsx
│   ├── AssistantSelector.tsx
│   └── CreateModelModal.tsx
├── *.css                       # File CSS per lo styling
└── README.md                   # Questo file
```

## Come Aggiungere Nuovi Componenti

1. Crea un nuovo file nella cartella `components/`
2. Definisci l'interfaccia Props con TypeScript
3. Implementa il componente come function component
4. Esporta il componente come default
5. Importalo e utilizzalo nel componente principale
6. Aggiorna questa documentazione

## Best Practices

- **Mantieni i componenti piccoli** (< 200 righe di codice)
- **Usa TypeScript interfaces** per definire le props
- **Implementa error boundaries** quando necessario
- **Mantieni la coerenza** nei nomi dei file e delle funzioni
- **Documenta le props complesse** con commenti JSDoc
- **Testa i componenti isolatamente** con unit tests

Questa struttura modulare garantisce che il codice rimanga gestibile e scalabile man mano che l'applicazione cresce.
