import React from 'react';
import '../ChatHeader.css';

interface ChatHeaderProps {
  onSettingsClick: () => void;
  onSidebarToggle: () => void;
  sidebarOpen: boolean;
}

const ChatHeader: React.FC<ChatHeaderProps> = ({ onSettingsClick, onSidebarToggle, sidebarOpen }) => {
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
        <h2>ChatBot AI</h2>
      </div>        
      <div className="header-actions">
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
