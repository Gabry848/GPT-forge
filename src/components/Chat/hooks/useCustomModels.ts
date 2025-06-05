import { useState, useEffect } from 'react';

export interface SavedCustomModel {
  id: string;
  title: string;
  prompt: string;
  modelId: string;
  createdAt: Date;
}

export const useCustomModels = () => {
  const [savedCustomModels, setSavedCustomModels] = useState<SavedCustomModel[]>([]);
  const [showSavedModels, setShowSavedModels] = useState<boolean>(false);
  const [showCreateModelModal, setShowCreateModelModal] = useState<boolean>(false);
  const [newModelTitle, setNewModelTitle] = useState<string>('');
  const [newModelPrompt, setNewModelPrompt] = useState<string>('');
  const [testingCustomModel, setTestingCustomModel] = useState<boolean>(false);

  // Carica i modelli personalizzati salvati da localStorage
  const loadSavedCustomModels = () => {
    const stored = localStorage.getItem('saved_custom_models');
    if (stored) {
      try {
        const models = JSON.parse(stored);
        setSavedCustomModels(models.map((model: any) => ({
          ...model,
          createdAt: new Date(model.createdAt)
        })));
      } catch (error) {
        console.error('Errore nel caricamento dei modelli salvati:', error);
      }
    }
  };

  useEffect(() => {
    loadSavedCustomModels();
  }, []);

  const openCreateModelModal = () => {
    setShowCreateModelModal(true);
    setNewModelTitle('');
    setNewModelPrompt('');
  };

  const closeCreateModelModal = () => {
    setShowCreateModelModal(false);
    setNewModelTitle('');
    setNewModelPrompt('');
  };

  const saveNewModel = (selectedModel: string) => {
    if (!newModelTitle.trim()) {
      alert('Inserisci un titolo per il modello personalizzato');
      return false;
    }
    
    if (!newModelPrompt.trim()) {
      alert('Inserisci un prompt personalizzato');
      return false;
    }
    
    const newModel: SavedCustomModel = {
      id: Date.now().toString(),
      title: newModelTitle.trim(),
      prompt: newModelPrompt.trim(),
      modelId: selectedModel,
      createdAt: new Date()
    };
    
    const updatedModels = [...savedCustomModels, newModel];
    setSavedCustomModels(updatedModels);
    localStorage.setItem('saved_custom_models', JSON.stringify(updatedModels));
    
    closeCreateModelModal();
    alert('Modello personalizzato salvato con successo!');
    return true;
  };
  const deleteCustomModel = (modelId: string) => {
    if (confirm('Sei sicuro di voler eliminare questo modello personalizzato?')) {
      const updatedModels = savedCustomModels.filter(model => model.id !== modelId);
      setSavedCustomModels(updatedModels);
      localStorage.setItem('saved_custom_models', JSON.stringify(updatedModels));
    }
  };

  const clearAllCustomModels = () => {
    setSavedCustomModels([]);
    localStorage.removeItem('saved_custom_models');
  };

  return {
    savedCustomModels,
    showSavedModels,
    showCreateModelModal,
    newModelTitle,
    newModelPrompt,
    testingCustomModel,
    setShowSavedModels,
    setNewModelTitle,
    setNewModelPrompt,
    setTestingCustomModel,
    openCreateModelModal,
    closeCreateModelModal,
    saveNewModel,
    deleteCustomModel,
    clearAllCustomModels,
  };
};
