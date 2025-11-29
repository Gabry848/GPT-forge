import React, { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import './MarkdownEditor.css';

interface MarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
  disabled?: boolean;
}

const MarkdownEditor: React.FC<MarkdownEditorProps> = ({
  value,
  onChange,
  onSend,
  disabled
}) => {
  const [showPreview, setShowPreview] = useState(false);
  const [mode, setMode] = useState<'edit' | 'split' | 'preview'>('edit');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const insertFormatting = (before: string, after: string = '') => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = value.substring(start, end);
    const newText = value.substring(0, start) + before + selectedText + after + value.substring(end);

    onChange(newText);

    // Riposiziona il cursore
    setTimeout(() => {
      textarea.focus();
      const newCursorPos = start + before.length + selectedText.length;
      textarea.setSelectionRange(newCursorPos, newCursorPos);
    }, 0);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      onSend();
    }
  };

  return (
    <div className="markdown-editor">
      <div className="markdown-toolbar">
        <button
          onClick={() => insertFormatting('**', '**')}
          title="Bold"
          className="toolbar-btn"
        >
          <strong>B</strong>
        </button>
        <button
          onClick={() => insertFormatting('*', '*')}
          title="Italic"
          className="toolbar-btn"
        >
          <em>I</em>
        </button>
        <button
          onClick={() => insertFormatting('`', '`')}
          title="Code"
          className="toolbar-btn"
        >
          {'</>'}
        </button>
        <button
          onClick={() => insertFormatting('```\n', '\n```')}
          title="Code Block"
          className="toolbar-btn"
        >
          {'{ }'}
        </button>
        <button
          onClick={() => insertFormatting('\n- ')}
          title="List"
          className="toolbar-btn"
        >
          ≡
        </button>
        <button
          onClick={() => insertFormatting('[', '](url)')}
          title="Link"
          className="toolbar-btn"
        >
          🔗
        </button>
        <button
          onClick={() => insertFormatting('> ')}
          title="Quote"
          className="toolbar-btn"
        >
          "
        </button>

        <div className="toolbar-divider" />

        <button
          onClick={() => setMode('edit')}
          className={`mode-btn ${mode === 'edit' ? 'active' : ''}`}
          title="Edit"
        >
          ✏️
        </button>
        <button
          onClick={() => setMode('split')}
          className={`mode-btn ${mode === 'split' ? 'active' : ''}`}
          title="Split View"
        >
          ⬌
        </button>
        <button
          onClick={() => setMode('preview')}
          className={`mode-btn ${mode === 'preview' ? 'active' : ''}`}
          title="Preview"
        >
          👁️
        </button>
      </div>

      <div className={`editor-container mode-${mode}`}>
        {(mode === 'edit' || mode === 'split') && (
          <div className="editor-pane">
            <textarea
              ref={textareaRef}
              value={value}
              onChange={(e) => onChange(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={disabled}
              placeholder="Scrivi il tuo messaggio in Markdown...&#10;&#10;**Grassetto**, *Corsivo*, `Codice`&#10;```&#10;Blocco codice&#10;```&#10;&#10;Ctrl+Enter per inviare"
              className="markdown-textarea"
            />
          </div>
        )}

        {(mode === 'preview' || mode === 'split') && (
          <div className="preview-pane">
            <div className="preview-content">
              {value.trim() ? (
                <ReactMarkdown>{value}</ReactMarkdown>
              ) : (
                <div className="preview-empty">
                  Nessun contenuto da visualizzare
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="editor-footer">
        <span className="char-count">
          {value.length} caratteri
        </span>
        <span className="hint">
          Ctrl+Enter per inviare
        </span>
      </div>
    </div>
  );
};

export default MarkdownEditor;
