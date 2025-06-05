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

  return { handleSendMessage };
};
