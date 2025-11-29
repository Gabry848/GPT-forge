import React, { useState } from 'react';
import VoiceControlsEnhanced from '../VoiceControlsEnhanced';
import MarkdownEditor from './MarkdownEditor';
import { Template } from '../hooks/useTemplates';
import './EnhancedInputArea.css';

interface EnhancedInputAreaProps {
  inputValue: string;
  isTyping: boolean;
  currentMessage: string | null;
  onInputChange: (value: string) => void;
  onSendMessage: () => void;
  onVoiceText: (text: string) => void;
  templates: Template[];
  onOpenTemplates: () => void;
  useMarkdownEditor?: boolean;
}

const EnhancedInputArea: React.FC<EnhancedInputAreaProps> = ({
  inputValue,
  isTyping,
  currentMessage,
  onInputChange,
  onSendMessage,
  onVoiceText,
  templates,
  onOpenTemplates,
  useMarkdownEditor = false
}) => {
  const [showQuickTemplates, setShowQuickTemplates] = useState(false);
  const [editorMode, setEditorMode] = useState<'simple' | 'markdown'>(
    useMarkdownEditor ? 'markdown' : 'simple'
  );

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey && editorMode === 'simple') {
      e.preventDefault();
      onSendMessage();
    }
  };

  const topTemplates = templates
    .sort((a, b) => b.usageCount - a.usageCount)
    .slice(0, 5);

  return (
    <div className="enhanced-input-area">
      <div className="input-toolbar">
        <button
          onClick={onOpenTemplates}
          className="toolbar-btn"
          title="Gestione Template"
        >
          📝 Template
        </button>

        <button
          onClick={() => setShowQuickTemplates(!showQuickTemplates)}
          className="toolbar-btn"
          title="Template Rapidi"
        >
          ⚡ Quick
        </button>

        <button
          onClick={() => setEditorMode(editorMode === 'simple' ? 'markdown' : 'simple')}
          className="toolbar-btn"
          title={editorMode === 'simple' ? 'Markdown Editor' : 'Editor Semplice'}
        >
          {editorMode === 'simple' ? '📝' : '💬'}
        </button>

        <div className="toolbar-spacer" />

        <VoiceControlsEnhanced
          onTextReceived={onVoiceText}
          isTyping={isTyping}
          currentMessage={currentMessage}
        />
      </div>

      {showQuickTemplates && topTemplates.length > 0 && (
        <div className="quick-templates">
          {topTemplates.map(template => (
            <button
              key={template.id}
              onClick={() => {
                onInputChange(template.content);
                setShowQuickTemplates(false);
              }}
              className="quick-template-btn"
              title={template.content}
            >
              {template.name}
            </button>
          ))}
        </div>
      )}

      {editorMode === 'markdown' ? (
        <MarkdownEditor
          value={inputValue}
          onChange={onInputChange}
          onSend={onSendMessage}
          disabled={isTyping}
        />
      ) : (
        <div className="simple-input-container">
          <textarea
            value={inputValue}
            onChange={(e) => onInputChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Scrivi un messaggio... (Shift+Enter per nuova riga)"
            className="message-textarea"
            disabled={isTyping}
            rows={3}
          />
          <button
            onClick={onSendMessage}
            className="send-button"
            disabled={isTyping || inputValue.trim() === ''}
            title="Invia (Enter)"
          >
            {isTyping ? '⏳' : '🚀'} Invia
          </button>
        </div>
      )}
    </div>
  );
};

export default EnhancedInputArea;
