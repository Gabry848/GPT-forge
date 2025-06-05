import React from 'react';
import SettingsSidebar, { SettingsTab } from './SettingsSidebar';
import AssistantSettings from './AssistantSettings';
import ModelSettings from './ModelSettings';
import CustomModelsSettings from './CustomModelsSettings';
import ApiSettings from './ApiSettings';
import ChatHistorySettings from './ChatHistorySettings';
import ActionsSettings from './ActionsSettings';
import { AssistantConfig } from '../../../config/prompts';

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

interface SavedCustomModel {
  id: string;
  title: string;
  prompt: string;
  modelId: string;
  createdAt: Date;
}

interface SettingsModalProps {
  isOpen: boolean;
  activeTab: SettingsTab;
  currentAssistant: AssistantConfig;
  customPrompt: string;
  showCustomPromptInSettings: boolean;
  selectedModel: string;
  availableModels: OpenRouterModel[];
  modelsLoading: boolean;
  modelsError: string | null;
  savedCustomModels: SavedCustomModel[];
  showSavedModels: boolean;
  apiKeyInput: string;
  customApiKey: string | null;
  chatSavePath: string;
  autoSaveChats: boolean;
  maxHistoryFiles: number;
  onClose: () => void;
  onTabChange: (tab: SettingsTab) => void;
  onAssistantChange: (assistantId: string) => void;
  onCustomPromptChange: (prompt: string) => void;
  onSaveCustomPrompt: () => void;
  onCancelCustomPrompt: () => void;
  onModelChange: (modelId: string) => void;
  onLoadModels: () => void;
  onCreateModelClick: () => void;
  onToggleSavedModels: () => void;
  onLoadModel: (model: SavedCustomModel) => void;
  onDeleteModel: (modelId: string) => void;
  onApiKeyChange: (key: string) => void;
  onSaveApiKey: () => void;
  onRemoveApiKey: () => void;
  onChatSavePathChange: (path: string) => void;
  onAutoSaveChatsChange: (enabled: boolean) => void;
  onMaxHistoryFilesChange: (max: number) => void;
  onSelectChatSaveFolder: () => void;
  onClearChatHistory: () => void;
  onExportAllChats: () => void;
  onClearChat: () => void;
  onExportChat: () => void;
  onResetSettings: () => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  activeTab,
  currentAssistant,
  customPrompt,
  showCustomPromptInSettings,
  selectedModel,
  availableModels,
  modelsLoading,
  modelsError,
  savedCustomModels,
  showSavedModels,
  apiKeyInput,
  customApiKey,
  chatSavePath,
  autoSaveChats,
  maxHistoryFiles,
  onClose,
  onTabChange,
  onAssistantChange,
  onCustomPromptChange,
  onSaveCustomPrompt,
  onCancelCustomPrompt,
  onModelChange,
  onLoadModels,
  onCreateModelClick,
  onToggleSavedModels,
  onLoadModel,
  onDeleteModel,
  onApiKeyChange,
  onSaveApiKey,
  onRemoveApiKey,
  onChatSavePathChange,
  onAutoSaveChatsChange,
  onMaxHistoryFilesChange,
  onSelectChatSaveFolder,
  onClearChatHistory,
  onExportAllChats,
  onClearChat,
  onExportChat,
  onResetSettings
}) => {
  if (!isOpen) return null;

  return (
    <div className="settings-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="settings-popup">
        <div className="settings-popup-header">
          <h2 className="settings-popup-title">Impostazioni</h2>
          <button className="settings-close-btn" onClick={onClose}>
            ×
          </button>
        </div>
        
        <div className="settings-content">
          <SettingsSidebar activeTab={activeTab} onTabChange={onTabChange} />

          <div className="settings-main">
            {activeTab === 'assistant' && (
              <AssistantSettings
                currentAssistant={currentAssistant}
                customPrompt={customPrompt}
                showCustomPromptInSettings={showCustomPromptInSettings}
                onAssistantChange={onAssistantChange}
                onCustomPromptChange={onCustomPromptChange}
                onSaveCustomPrompt={onSaveCustomPrompt}
                onCancelCustomPrompt={onCancelCustomPrompt}
              />
            )}

            {activeTab === 'model' && (
              <ModelSettings
                selectedModel={selectedModel}
                availableModels={availableModels}
                modelsLoading={modelsLoading}
                modelsError={modelsError}
                onModelChange={onModelChange}
                onLoadModels={onLoadModels}
              />
            )}

            {activeTab === 'custom-models' && (
              <CustomModelsSettings
                savedCustomModels={savedCustomModels}
                showSavedModels={showSavedModels}
                onCreateModelClick={onCreateModelClick}
                onToggleSavedModels={onToggleSavedModels}
                onLoadModel={onLoadModel}
                onDeleteModel={onDeleteModel}
              />
            )}            {activeTab === 'api' && (
              <ApiSettings
                apiKeyInput={apiKeyInput}
                customApiKey={customApiKey}
                onApiKeyChange={onApiKeyChange}
                onSaveApiKey={onSaveApiKey}
                onRemoveApiKey={onRemoveApiKey}
              />
            )}

            {activeTab === 'history' && (
              <ChatHistorySettings
                savePath={chatSavePath}
                autoSave={autoSaveChats}
                maxHistoryFiles={maxHistoryFiles}
                onSavePathChange={onChatSavePathChange}
                onAutoSaveChange={onAutoSaveChatsChange}
                onMaxHistoryFilesChange={onMaxHistoryFilesChange}
                onSelectFolder={onSelectChatSaveFolder}
                onClearHistory={onClearChatHistory}
                onExportAllChats={onExportAllChats}
              />
            )}

            {activeTab === 'actions' && (
              <ActionsSettings
                onClearChat={onClearChat}
                onExportChat={onExportChat}
                onResetSettings={onResetSettings}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;
