import React from 'react';
import './EnhancedChatHeader.css';

interface EnhancedChatHeaderProps {
  assistantName: string;
  sidebarOpen: boolean;
  onSettingsClick: () => void;
  onSidebarToggle: () => void;
  onNewChat: () => void;
  onTemplatesClick: () => void;
  onAnalyticsClick: () => void;
  onSearchClick: () => void;
  chainOfThoughtEnabled?: boolean;
  onToggleChainOfThought?: () => void;
}

const EnhancedChatHeader: React.FC<EnhancedChatHeaderProps> = ({
  assistantName,
  sidebarOpen,
  onSettingsClick,
  onSidebarToggle,
  onNewChat,
  onTemplatesClick,
  onAnalyticsClick,
  onSearchClick,
  chainOfThoughtEnabled = false,
  onToggleChainOfThought
}) => {
  return (
    <div className="enhanced-chat-header">
      <div className="header-left">
        <button
          onClick={onSidebarToggle}
          className="header-btn icon-btn"
          title={sidebarOpen ? 'Nascondi sidebar' : 'Mostra sidebar'}
        >
          {sidebarOpen ? '◀' : '☰'}
        </button>

        <div className="assistant-info">
          <div className="assistant-icon">🤖</div>
          <div className="assistant-details">
            <h3 className="assistant-name">{assistantName}</h3>
            <span className="assistant-status">● Online</span>
          </div>
        </div>
      </div>

      <div className="header-center">
        <button
          onClick={onNewChat}
          className="header-btn primary-btn"
          title="Nuova conversazione"
        >
          ✨ Nuova Chat
        </button>
      </div>

      <div className="header-right">
        <button
          onClick={onSearchClick}
          className="header-btn icon-btn"
          title="Cerca nella cronologia"
        >
          🔍
        </button>

        <button
          onClick={onTemplatesClick}
          className="header-btn icon-btn"
          title="Template Manager"
        >
          📝
        </button>

        <button
          onClick={onAnalyticsClick}
          className="header-btn icon-btn"
          title="Analytics Dashboard"
        >
          📊
        </button>

        {onToggleChainOfThought && (
          <button
            onClick={onToggleChainOfThought}
            className={`header-btn icon-btn ${chainOfThoughtEnabled ? 'active' : ''}`}
            title="Chain of Thought"
          >
            🧠
          </button>
        )}

        <button
          onClick={onSettingsClick}
          className="header-btn icon-btn"
          title="Impostazioni"
        >
          ⚙️
        </button>
      </div>
    </div>
  );
};

export default EnhancedChatHeader;
