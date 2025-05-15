# Chat Vocale - Documentazione d'uso

Questa documentazione fornisce una guida all'utilizzo della funzionalità di chat vocale implementata nell'applicazione.

## Funzionalità principali

La chat vocale offre le seguenti funzionalità principali:

1. **Riconoscimento vocale**: Permette di inserire messaggi usando la propria voce anziché digitare.
2. **Sintesi vocale**: Legge ad alta voce le risposte del chatbot.
3. **Personalizzazione**: Consente di regolare voce, velocità e tono della sintesi vocale.
4. **Diagnostica del microfono**: Strumenti per verificare e risolvere problemi con il microfono.

## Come utilizzare la chat vocale

### Riconoscimento vocale

1. Clicca sul pulsante del microfono (🎤) per attivare il riconoscimento vocale.
2. Parla chiaramente e il testo riconosciuto verrà inserito automaticamente nella chat.
3. Clicca nuovamente sul pulsante del microfono per disattivare il riconoscimento.

### Sintesi vocale

1. Quando il chatbot invia un messaggio, puoi fare clic sul pulsante dell'altoparlante (🔊) per ascoltarlo.
2. Clicca nuovamente per interrompere la lettura.
3. La sintesi vocale non è disponibile mentre il bot sta ancora digitando il messaggio.

### Impostazioni vocali

1. Clicca sull'icona delle impostazioni (⚙️) per accedere al pannello delle impostazioni vocali.
2. Scegli tra le voci disponibili nel menu a discesa.
3. Regola la velocità di lettura con il primo slider (da 0.5x a 2x).
4. Regola il tono della voce con il secondo slider (da 0.5 a 2).
5. Clicca su "Reset" per ripristinare le impostazioni predefinite.
6. Clicca su "Chiudi" per salvare le impostazioni e chiudere il pannello.

### Test del microfono

Se riscontri problemi con il riconoscimento vocale:

1. Clicca sulla scheda "Test Microfono" nella parte superiore dell'applicazione.
2. Clicca su "Testa Microfono" per verificare se il microfono è accessibile.
3. Clicca su "Testa Riconoscimento Vocale" per verificare il funzionamento del riconoscimento.
4. Se riscontri problemi, consulta la sezione di risoluzione dei problemi disponibile nella pagina di test.

## Suggerimenti per risultati ottimali

- Parla a un ritmo normale e chiaro.
- Usa frasi brevi e specifiche per migliorare la precisione del riconoscimento.
- Evita ambienti troppo rumorosi.
- Se possibile, utilizza un microfono esterno di buona qualità.
- In caso di problemi persistenti, consulta la "Guida vocale" facendo clic sull'icona del punto interrogativo (❓).

## Compatibilità

La chat vocale è progettata per funzionare sia in ambienti Web che in Electron. Tuttavia, alcune funzionalità potrebbero variare a seconda del contesto di esecuzione:

- **Browser Web**: Funziona meglio su Chrome, Edge e Safari che hanno un buon supporto per le API vocali.
- **Applicazione Electron**: Sono state implementate soluzioni specifiche per garantire la compatibilità con l'ambiente Electron.

## Risoluzione dei problemi comuni

1. **Il microfono non viene rilevato**
   - Verifica che il microfono sia collegato e funzionante
   - Controlla che l'applicazione abbia i permessi di accesso al microfono
   - Riavvia l'applicazione

2. **Il riconoscimento vocale non funziona correttamente**
   - Passa alla scheda "Test Microfono" e utilizza gli strumenti di diagnostica
   - Verifica che il tuo browser supporti le API di riconoscimento vocale
   - Assicurati che la lingua del tuo sistema sia impostata correttamente

3. **La sintesi vocale non produce suono**
   - Verifica che il volume del dispositivo sia attivo
   - Prova a selezionare una voce diversa nelle impostazioni
   - Riavvia l'applicazione

4. **L'applicazione si blocca durante l'uso del microfono**
   - Chiudi e riapri l'applicazione
   - Verifica che non ci siano altre applicazioni che utilizzano il microfono
   - Prova a disconnettere e riconnettere il microfono

## Contattare l'assistenza

Se riscontri problemi persistenti, usa il pulsante "Informazioni di Supporto" nella pagina di test del microfono per generare un report diagnostico e contatta l'assistenza tecnica.
