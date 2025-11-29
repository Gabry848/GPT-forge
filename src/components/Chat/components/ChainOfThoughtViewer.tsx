import React from 'react';
import { ThoughtStep } from '../hooks/useChainOfThought';
import './ChainOfThoughtViewer.css';

interface ChainOfThoughtViewerProps {
  isVisible: boolean;
  thoughtSteps: ThoughtStep[];
  isThinking: boolean;
}

const ChainOfThoughtViewer: React.FC<ChainOfThoughtViewerProps> = ({
  isVisible,
  thoughtSteps,
  isThinking
}) => {
  if (!isVisible) return null;

  return (
    <div className="chain-of-thought-viewer">
      <div className="cot-header">
        <span className="cot-title">🧠 Chain of Thought</span>
        {isThinking && <span className="cot-thinking">Pensando...</span>}
      </div>

      <div className="cot-steps">
        {thoughtSteps.map((step) => (
          <div key={step.step} className="cot-step">
            <div className="step-number">Step {step.step}</div>
            <div className="step-content">
              <div className="step-thought">{step.thought}</div>
              <div className="step-reasoning">{step.reasoning}</div>
            </div>
            <div className="step-time">
              {step.timestamp.toLocaleTimeString()}
            </div>
          </div>
        ))}

        {isThinking && (
          <div className="cot-step loading">
            <div className="step-number">⏳</div>
            <div className="step-content">
              <div className="loading-dots">
                <span>.</span><span>.</span><span>.</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChainOfThoughtViewer;
