import { useState, useEffect } from 'react';

// FIX CRITICO: Type definitions per secure storage
declare global {
  interface Window {
    secureStorage?: {
      setApiKey: (apiKey: string) => Promise<{ success: boolean; error?: string }>;
      getApiKey: () => Promise<{ success: boolean; apiKey?: string | null; error?: string }>;
      removeApiKey: () => Promise<{ success: boolean; error?: string }>;
    };
  }
}

export const useApiKey = () => {
  const [apiKeyInput, setApiKeyInput] = useState<string>('');
  const [customApiKey, setCustomApiKey] = useState<string | null>(null);

  // FIX CRITICO: Carica la chiave API da secure storage invece di localStorage
  useEffect(() => {
    const loadApiKey = async () => {
      // Se secureStorage non è disponibile (web), fallback a localStorage (DEPRECATO)
      if (!window.secureStorage) {
        console.warn('Secure storage not available, falling back to localStorage (INSECURE)');
        const storedKey = localStorage.getItem('openrouter_api_key');
        if (storedKey) {
          setCustomApiKey(storedKey);
          setApiKeyInput('************' + storedKey.slice(-4));
        }
        return;
      }

      try {
        const result = await window.secureStorage.getApiKey();
        if (result.success && result.apiKey) {
          setCustomApiKey(result.apiKey);
          setApiKeyInput('************' + result.apiKey.slice(-4));
        }
      } catch (error) {
        console.error('Error loading API key:', error);
      }
    };

    loadApiKey();
  }, []);

  const getApiKey = (): string | null => {
    return customApiKey;
  };

  const handleSaveApiKey = async () => {
    if (apiKeyInput.trim() && !apiKeyInput.includes('*')) {
      // FIX CRITICO: Usa secure storage
      if (!window.secureStorage) {
        console.warn('Secure storage not available, falling back to localStorage (INSECURE)');
        localStorage.setItem('openrouter_api_key', apiKeyInput.trim());
        setCustomApiKey(apiKeyInput.trim());
        setApiKeyInput('************' + apiKeyInput.slice(-4));
        alert('Chiave API salvata con successo!');
        return;
      }

      try {
        const result = await window.secureStorage.setApiKey(apiKeyInput.trim());
        if (result.success) {
          setCustomApiKey(apiKeyInput.trim());
          setApiKeyInput('************' + apiKeyInput.slice(-4));
          alert('Chiave API salvata con successo (cifrata)!');

          // Rimuovi vecchia chiave da localStorage se esiste
          localStorage.removeItem('openrouter_api_key');
        } else {
          alert('Errore nel salvataggio della chiave API: ' + (result.error || 'Unknown error'));
        }
      } catch (error) {
        console.error('Error saving API key:', error);
        alert('Errore nel salvataggio della chiave API');
      }
    }
  };

  const handleClearApiKey = async () => {
    // FIX CRITICO: Usa secure storage
    if (!window.secureStorage) {
      console.warn('Secure storage not available, falling back to localStorage (INSECURE)');
      localStorage.removeItem('openrouter_api_key');
      setCustomApiKey(null);
      setApiKeyInput('');
      alert('Chiave API rimossa!');
      return;
    }

    try {
      const result = await window.secureStorage.removeApiKey();
      if (result.success) {
        setCustomApiKey(null);
        setApiKeyInput('');
        alert('Chiave API rimossa!');

        // Rimuovi anche da localStorage per pulizia
        localStorage.removeItem('openrouter_api_key');
      } else {
        alert('Errore nella rimozione della chiave API: ' + (result.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error removing API key:', error);
      alert('Errore nella rimozione della chiave API');
    }
  };

  return {
    apiKeyInput,
    customApiKey,
    setApiKeyInput,
    getApiKey,
    handleSaveApiKey,
    handleClearApiKey,
  };
};
