import { useState, useEffect } from 'react';

export const useApiKey = () => {
  const [apiKeyInput, setApiKeyInput] = useState<string>('');
  const [customApiKey, setCustomApiKey] = useState<string | null>(null);

  // Carica la chiave API da localStorage all'avvio
  useEffect(() => {
    const storedKey = localStorage.getItem('openrouter_api_key');
    if (storedKey) {
      setCustomApiKey(storedKey);
      setApiKeyInput('************' + storedKey.slice(-4));
    }
  }, []);

  const getApiKey = (): string | null => {
    return customApiKey || localStorage.getItem('openrouter_api_key');
  };

  const handleSaveApiKey = () => {
    if (apiKeyInput.trim() && !apiKeyInput.includes('*')) {
      localStorage.setItem('openrouter_api_key', apiKeyInput.trim());
      setCustomApiKey(apiKeyInput.trim());
      setApiKeyInput('************' + apiKeyInput.slice(-4));
      alert('Chiave API salvata con successo!');
    }
  };

  const handleClearApiKey = () => {
    localStorage.removeItem('openrouter_api_key');
    setCustomApiKey(null);
    setApiKeyInput('');
    alert('Chiave API rimossa!');
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
