import React, { useRef } from 'react';
import ReactMarkdown from 'react-markdown';

interface Message {
  id: number;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

interface MessageBubbleProps {
  message: Message;
  onCopy?: (text: string) => void;
}

// Componente per blocco codice con tasto copia
const CodeBlockWithCopy = ({ children }: { children: React.ReactNode }) => {
  const codeRef = useRef<HTMLPreElement>(null);
  const [copied, setCopied] = React.useState(false);
  
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
      <button className="copy-btn" onClick={handleCopy} title="Copia codice">
        {copied ? 'Copiato!' : 'Copia'}
      </button>
      {children}
    </pre>
  );
};

const MessageBubble: React.FC<MessageBubbleProps> = ({ message }) => {
  const formatTime = (date: Date): string => {
    return date.toLocaleTimeString('it-IT', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <div className={`message-bubble ${message.sender === 'user' ? 'user-message' : 'bot-message'}`}>
      <div className="message-content">
        {message.sender === 'bot' ? (
          <ReactMarkdown
            components={{
              pre: ({children}) => <CodeBlockWithCopy>{children}</CodeBlockWithCopy>,
            }}
          >
            {message.text}
          </ReactMarkdown>
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
  );
};

export default MessageBubble;
