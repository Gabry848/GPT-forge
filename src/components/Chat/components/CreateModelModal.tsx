import React from 'react';

interface CreateModelModalProps {
  isOpen: boolean;
  title: string;
  prompt: string;
  selectedModel: string;
  testingModel: boolean;
  onTitleChange: (title: string) => void;
  onPromptChange: (prompt: string) => void;
  onSave: () => void;
  onClose: () => void;
  onTest: () => void;
}

const CreateModelModal: React.FC<CreateModelModalProps> = ({
  isOpen,
  title,
  prompt,
  selectedModel,
  testingModel,
  onTitleChange,
  onPromptChange,
  onSave,
  onClose,
  onTest
}) => {
  if (!isOpen) return null;
  return (
    <div className="create-model-modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="create-model-modal">
        <div className="create-model-modal-header">
          <h2 className="create-model-modal-title">Crea Nuovo Modello Personalizzato</h2>
          <button className="create-model-modal-close" onClick={onClose}>
            ×
          </button>
        </div>
          <div className="create-model-modal-body">
          <div className="create-model-field">
            <label className="create-model-label" htmlFor="model-title">
              Titolo del modello:
            </label>
            <input
              id="model-title"
              type="text"
              className="create-model-input"
              value={title}
              onChange={(e) => onTitleChange(e.target.value)}
              placeholder="Es: Assistente Sviluppatore React"
            />
          </div>
          
          <div className="create-model-field">
            <label className="create-model-label" htmlFor="model-prompt">
              Prompt personalizzato:
            </label>
            <textarea
              id="model-prompt"
              className="create-model-textarea"
              value={prompt}
              onChange={(e) => onPromptChange(e.target.value)}
              placeholder="Definisci il comportamento dell'assistente..."
              rows={8}
            />
          </div>
          
          <div className="create-model-info">
            <p><strong>Modello AI:</strong> {selectedModel}</p>
            <p className="create-model-help-text">
              Il modello verrà configurato con il prompt personalizzato che hai definito.
            </p>
          </div>
        </div>
        
        <div className="create-model-modal-footer">
          <button 
            className="create-model-button create-model-button-secondary"
            onClick={onClose}
          >
            Annulla
          </button>
          <button 
            className="create-model-button create-model-button-test"
            onClick={onTest}
            disabled={!prompt.trim() || testingModel}
          >
            {testingModel ? 'Test in corso...' : '🧪 Testa'}
          </button>
          <button 
            className="create-model-button create-model-button-primary"
            onClick={onSave}
            disabled={!title.trim() || !prompt.trim()}
          >
            💾 Salva Modello
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateModelModal;
