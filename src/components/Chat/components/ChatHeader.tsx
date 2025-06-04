import React from 'react';
import '../ChatHeader.css';

interface ChatHeaderProps {
  onSettingsClick: () => void;
}

const ChatHeader: React.FC<ChatHeaderProps> = ({ onSettingsClick }) => {
  return (
    <div className="chat-header">
      <h2>ChatBot AI</h2>        
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
