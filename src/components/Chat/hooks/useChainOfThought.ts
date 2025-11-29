import { useState } from 'react';
import { OpenRouterService } from '../services/ChatService';
import { ChatMessage } from './useChat';

export interface ThoughtStep {
  step: number;
  thought: string;
  reasoning: string;
  timestamp: Date;
}

export const useChainOfThought = () => {
  const [isThinking, setIsThinking] = useState(false);
  const [thoughtSteps, setThoughtSteps] = useState<ThoughtStep[]>([]);
  const [multiAgentMode, setMultiAgentMode] = useState(false);
  const [agents, setAgents] = useState<string[]>([]);

  const processWithChainOfThought = async (
    apiKey: string,
    model: string,
    chatHistory: ChatMessage[],
    userMessage: string,
    onThoughtStep?: (step: ThoughtStep) => void
  ): Promise<{ success: boolean; response?: string; error?: string }> => {
    setIsThinking(true);
    setThoughtSteps([]);

    try {
      // Step 1: Analizza la domanda
      const analysisPrompt: ChatMessage[] = [
        {
          role: 'system',
          content: 'Sei un assistente che analizza domande complesse passo dopo passo. Descrivi brevemente cosa ti viene chiesto e identifica i sub-problemi.'
        },
        { role: 'user', content: userMessage }
      ];

      const analysisResult = await OpenRouterService.sendMessage(
        apiKey,
        model,
        analysisPrompt,
        ''
      );

      if (!analysisResult.success) {
        throw new Error(analysisResult.error);
      }

      const step1: ThoughtStep = {
        step: 1,
        thought: 'Analisi della domanda',
        reasoning: analysisResult.response || '',
        timestamp: new Date()
      };

      setThoughtSteps([step1]);
      onThoughtStep?.(step1);

      // Step 2: Ragionamento
      const reasoningPrompt: ChatMessage[] = [
        ...chatHistory,
        { role: 'user', content: userMessage },
        {
          role: 'assistant',
          content: `Analisi: ${analysisResult.response}\n\nOra ragioniamo passo dopo passo per rispondere:`
        }
      ];

      const reasoningResult = await OpenRouterService.sendMessage(
        apiKey,
        model,
        reasoningPrompt,
        'Fornisci un ragionamento dettagliato passo dopo passo.'
      );

      const step2: ThoughtStep = {
        step: 2,
        thought: 'Ragionamento dettagliato',
        reasoning: reasoningResult.response || '',
        timestamp: new Date()
      };

      setThoughtSteps(prev => [...prev, step2]);
      onThoughtStep?.(step2);

      // Step 3: Risposta finale
      const finalPrompt: ChatMessage[] = [
        ...reasoningPrompt,
        { role: 'assistant', content: reasoningResult.response || '' },
        {
          role: 'user',
          content: 'Ora fornisci la risposta finale completa e ben strutturata.'
        }
      ];

      const finalResult = await OpenRouterService.sendMessage(
        apiKey,
        model,
        finalPrompt,
        ''
      );

      const step3: ThoughtStep = {
        step: 3,
        thought: 'Risposta finale',
        reasoning: finalResult.response || '',
        timestamp: new Date()
      };

      setThoughtSteps(prev => [...prev, step3]);
      onThoughtStep?.(step3);

      setIsThinking(false);
      return finalResult;
    } catch (error) {
      setIsThinking(false);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Errore nel chain of thought'
      };
    }
  };

  const processMultiAgent = async (
    apiKey: string,
    models: string[],
    chatHistory: ChatMessage[],
    userMessage: string,
    onAgentResponse?: (agent: string, response: string) => void
  ): Promise<{ success: boolean; responses?: Record<string, string>; synthesis?: string; error?: string }> => {
    setMultiAgentMode(true);
    setAgents(models);

    try {
      const responses: Record<string, string> = {};

      // Raccogli risposte da tutti gli agenti
      for (const model of models) {
        const result = await OpenRouterService.sendMessage(
          apiKey,
          model,
          chatHistory,
          userMessage
        );

        if (result.success && result.response) {
          responses[model] = result.response;
          onAgentResponse?.(model, result.response);
        }
      }

      // Sintetizza le risposte
      const synthesisPrompt: ChatMessage[] = [
        {
          role: 'system',
          content: 'Sei un esperto che sintetizza diverse prospettive in una risposta completa e bilanciata.'
        },
        {
          role: 'user',
          content: `Domanda originale: ${userMessage}\n\nRisposte da diversi esperti:\n\n${Object.entries(responses)
            .map(([model, resp]) => `**${model}**:\n${resp}`)
            .join('\n\n---\n\n')}\n\nFornisci una sintesi completa che integri tutte le prospettive:`
        }
      ];

      const synthesisResult = await OpenRouterService.sendMessage(
        apiKey,
        models[0],
        synthesisPrompt,
        ''
      );

      setMultiAgentMode(false);

      return {
        success: true,
        responses,
        synthesis: synthesisResult.response
      };
    } catch (error) {
      setMultiAgentMode(false);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Errore multi-agent'
      };
    }
  };

  return {
    isThinking,
    thoughtSteps,
    multiAgentMode,
    agents,
    processWithChainOfThought,
    processMultiAgent
  };
};
