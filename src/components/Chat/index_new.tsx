// filepath: e:\Projects\GPT Forge\src\components\Chat\index.tsx
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
  const [currentBotMessage, setCurrentBotMessage] = useState<string | null>(null);
  const [apiKeyInput, setApiKeyInput] = useState<string>('');
  const [customApiKey, setCustomApiKey] = useState<string | null>(null);
  
  // Stati per il popup delle impostazioni
  const [showSettingsPopup, setShowSettingsPopup] = useState<boolean>(false);
  const [showCustomPromptInSettings, setShowCustomPromptInSettings] = useState<boolean>(false);
  
  // Stati per la nuova struttura sidebar
  const [activeSettingsTab, setActiveSettingsTab] = useState<SettingsTab>('assistant');
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
      alert(`Test completato!\\n\\nRisposta del modello:\\n"${botResponse}"`);
      
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

  // Funzione per ottenere la chiave API
  const getApiKey = (): string | null => {
    return customApiKey || localStorage.getItem('openrouter_api_key');
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

  const handleExportChat = () => {
    const chatData = {
      assistant: currentAssistant.name,
      model: selectedModel,
      timestamp: new Date().toISOString(),
      messages: messages
    };
    
    const dataStr = JSON.stringify(chatData, null, 2);
    const dataBlob = new Blob([dataStr], {type: 'application/json'});
    
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `gpt-forge-chat-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    
    URL.revokeObjectURL(url);
  };

  const handleResetSettings = () => {
    if (confirm('Sei sicuro di voler resettare tutte le impostazioni? Questa azione cancellerà chiavi API, modelli personalizzati e preferenze.')) {
      localStorage.removeItem('openrouter_api_key');
      localStorage.removeItem('openrouter_selected_model');
      localStorage.removeItem('saved_custom_models');
      
      setCustomApiKey(null);
      setApiKeyInput('');
      setSelectedModel('openai/gpt-3.5-turbo');
      setSavedCustomModels([]);
      setCurrentAssistant(defaultAssistant);
      setCustomPrompt('');
      
      alert('Impostazioni resettate con successo!');
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
  
  return (
    <div className="chat-container">
      {/* Intestazione della chat */}
      <ChatHeader onSettingsClick={() => setShowSettingsPopup(true)} />
      
      {/* Modal delle impostazioni con sidebar */}
      <SettingsModal
        isOpen={showSettingsPopup}
        activeTab={activeSettingsTab}
        currentAssistant={currentAssistant}
        customPrompt={customPrompt}
        showCustomPromptInSettings={showCustomPromptInSettings}
        selectedModel={selectedModel}
        availableModels={availableModels}
        modelsLoading={modelsLoading}
        modelsError={modelsError}
        savedCustomModels={savedCustomModels}
        showSavedModels={showSavedModels}
        apiKeyInput={apiKeyInput}
        customApiKey={customApiKey}
        onClose={handleCloseSettings}
        onTabChange={setActiveSettingsTab}
        onAssistantChange={handleChangeAssistant}
        onCustomPromptChange={setCustomPrompt}
        onSaveCustomPrompt={handleSaveCustomPromptInSettings}
        onCancelCustomPrompt={handleCancelCustomPromptInSettings}
        onModelChange={handleModelChange}
        onLoadModels={loadAvailableModels}
        onCreateModelClick={openCreateModelModal}
        onToggleSavedModels={() => setShowSavedModels(!showSavedModels)}
        onLoadModel={loadCustomModel}
        onDeleteModel={deleteCustomModel}
        onApiKeyChange={setApiKeyInput}
        onSaveApiKey={handleSaveApiKey}
        onRemoveApiKey={handleClearApiKey}
        onClearChat={handleClearChat}
        onExportChat={handleExportChat}
        onResetSettings={handleResetSettings}
      />

      {/* Modal per creazione nuovo modello */}
      <CreateModelModal
        isOpen={showCreateModelModal}
        title={newModelTitle}
        prompt={newModelPrompt}
        selectedModel={selectedModel}
        testingModel={testingCustomModel}
        onTitleChange={setNewModelTitle}
        onPromptChange={setNewModelPrompt}
        onSave={saveNewModelFromModal}
        onClose={closeCreateModelModal}
        onTest={testNewModel}
      />
        
      {/* Contenitore centrale per limitare la larghezza della chat */}
      <div className="chat-content">
        {/* Selettore assistente */}
        <AssistantSelector
          currentAssistant={currentAssistant}
          onAssistantChange={handleChangeAssistant}
        />

        {/* Form per il prompt personalizzato - Solo quando il popup delle impostazioni è chiuso */}
        {showCustomPromptForm && !showSettingsPopup && (
          <CustomPromptForm
            customPrompt={customPrompt}
            onPromptChange={setCustomPrompt}
            onSave={handleSaveCustomPrompt}
            onCancel={() => setShowCustomPromptForm(false)}
          />
        )}
          
        {/* Container dei messaggi */}
        <MessagesContainer
          messages={messages}
          isTyping={isTyping}
          error={error}
        />
        
        {/* Input per scrivere il messaggio */}
        <InputArea
          inputValue={inputValue}
          isTyping={isTyping}
          currentMessage={currentBotMessage}
          onInputChange={setInputValue}
          onSendMessage={handleSendMessage}
          onKeyDown={handleKeyDown}
          onVoiceText={handleVoiceText}
        />
      </div>
    </div>
  );
};

export default Chat;
