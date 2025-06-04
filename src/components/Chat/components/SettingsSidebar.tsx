import React from 'react';

export type SettingsTab = 'assistant' | 'model' | 'custom-models' | 'api' | 'actions';

interface SettingsSidebarProps {
  activeTab: SettingsTab;
  onTabChange: (tab: SettingsTab) => void;
}

const SettingsSidebar: React.FC<SettingsSidebarProps> = ({ activeTab, onTabChange }) => {
  const tabs = [
    { id: 'assistant' as const, icon: '🤖', title: 'Assistente' },
    { id: 'model' as const, icon: '🧠', title: 'Modello AI' },
    { id: 'custom-models' as const, icon: '⚡', title: 'Modelli Personalizzati' },
    { id: 'api' as const, icon: '🔑', title: 'API' },
    { id: 'actions' as const, icon: '⚙️', title: 'Azioni' },
  ];

  return (
    <div className="settings-sidebar">
      {tabs.map((tab) => (
        <button 
          key={tab.id}
          className={`settings-tab ${activeTab === tab.id ? 'active' : ''}`}
          onClick={() => onTabChange(tab.id)}
        >
          <span className="settings-tab-icon">{tab.icon}</span>
          <span className="settings-tab-title">{tab.title}</span>
        </button>
      ))}
    </div>
  );
};

export default SettingsSidebar;
