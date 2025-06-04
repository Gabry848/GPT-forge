import React from 'react';
import { AssistantConfig, assistants } from '../../../config/prompts';

interface AssistantSettingsProps {
  currentAssistant: AssistantConfig;
  customPrompt: string;
  showCustomPromptInSettings: boolean;
  onAssistantChange: (assistantId: string) => void;
  onCustomPromptChange: (prompt: string) => void;
  onSaveCustomPrompt: () => void;
  onCancelCustomPrompt: () => void;
}

const AssistantSettings: React.FC<AssistantSettingsProps> = ({
  currentAssistant,
  customPrompt,
  showCustomPromptInSettings,
  onAssistantChange,
  onCustomPromptChange,
  onSaveCustomPrompt,
  onCancelCustomPrompt
}) => {
  return (
    <div className="settings-section">
      <h3 className="settings-section-title">
        <span className="settings-section-icon">🤖</span>
        Assistente
      </h3>
      <div className="settings-field">
        <label className="settings-label" htmlFor="assistant-select">
          Seleziona assistente:
        </label>
        <select 
          id="assistant-select"
          className="settings-select"
          onChange={(e) => onAssistantChange(e.target.value)}
          value={currentAssistant.id}
        >
          {assistants.map(assistant => (
            <option key={assistant.id} value={assistant.id}>
              {assistant.name}
            </option>
          ))}
        </select>
      </div>
      
      {/* Form prompt personalizzato */}
      {showCustomPromptInSettings && (
        <div className="settings-custom-prompt-form">
          <h4>Configura il tuo assistente personalizzato</h4>
          <p className="prompt-description">
            Definisci come si comporterà l'assistente. Descrivi il suo ruolo, il tono di voce e le sue competenze specifiche.
          </p>
          <textarea 
            value={customPrompt}
            onChange={(e) => onCustomPromptChange(e.target.value)}
            placeholder="Esempio: Sei un esperto sviluppatore React che risponde sempre in modo conciso e professionale. Fornisci esempi di codice quando utile e spiega le best practices..."
          />
          <div className="settings-prompt-buttons">
            <button 
              className="settings-prompt-button settings-prompt-button-cancel"
              onClick={onCancelCustomPrompt}
            >
              Annulla
            </button>
            <button 
              className="settings-prompt-button settings-prompt-button-save"
              onClick={onSaveCustomPrompt}
              disabled={!customPrompt.trim()}
            >
              Salva Prompt
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AssistantSettings;
