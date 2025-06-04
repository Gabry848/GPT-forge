import { useState, useEffect } from 'react';
import './ChatContainer.css';
import './ChatHeader.css';
import './Messages.css';
import './InputArea.css';
import './SettingsMenu.css';
import './AssistantSelector.css';
import './CustomPromptForm.css';
import './ApiKeySection.css';
import './SettingsPopup.css';
import { AssistantConfig, defaultAssistant, findAssistantById } from '../../config/prompts';

// Import dei componenti modulari
import ChatHeader from './components/ChatHeader';
import SettingsModal from './components/SettingsModal';
import { SettingsTab } from './components/SettingsSidebar';
import CreateModelModal from './components/CreateModelModal';
import MessagesContainer from './components/MessagesContainer';
import InputArea from './components/InputArea';
import CustomPromptForm from './components/CustomPromptForm';
import AssistantSelector from './components/AssistantSelector';

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

interface OpenRouterModel {
  id: string;
  name: string;
  description: string;
  context_length: number;
  pricing: {
    prompt: string;
    completion: string;
  };
}

// Interfaccia per i modelli personalizzati salvati
interface SavedCustomModel {
  id: string;
  title: string;
  prompt: string;
  modelId: string;
  createdAt: Date;
}

// Componente per blocco codice con tasto copia
const CodeBlockWithCopy = ({ children }: { children: React.ReactNode }) => {
  const codeRef = useRef<HTMLPreElement>(null);
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    if (codeRef.current) {
      const text = codeRef.current.innerText;
      navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    }
  };

  return (
    <pre ref={codeRef}>
      <button className="copy-btn" onClick={handleCopy} title="Copia codice">{copied ? 'Copiato!' : 'Copia'}</button>
      {children}
    </pre>
  );
};

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
    // Manteniamo una cronologia delle chat per OpenRouter
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
    // Stati per il popup delle impostazioni
  const [showSettingsPopup, setShowSettingsPopup] = useState<boolean>(false);
  const [showCustomPromptInSettings, setShowCustomPromptInSettings] = useState<boolean>(false);
  
  // Stati per la nuova struttura sidebar
  const [activeSettingsTab, setActiveSettingsTab] = useState<'assistant' | 'model' | 'custom-models' | 'api' | 'actions'>('assistant');
  const [showCreateModelModal, setShowCreateModelModal] = useState<boolean>(false);
  const [newModelTitle, setNewModelTitle] = useState<string>('');
  const [newModelPrompt, setNewModelPrompt] = useState<string>('');
  
  // Stati per i modelli OpenRouter
  const [availableModels, setAvailableModels] = useState<OpenRouterModel[]>([]);
  const [selectedModel, setSelectedModel] = useState<string>('openai/gpt-3.5-turbo');
  const [modelsLoading, setModelsLoading] = useState<boolean>(false);
  const [modelsError, setModelsError] = useState<string | null>(null);
  
  // Stati per i modelli personalizzati salvati
  const [savedCustomModels, setSavedCustomModels] = useState<SavedCustomModel[]>([]);
  const [showSavedModels, setShowSavedModels] = useState<boolean>(false);
  const [customModelTitle, setCustomModelTitle] = useState<string>('');
  const [testingCustomModel, setTestingCustomModel] = useState<boolean>(false);
  
  // Funzione per aprire il modal di creazione modello
  const openCreateModelModal = () => {
    setShowCreateModelModal(true);
    setNewModelTitle('');
    setNewModelPrompt('');
  };

  // Funzione per chiudere il modal di creazione modello
  const closeCreateModelModal = () => {
    setShowCreateModelModal(false);
    setNewModelTitle('');
    setNewModelPrompt('');
  };

  // Funzione per salvare il nuovo modello dal modal
  const saveNewModelFromModal = () => {
    if (!newModelTitle.trim()) {
      alert('Inserisci un titolo per il modello personalizzato');
      return;
    }
    
    if (!newModelPrompt.trim()) {
      alert('Inserisci un prompt personalizzato');
      return;
    }
    
    const newModel: SavedCustomModel = {
      id: Date.now().toString(),
      title: newModelTitle.trim(),
      prompt: newModelPrompt.trim(),
      modelId: selectedModel,
      createdAt: new Date()
    };
    
    const updatedModels = [...savedCustomModels, newModel];
    setSavedCustomModels(updatedModels);
    localStorage.setItem('saved_custom_models', JSON.stringify(updatedModels));
    
    closeCreateModelModal();
    alert('Modello personalizzato salvato con successo!');
  };

  // Funzione per testare il nuovo modello
  const testNewModel = async () => {
    if (!newModelPrompt.trim()) {
      alert('Inserisci un prompt personalizzato da testare');
      return;
    }
    
    setTestingCustomModel(true);
    
    try {
      // Crea un messaggio di test
      const testMessage = 'Ciao! Presentati brevemente seguendo il tuo ruolo.';
      
      // Prepara la cronologia per il test
      const testHistory: ChatMessage[] = [
        { role: 'system', content: newModelPrompt.trim() },
        { role: 'user', content: testMessage }
      ];
      
      const apiKey = getApiKey();
      if (!apiKey) {
        throw new Error('Chiave API mancante');
      }
      
      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': window.location.origin,
          'X-Title': 'GPT Forge - Test Custom Model'
        },
        body: JSON.stringify({
          model: selectedModel,
          messages: testHistory,
          temperature: 0.7,
          max_tokens: 200,
          stream: false
        })
      });
      
      if (!response.ok) {
        throw new Error(`Errore API: ${response.status}`);
      }
      
      const data = await response.json();
      const botResponse = data.choices?.[0]?.message?.content || 'Nessuna risposta ricevuta';
      
      // Mostra la risposta di test
      alert(`Test completato!\n\nRisposta del modello:\n"${botResponse}"`);
      
    } catch (error) {
      console.error('Errore nel test del modello:', error);
      alert('Errore durante il test del modello. Controlla la configurazione.');
    } finally {
      setTestingCustomModel(false);
    }
  };
  
    // Funzione per caricare i modelli personalizzati salvati da localStorage
  const loadSavedCustomModels = () => {
    const stored = localStorage.getItem('saved_custom_models');
    if (stored) {
      try {
        const models = JSON.parse(stored);
        setSavedCustomModels(models.map((model: any) => ({
          ...model,
          createdAt: new Date(model.createdAt)
        })));
      } catch (error) {
        console.error('Errore nel caricamento dei modelli salvati:', error);
      }
    }
  };

  // Carica la chiave API da localStorage all'avvio
  useEffect(() => {
    const storedKey = localStorage.getItem('openrouter_api_key');
    if (storedKey) {
      setCustomApiKey(storedKey);
      setApiKeyInput('************' + storedKey.slice(-4));
    }
    
    // Carica il modello salvato
    const storedModel = localStorage.getItem('openrouter_selected_model');
    if (storedModel) {
      setSelectedModel(storedModel);
    }
    
    // Carica i modelli personalizzati salvati
    loadSavedCustomModels();
  }, []);

  // Funzione per caricare i modelli da OpenRouter
  const loadAvailableModels = async () => {
    setModelsLoading(true);
    setModelsError(null);
    
    try {
      const response = await fetch('https://openrouter.ai/api/v1/models');
      if (!response.ok) {
        throw new Error('Errore nel caricamento dei modelli');
      }
      
      const data = await response.json();
      const models = data.data.map((model: any) => ({
        id: model.id,
        name: model.name,
        description: model.description,
        context_length: model.context_length,
        pricing: {
          prompt: model.pricing.prompt,
          completion: model.pricing.completion
        }
      }));
      
      setAvailableModels(models);
    } catch (error) {
      console.error('Errore nel caricamento dei modelli:', error);
      setModelsError('Impossibile caricare i modelli. Riprova più tardi.');
    } finally {
      setModelsLoading(false);
    }
  };

  // Carica i modelli quando viene aperto il popup delle impostazioni
  useEffect(() => {
    if (showSettingsPopup && availableModels.length === 0) {
      loadAvailableModels();
    }
  }, [showSettingsPopup]);

  // Funzione per salvare un modello personalizzato
  const saveCustomModel = () => {
    if (!customModelTitle.trim()) {
      alert('Inserisci un titolo per il modello personalizzato');
      return;
    }
    
    if (!customPrompt.trim()) {
      alert('Inserisci un prompt personalizzato');
      return;
    }
    
    const newModel: SavedCustomModel = {
      id: Date.now().toString(),
      title: customModelTitle.trim(),
      prompt: customPrompt.trim(),
      modelId: selectedModel,
      createdAt: new Date()
    };
    
    const updatedModels = [...savedCustomModels, newModel];
    setSavedCustomModels(updatedModels);
    localStorage.setItem('saved_custom_models', JSON.stringify(updatedModels));
    
    // Reset del form
    setCustomModelTitle('');
    setCustomPrompt('');
    
    alert('Modello personalizzato salvato con successo!');
  };

  // Funzione per caricare un modello personalizzato salvato
  const loadCustomModel = (model: SavedCustomModel) => {
    // Cambia all'assistente personalizzato
    setCurrentAssistant(findAssistantById('custom'));
    
    // Imposta il prompt personalizzato
    setCustomPrompt(model.prompt);
    
    // Imposta il modello
    setSelectedModel(model.modelId);
    localStorage.setItem('openrouter_selected_model', model.modelId);
    
    // Chiudi la lista dei modelli salvati
    setShowSavedModels(false);
    
    // Mostra notifica
    alert(`Modello "${model.title}" caricato con successo!`);
  };

  // Funzione per eliminare un modello personalizzato salvato
  const deleteCustomModel = (modelId: string) => {
    if (confirm('Sei sicuro di voler eliminare questo modello personalizzato?')) {
      const updatedModels = savedCustomModels.filter(model => model.id !== modelId);
      setSavedCustomModels(updatedModels);
      localStorage.setItem('saved_custom_models', JSON.stringify(updatedModels));
    }
  };

  // Funzione per testare il modello personalizzato corrente
  const testCustomModel = async () => {
    if (!customPrompt.trim()) {
      alert('Inserisci un prompt personalizzato da testare');
      return;
    }
    
    setTestingCustomModel(true);
    
    try {
      // Crea un messaggio di test
      const testMessage = 'Ciao! Presentati brevemente seguendo il tuo ruolo.';
      
      // Prepara la cronologia per il test
      const testHistory: ChatMessage[] = [
        { role: 'system', content: customPrompt.trim() },
        { role: 'user', content: testMessage }
      ];
      
      const apiKey = getApiKey();
      if (!apiKey) {
        throw new Error('Chiave API mancante');
      }
      
      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': window.location.origin,
          'X-Title': 'GPT Forge - Test Custom Model'
        },
        body: JSON.stringify({
          model: selectedModel,
          messages: testHistory,
          temperature: 0.7,
          max_tokens: 200,
          stream: false
        })
      });
      
      if (!response.ok) {
        throw new Error(`Errore API: ${response.status}`);
      }
      
      const data = await response.json();
      const botResponse = data.choices?.[0]?.message?.content || 'Nessuna risposta ricevuta';
      
      // Mostra la risposta di test
      alert(`Test completato!\n\nRisposta del modello:\n"${botResponse}"`);
      
    } catch (error) {
      console.error('Errore nel test del modello:', error);
      alert('Errore durante il test del modello. Controlla la configurazione.');
    } finally {
      setTestingCustomModel(false);
    }
  };

  // Funzione per ottenere la chiave API
  const getApiKey = (): string | null => {
    return customApiKey || localStorage.getItem('openrouter_api_key');
  };

  // Funzione per formattare il tempo
  const formatTime = (date: Date): string => {
    return date.toLocaleTimeString('it-IT', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  // Gestori degli eventi
  const handleCloseSettings = () => {
    setShowSettingsPopup(false);
    setShowCustomPromptInSettings(false);
  };

  const handleChangeAssistant = (assistantId: string) => {
    const assistant = findAssistantById(assistantId);
    setCurrentAssistant(assistant);
    
    // Aggiorna la cronologia della chat con il nuovo system prompt
    setChatHistory([{ role: 'system', content: assistant.systemPrompt }]);
    
    // Mostra il form del prompt personalizzato se necessario
    if (assistantId === 'custom') {
      setShowCustomPromptInSettings(true);
    } else {
      setShowCustomPromptInSettings(false);
    }
  };

  const handleCancelCustomPromptInSettings = () => {
    setShowCustomPromptInSettings(false);
    setCustomPrompt('');
  };

  const handleSaveCustomPromptInSettings = () => {
    if (customPrompt.trim()) {
      // Aggiorna la cronologia della chat con il nuovo prompt personalizzato
      setChatHistory([{ role: 'system', content: customPrompt.trim() }]);
      setShowCustomPromptInSettings(false);
      
      // Messaggio di conferma
      setMessages(prev => [...prev, {
        id: Date.now(),
        text: 'Prompt personalizzato salvato con successo!',
        sender: 'bot',
        timestamp: new Date()
      }]);
    }
  };

  const handleModelChange = (modelId: string) => {
    setSelectedModel(modelId);
    localStorage.setItem('openrouter_selected_model', modelId);
  };

  const handleSaveApiKey = () => {
    if (apiKeyInput.trim() && !apiKeyInput.includes('*')) {
      localStorage.setItem('openrouter_api_key', apiKeyInput.trim());
      setCustomApiKey(apiKeyInput.trim());
      setApiKeyInput('************' + apiKeyInput.slice(-4));
      alert('Chiave API salvata con successo!');
    }
  };

  const handleClearApiKey = () => {
    localStorage.removeItem('openrouter_api_key');
    setCustomApiKey(null);
    setApiKeyInput('');
    alert('Chiave API rimossa!');
  };

  const handleClearChat = () => {
    if (confirm('Sei sicuro di voler cancellare tutta la chat?')) {
      setMessages([{
        id: 1,
        text: currentAssistant.welcomeMessage,
        sender: 'bot',
        timestamp: new Date(),
      }]);
      setChatHistory([{ role: 'system', content: currentAssistant.systemPrompt }]);
      setError(null);
    }
  };

  const handleSaveCustomPrompt = () => {
    if (customPrompt.trim()) {
      // Aggiorna la cronologia della chat con il nuovo prompt personalizzato
      setChatHistory([{ role: 'system', content: customPrompt.trim() }]);
      setShowCustomPromptForm(false);
      
      // Messaggio di conferma
      setMessages(prev => [...prev, {
        id: Date.now(),
        text: 'Prompt personalizzato impostato con successo!',
        sender: 'bot',
        timestamp: new Date()
      }]);
    }
  };

  const handleVoiceText = (text: string) => {
    setInputValue(text);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleSendMessage = async () => {
    if (inputValue.trim() === '' || isTyping) return;

    const userMessage: Message = {
      id: Date.now(),
      text: inputValue.trim(),
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);
    setError(null);

    try {
      // Prepara la cronologia della chat per l'API
      const apiHistory: ChatMessage[] = [
        ...chatHistory,
        { role: 'user', content: userMessage.text }
      ];

      const apiKey = getApiKey();
      if (!apiKey) {
        throw new Error('Chiave API mancante. Inserisci la tua chiave API nelle impostazioni.');
      }

      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': window.location.origin,
          'X-Title': 'GPT Forge'
        },
        body: JSON.stringify({
          model: selectedModel,
          messages: apiHistory,
          temperature: 0.7,
          max_tokens: 2000,
          stream: false
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.error?.message || `Errore API: ${response.status}`);
      }

      const data = await response.json();
      const botResponse = data.choices?.[0]?.message?.content || 'Nessuna risposta ricevuta';

      const botMessage: Message = {
        id: Date.now() + 1,
        text: botResponse,
        sender: 'bot',
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, botMessage]);
      setCurrentBotMessage(botResponse);

      // Aggiorna la cronologia della chat
      setChatHistory(prev => [
        ...prev,
        { role: 'user', content: userMessage.text },
        { role: 'assistant', content: botResponse }
      ]);

    } catch (error) {
      console.error('Errore nell\'invio del messaggio:', error);
      setError(error instanceof Error ? error.message : 'Si è verificato un errore sconosciuto');
    } finally {
      setIsTyping(false);
    }
  };

  // Scroll automatico quando arrivano nuovi messaggi
  useEffect(() => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
  }, [messages, isTyping]);
  
  return (
    <div className="chat-container">
      {/* Intestazione della chat */}
      <div className="chat-header">
        <h2>ChatBot AI</h2>        
        <div className="header-actions">
          <button 
            className="settings-button"
            onClick={() => setShowSettingsPopup(true)}
            aria-label="Impostazioni"
          >
            ⚙️
          </button>
        </div>
        
        {/* Popup Impostazioni con Sidebar */}
        {showSettingsPopup && (
          <div className="settings-overlay" onClick={(e) => e.target === e.currentTarget && handleCloseSettings()}>
            <div className="settings-popup">
              <div className="settings-popup-header">
                <h2 className="settings-popup-title">Impostazioni</h2>
                <button className="settings-close-btn" onClick={handleCloseSettings}>
                  ×
                </button>
              </div>
              
              <div className="settings-content">
                {/* Sidebar */}
                <div className="settings-sidebar">
                  <button 
                    className={`settings-tab ${activeSettingsTab === 'assistant' ? 'active' : ''}`}
                    onClick={() => setActiveSettingsTab('assistant')}
                  >
                    <span className="settings-tab-icon">🤖</span>
                    <span className="settings-tab-title">Assistente</span>
                  </button>
                  <button 
                    className={`settings-tab ${activeSettingsTab === 'model' ? 'active' : ''}`}
                    onClick={() => setActiveSettingsTab('model')}
                  >
                    <span className="settings-tab-icon">🧠</span>
                    <span className="settings-tab-title">Modello AI</span>
                  </button>
                  <button 
                    className={`settings-tab ${activeSettingsTab === 'custom-models' ? 'active' : ''}`}
                    onClick={() => setActiveSettingsTab('custom-models')}
                  >
                    <span className="settings-tab-icon">⚡</span>
                    <span className="settings-tab-title">Modelli Personalizzati</span>
                  </button>
                  <button 
                    className={`settings-tab ${activeSettingsTab === 'api' ? 'active' : ''}`}
                    onClick={() => setActiveSettingsTab('api')}
                  >
                    <span className="settings-tab-icon">🔑</span>
                    <span className="settings-tab-title">API</span>
                  </button>
                  <button 
                    className={`settings-tab ${activeSettingsTab === 'actions' ? 'active' : ''}`}
                    onClick={() => setActiveSettingsTab('actions')}
                  >
                    <span className="settings-tab-icon">⚙️</span>
                    <span className="settings-tab-title">Azioni</span>
                  </button>
                </div>

                {/* Contenuto principale */}
                <div className="settings-main">
                  {/* Tab Assistente */}
                  {activeSettingsTab === 'assistant' && (
                    <div className="settings-section">
                      <h3 className="settings-section-title">
                        <span className="settings-section-icon">🤖</span>
                        Assistente
                      </h3>
                      <div className="settings-field">
                        <label className="settings-label" htmlFor="assistant-select">
                          Seleziona assistente:
                        </label>
                        <select 
                          id="assistant-select"
                          className="settings-select"
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
                      
                      {/* Form prompt personalizzato */}
                      {showCustomPromptInSettings && (
                        <div className="settings-custom-prompt-form">
                          <h4>Configura il tuo assistente personalizzato</h4>
                          <p className="prompt-description">
                            Definisci come si comporterà l'assistente. Descrivi il suo ruolo, il tono di voce e le sue competenze specifiche.
                          </p>
                          <textarea 
                            value={customPrompt}
                            onChange={(e) => setCustomPrompt(e.target.value)}
                            placeholder="Esempio: Sei un esperto sviluppatore React che risponde sempre in modo conciso e professionale. Fornisci esempi di codice quando utile e spiega le best practices..."
                          />
                          <div className="settings-prompt-buttons">
                            <button 
                              className="settings-prompt-button settings-prompt-button-cancel"
                              onClick={handleCancelCustomPromptInSettings}
                            >
                              Annulla
                            </button>
                            <button 
                              className="settings-prompt-button settings-prompt-button-save"
                              onClick={handleSaveCustomPromptInSettings}
                              disabled={!customPrompt.trim()}
                            >
                              Salva Prompt
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Tab Modello AI */}
                  {activeSettingsTab === 'model' && (
                    <div className="settings-section">
                      <h3 className="settings-section-title">
                        <span className="settings-section-icon">🧠</span>
                        Modello AI
                        {modelsLoading && <span style={{fontSize: '12px', color: '#666'}}> (Caricamento...)</span>}
                      </h3>
                      <div className="settings-field">
                        <label className="settings-label" htmlFor="model-select">
                          Seleziona modello:
                          <button 
                            className="models-refresh"
                            onClick={loadAvailableModels}
                            disabled={modelsLoading}
                          >
                            Aggiorna
                          </button>
                        </label>
                        {modelsLoading ? (
                          <div className="models-loading">
                            Caricamento modelli disponibili...
                          </div>
                        ) : (
                          <select 
                            id="model-select"
                            className="settings-select"
                            value={selectedModel}
                            onChange={(e) => handleModelChange(e.target.value)}
                          >
                            {availableModels.length === 0 ? (
                              <option value={selectedModel}>{selectedModel}</option>
                            ) : (
                              availableModels.map(model => (
                                <option key={model.id} value={model.id} title={model.description}>
                                  {model.name}
                                </option>
                              ))
                            )}
                          </select>
                        )}
                        {modelsError && (
                          <div className="models-error">{modelsError}</div>
                        )}
                        {selectedModel && (
                          <div className="settings-help-text">
                            Modello attuale: {selectedModel}
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Tab Modelli Personalizzati */}
                  {activeSettingsTab === 'custom-models' && (
                    <div className="settings-section">
                      <h3 className="settings-section-title">
                        <span className="settings-section-icon">⚡</span>
                        Modelli Personalizzati
                      </h3>
                      
                      <div className="settings-field">
                        <button 
                          className="settings-button settings-button-primary"
                          onClick={openCreateModelModal}
                        >
                          + Crea Nuovo Modello
                        </button>
                      </div>

                      {/* Lista modelli salvati */}
                      <div className="saved-models-list">
                        {savedCustomModels.length === 0 ? (
                          <div className="no-models-message">
                            Nessun modello personalizzato salvato
                          </div>
                        ) : (
                          savedCustomModels.map(model => (
                            <div key={model.id} className="saved-model-item">
                              <div className="saved-model-info">
                                <h4 className="saved-model-title">{model.title}</h4>
                                <p className="saved-model-model">Modello: {model.modelId}</p>
                                <p className="saved-model-date">
                                  Creato: {model.createdAt.toLocaleDateString('it-IT')}
                                </p>
                                <p className="saved-model-prompt">
                                  {model.prompt.length > 100 
                                    ? model.prompt.substring(0, 100) + '...'
                                    : model.prompt
                                  }
                                </p>
                              </div>
                              <div className="saved-model-actions">
                                <button 
                                  className="model-action-button load-button"
                                  onClick={() => loadCustomModel(model)}
                                >
                                  Carica
                                </button>
                                <button 
                                  className="model-action-button delete-button"
                                  onClick={() => deleteCustomModel(model.id)}
                                >
                                  Elimina
                                </button>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}

                  {/* Tab API */}
                  {activeSettingsTab === 'api' && (
                    <div className="settings-section">
                      <h3 className="settings-section-title">
                        <span className="settings-section-icon">🔑</span>
                        OpenRouter API
                      </h3>
                      <div className="settings-field">
                        <label className="settings-label" htmlFor="api-key-input">
                          API Key:
                        </label>
                        <input
                          id="api-key-input"
                          type="text"
                          className="settings-input"
                          placeholder="Inserisci la tua API key..."
                          value={customApiKey ? ('************' + customApiKey.slice(-4)) : apiKeyInput}
                          onChange={e => setApiKeyInput(e.target.value)}
                          autoComplete="off"
                        />
                        <div className="settings-button-group">
                          <button 
                            className="settings-button settings-button-primary"
                            onClick={handleSaveApiKey}
                          >
                            Salva
                          </button>
                          {customApiKey && (
                            <button 
                              className="settings-button settings-button-secondary"
                              onClick={handleClearApiKey}
                            >
                              Rimuovi
                            </button>
                          )}
                        </div>
                        <div className="settings-help-text">
                          La chiave viene salvata solo sul tuo dispositivo. Ottieni la tua chiave da{' '}
                          <a href="https://openrouter.ai/keys" target="_blank" rel="noopener noreferrer">
                            OpenRouter
                          </a>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Tab Azioni */}
                  {activeSettingsTab === 'actions' && (
                    <div className="settings-section">
                      <h3 className="settings-section-title">
                        <span className="settings-section-icon">⚙️</span>
                        Azioni
                      </h3>
                      <div className="settings-actions">
                        <button 
                          className="settings-action-button clear-chat-button"
                          onClick={handleClearChat}
                        >
                          Cancella Chat
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Modal per Creazione Nuovo Modello */}
        {showCreateModelModal && (
          <div className="create-model-modal-overlay" onClick={(e) => e.target === e.currentTarget && closeCreateModelModal()}>
            <div className="create-model-modal">
              <div className="create-model-modal-header">
                <h3 className="create-model-modal-title">Crea Nuovo Modello Personalizzato</h3>
                <button className="create-model-modal-close" onClick={closeCreateModelModal}>
                  ×
                </button>
              </div>
              
              <div className="create-model-modal-body">
                <div className="settings-field">
                  <label className="settings-label" htmlFor="new-model-title">
                    Titolo del modello:
                  </label>
                  <input
                    id="new-model-title"
                    type="text"
                    className="settings-input"
                    placeholder="Es: Assistente per codifica Python"
                    value={newModelTitle}
                    onChange={(e) => setNewModelTitle(e.target.value)}
                  />
                </div>

                <div className="settings-field">
                  <label className="settings-label" htmlFor="new-model-prompt">
                    Prompt del modello:
                  </label>
                  <textarea
                    id="new-model-prompt"
                    className="settings-textarea"
                    placeholder="Descrivi il comportamento e il ruolo dell'assistente..."
                    value={newModelPrompt}
                    onChange={(e) => setNewModelPrompt(e.target.value)}
                    rows={8}
                  />
                </div>

                <div className="current-model-info">
                  <strong>Modello AI selezionato:</strong> {selectedModel}
                  <small>Il modello personalizzato utilizzerà questo modello AI come base</small>
                </div>
              </div>
              
              <div className="create-model-modal-footer">
                <button 
                  className="settings-button settings-button-secondary"
                  onClick={closeCreateModelModal}
                >
                  Annulla
                </button>
                <button 
                  className="settings-button settings-button-primary"
                  onClick={testNewModel}
                  disabled={!newModelPrompt.trim() || testingCustomModel}
                >
                  {testingCustomModel ? 'Test in corso...' : 'Testa Modello'}
                </button>
                <button 
                  className="settings-button settings-button-success"
                  onClick={saveNewModelFromModal}
                  disabled={!newModelTitle.trim() || !newModelPrompt.trim()}
                >
                  Salva Modello
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
        
      {/* Contenitore centrale per limitare la larghezza della chat */}
      <div className="chat-content">
        {/* Form per il prompt personalizzato - Solo quando il popup delle impostazioni è chiuso */}
        {showCustomPromptForm && !showSettingsPopup && (
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
                {message.sender === 'bot' ? (
                  <ReactMarkdown
                    components={{
                      pre: ({children}) => <CodeBlockWithCopy>{children}</CodeBlockWithCopy>,
                    }}
                  >{message.text}</ReactMarkdown>
                ) : (
                  message.text
                )}
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