import React from 'react';
import './ChatContainer.css';
import './ChatHeader.css';
import './Messages.css';
import './InputArea.css';
import './SettingsMenu.css';
import './CustomPromptForm.css';
import './ApiKeySection.css';
import './SettingsPopup.css';
import './ChatSidebar.css';

// Import componenti modulari
import ChatHeader from './components/ChatHeader';
import SettingsModal from './components/SettingsModal';
import CreateModelModal from './components/CreateModelModal';
import CustomPromptForm from './components/CustomPromptForm';
import MessagesContainer from './components/MessagesContainer';
import InputArea from './components/InputArea';
import ChatSidebar from './components/ChatSidebar';
import { ChatLogic, type ChatLogicRenderProps } from './components/ChatLogic';

const Chat: React.FC = () => {
  return (
    <ChatLogic>
      {(props: ChatLogicRenderProps) => (
        <>
          {/* Modal delle impostazioni con sidebar */}
          <SettingsModal
            isOpen={props.showSettingsPopup}
            activeTab={props.activeSettingsTab}
            currentAssistant={props.currentAssistant}
            customPrompt={props.customPrompt}
            showCustomPromptInSettings={props.showCustomPromptInSettings}
            selectedModel={props.selectedModel}
            availableModels={props.availableModels}
            modelsLoading={props.modelsLoading}
            modelsError={props.modelsError}
            savedCustomModels={props.savedCustomModels}
            showSavedModels={props.showSavedModels}
            apiKeyInput={props.apiKeyInput}
            customApiKey={props.customApiKey}
            chatSavePath={props.chatSavePath}
            autoSaveChats={props.autoSaveChats}
            maxHistoryFiles={props.maxHistoryFiles}
            onClose={props.handleCloseSettings}
            onTabChange={props.setActiveSettingsTab}
            onAssistantChange={props.handleChangeAssistant}
            onCustomPromptChange={props.setCustomPrompt}
            onSaveCustomPrompt={props.handleSaveCustomPromptInSettings}
            onCancelCustomPrompt={props.handleCancelCustomPromptInSettings}
            onModelChange={props.handleModelChange}
            onLoadModels={props.loadAvailableModels}
            onCreateModelClick={props.openCreateModelModal}
            onToggleSavedModels={() => props.setShowSavedModels(!props.showSavedModels)}
            onLoadModel={props.loadCustomModel}
            onDeleteModel={props.deleteCustomModel}
            onApiKeyChange={props.setApiKeyInput}
            onSaveApiKey={props.handleSaveApiKey}
            onRemoveApiKey={props.handleClearApiKey}
            onChatSavePathChange={props.handleChatSavePathChange}
            onAutoSaveChatsChange={props.handleAutoSaveChatsChange}
            onMaxHistoryFilesChange={props.handleMaxHistoryFilesChange}
            onSelectChatSaveFolder={props.handleSelectChatSaveFolder}
            onClearChatHistory={props.handleClearChatHistory}
            onExportAllChats={props.handleExportAllChats}
            onClearChat={props.handleClearChat}
            onExportChat={props.handleExportChat}
            onResetSettings={props.handleResetSettings}
          />

          {/* Modal per creazione nuovo modello */}
          <CreateModelModal
            isOpen={props.showCreateModelModal}
            title={props.newModelTitle}
            prompt={props.newModelPrompt}
            selectedModel={props.selectedModel}
            testingModel={props.testingCustomModel}
            onTitleChange={props.setNewModelTitle}
            onPromptChange={props.setNewModelPrompt}
            onSave={props.saveNewModelFromModal}
            onClose={props.closeCreateModelModal}
            onTest={props.testNewModel}
          />

          {/* Sidebar per la cronologia delle chat */}
          <ChatSidebar
            isOpen={props.showChatSidebar}
            onToggle={props.handleToggleChatSidebar}
            onLoadChat={props.handleLoadChat}
            onDeleteChat={props.handleDeleteChatFromSidebar}
            currentChatId={props.currentChatId}
            savePath={props.chatSavePath}
          />

          <div className={`chat-container ${props.showChatSidebar ? 'sidebar-open' : ''}`}>
            {/* Intestazione della chat */}
            <ChatHeader 
              onSettingsClick={() => props.setShowSettingsPopup(true)}
              onSidebarToggle={props.handleToggleChatSidebar}
              onNewChat={props.handleNewChat}
              sidebarOpen={props.showChatSidebar}
            />
            
            {/* Contenitore centrale per limitare la larghezza della chat */}
            <div className="chat-content">
              {/* Form per il prompt personalizzato - Solo quando il popup delle impostazioni è chiuso */}
              {props.showCustomPromptForm && !props.showSettingsPopup && (
                <CustomPromptForm
                  customPrompt={props.customPrompt}
                  onPromptChange={props.setCustomPrompt}
                  onSave={props.handleSaveCustomPrompt}
                  onCancel={() => props.setShowCustomPromptForm(false)}
                />
              )}
                
              {/* Container dei messaggi */}
              <MessagesContainer
                messages={props.messages}
                isTyping={props.isTyping}
                error={props.error}
              />

              {/* Input per scrivere il messaggio */}
              <InputArea
                ref={props.inputRef}
                inputValue={props.inputValue}
                isTyping={props.isTyping}
                currentMessage={props.currentBotMessage}
                onInputChange={props.setInputValue}
                onSendMessage={async () => {
                  const success = await props.handleSendMessage(props.inputValue);
                  if (success) {
                    props.setInputValue('');
                  }
                }}
                onKeyDown={props.handleKeyDown}
                onVoiceText={props.handleVoiceText}        
              />
            </div>
          </div>
        </>
      )}
    </ChatLogic>
  );
};

export default Chat;
