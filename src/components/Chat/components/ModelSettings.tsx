import React from 'react';

interface OpenRouterModel {
  id: string;
  name: string;
  description: string;
  context_length: number;
  pricing: {
    prompt: string;
    completion: string;
  };
}

interface ModelSettingsProps {
  selectedModel: string;
  availableModels: OpenRouterModel[];
  modelsLoading: boolean;
  modelsError: string | null;
  onModelChange: (modelId: string) => void;
  onLoadModels: () => void;
}

const ModelSettings: React.FC<ModelSettingsProps> = ({
  selectedModel,
  availableModels,
  modelsLoading,
  modelsError,
  onModelChange,
  onLoadModels
}) => {
  return (
    <div className="settings-section">
      <h3 className="settings-section-title">
        <span className="settings-section-icon">🧠</span>
        Modello AI
        {modelsLoading && <span style={{fontSize: '12px', color: '#666'}}> (Caricamento...)</span>}
      </h3>
      <div className="settings-field">
        <label className="settings-label" htmlFor="model-select">
          Seleziona modello:
          <button 
            className="models-refresh"
            onClick={onLoadModels}
            disabled={modelsLoading}
          >
            Aggiorna
          </button>
        </label>
        {modelsLoading ? (
          <div className="models-loading">
            Caricamento modelli disponibili...
          </div>
        ) : (
          <select 
            id="model-select"
            className="settings-select"
            value={selectedModel}
            onChange={(e) => onModelChange(e.target.value)}
          >
            {availableModels.length === 0 ? (
              <option value={selectedModel}>{selectedModel}</option>
            ) : (
              availableModels.map(model => (
                <option key={model.id} value={model.id} title={model.description}>
                  {model.name}
                </option>
              ))
            )}
          </select>
        )}
        {modelsError && (
          <div className="models-error">{modelsError}</div>
        )}
        {selectedModel && (
          <div className="settings-help-text">
            Modello attuale: {selectedModel}
          </div>
        )}
      </div>
    </div>
  );
};

export default ModelSettings;
