import React from 'react';

interface CustomPromptFormProps {
  customPrompt: string;
  onPromptChange: (prompt: string) => void;
  onSave: () => void;
  onCancel: () => void;
}

const CustomPromptForm: React.FC<CustomPromptFormProps> = ({
  customPrompt,
  onPromptChange,
  onSave,
  onCancel
}) => {
  return (
    <div className="custom-prompt-form">
      <h3>Configura il tuo assistente personalizzato</h3>
      <p className="prompt-description">
        Definisci come si comporterà l'assistente. Descrivi il suo ruolo, il tono di voce e le sue competenze specifiche.
      </p>
      <textarea 
        className="custom-prompt-textarea"
        value={customPrompt}
        onChange={(e) => onPromptChange(e.target.value)}
        placeholder="Inserisci il tuo prompt personalizzato..."
      />
      <div className="prompt-buttons">
        <button 
          onClick={onCancel}
          className="cancel-button"
        >
          Annulla
        </button>
        <button 
          onClick={onSave}
          className="save-button"
          disabled={!customPrompt.trim()}
        >
          Salva Prompt
        </button>
      </div>
    </div>
  );
};

export default CustomPromptForm;
