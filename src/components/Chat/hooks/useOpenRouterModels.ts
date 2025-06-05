import { useState, useEffect } from 'react';

export interface OpenRouterModel {
  id: string;
  name: string;
  description: string;
  context_length: number;
  pricing: {
    prompt: string;
    completion: string;
  };
}

export const useOpenRouterModels = () => {
  const [availableModels, setAvailableModels] = useState<OpenRouterModel[]>([]);
  const [selectedModel, setSelectedModel] = useState<string>('openai/gpt-3.5-turbo');
  const [modelsLoading, setModelsLoading] = useState<boolean>(false);
  const [modelsError, setModelsError] = useState<string | null>(null);

  // Carica il modello salvato all'avvio
  useEffect(() => {
    const storedModel = localStorage.getItem('openrouter_selected_model');
    if (storedModel) {
      setSelectedModel(storedModel);
    }
  }, []);

  const loadAvailableModels = async () => {
    setModelsLoading(true);
    setModelsError(null);
    
    try {
      const response = await fetch('https://openrouter.ai/api/v1/models');
      if (!response.ok) {
        throw new Error('Errore nel caricamento dei modelli');
      }
      
      const data = await response.json();
      const models = data.data.map((model: any) => ({
        id: model.id,
        name: model.name,
        description: model.description,
        context_length: model.context_length,
        pricing: {
          prompt: model.pricing.prompt,
          completion: model.pricing.completion
        }
      }));
      
      setAvailableModels(models);
    } catch (error) {
      console.error('Errore nel caricamento dei modelli:', error);
      setModelsError('Impossibile caricare i modelli. Riprova più tardi.');
    } finally {
      setModelsLoading(false);
    }
  };

  const handleModelChange = (modelId: string) => {
    setSelectedModel(modelId);
    localStorage.setItem('openrouter_selected_model', modelId);
  };

  return {
    availableModels,
    selectedModel,
    modelsLoading,
    modelsError,
    loadAvailableModels,
    handleModelChange,
  };
};
