import { useCallback } from 'react';
import { Message, ChatMessage } from './useChat';
import { OpenRouterService } from '../services/ChatService';

export const useMessageHandler = (
  messages: Message[],
  setMessages: (messages: Message[] | ((prev: Message[]) => Message[])) => void,
  chatHistory: ChatMessage[],
  setChatHistory: (history: ChatMessage[] | ((prev: ChatMessage[]) => ChatMessage[])) => void,
  isTyping: boolean,
  setIsTyping: (typing: boolean) => void,
  setError: (error: string | null) => void,
  setCurrentBotMessage: (message: string | null) => void,
  getApiKey: () => string | null,
  selectedModel: string
) => {
  const handleSendMessage = useCallback(async (inputValue: string) => {
    if (inputValue.trim() === '' || isTyping) return false;

    const userMessage: Message = {
      id: Date.now(),
      text: inputValue.trim(),
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setIsTyping(true);
    setError(null);

    const apiKey = getApiKey();
    if (!apiKey) {
      setError('Chiave API mancante. Inserisci la tua chiave API nelle impostazioni.');
      setIsTyping(false);
      return false;
    }

    const result = await OpenRouterService.sendMessage(
      apiKey,
      selectedModel,
      chatHistory,
      userMessage.text
    );

    if (result.success && result.response) {
      const botMessage: Message = {
        id: Date.now() + 1,
        text: result.response,
        sender: 'bot',
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, botMessage]);
      setCurrentBotMessage(result.response);

      // Aggiorna la cronologia della chat
      setChatHistory(prev => [
        ...prev,
        { role: 'user', content: userMessage.text },
        { role: 'assistant', content: result.response! }
      ]);
    } else {
      setError(result.error || 'Errore sconosciuto');
    }

    setIsTyping(false);
    return result.success;
  }, [
    isTyping, 
    setMessages, 
    setIsTyping, 
    setError, 
    setCurrentBotMessage, 
    getApiKey, 
    selectedModel, 
    chatHistory, 
    setChatHistory
  ]);
  const handleRegenerateResponse = useCallback(async (messageId: number) => {
    if (isTyping) return false;

    // Trova il messaggio del bot da rigenerare
    const messageIndex = messages.findIndex(msg => msg.id === messageId);
    if (messageIndex === -1 || messages[messageIndex].sender !== 'bot') return false;

    // Trova l'ultimo messaggio utente prima di questo messaggio bot
    let lastUserMessage = null;
    for (let i = messageIndex - 1; i >= 0; i--) {
      if (messages[i].sender === 'user') {
        lastUserMessage = messages[i];
        break;
      }
    }

    if (!lastUserMessage) return false;

    // Rimuovi tutti i messaggi dopo l'ultimo messaggio utente
    const messagesUpToUser = messages.slice(0, messageIndex);
    setMessages(messagesUpToUser);

    // Ricostruisci la cronologia della chat fino a quel punto
    const chatHistoryUpToUser = messagesUpToUser
      .slice(1) // Rimuovi il messaggio di benvenuto
      .reduce((acc: ChatMessage[], msg) => {
        if (msg.sender === 'user') {
          acc.push({ role: 'user', content: msg.text });
        } else if (msg.sender === 'bot') {
          acc.push({ role: 'assistant', content: msg.text });
        }
        return acc;
      }, chatHistory.slice(0, 1)); // Mantieni solo il system prompt

    setChatHistory(chatHistoryUpToUser);

    setIsTyping(true);
    setError(null);

    const apiKey = getApiKey();
    if (!apiKey) {
      setError('Chiave API mancante. Inserisci la tua chiave API nelle impostazioni.');
      setIsTyping(false);
      return false;
    }

    const result = await OpenRouterService.sendMessage(
      apiKey,
      selectedModel,
      chatHistoryUpToUser,
      lastUserMessage.text
    );

    if (result.success && result.response) {
      const botMessage: Message = {
        id: Date.now(),
        text: result.response,
        sender: 'bot',
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, botMessage]);
      setCurrentBotMessage(result.response);

      // Aggiorna la cronologia della chat
      setChatHistory(prev => [
        ...prev,
        { role: 'user', content: lastUserMessage.text },
        { role: 'assistant', content: result.response! }
      ]);
    } else {
      setError(result.error || 'Errore sconosciuto');
    }

    setIsTyping(false);
    return result.success;
  }, [
    isTyping,
    messages,
    setMessages,
    setIsTyping,
    setError,
    setCurrentBotMessage,
    getApiKey,
    selectedModel,
    chatHistory,
    setChatHistory
  ]);

  return { handleSendMessage, handleRegenerateResponse };
};
