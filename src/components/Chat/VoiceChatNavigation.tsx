import { useState } from 'react';
import Chat from './index';
import MicrophoneTest from './MicrophoneTest';
import ThemeToggle from './ThemeToggle';
import './VoiceChatNavigation.css';

const VoiceChatNavigation: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'chat' | 'test'>('chat');

  return (
    <div className="voice-chat-container">
      <div className="voice-chat-tabs">
        <button
          className={`tab ${activeTab === 'chat' ? 'active' : ''}`}
          onClick={() => setActiveTab('chat')}
        >
          Chat Vocale
        </button>
        <button
          className={`tab ${activeTab === 'test' ? 'active' : ''}`}
          onClick={() => setActiveTab('test')}
        >
          Test Microfono
        </button>
        <ThemeToggle />
      </div>

      <div className="voice-chat-content">
        {activeTab === 'chat' ? (
          <Chat />
        ) : (
          <MicrophoneTest />
        )}
      </div>
    </div>
  );
};

export default VoiceChatNavigation;
