# Migrazione da DeepSeek a OpenRouter

## Modifiche Effettuate

L'applicazione GPT Forge è stata aggiornata per utilizzare OpenRouter al posto di DeepSeek come provider API per la chat.

### Cambiamenti Principali:

1. **Endpoint API**: 
   - Prima: `https://api.deepseek.com/v1/chat/completions`
   - Ora: `https://openrouter.ai/api/v1/chat/completions`

2. **Variabile d'ambiente**:
   - Prima: `VITE_DEESPEEK_API_KEY`
   - Ora: `VITE_OPENROUTER_API_KEY`

3. **Chiave localStorage**:
   - Prima: `deespeek_api_key`
   - Ora: `openrouter_api_key`

4. **Modello predefinito**:
   - Prima: `deepseek-chat`
   - Ora: `openai/gpt-3.5-turbo`

5. **Headers aggiuntivi**:
   - Aggiunti `HTTP-Referer` e `X-Title` per analytics OpenRouter

### Configurazione

1. Crea un account su [OpenRouter](https://openrouter.ai)
2. Ottieni la tua API key da [OpenRouter Keys](https://openrouter.ai/keys)
3. Crea un file `.env` nella root del progetto:
   ```
   VITE_OPENROUTER_API_KEY=your_openrouter_api_key_here
   ```

### Modelli Disponibili

OpenRouter supporta molti modelli diversi. Puoi cambiare il modello modificando la proprietà `model` nella richiesta API:

- `openai/gpt-3.5-turbo`
- `openai/gpt-4`
- `anthropic/claude-3-haiku`
- `meta-llama/llama-2-70b-chat`
- E molti altri...

Per la lista completa: [OpenRouter Models](https://openrouter.ai/docs#models)

### Note

- Le chiavi API vengono salvate localmente nel browser (localStorage)
- È possibile inserire una chiave API personalizzata tramite l'interfaccia utente
- I messaggi di errore sono stati aggiornati per riflettere il nuovo provider
