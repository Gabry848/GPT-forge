import { useState } from 'react';

export type SettingsTab = 'assistant' | 'model' | 'custom-models' | 'api' | 'history' | 'actions';

export const useSettings = () => {
  const [showSettingsPopup, setShowSettingsPopup] = useState<boolean>(false);
  const [showCustomPromptForm, setShowCustomPromptForm] = useState<boolean>(false);
  const [showCustomPromptInSettings, setShowCustomPromptInSettings] = useState<boolean>(false);
  const [activeSettingsTab, setActiveSettingsTab] = useState<SettingsTab>('assistant');

  const handleCloseSettings = () => {
    setShowSettingsPopup(false);
    setShowCustomPromptInSettings(false);
  };

  const handleResetSettings = () => {
    if (confirm('Sei sicuro di voler resettare tutte le impostazioni? Questa azione cancellerà chiavi API, modelli personalizzati e preferenze.')) {
      localStorage.removeItem('openrouter_api_key');
      localStorage.removeItem('openrouter_selected_model');
      localStorage.removeItem('saved_custom_models');
      localStorage.removeItem('chat_save_path');
      localStorage.removeItem('auto_save_chats');
      localStorage.removeItem('max_history_files');
      
      alert('Impostazioni resettate con successo!');
      return true;
    }
    return false;
  };

  return {
    showSettingsPopup,
    showCustomPromptForm,
    showCustomPromptInSettings,
    activeSettingsTab,
    setShowSettingsPopup,
    setShowCustomPromptForm,
    setShowCustomPromptInSettings,
    setActiveSettingsTab,
    handleCloseSettings,
    handleResetSettings,
  };
};
