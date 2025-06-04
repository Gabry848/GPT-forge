import React from 'react';
import { AssistantConfig, assistants } from '../../../config/prompts';

interface AssistantSelectorProps {
  currentAssistant: AssistantConfig;
  onAssistantChange: (assistantId: string) => void;
}

const AssistantSelector: React.FC<AssistantSelectorProps> = ({
  currentAssistant,
  onAssistantChange
}) => {
  return (
    <div className="assistant-selector">
      <label htmlFor="assistant-select" className="assistant-label">
        Assistente:
      </label>
      <select 
        id="assistant-select"
        className="assistant-select"
        onChange={(e) => onAssistantChange(e.target.value)}
        value={currentAssistant.id}
      >
        {assistants.map(assistant => (
          <option key={assistant.id} value={assistant.id}>
            {assistant.name}
          </option>
        ))}
      </select>
    </div>
  );
};

export default AssistantSelector;
