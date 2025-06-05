import { useState, useEffect } from 'react';
import { Message } from './useChat';

export interface ChatHistory {
  id: string;
  title: string;
  timestamp: Date;
  messages: Message[];
  assistant: string;
  model: string;
}

export const useChatHistory = () => {
  const [chatSavePath, setChatSavePath] = useState<string>('');
  const [autoSaveChats, setAutoSaveChats] = useState<boolean>(true);
  const [maxHistoryFiles, setMaxHistoryFiles] = useState<number>(50);
  const [showChatSidebar, setShowChatSidebar] = useState<boolean>(false);

  // Carica le impostazioni della cronologia chat da localStorage
  useEffect(() => {
    const storedSavePath = localStorage.getItem('chat_save_path');
    const storedAutoSave = localStorage.getItem('auto_save_chats');
    const storedMaxFiles = localStorage.getItem('max_history_files');
    
    if (storedSavePath) setChatSavePath(storedSavePath);
    if (storedAutoSave) setAutoSaveChats(storedAutoSave === 'true');
    if (storedMaxFiles) setMaxHistoryFiles(parseInt(storedMaxFiles) || 50);
  }, []);

  const handleChatSavePathChange = (path: string) => {
    setChatSavePath(path);
    localStorage.setItem('chat_save_path', path);
  };

  const handleAutoSaveChatsChange = (enabled: boolean) => {
    setAutoSaveChats(enabled);
    localStorage.setItem('auto_save_chats', enabled.toString());
  };

  const handleMaxHistoryFilesChange = (max: number) => {
    setMaxHistoryFiles(max);
    localStorage.setItem('max_history_files', max.toString());
  };

  const handleSelectChatSaveFolder = async () => {
    try {
      const result = await window.ipcRenderer.invoke('select-folder');
      if (result && !result.canceled) {
        handleChatSavePathChange(result.filePaths[0]);
      }
    } catch (error) {
      console.error('Errore nella selezione della cartella:', error);
      alert('Errore nella selezione della cartella');
    }
  };

  const handleClearChatHistory = async () => {
    if (window.confirm('Sei sicuro di voler eliminare tutta la cronologia delle chat? Questa azione non può essere annullata.')) {
      try {
        await window.ipcRenderer.invoke('clear-chat-history', chatSavePath);
        alert('Cronologia chat eliminata con successo');
      } catch (error) {
        console.error('Errore nell\'eliminazione della cronologia:', error);
        alert('Errore nell\'eliminazione della cronologia');
      }
    }
  };

  const handleExportAllChats = async () => {
    try {
      const result = await window.ipcRenderer.invoke('export-all-chats', chatSavePath);
      if (result) {
        alert('Tutte le chat sono state esportate con successo');
      }
    } catch (error) {
      console.error('Errore nell\'esportazione delle chat:', error);
      alert('Errore nell\'esportazione delle chat');
    }
  };

  const generateChatTitle = (messages: Message[]) => {
    const userMessages = messages.filter(msg => msg.sender === 'user');
    if (userMessages.length > 0) {
      const firstMessage = userMessages[0].text;
      return firstMessage.length > 30 
        ? firstMessage.substring(0, 30) + '...'
        : firstMessage;
    }
    return 'Chat Senza Titolo';
  };

  const autoSaveCurrentChat = async (
    messages: Message[], 
    currentChatId: string | null, 
    setCurrentChatId: (id: string) => void,
    assistantName: string,
    selectedModel: string
  ) => {
    if (!autoSaveChats || !chatSavePath || messages.length <= 1) return;
    
    try {
      const chatData: ChatHistory = {
        id: currentChatId || Date.now().toString(),
        title: generateChatTitle(messages),
        timestamp: new Date(),
        messages: messages,
        assistant: assistantName,
        model: selectedModel
      };
      
      await window.ipcRenderer.invoke('save-chat-file', chatSavePath, chatData);
      
      if (!currentChatId) {
        setCurrentChatId(chatData.id);
      }
    } catch (error) {
      console.error('Errore nel salvataggio automatico della chat:', error);
    }
  };

  return {
    chatSavePath,
    autoSaveChats,
    maxHistoryFiles,
    showChatSidebar,
    setShowChatSidebar,
    handleChatSavePathChange,
    handleAutoSaveChatsChange,
    handleMaxHistoryFilesChange,
    handleSelectChatSaveFolder,
    handleClearChatHistory,
    handleExportAllChats,
    generateChatTitle,
    autoSaveCurrentChat,
  };
};
