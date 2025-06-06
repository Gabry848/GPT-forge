import React, { useEffect } from 'react';
import './ConfirmationModal.css';

interface ConfirmationModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
  type?: 'danger' | 'warning' | 'info';
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  title,
  message,
  confirmText = 'Conferma',
  cancelText = 'Annulla',
  onConfirm,
  onCancel,
  type = 'info'
}) => {
  // Gestisce la chiusura con il tasto ESC
  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onCancel();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEsc);
      return () => document.removeEventListener('keydown', handleEsc);
    }
  }, [isOpen, onCancel]);

  if (!isOpen) return null;

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onCancel();
    }
  };

  const getIconForType = () => {
    switch (type) {
      case 'danger':
        return '⚠️';
      case 'warning':
        return '⚠️';
      case 'info':
      default:
        return 'ℹ️';
    }
  };

  return (
    <div className="confirmation-modal-overlay" onClick={handleBackdropClick}>
      <div className={`confirmation-modal confirmation-modal--${type}`}>
        <div className="confirmation-modal__header">
          <div className="confirmation-modal__icon">
            {getIconForType()}
          </div>
          <h3 className="confirmation-modal__title">{title}</h3>
        </div>
        
        <div className="confirmation-modal__content">
          <p className="confirmation-modal__message">{message}</p>
        </div>
        
        <div className="confirmation-modal__actions">
          <button 
            className="confirmation-modal__button confirmation-modal__button--cancel"
            onClick={onCancel}
          >
            {cancelText}
          </button>
          <button 
            className={`confirmation-modal__button confirmation-modal__button--confirm confirmation-modal__button--${type}`}
            onClick={onConfirm}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;
