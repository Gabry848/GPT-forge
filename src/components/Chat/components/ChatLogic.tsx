import React, { useEffect } from 'react';
import { findAssistantById } from '../../../config/prompts';
import {
  useChat,
  useOpenRouterModels,
  useCustomModels,
  useApiKey,
  useChatHistory,
  useSettings,
  useMessageHandler,
  type SavedCustomModel,
  type ChatHistory
} from '../hooks';
import { OpenRouterService, ChatExportService } from '../services/ChatService';

interface ChatLogicProps {
  children: (props: ChatLogicRenderProps) => React.ReactNode;
}

export interface ChatLogicRenderProps {
  // Chat state
  currentAssistant: ReturnType<typeof useChat>['currentAssistant'];
  customPrompt: string;
  messages: ReturnType<typeof useChat>['messages'];
  chatHistory: ReturnType<typeof useChat>['chatHistory'];
  inputValue: string;
  isTyping: boolean;
  error: string | null;
  currentBotMessage: string | null;
  currentChatId: string | null;
  inputRef: ReturnType<typeof useChat>['inputRef'];
  
  // Models state
  availableModels: ReturnType<typeof useOpenRouterModels>['availableModels'];
  selectedModel: string;
  modelsLoading: boolean;
  modelsError: string | null;
    // Custom models state
  savedCustomModels: SavedCustomModel[];
  showSavedModels: boolean;
  showCreateModelModal: boolean;
  newModelTitle: string;
  newModelPrompt: string;
  testingCustomModel: boolean;
  
  // Test modal state
  showTestModal: boolean;
  testModelName: string;
  testModelOutput: string;
  
  // API key state
  apiKeyInput: string;
  customApiKey: string | null;
  
  // Chat history state
  chatSavePath: string;
  autoSaveChats: boolean;
  maxHistoryFiles: number;
  showChatSidebar: boolean;
  
  // Settings state
  showSettingsPopup: boolean;
  showCustomPromptForm: boolean;
  showCustomPromptInSettings: boolean;
  activeSettingsTab: ReturnType<typeof useSettings>['activeSettingsTab'];
  
  // Actions
  handleSendMessage: (inputValue: string) => Promise<boolean>;
  handleNewChat: () => void;
  handleClearChat: () => void;
  handleExportChat: () => void;
  handleResetSettings: () => void;
  handleChangeAssistant: (assistantId: string) => void;
  handleSaveCustomPrompt: () => void;
  handleCancelCustomPromptInSettings: () => void;
  handleSaveCustomPromptInSettings: () => void;
  handleVoiceText: (text: string) => void;
  handleKeyDown: (e: React.KeyboardEvent) => void;
  handleCloseSettings: () => void;
  handleModelChange: (modelId: string) => void;
  handleSaveApiKey: () => void;
  handleClearApiKey: () => void;
  handleToggleChatSidebar: () => void;
  handleLoadChat: (chat: ChatHistory) => void;
  handleDeleteChatFromSidebar: (chatId: string) => void;
  loadCustomModel: (model: SavedCustomModel) => void;
  deleteCustomModel: (modelId: string) => void;  openCreateModelModal: () => void;
  closeCreateModelModal: () => void;
  saveNewModelFromModal: () => void;
  testNewModel: () => Promise<void>;
  closeTestModal: () => void;
  loadAvailableModels: () => Promise<void>;
  
  // Setters
  setInputValue: (value: string) => void;
  setCustomPrompt: (prompt: string) => void;
  setShowSettingsPopup: (show: boolean) => void;
  setShowCustomPromptForm: (show: boolean) => void;
  setActiveSettingsTab: (tab: ReturnType<typeof useSettings>['activeSettingsTab']) => void;
  setApiKeyInput: (key: string) => void;
  setNewModelTitle: (title: string) => void;
  setNewModelPrompt: (prompt: string) => void;
  setShowSavedModels: (show: boolean) => void;
  setShowChatSidebar: (show: boolean) => void;
  
  // Chat history actions
  handleChatSavePathChange: (path: string) => void;
  handleAutoSaveChatsChange: (enabled: boolean) => void;
  handleMaxHistoryFilesChange: (max: number) => void;
  handleSelectChatSaveFolder: () => Promise<void>;
  handleClearChatHistory: () => Promise<void>;
  handleExportAllChats: () => Promise<void>;
}

export const ChatLogic: React.FC<ChatLogicProps> = ({ children }) => {
  // Initialize hooks
  const chat = useChat();
  const models = useOpenRouterModels();
  const customModels = useCustomModels();
  const apiKey = useApiKey();
  const chatHistory = useChatHistory();
  const settings = useSettings();
  
  const messageHandler = useMessageHandler(
    chat.messages,
    chat.setMessages,
    chat.chatHistory,
    chat.setChatHistory,
    chat.isTyping,
    chat.setIsTyping,
    chat.setError,
    chat.setCurrentBotMessage,
    apiKey.getApiKey,
    models.selectedModel
  );

  // Auto-save chat when messages change
  useEffect(() => {
    if (chat.messages.length > 1) {
      const timeoutId = setTimeout(() => {
        chatHistory.autoSaveCurrentChat(
          chat.messages,
          chat.currentChatId,
          chat.setCurrentChatId,
          chat.currentAssistant.name,
          models.selectedModel
        );
      }, 2000);
      
      return () => clearTimeout(timeoutId);
    }
  }, [chat.messages, chatHistory.autoSaveChats, chatHistory.chatSavePath]);

  // Load models when settings popup opens
  useEffect(() => {
    if (settings.showSettingsPopup && models.availableModels.length === 0) {
      models.loadAvailableModels();
    }
  }, [settings.showSettingsPopup]);

  // Event handlers
  const handleNewChat = () => {
    chat.resetChat();
  };

  const handleClearChat = () => {
    if (confirm('Sei sicuro di voler cancellare tutta la chat?')) {
      chat.resetChat();
    }
  };

  const handleExportChat = () => {
    ChatExportService.exportChatAsJson(
      chat.messages,
      chat.currentAssistant.name,
      models.selectedModel
    );
  };
  const handleResetSettings = () => {
    if (settings.handleResetSettings()) {
      apiKey.handleClearApiKey();
      models.handleModelChange('openai/gpt-3.5-turbo');
      customModels.clearAllCustomModels();
      chat.updateAssistant(chat.currentAssistant);
      chat.setCustomPrompt('');
    }
  };

  const handleChangeAssistant = (assistantId: string) => {
    const assistant = findAssistantById(assistantId);
    chat.updateAssistant(assistant);
    
    if (assistantId === 'custom') {
      settings.setShowCustomPromptInSettings(true);
    } else {
      settings.setShowCustomPromptInSettings(false);
    }
  };

  const handleSaveCustomPrompt = () => {
    if (chat.customPrompt.trim()) {
      chat.updateCustomPrompt(chat.customPrompt);
      settings.setShowCustomPromptForm(false);
      
      chat.setMessages(prev => [...prev, {
        id: Date.now(),
        text: 'Prompt personalizzato impostato con successo!',
        sender: 'bot',
        timestamp: new Date()
      }]);
    }
  };

  const handleCancelCustomPromptInSettings = () => {
    settings.setShowCustomPromptInSettings(false);
    chat.setCustomPrompt('');
  };

  const handleSaveCustomPromptInSettings = () => {
    if (chat.customPrompt.trim()) {
      chat.updateCustomPrompt(chat.customPrompt);
      settings.setShowCustomPromptInSettings(false);
      
      chat.setMessages(prev => [...prev, {
        id: Date.now(),
        text: 'Prompt personalizzato salvato con successo!',
        sender: 'bot',
        timestamp: new Date()
      }]);
    }
  };

  const handleVoiceText = (text: string) => {
    chat.setInputValue(text);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      messageHandler.handleSendMessage(chat.inputValue).then((success) => {
        if (success) {
          chat.setInputValue('');
        }
      });
    }
  };

  const handleCloseSettings = () => {
    settings.handleCloseSettings();
    
    setTimeout(() => {
      if (chat.inputRef.current) {
        chat.inputRef.current.focus();
      }
    }, 100);
  };

  const handleToggleChatSidebar = () => {
    chatHistory.setShowChatSidebar(!chatHistory.showChatSidebar);
  };

  const handleLoadChat = (chatData: ChatHistory) => {
    chat.setMessages(chatData.messages);
    chat.setCurrentChatId(chatData.id);
    
    const systemMessage = { role: 'system' as const, content: chat.currentAssistant.systemPrompt };
    const chatMessages = chatData.messages
      .filter(msg => msg.sender !== 'bot' || msg.text !== chat.currentAssistant.welcomeMessage)
      .map(msg => ({
        role: msg.sender === 'user' ? 'user' as const : 'assistant' as const,
        content: msg.text
      }));
    
    chat.setChatHistory([systemMessage, ...chatMessages]);
    chatHistory.setShowChatSidebar(false);
  };

  const handleDeleteChatFromSidebar = (chatId: string) => {
    if (chat.currentChatId === chatId) {
      handleNewChat();
    }
  };

  const loadCustomModel = (model: SavedCustomModel) => {
    const customAssistant = findAssistantById('custom');
    chat.updateAssistant(customAssistant);
    chat.setCustomPrompt(model.prompt);
    models.handleModelChange(model.modelId);

    chat.setMessages([{
      id: Date.now(),
      text: `Ciao! Sono il tuo assistente personalizzato "${model.title}". Come posso aiutarti oggi?`,
      sender: 'bot',
      timestamp: new Date(),
    }]);

    chat.setChatHistory([{ role: 'system', content: model.prompt }]);
    customModels.setShowSavedModels(false);
    chat.setError(null);

    // Forza il focus sull'input field
    setTimeout(() => {
      if (chat.inputRef.current) {
        chat.inputRef.current.focus();
      }
    }, 0);
  };

  const saveNewModelFromModal = () => {
    const success = customModels.saveNewModel(models.selectedModel); // Questa funzione interna chiama alert e closeCreateModelModal
    if (success) {
      // Se il salvataggio ha avuto successo (e l'alert è stato mostrato/chiuso), forza il focus
      setTimeout(() => {
        if (chat.inputRef.current) {
          chat.inputRef.current.focus();
        }
      }, 0);
    }
    // La funzione saveNewModel nell'hook useCustomModels restituisce un booleano
    // Non è necessario restituire esplicitamente qui se non usato altrove.
  };

  const testNewModel = async () => {
    if (!customModels.newModelPrompt.trim()) {
      alert('Inserisci un prompt personalizzato da testare');
      return;
    }
    
    customModels.setTestingCustomModel(true);
    
    const apiKeyValue = apiKey.getApiKey();
    if (!apiKeyValue) {
      alert('Chiave API mancante');
      customModels.setTestingCustomModel(false);
      return;
    }
      const result = await OpenRouterService.testCustomModel(
      apiKeyValue,
      models.selectedModel,
      customModels.newModelPrompt
    );
    
    if (result.success) {
      // Apri il modal di test invece dell'alert
      customModels.openTestModal(
        customModels.newModelTitle || models.selectedModel,
        result.response || 'Nessuna risposta ricevuta'
      );
    } else {
      alert(result.error || 'Errore durante il test del modello');
    }
    
    customModels.setTestingCustomModel(false);
  };

  const renderProps: ChatLogicRenderProps = {
    // State
    currentAssistant: chat.currentAssistant,
    customPrompt: chat.customPrompt,
    messages: chat.messages,
    chatHistory: chat.chatHistory,
    inputValue: chat.inputValue,
    isTyping: chat.isTyping,
    error: chat.error,
    currentBotMessage: chat.currentBotMessage,
    currentChatId: chat.currentChatId,
    inputRef: chat.inputRef,
    
    availableModels: models.availableModels,
    selectedModel: models.selectedModel,
    modelsLoading: models.modelsLoading,
    modelsError: models.modelsError,
      savedCustomModels: customModels.savedCustomModels,
    showSavedModels: customModels.showSavedModels,
    showCreateModelModal: customModels.showCreateModelModal,
    newModelTitle: customModels.newModelTitle,
    newModelPrompt: customModels.newModelPrompt,
    testingCustomModel: customModels.testingCustomModel,
    
    showTestModal: customModels.showTestModal,
    testModelName: customModels.testModelName,
    testModelOutput: customModels.testModelOutput,
    
    apiKeyInput: apiKey.apiKeyInput,
    customApiKey: apiKey.customApiKey,
    
    chatSavePath: chatHistory.chatSavePath,
    autoSaveChats: chatHistory.autoSaveChats,
    maxHistoryFiles: chatHistory.maxHistoryFiles,
    showChatSidebar: chatHistory.showChatSidebar,
    
    showSettingsPopup: settings.showSettingsPopup,
    showCustomPromptForm: settings.showCustomPromptForm,
    showCustomPromptInSettings: settings.showCustomPromptInSettings,
    activeSettingsTab: settings.activeSettingsTab,
    
    // Actions
    handleSendMessage: messageHandler.handleSendMessage,
    handleNewChat,
    handleClearChat,
    handleExportChat,
    handleResetSettings,
    handleChangeAssistant,
    handleSaveCustomPrompt,
    handleCancelCustomPromptInSettings,
    handleSaveCustomPromptInSettings,
    handleVoiceText,
    handleKeyDown,
    handleCloseSettings,
    handleModelChange: models.handleModelChange,
    handleSaveApiKey: apiKey.handleSaveApiKey,
    handleClearApiKey: apiKey.handleClearApiKey,
    handleToggleChatSidebar,
    handleLoadChat,
    handleDeleteChatFromSidebar,
    loadCustomModel,
    deleteCustomModel: customModels.deleteCustomModel,    openCreateModelModal: customModels.openCreateModelModal,
    closeCreateModelModal: customModels.closeCreateModelModal,
    saveNewModelFromModal,
    testNewModel,
    closeTestModal: customModels.closeTestModal,
    loadAvailableModels: models.loadAvailableModels,
    
    // Setters
    setInputValue: chat.setInputValue,
    setCustomPrompt: chat.setCustomPrompt,
    setShowSettingsPopup: settings.setShowSettingsPopup,
    setShowCustomPromptForm: settings.setShowCustomPromptForm,
    setActiveSettingsTab: settings.setActiveSettingsTab,
    setApiKeyInput: apiKey.setApiKeyInput,
    setNewModelTitle: customModels.setNewModelTitle,
    setNewModelPrompt: customModels.setNewModelPrompt,
    setShowSavedModels: customModels.setShowSavedModels,
    setShowChatSidebar: chatHistory.setShowChatSidebar,
    
    // Chat history actions
    handleChatSavePathChange: chatHistory.handleChatSavePathChange,
    handleAutoSaveChatsChange: chatHistory.handleAutoSaveChatsChange,
    handleMaxHistoryFilesChange: chatHistory.handleMaxHistoryFilesChange,
    handleSelectChatSaveFolder: chatHistory.handleSelectChatSaveFolder,
    handleClearChatHistory: chatHistory.handleClearChatHistory,
    handleExportAllChats: chatHistory.handleExportAllChats,
  };

  return <>{children(renderProps)}</>;
};
