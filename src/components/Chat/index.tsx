import { useState, useRef, useEffect } from 'react';
import './ChatContainer.css';
import './ChatHeader.css';
import './Messages.css';
import './InputArea.css';
import './SettingsMenu.css';
import './AssistantSelector.css';
import './CustomPromptForm.css';
import './ApiKeySection.css';
import { AssistantConfig, assistants, defaultAssistant, findAssistantById } from '../../config/prompts';
import VoiceControlsEnhanced from './VoiceControlsEnhanced';

interface Message {
  id: number;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

const Chat: React.FC = () => {
  // Stato per l'assistente attualmente selezionato
  const [currentAssistant, setCurrentAssistant] = useState<AssistantConfig>(defaultAssistant);
  // Stato per il prompt personalizzato (per l'assistente custom)
  const [customPrompt, setCustomPrompt] = useState<string>('');
  // Stato per mostrare/nascondere il form del prompt personalizzato
  const [showCustomPromptForm, setShowCustomPromptForm] = useState<boolean>(false);

  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      text: defaultAssistant.welcomeMessage,
      sender: 'bot',
      timestamp: new Date(),
    }
  ]);
  
  // Manteniamo una cronologia delle chat per OpenAI
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([
    { role: 'system', content: defaultAssistant.systemPrompt }
  ]);
  
  const [inputValue, setInputValue] = useState<string>('');
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [showSettings, setShowSettings] = useState<boolean>(false);
  const [currentBotMessage, setCurrentBotMessage] = useState<string | null>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  const [apiKeyInput, setApiKeyInput] = useState<string>('');
  const [customApiKey, setCustomApiKey] = useState<string | null>(null);

  // Carica la chiave API da localStorage all'avvio
  useEffect(() => {
    const storedKey = localStorage.getItem('openai_api_key');
    if (storedKey) {
      setCustomApiKey(storedKey);
      setApiKeyInput('************' + storedKey.slice(-4));
    }
  }, []);

  // Salva la chiave API inserita
  const handleSaveApiKey = () => {
    if (apiKeyInput.trim().length < 20) {
      alert('La chiave API sembra troppo corta.');
      return;
    }
    localStorage.setItem('openai_api_key', apiKeyInput.trim());
    setCustomApiKey(apiKeyInput.trim());
    setApiKeyInput('************' + apiKeyInput.trim().slice(-4));
    setShowSettings(false);
  };

  // Cancella la chiave API personalizzata
  const handleClearApiKey = () => {
    localStorage.removeItem('openai_api_key');
    setCustomApiKey(null);
    setApiKeyInput('');
    setShowSettings(false);
  };

  // Effetto per aggiornare il messaggio di sistema quando cambia l'assistente
  useEffect(() => {
    // Aggiorna il messaggio di benvenuto
    setMessages([
      {
        id: Date.now(),
        text: currentAssistant.welcomeMessage,
        sender: 'bot',
        timestamp: new Date(),
      }
    ]);
    
    // Imposta il messaggio di benvenuto come messaggio corrente per la lettura vocale
    setCurrentBotMessage(currentAssistant.welcomeMessage);
    
    // Aggiorna il prompt di sistema nella cronologia chat
    setChatHistory([
      { 
        role: 'system', 
        content: currentAssistant.id === 'custom' && customPrompt 
          ? customPrompt 
          : currentAssistant.systemPrompt 
      }
    ]);
  }, [currentAssistant, customPrompt]);

  // Funzione per scorrere automaticamente ai messaggi più recenti
  const scrollToBottom = () => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
  };

  // Effetto per scorrere ai messaggi più recenti quando vengono aggiunti nuovi messaggi
  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  // Ottieni la chiave API dalle variabili d'ambiente o da localStorage
  const getApiKey = (): string => {
    if (customApiKey) return customApiKey;
    const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
    if (!apiKey) {
      console.error('Chiave API OpenAI mancante. Controlla il file .env');
      setError('Configurazione API mancante. Contatta l\'amministratore.');
    }
    return apiKey as string;
  };

  // Funzione per cancellare la chat
  const handleClearChat = () => {
    // Mantieni il messaggio di benvenuto
    setMessages([
      {
        id: Date.now(),
        text: currentAssistant.welcomeMessage,
        sender: 'bot',
        timestamp: new Date(),
      }
    ]);
    
    // Resetta il messaggio corrente del bot
    setCurrentBotMessage(currentAssistant.welcomeMessage);
    
    // Mantieni solo il messaggio di sistema
    setChatHistory([
      { 
        role: 'system', 
        content: currentAssistant.id === 'custom' && customPrompt 
          ? customPrompt 
          : currentAssistant.systemPrompt
      }
    ]);
    
    // Chiudi il menu delle impostazioni
    setShowSettings(false);
  };

  // Funzione per cambiare l'assistente
  const handleChangeAssistant = (assistantId: string) => {
    const newAssistant = findAssistantById(assistantId);
    setCurrentAssistant(newAssistant);
    
    // Se è selezionato l'assistente personalizzato, mostra il form
    if (assistantId === 'custom') {
      setShowCustomPromptForm(true);
    } else {
      setShowCustomPromptForm(false);
    }
    
    // Chiudi il menu delle impostazioni
    setShowSettings(false);
  };

  // Funzione per salvare il prompt personalizzato
  const handleSaveCustomPrompt = () => {
    // Aggiorna l'assistente custom con il nuovo prompt
    const updatedAssistant = {...currentAssistant};
    updatedAssistant.systemPrompt = customPrompt;
    setCurrentAssistant(updatedAssistant);
    
    // Chiudi il form
    setShowCustomPromptForm(false);
  };

  // Gestisce l'invio del messaggio
  const handleSendMessage = async () => {
    if (inputValue.trim() === '') return;
    setError(null); // Resetta eventuali errori precedenti

    // Aggiungi il messaggio dell'utente
    const newUserMessage: Message = {
      id: Date.now(),
      text: inputValue,
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages(prevMessages => [...prevMessages, newUserMessage]);
    
    // Salva il messaggio dell'utente prima di cancellare l'input
    const userMessage = inputValue;
    setInputValue('');
    
    // Aggiorna la cronologia della chat
    const newUserChatMessage: ChatMessage = { role: 'user', content: userMessage };
    const updatedChatHistory = [...chatHistory, newUserChatMessage];
    setChatHistory(updatedChatHistory);
    
    // Mostra l'indicatore di digitazione
    setIsTyping(true);

    try {
      const apiKey = getApiKey();
      if (!apiKey) {
        throw new Error('Chiave API non disponibile');
      }

      // Effettua la richiesta all'API di OpenAI
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: updatedChatHistory
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          `Errore API OpenAI: ${response.status} - ${errorData.error?.message || response.statusText}`
        );
      }

      const data = await response.json();
      const botReply = data.choices[0].message.content;
      
      // Nascondi l'indicatore di digitazione
      setIsTyping(false);
      
      // Aggiungi la risposta del bot ai messaggi
      const botResponse: Message = {
        id: Date.now() + 1,
        text: botReply,
        sender: 'bot',
        timestamp: new Date(),
      };
      
      setMessages(prevMessages => [...prevMessages, botResponse]);
      
      // Imposta il messaggio corrente del bot per la lettura vocale
      setCurrentBotMessage(botReply);
      
      // Aggiorna la cronologia della chat
      setChatHistory(prev => [...prev, { role: 'assistant', content: botReply }]);
    } catch (error) {
      console.error('Errore durante la comunicazione con OpenAI:', error);
      
      // Nascondi l'indicatore di digitazione
      setIsTyping(false);
      
      // Imposta il messaggio di errore
      const errorMessage = error instanceof Error ? error.message : 'Errore sconosciuto';
      setError(errorMessage);
      
      // Aggiungi un messaggio di errore
      const errorResponse: Message = {
        id: Date.now() + 1,
        text: "Mi dispiace, si è verificato un errore di comunicazione. Riprova più tardi.",
        sender: 'bot',
        timestamp: new Date(),
      };
      
      setMessages(prevMessages => [...prevMessages, errorResponse]);
    }
  };

  // Gestisce l'invio del messaggio quando si preme "Enter"
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };

  // Formatta l'ora del messaggio
  const formatTime = (date: Date): string => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Funzione per gestire il testo ricevuto dal riconoscimento vocale
  const handleVoiceText = (text: string) => {
    console.log('[handleVoiceText] Testo ricevuto:', text);
    if (text.trim() === '') return;
    setInputValue(text); // Inserisce il testo riconosciuto nell'input, ma NON invia automaticamente
    // Stampa il testo tradotto nella console
    console.log('[handleVoiceText] Testo tradotto:', text);
  };
  return (
    <div className="chat-container">
      {/* Intestazione della chat */}
      <div className="chat-header">
        <h2>ChatBot AI</h2>
        <div className="header-actions">
          <button 
            className="settings-button"
            onClick={() => setShowSettings(!showSettings)}
            aria-label="Impostazioni"
          >
            ⚙️
          </button>
        </div>
        
        {/* Menu impostazioni */}
        {showSettings && (
          <div className="settings-menu">
            <button 
              className="clear-chat-button"
              onClick={handleClearChat}
            >
              Cancella chat
            </button>
            <div className="assistant-selector">
              <label htmlFor="assistant-select">Seleziona assistente:</label>
              <select 
                id="assistant-select" 
                onChange={(e) => handleChangeAssistant(e.target.value)}
                value={currentAssistant.id}
              >
                {assistants.map(assistant => (
                  <option key={assistant.id} value={assistant.id}>
                    {assistant.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="api-key-section" style={{padding: '15px 15px 0 15px'}}>
              <label htmlFor="api-key-input" style={{fontSize: '14px', color: '#333'}}>OpenAI API Key:</label>
              <input
                id="api-key-input"
                type="text"
                placeholder="Inserisci la tua API key..."
                value={customApiKey ? ('************' + customApiKey.slice(-4)) : apiKeyInput}
                onChange={e => setApiKeyInput(e.target.value)}
                style={{width: '100%', marginTop: 4, marginBottom: 8, padding: 6, borderRadius: 6, border: '1px solid #ddd'}}
                autoComplete="off"
              />
              <div style={{display: 'flex', gap: 8}}>
                <button onClick={handleSaveApiKey} style={{flex: 1, background: '#0084ff', color: 'white', border: 'none', borderRadius: 6, padding: 6, cursor: 'pointer'}}>Salva</button>
                {customApiKey && (
                  <button onClick={handleClearApiKey} style={{flex: 1, background: '#eee', color: '#333', border: 'none', borderRadius: 6, padding: 6, cursor: 'pointer'}}>Rimuovi</button>
                )}
              </div>
              <div style={{fontSize: '12px', color: '#888', marginTop: 4}}>
                La chiave viene salvata solo sul tuo dispositivo.
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Contenitore centrale per limitare la larghezza della chat */}
      <div className="chat-content">
        {/* Form per il prompt personalizzato */}
        {showCustomPromptForm && (
          <div className="custom-prompt-form">
            <h3>Prompt Personalizzato</h3>
            <p className="prompt-description">
              Definisci come si comporterà l'assistente.
            </p>
            <textarea 
              value={customPrompt}
              onChange={(e) => setCustomPrompt(e.target.value)}
              placeholder="Inserisci il tuo prompt personalizzato..."
            />
            <div className="prompt-buttons">
              <button 
                onClick={() => setShowCustomPromptForm(false)}
                className="cancel-button"
              >
                Annulla
              </button>
              <button 
                onClick={handleSaveCustomPrompt}
                className="save-button"
                disabled={!customPrompt.trim()}
              >
                Salva Prompt
              </button>
            </div>
          </div>
        )}
          {/* Contenitore dei messaggi */}
        <div className="messages-container" ref={messagesContainerRef}>
          {messages.map(message => (
            <div 
              key={message.id} 
              className={`message-bubble ${message.sender === 'user' ? 'user-message' : 'bot-message'}`}
            >
              <div className="message-content">
                {message.text}
              </div>
              <div className="message-info">
                <span className="message-sender">{message.sender === 'user' ? 'Tu' : 'Bot'}</span>
                <span className="message-time">
                  {formatTime(message.timestamp)}
                </span>
              </div>
            </div>
          ))}
          
          {/* Indicatore "sta scrivendo..." */}
          {isTyping && (
            <div className="typing-indicator">
              <div className="typing-bubble"></div>
              <div className="typing-bubble"></div>
              <div className="typing-bubble"></div>
            </div>
          )}
          
          {/* Messaggio di errore */}
          {error && (
            <div className="error-message">
              <p>Si è verificato un errore: {error}</p>
            </div>
          )}
        </div>
        {/* Input per scrivere il messaggio */}
        <div className="input-container">
          <VoiceControlsEnhanced 
            onTextReceived={handleVoiceText}
            isTyping={isTyping}
            currentMessage={currentBotMessage}
          />
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Scrivi un messaggio..."
            className="message-input"
            disabled={isTyping}
          />
          <button
            onClick={handleSendMessage}
            className="send-button"
            disabled={isTyping || inputValue.trim() === ''}
          >
            Invia
          </button>
        </div>
      </div>
    </div>
  );
};

export default Chat;