import React, { useRef } from 'react';
import ReactMarkdown from 'react-markdown';

interface Message {
  id: number;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date | string;
}

interface MessageBubbleProps {
  message: Message;
  onCopy?: (text: string) => void;
  onRegenerateResponse?: (messageId: number) => void;
}

// Componente per blocco codice con tasto copia
const CodeBlockWithCopy = ({ children }: { children: React.ReactNode }) => {
  const codeRef = useRef<HTMLPreElement>(null);
  const [copied, setCopied] = React.useState(false);

  // FIX MEDIA: Gestione errori clipboard con fallback
  const handleCopy = async () => {
    if (codeRef.current) {
      const text = codeRef.current.innerText;
      try {
        await navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 1200);
      } catch (error) {
        console.error('Errore nella copia negli appunti:', error);
        // Fallback: crea textarea temporaneo
        const textarea = document.createElement('textarea');
        textarea.value = text;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.select();
        try {
          document.execCommand('copy');
          setCopied(true);
          setTimeout(() => setCopied(false), 1200);
        } catch (fallbackError) {
          console.error('Fallback copy failed:', fallbackError);
          alert('Impossibile copiare negli appunti');
        } finally {
          document.body.removeChild(textarea);
        }
      }
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

const MessageBubble: React.FC<MessageBubbleProps> = ({ message, onRegenerateResponse }) => {
  const formatTime = (date: Date | string): string => {
    const dateObj = date instanceof Date ? date : new Date(date);
    return dateObj.toLocaleTimeString('it-IT', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  // FIX MEDIA: Gestione errori clipboard
  const handleCopyMessage = async () => {
    try {
      await navigator.clipboard.writeText(message.text);
    } catch (error) {
      console.error('Errore nella copia del messaggio:', error);
      // Fallback
      const textarea = document.createElement('textarea');
      textarea.value = message.text;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.select();
      try {
        document.execCommand('copy');
      } catch (fallbackError) {
        console.error('Fallback copy failed:', fallbackError);
        alert('Impossibile copiare il messaggio');
      } finally {
        document.body.removeChild(textarea);
      }
    }
  };

  const handleRegenerateResponse = () => {
    if (onRegenerateResponse && message.sender === 'bot') {
      onRegenerateResponse(message.id);
    }
  };

  // FIX MEDIA: Gestione errori clipboard
  const handleShareMessage = async () => {
    try {
      await navigator.clipboard.writeText(message.text);
      console.log('Messaggio copiato per condivisione');
    } catch (error) {
      console.error('Errore nella condivisione del messaggio:', error);
      // Fallback
      const textarea = document.createElement('textarea');
      textarea.value = message.text;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.select();
      try {
        document.execCommand('copy');
        console.log('Messaggio copiato per condivisione (fallback)');
      } catch (fallbackError) {
        console.error('Fallback copy failed:', fallbackError);
        alert('Impossibile condividere il messaggio');
      } finally {
        document.body.removeChild(textarea);
      }
    }
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

      {/* Elementi aggiuntivi per i messaggi del bot */}
      {message.sender === 'bot' && (
        <>
          {/* Area informativa sul lato destro */}
          <div className="message-right-info">
            {formatTime(message.timestamp)}
          </div>

          {/* Indicatore AI */}
          <div className="ai-indicator"></div>

          {/* Bordo animato */}
          <div className="right-border-animation"></div>

          {/* Pulsanti di azione */}
          <div className="right-actions">
            <button 
              className="right-action-btn" 
              onClick={handleCopyMessage}
              data-tooltip="Copia"
              aria-label="Copia messaggio"
            >
              📋
            </button>
            <button 
              className="right-action-btn" 
              onClick={handleRegenerateResponse}
              data-tooltip="Rigenera"
              aria-label="Rigenera risposta"
            >
              🔄
            </button>
            <button 
              className="right-action-btn" 
              onClick={handleShareMessage}
              data-tooltip="Condividi"
              aria-label="Condividi messaggio"
            >
              📤
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default MessageBubble;
