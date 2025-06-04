import React from 'react';

interface SavedCustomModel {
  id: string;
  title: string;
  prompt: string;
  modelId: string;
  createdAt: Date;
}

interface CustomModelsSettingsProps {
  savedCustomModels: SavedCustomModel[];
  showSavedModels: boolean;
  onCreateModelClick: () => void;
  onToggleSavedModels: () => void;
  onLoadModel: (model: SavedCustomModel) => void;
  onDeleteModel: (modelId: string) => void;
}

const CustomModelsSettings: React.FC<CustomModelsSettingsProps> = ({
  savedCustomModels,
  showSavedModels,
  onCreateModelClick,
  onToggleSavedModels,
  onLoadModel,
  onDeleteModel
}) => {
  return (
    <div className="settings-section">
      <h3 className="settings-section-title">
        <span className="settings-section-icon">⚡</span>
        Modelli Personalizzati
      </h3>
      
      <div className="settings-field">
        <button 
          className="settings-button settings-button-primary"
          onClick={onCreateModelClick}
        >
          ➕ Crea Nuovo Modello
        </button>
      </div>
      
      {savedCustomModels.length > 0 && (
        <>
          <div className="settings-field">
            <button 
              className="settings-button settings-button-secondary"
              onClick={onToggleSavedModels}
            >
              {showSavedModels ? '🔽' : '▶️'} Modelli Salvati ({savedCustomModels.length})
            </button>
          </div>
          
          {showSavedModels && (
            <div className="saved-models-list">
              {savedCustomModels.map(model => (
                <div key={model.id} className="saved-model-item">
                  <div className="saved-model-info">
                    <div className="saved-model-title">{model.title}</div>
                    <div className="saved-model-details">
                      <span className="saved-model-model">Modello: {model.modelId}</span>
                      <span className="saved-model-date">
                        Creato: {new Date(model.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="saved-model-preview">
                      {model.prompt.substring(0, 100)}
                      {model.prompt.length > 100 && '...'}
                    </div>
                  </div>
                  <div className="saved-model-actions">
                    <button 
                      className="saved-model-button saved-model-load"
                      onClick={() => onLoadModel(model)}
                    >
                      Carica
                    </button>
                    <button 
                      className="saved-model-button saved-model-delete"
                      onClick={() => onDeleteModel(model.id)}
                    >
                      Elimina
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default CustomModelsSettings;
