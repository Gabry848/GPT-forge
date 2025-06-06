import { useState, useCallback } from 'react';

interface ConfirmationOptions {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'danger' | 'warning' | 'info';
}

interface ConfirmationState extends ConfirmationOptions {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export const useConfirmation = () => {
  const [confirmationState, setConfirmationState] = useState<ConfirmationState>({
    isOpen: false,
    title: '',
    message: '',
    confirmText: 'Conferma',
    cancelText: 'Annulla',
    type: 'info',
    onConfirm: () => {},
    onCancel: () => {}
  });

  const showConfirmation = useCallback((
    options: ConfirmationOptions
  ): Promise<boolean> => {
    return new Promise((resolve) => {
      setConfirmationState({
        ...options,
        isOpen: true,
        confirmText: options.confirmText || 'Conferma',
        cancelText: options.cancelText || 'Annulla',
        type: options.type || 'info',
        onConfirm: () => {
          setConfirmationState(prev => ({ ...prev, isOpen: false }));
          resolve(true);
        },
        onCancel: () => {
          setConfirmationState(prev => ({ ...prev, isOpen: false }));
          resolve(false);
        }
      });
    });
  }, []);

  const hideConfirmation = useCallback(() => {
    setConfirmationState(prev => ({ ...prev, isOpen: false }));
  }, []);

  return {
    confirmationState,
    showConfirmation,
    hideConfirmation
  };
};
