import React from 'react';
import VoiceControlsEnhanced from '../VoiceControlsEnhanced';

interface InputAreaProps {
  inputValue: string;
  isTyping: boolean;
  currentMessage: string | null;
  onInputChange: (value: string) => void;
  onSendMessage: () => void;
  onKeyDown: (event: React.KeyboardEvent) => void;
  onVoiceText: (text: string) => void;
}

const InputArea: React.FC<InputAreaProps> = ({
  inputValue,
  isTyping,
  currentMessage,
  onInputChange,
  onSendMessage,
  onKeyDown,
  onVoiceText
}) => {
  return (
    <div className="input-container">
      <VoiceControlsEnhanced 
        onTextReceived={onVoiceText}
        isTyping={isTyping}
        currentMessage={currentMessage}
      />
      <input
        type="text"
        value={inputValue}
        onChange={(e) => onInputChange(e.target.value)}
        onKeyDown={onKeyDown}
        placeholder="Scrivi un messaggio..."
        className="message-input"
        disabled={isTyping}
      />
      <button
        onClick={onSendMessage}
        className="send-button"
        disabled={isTyping || inputValue.trim() === ''}
      >
        Invia
      </button>
    </div>
  );
};

export default InputArea;
