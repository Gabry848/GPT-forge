import React from 'react';

interface ApiSettingsProps {
  apiKeyInput: string;
  customApiKey: string | null;
  onApiKeyChange: (key: string) => void;
  onSaveApiKey: () => void;
  onRemoveApiKey: () => void;
}

const ApiSettings: React.FC<ApiSettingsProps> = ({
  apiKeyInput,
  customApiKey,
  onApiKeyChange,
  onSaveApiKey,
  onRemoveApiKey
}) => {
  return (
    <div className="settings-section">
      <h3 className="settings-section-title">
        <span className="settings-section-icon">🔑</span>
        Configurazione API
      </h3>
      
      <div className="settings-field">
        <label className="settings-label" htmlFor="api-key-input">
          Chiave API OpenRouter:
        </label>
        <div className="api-key-container">
          <input
            id="api-key-input"
            type="password"
            className="settings-input"
            value={apiKeyInput}
            onChange={(e) => onApiKeyChange(e.target.value)}
            placeholder="Inserisci la tua chiave API..."
          />
          <button 
            className="settings-button settings-button-primary"
            onClick={onSaveApiKey}
            disabled={!apiKeyInput.trim()}
          >
            Salva
          </button>
        </div>
        
        {customApiKey && (
          <div className="api-key-status">
            <span className="api-key-saved">✓ Chiave API configurata</span>
            <button 
              className="settings-button settings-button-danger"
              onClick={onRemoveApiKey}
            >
              Rimuovi
            </button>
          </div>
        )}
        
        <div className="settings-help-text">
          La chiave API viene salvata localmente nel browser e utilizzata per comunicare con OpenRouter.
          <br />
          <a href="https://openrouter.ai/keys" target="_blank" rel="noopener noreferrer">
            Ottieni la tua chiave API su OpenRouter →
          </a>
        </div>
      </div>
    </div>
  );
};

export default ApiSettings;
