import { useState, useRef, useEffect } from 'react';
import { AssistantConfig, defaultAssistant } from '../../../config/prompts';

export interface Message {
  id: number;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date | string;
}

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export const useChat = () => {
  const [currentAssistant, setCurrentAssistant] = useState<AssistantConfig>(defaultAssistant);
  const [customPrompt, setCustomPrompt] = useState<string>('');
  const [customAssistantName, setCustomAssistantName] = useState<string>('');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      text: defaultAssistant.welcomeMessage,
      sender: 'bot',
      timestamp: new Date(),
    }
  ]);
  
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([
    { role: 'system', content: defaultAssistant.systemPrompt }
  ]);
  
  const [inputValue, setInputValue] = useState<string>('');
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [currentBotMessage, setCurrentBotMessage] = useState<string | null>(null);
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);
  
  const inputRef = useRef<HTMLInputElement>(null);

  const resetChat = () => {
    setMessages([
      {
        id: 1,
        text: currentAssistant.welcomeMessage,
        sender: 'bot',
        timestamp: new Date(),
      }
    ]);
    
    setChatHistory([
      { role: 'system', content: currentAssistant.systemPrompt }
    ]);
    
    setInputValue('');
    setError(null);
    setCurrentBotMessage(null);
    setCurrentChatId(null);
    
    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }, 100);
  };
  const updateAssistant = (assistant: AssistantConfig) => {
    setCurrentAssistant(assistant);
    setChatHistory([{ role: 'system', content: assistant.systemPrompt }]);
    // Reset del nome personalizzato quando cambia assistente
    if (assistant.id !== 'custom') {
      setCustomAssistantName('');
    }
  };

  const updateCustomPrompt = (prompt: string) => {
    setCustomPrompt(prompt);
    setChatHistory([{ role: 'system', content: prompt.trim() }]);
  };

  const setCustomAssistantTitle = (name: string) => {
    setCustomAssistantName(name);
  };

  return {
    // State
    currentAssistant,
    customPrompt,
    customAssistantName,
    messages,
    chatHistory,
    inputValue,
    isTyping,
    error,
    currentBotMessage,
    currentChatId,
    inputRef,
    
    // Setters
    setCurrentAssistant,
    setCustomPrompt,
    setCustomAssistantName,
    setMessages,
    setChatHistory,
    setInputValue,
    setIsTyping,
    setError,
    setCurrentBotMessage,
    setCurrentChatId,
    
    // Actions
    resetChat,
    updateAssistant,
    updateCustomPrompt,
    setCustomAssistantTitle,
  };
};
