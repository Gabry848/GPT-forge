import React, { useState } from 'react';
import './CustomModelsSettings.css';

interface SavedCustomModel {
  id: string;
  title: string;
  prompt: string;
  modelId: string;
  createdAt: Date;
}

interface CustomModelsSettingsProps {
  savedCustomModels: SavedCustomModel[];
  onCreateModelClick: () => void;
  onLoadModel: (model: SavedCustomModel) => void;
  onDeleteModel: (modelId: string) => void;
  onUpdateModel?: (model: SavedCustomModel) => void;
}

const CustomModelsSettings: React.FC<CustomModelsSettingsProps> = ({
  savedCustomModels,
  onCreateModelClick,
  onLoadModel,
  onDeleteModel,
  onUpdateModel
}) => {
  const [editingModel, setEditingModel] = useState<string | null>(null);
  const [editingField, setEditingField] = useState<string | null>(null);
  const [editValue, setEditValue] = useState<string>('');
  const [expandedPrompt, setExpandedPrompt] = useState<string | null>(null);

  // Gestisce l'inizio della modifica
  const handleEditStart = (modelId: string, field: string, currentValue: string) => {
    setEditingModel(modelId);
    setEditingField(field);
    setEditValue(currentValue);
  };

  // Gestisce la conferma della modifica
  const handleEditConfirm = () => {
    if (editingModel && editingField && onUpdateModel) {
      const model = savedCustomModels.find(m => m.id === editingModel);
      if (model) {
        const updatedModel = {
          ...model,
          [editingField]: editValue
        };
        onUpdateModel(updatedModel);
      }
    }
    handleEditCancel();
  };

  // Gestisce l'annullamento della modifica
  const handleEditCancel = () => {
    setEditingModel(null);
    setEditingField(null);
    setEditValue('');
  };

  // Gestisce l'espansione/compressione del prompt
  const togglePromptExpansion = (modelId: string) => {
    setExpandedPrompt(expandedPrompt === modelId ? null : modelId);
  };

  // Controlla se un campo è in modifica
  const isEditing = (modelId: string, field: string) => {
    return editingModel === modelId && editingField === field;
  };

  // Gestisce i tasti di scelta rapida
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleEditConfirm();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      handleEditCancel();
    }
  };

  return (
    <div className="settings-section">
      <h3 className="settings-section-title">
        <span className="settings-section-icon">⚡</span>
        Modelli Personalizzati
      </h3>
      
      {/* Pulsante per creare nuovo modello */}
      <div className="settings-field">
        <button 
          className="settings-button settings-button-primary"
          onClick={onCreateModelClick}
        >
          ➕ Crea Nuovo Modello
        </button>
      </div>

      {/* Statistiche modelli */}
      {savedCustomModels.length > 0 && (
        <div className="settings-field">
          <div className="settings-stats">
            <div className="settings-stat-item">
              <span className="settings-stat-label">Modelli salvati:</span>
              <span className="settings-stat-value">{savedCustomModels.length}</span>
            </div>
          </div>
        </div>
      )}      {/* Tabella modelli personalizzati - sempre visibile quando ci sono modelli */}
      {savedCustomModels.length > 0 && (
        <div className="settings-field">
          <h4>Gestione Modelli</h4>
          <div className="settings-help-text">
            Clicca su qualsiasi campo per modificarlo. Premi Invio per confermare o Esc per annullare.
          </div>
              
          {/* Tabella modelli personalizzati */}
          <div className="custom-models-table-container">
            <table className="custom-models-table">
              <thead>
                <tr>
                  <th className="custom-models-th-title">Titolo</th>
                  <th className="custom-models-th-model">Modello IA</th>
                  <th className="custom-models-th-prompt">Prompt Personalizzato</th>
                  <th className="custom-models-th-date">Data Creazione</th>
                  <th className="custom-models-th-actions">Azioni</th>
                </tr>
              </thead>
              <tbody>
                {savedCustomModels.map(model => (
                  <tr key={model.id} className="custom-models-row">
                    {/* Titolo */}
                    <td className="custom-models-td-title">
                      {isEditing(model.id, 'title') ? (
                        <input
                          type="text"
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          onKeyDown={handleKeyPress}
                          onBlur={handleEditConfirm}
                          className="custom-models-edit-input"
                          autoFocus
                        />
                      ) : (
                        <div 
                          className="custom-models-editable-field"
                          onClick={() => handleEditStart(model.id, 'title', model.title)}
                          title="Clicca per modificare"
                        >
                          {model.title}
                        </div>
                      )}
                    </td>

                    {/* Modello IA */}
                    <td className="custom-models-td-model">
                      {isEditing(model.id, 'modelId') ? (
                        <input
                          type="text"
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          onKeyDown={handleKeyPress}
                          onBlur={handleEditConfirm}
                          className="custom-models-edit-input"
                          autoFocus
                        />
                      ) : (
                        <div 
                          className="custom-models-editable-field custom-models-model-id"
                          onClick={() => handleEditStart(model.id, 'modelId', model.modelId)}
                          title="Clicca per modificare"
                        >
                          {model.modelId}
                        </div>
                      )}
                    </td>

                    {/* Prompt Personalizzato */}
                    <td className="custom-models-td-prompt">
                      {isEditing(model.id, 'prompt') ? (
                        <textarea
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          onKeyDown={handleKeyPress}
                          onBlur={handleEditConfirm}
                          className="custom-models-edit-textarea"
                          rows={3}
                          autoFocus
                        />
                      ) : (
                        <div className="custom-models-prompt-container">
                          <div 
                            className="custom-models-editable-field custom-models-prompt-preview"
                            onClick={() => handleEditStart(model.id, 'prompt', model.prompt)}
                            title="Clicca per modificare"
                          >
                            {expandedPrompt === model.id 
                              ? model.prompt 
                              : `${model.prompt.substring(0, 100)}${model.prompt.length > 100 ? '...' : ''}`
                            }
                          </div>
                          {model.prompt.length > 100 && (
                            <button
                              className="custom-models-expand-button"
                              onClick={() => togglePromptExpansion(model.id)}
                            >
                              {expandedPrompt === model.id ? '📄 Comprimi' : '📄 Espandi'}
                            </button>
                          )}
                        </div>
                      )}
                    </td>

                    {/* Data Creazione */}
                    <td className="custom-models-td-date">
                      <span className="custom-models-date">
                        {new Date(model.createdAt).toLocaleDateString('it-IT', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </span>
                    </td>

                    {/* Azioni */}
                    <td className="custom-models-td-actions">
                      <div className="custom-models-actions">
                        <button 
                          className="custom-models-action-button custom-models-load-button"
                          onClick={() => onLoadModel(model)}
                          title="Carica questo modello"
                        >
                          📤 Carica
                        </button>
                        <button 
                          className="custom-models-action-button custom-models-delete-button"
                          onClick={() => onDeleteModel(model.id)}
                          title="Elimina questo modello"
                        >
                          🗑️ Elimina
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Istruzioni */}
          <div className="settings-help-text">
            💡 <strong>Suggerimenti:</strong> I campi sono modificabili direttamente cliccandoci sopra. 
            Le modifiche vengono salvate automaticamente quando confermi o clicchi altrove.
          </div>
        </div>
      )}

      {/* Messaggio quando non ci sono modelli */}
      {savedCustomModels.length === 0 && (
        <div className="settings-field">
          <div className="custom-models-empty">
            <span className="custom-models-empty-icon">🤖</span>
            <div>
              <div className="custom-models-empty-title">Nessun modello personalizzato</div>
              <div className="custom-models-empty-description">
                Crea il tuo primo modello personalizzato per iniziare
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomModelsSettings;
