import React, { useState } from 'react';

interface ChatHistorySettingsProps {
  savePath: string;
  autoSave: boolean;
  maxHistoryFiles: number;
  onSavePathChange: (path: string) => void;
  onAutoSaveChange: (enabled: boolean) => void;
  onMaxHistoryFilesChange: (max: number) => void;
  onSelectFolder: () => void;
  onClearHistory: () => void;
  onExportAllChats: () => void;
}

const ChatHistorySettings: React.FC<ChatHistorySettingsProps> = ({
  savePath,
  autoSave,
  maxHistoryFiles,
  onSavePathChange,
  onAutoSaveChange,
  onMaxHistoryFilesChange,
  onSelectFolder,
  onClearHistory,
  onExportAllChats
}) => {
  const [isValidating, setIsValidating] = useState(false);
  // Valida il percorso di salvataggio
  const validatePath = async () => {
    if (!savePath) return;
    
    setIsValidating(true);
    try {
      const isValid = await window.ipcRenderer.invoke('validate-chat-save-path', savePath);
      
      if (isValid) {
        alert('Percorso valido e accessibile ✅');
      } else {
        alert('Percorso non accessibile o non esistente ❌');
      }
    } catch (error) {
      console.error('Errore nella validazione del percorso:', error);
      alert('Errore durante la validazione del percorso');
    } finally {
      setIsValidating(false);
    }
  };
  // Apre la cartella di salvataggio
  const openSaveFolder = async () => {
    if (!savePath) return;
    
    try {
      await window.ipcRenderer.invoke('open-folder', savePath);
    } catch (error) {
      console.error('Errore nell\'apertura della cartella:', error);
      alert('Impossibile aprire la cartella');
    }
  };

  return (
    <div className="settings-section">
      <h3 className="settings-section-title">
        <span className="settings-section-icon">💾</span>
        Cronologia Chat
      </h3>
      
      {/* Configurazione percorso di salvataggio */}
      <div className="settings-field">
        <h4>Percorso di Salvataggio</h4>
        <div className="settings-path-container">
          <input
            type="text"
            value={savePath}
            onChange={(e) => onSavePathChange(e.target.value)}
            placeholder="Seleziona una cartella per salvare le chat..."
            className="settings-path-input"
            readOnly
          />
          <button 
            className="settings-button settings-button-secondary"
            onClick={onSelectFolder}
          >
            📁 Sfoglia
          </button>
        </div>
        
        {savePath && (
          <div className="settings-path-actions">
            <button 
              className="settings-button settings-button-small"
              onClick={validatePath}
              disabled={isValidating}
            >
              {isValidating ? '⏳ Validazione...' : '✅ Valida Percorso'}
            </button>
            <button 
              className="settings-button settings-button-small"
              onClick={openSaveFolder}
            >
              📂 Apri Cartella
            </button>
          </div>
        )}
        
        <div className="settings-help-text">
          Le chat verranno salvate automaticamente in formato JSON nella cartella selezionata.
        </div>
      </div>

      {/* Impostazioni di salvataggio automatico */}
      <div className="settings-field">
        <h4>Salvataggio Automatico</h4>
        <div className="settings-checkbox-container">
          <label className="settings-checkbox-label">
            <input
              type="checkbox"
              checked={autoSave}
              onChange={(e) => onAutoSaveChange(e.target.checked)}
              className="settings-checkbox"
            />
            <span className="settings-checkbox-custom"></span>
            Salva automaticamente le chat quando vengono create o aggiornate
          </label>
        </div>
        <div className="settings-help-text">
          Quando abilitato, ogni nuova chat verrà salvata automaticamente nella cartella configurata.
        </div>
      </div>

      {/* Gestione limite file di cronologia */}
      <div className="settings-field">
        <h4>Limite File di Cronologia</h4>
        <div className="settings-number-container">
          <input
            type="number"
            min="10"
            max="1000"
            value={maxHistoryFiles}
            onChange={(e) => onMaxHistoryFilesChange(parseInt(e.target.value) || 50)}
            className="settings-number-input"
          />
          <span className="settings-number-label">file massimi</span>
        </div>
        <div className="settings-help-text">
          Numero massimo di file di chat da mantenere. I file più vecchi verranno eliminati automaticamente.
        </div>
      </div>

      {/* Azioni per la gestione della cronologia */}
      <div className="settings-field">
        <h4>Gestione Cronologia</h4>
        <div className="settings-actions">
          <button 
            className="settings-button settings-button-secondary"
            onClick={onExportAllChats}
            disabled={!savePath}
          >
            📤 Esporta Tutte le Chat
          </button>
          <button 
            className="settings-button settings-button-danger"
            onClick={onClearHistory}
            disabled={!savePath}
          >
            🗑️ Cancella Cronologia
          </button>
        </div>
        <div className="settings-help-text">
          L'esportazione crea un singolo file ZIP con tutte le chat. La cancellazione elimina tutti i file di cronologia.
        </div>
      </div>

      {/* Statistiche cronologia */}
      {savePath && (
        <div className="settings-field">
          <h4>Statistiche</h4>
          <div className="settings-stats">
            <div className="settings-stat-item">
              <span className="settings-stat-label">Percorso:</span>
              <span className="settings-stat-value">{savePath}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatHistorySettings;
