import React from 'react';
import '../ChatHeader.css';

interface ChatHeaderProps {
  onSettingsClick: () => void;
  onSidebarToggle: () => void;
  onNewChat: () => void;
  sidebarOpen: boolean;
  assistantName: string;
}

const ChatHeader: React.FC<ChatHeaderProps> = ({ onSettingsClick, onSidebarToggle, onNewChat, sidebarOpen, assistantName }) => {
  return (
    <div className="chat-header">
      <div className="header-left">
        <button 
          className="sidebar-toggle-button"
          onClick={onSidebarToggle}
          aria-label={sidebarOpen ? "Chiudi cronologia" : "Apri cronologia"}
          title={sidebarOpen ? "Chiudi cronologia" : "Apri cronologia"}
        >
          {sidebarOpen ? '×' : '☰'}
        </button>
        <h2>{assistantName}</h2>      </div>        
      <div className="header-actions">
        <button 
          className="new-chat-button"
          onClick={onNewChat}
          aria-label="Nuova Chat"
          title="Nuova Chat"
        >
          <span
            role="img"
            aria-label="plus-icon"
            style={{ fontSize: '1.7rem', marginRight: 0 }}
          >✚</span>
        </button>
        <button 
          className="settings-button"
          onClick={onSettingsClick}
          aria-label="Impostazioni"
        >
          ⚙️
        </button>
      </div>
    </div>
  );
};

export default ChatHeader;
