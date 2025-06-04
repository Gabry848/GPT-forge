import React from 'react';

interface ActionsSettingsProps {
  onClearChat: () => void;
  onExportChat: () => void;
  onResetSettings: () => void;
}

const ActionsSettings: React.FC<ActionsSettingsProps> = ({
  onClearChat,
  onExportChat,
  onResetSettings
}) => {
  return (
    <div className="settings-section">
      <h3 className="settings-section-title">
        <span className="settings-section-icon">⚙️</span>
        Azioni
      </h3>
      
      <div className="settings-field">
        <h4>Gestione Chat</h4>
        <div className="settings-actions">
          <button 
            className="settings-button settings-button-secondary"
            onClick={onClearChat}
          >
            🗑️ Cancella Chat
          </button>
          <button 
            className="settings-button settings-button-secondary"
            onClick={onExportChat}
          >
            📤 Esporta Chat
          </button>
        </div>
      </div>
      
      <div className="settings-field">
        <h4>Configurazione</h4>
        <div className="settings-actions">
          <button 
            className="settings-button settings-button-danger"
            onClick={onResetSettings}
          >
            🔄 Reset Impostazioni
          </button>
        </div>
        <div className="settings-help-text">
          Attenzione: Il reset cancellerà tutte le impostazioni salvate, incluse le chiavi API e i modelli personalizzati.
        </div>
      </div>
    </div>
  );
};

export default ActionsSettings;
