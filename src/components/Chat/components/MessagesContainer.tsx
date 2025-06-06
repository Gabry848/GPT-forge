import React, { useRef, useEffect } from 'react';
import MessageBubble from './MessageBubble';

interface Message {
  id: number;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date | string;
}

interface MessagesContainerProps {
  messages: Message[];
  isTyping: boolean;
  error: string | null;
  onRegenerateResponse?: (messageId: number) => void;
}

const MessagesContainer: React.FC<MessagesContainerProps> = ({ 
  messages, 
  isTyping, 
  error,
  onRegenerateResponse
}) => {
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  // Scroll automatico quando arrivano nuovi messaggi
  useEffect(() => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  return (    <div className="messages-container" ref={messagesContainerRef}>
      {messages.map(message => (
        <MessageBubble 
          key={message.id} 
          message={message} 
          onRegenerateResponse={onRegenerateResponse}
        />
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
  );
};

export default MessagesContainer;
