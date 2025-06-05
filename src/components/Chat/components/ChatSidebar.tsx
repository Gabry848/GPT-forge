import React, { useState, useEffect } from 'react';

interface ChatHistory {
  id: string;
  title: string;
  timestamp: Date;
  messages: Array<{
    id: number;
    text: string;
    sender: 'user' | 'bot';
    timestamp: Date;
  }>;
  assistant: string;
  model: string;
}

interface ChatSidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  onLoadChat: (chat: ChatHistory) => void;
  onDeleteChat: (chatId: string) => void;
  currentChatId: string | null;
  savePath: string;
}

const ChatSidebar: React.FC<ChatSidebarProps> = ({
  isOpen,
  onToggle,
  onLoadChat,
  onDeleteChat,
  currentChatId,
  savePath
}) => {
  const [chatHistory, setChatHistory] = useState<ChatHistory[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'date' | 'title'>('date');
  const [isLoading, setIsLoading] = useState(false);
  // Carica la cronologia delle chat
  const loadChatHistory = async () => {
    setIsLoading(true);
    try {
      if (!savePath || savePath === '') {
        setChatHistory([]);
        return;
      }

      // Verifica se la cartella esiste e carica i file JSON
      const savedChats = await window.ipcRenderer.invoke('load-chat-history', savePath);
      
      if (savedChats && Array.isArray(savedChats)) {
        const formattedChats = savedChats.map(chat => ({
          ...chat,
          timestamp: new Date(chat.timestamp)
        }));
        setChatHistory(formattedChats);
      }
    } catch (error) {
      console.error('Errore nel caricamento della cronologia:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && savePath) {
      loadChatHistory();
    }
  }, [isOpen, savePath]);

  // Filtra e ordina le chat
  const filteredAndSortedChats = chatHistory
    .filter(chat => 
      chat.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      chat.assistant.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      if (sortBy === 'date') {
        return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
      } else {
        return a.title.localeCompare(b.title);
      }
    });

  // Formatta la data per la visualizzazione
  const formatDate = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days === 0) return 'Oggi';
    if (days === 1) return 'Ieri';
    if (days < 7) return `${days} giorni fa`;
    
    return date.toLocaleDateString('it-IT', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };
  // Gestisce la cancellazione di una chat
  const handleDeleteChat = async (chatId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    
    if (window.confirm('Sei sicuro di voler eliminare questa chat?')) {
      try {
        await window.ipcRenderer.invoke('delete-chat-file', savePath, chatId);
        onDeleteChat(chatId);
        loadChatHistory(); // Ricarica la lista
      } catch (error) {
        console.error('Errore durante l\'eliminazione:', error);
        alert('Errore durante l\'eliminazione della chat');
      }
    }
  };

  // Genera il titolo della chat basato sui primi messaggi
  const generateChatTitle = (messages: any[]) => {
    const userMessages = messages.filter(msg => msg.sender === 'user');
    if (userMessages.length > 0) {
      const firstMessage = userMessages[0].text;
      return firstMessage.length > 30 
        ? firstMessage.substring(0, 30) + '...'
        : firstMessage;
    }
    return 'Chat Senza Titolo';
  };

  return (
    <>
      {/* Overlay per dispositivi mobili */}
      {isOpen && (
        <div 
          className="chat-sidebar-overlay"
          onClick={onToggle}
        />
      )}
      
      {/* Sidebar principale */}
      <div className={`chat-sidebar ${isOpen ? 'open' : ''}`}>
        {/* Header della sidebar */}
        <div className="chat-sidebar-header">
          <div className="chat-sidebar-title">
            <span className="chat-sidebar-icon">💬</span>
            Chat Precedenti
          </div>
          <button 
            className="chat-sidebar-toggle"
            onClick={onToggle}
            title={isOpen ? 'Chiudi sidebar' : 'Apri sidebar'}
          >
            {isOpen ? '×' : '☰'}
          </button>
        </div>

        {/* Contenuto della sidebar */}
        {isOpen && (
          <div className="chat-sidebar-content">
            {/* Controlli di ricerca e ordinamento */}
            <div className="chat-sidebar-controls">
              <div className="chat-search-container">
                <input
                  type="text"
                  placeholder="Cerca nelle chat..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="chat-search-input"
                />
                <span className="chat-search-icon">🔍</span>
              </div>
              
              <div className="chat-sort-container">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as 'date' | 'title')}
                  className="chat-sort-select"
                >
                  <option value="date">Data</option>
                  <option value="title">Titolo</option>
                </select>
              </div>
            </div>

            {/* Messaggio se non è configurato il percorso */}
            {!savePath && (
              <div className="chat-sidebar-notice">
                <p>⚠️ Configura il percorso di salvataggio nelle impostazioni per visualizzare le chat precedenti.</p>
              </div>
            )}

            {/* Loading */}
            {isLoading && (
              <div className="chat-sidebar-loading">
                <p>Caricamento...</p>
              </div>
            )}

            {/* Lista delle chat */}
            {!isLoading && savePath && (
              <div className="chat-list">
                {filteredAndSortedChats.length === 0 ? (
                  <div className="chat-list-empty">
                    <p>Nessuna chat trovata</p>
                  </div>
                ) : (
                  filteredAndSortedChats.map((chat) => (
                    <div
                      key={chat.id}
                      className={`chat-list-item ${currentChatId === chat.id ? 'active' : ''}`}
                      onClick={() => onLoadChat(chat)}
                    >
                      <div className="chat-item-content">
                        <div className="chat-item-title">
                          {chat.title || generateChatTitle(chat.messages)}
                        </div>
                        <div className="chat-item-meta">
                          <span className="chat-item-date">
                            {formatDate(chat.timestamp)}
                          </span>
                          <span className="chat-item-assistant">
                            {chat.assistant}
                          </span>
                        </div>
                        <div className="chat-item-stats">
                          {chat.messages.length} messaggi
                        </div>
                      </div>
                      <button
                        className="chat-item-delete"
                        onClick={(e) => handleDeleteChat(chat.id, e)}
                        title="Elimina chat"
                      >
                        🗑️
                      </button>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
};

export default ChatSidebar;
