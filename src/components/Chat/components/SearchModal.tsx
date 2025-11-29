import React, { useState } from 'react';
import { SearchResult } from '../hooks/useSemanticSearch';
import { ChatHistory } from '../hooks';
import './SearchModal.css';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  chatHistory: ChatHistory[];
  onSearch: (query: string, history: ChatHistory[]) => void;
  searchResults: SearchResult[];
  isSearching: boolean;
  onLoadChat: (chatId: string) => void;
}

const SearchModal: React.FC<SearchModalProps> = ({
  isOpen,
  onClose,
  chatHistory,
  onSearch,
  searchResults,
  isSearching,
  onLoadChat
}) => {
  const [query, setQuery] = useState('');

  if (!isOpen) return null;

  const handleSearch = () => {
    if (query.trim()) {
      onSearch(query, chatHistory);
    }
  };

  return (
    <div className="search-modal-overlay">
      <div className="search-modal">
        <div className="search-modal-header">
          <h2>🔍 Cerca nella Cronologia</h2>
          <button onClick={onClose} className="close-btn">✕</button>
        </div>

        <div className="search-box">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            placeholder="Cerca messaggi, argomenti, concetti..."
            className="search-input"
            autoFocus
          />
          <button onClick={handleSearch} className="search-btn" disabled={isSearching}>
            {isSearching ? '⏳' : '🔍'} Cerca
          </button>
        </div>

        <div className="search-results">
          {isSearching && <div className="loading">Ricerca in corso...</div>}

          {!isSearching && searchResults.length === 0 && query && (
            <div className="no-results">Nessun risultato trovato</div>
          )}

          {!isSearching && searchResults.length > 0 && (
            <>
              <div className="results-count">
                Trovati {searchResults.length} risultati
              </div>

              {searchResults.map(result => (
                <div key={result.chatId} className="search-result-card">
                  <div className="result-header">
                    <span className="result-score">Rilevanza: {result.score}</span>
                    <span className="result-date">
                      {new Date(result.timestamp).toLocaleDateString()}
                    </span>
                  </div>

                  <div className="result-assistant">{result.assistant}</div>

                  <div className="result-preview">
                    {result.messages.slice(0, 2).map((msg, idx) => (
                      <div key={idx} className={`preview-msg ${msg.sender}`}>
                        <strong>{msg.sender === 'user' ? 'Tu:' : 'AI:'}</strong>
                        {msg.text.substring(0, 150)}...
                      </div>
                    ))}
                  </div>

                  <button
                    onClick={() => {
                      onLoadChat(result.chatId);
                      onClose();
                    }}
                    className="load-chat-btn"
                  >
                    Apri Chat
                  </button>
                </div>
              ))}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default SearchModal;
