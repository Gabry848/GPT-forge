import React from 'react';
import '../TestModelModal.css';

interface TestModelModalProps {
  isOpen: boolean;
  modelName: string;
  output: string;
  onClose: () => void;
}

const TestModelModal: React.FC<TestModelModalProps> = ({
  isOpen,
  modelName,
  output,
  onClose
}) => {
  if (!isOpen) return null;

  return (
    <div className="test-model-modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="test-model-modal">
        <div className="test-model-modal-header">
          <h2 className="test-model-modal-title">
            Test modello {modelName}
          </h2>
          <button className="test-model-modal-close" onClick={onClose}>
            ×
          </button>
        </div>
        
        <div className="test-model-modal-body">
          <div className="test-model-output-container">
            <h3 className="test-model-output-title">Output del modello</h3>
            <div className="test-model-output">
              {output}
            </div>
          </div>
        </div>
        
        <div className="test-model-modal-footer">
          <button 
            className="test-model-button test-model-button-primary"
            onClick={onClose}
          >
            Chiudi
          </button>
        </div>
      </div>
    </div>
  );
};

export default TestModelModal;
