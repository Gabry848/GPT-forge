import { useState, useEffect } from 'react';

export interface UsageMetrics {
  totalMessages: number;
  totalTokens: number;
  totalCost: number;
  messagesPerDay: Record<string, number>;
  tokensPerModel: Record<string, number>;
  costPerModel: Record<string, number>;
  assistantUsage: Record<string, number>;
  averageMessageLength: number;
  topKeywords: Array<{ keyword: string; count: number }>;
  conversationCount: number;
  lastUpdated: Date;
}

export interface AnalyticsEntry {
  timestamp: Date;
  messageLength: number;
  model: string;
  assistant: string;
  tokens: number;
  cost: number;
}

const MODEL_PRICING: Record<string, { prompt: number; completion: number }> = {
  'openai/gpt-4': { prompt: 0.03, completion: 0.06 },
  'openai/gpt-4-turbo': { prompt: 0.01, completion: 0.03 },
  'openai/gpt-3.5-turbo': { prompt: 0.0005, completion: 0.0015 },
  'anthropic/claude-3-opus': { prompt: 0.015, completion: 0.075 },
  'anthropic/claude-3-sonnet': { prompt: 0.003, completion: 0.015 },
  'default': { prompt: 0.001, completion: 0.002 }
};

export const useAnalytics = () => {
  const [metrics, setMetrics] = useState<UsageMetrics>({
    totalMessages: 0,
    totalTokens: 0,
    totalCost: 0,
    messagesPerDay: {},
    tokensPerModel: {},
    costPerModel: {},
    assistantUsage: {},
    averageMessageLength: 0,
    topKeywords: [],
    conversationCount: 0,
    lastUpdated: new Date()
  });

  // Carica metriche da localStorage
  useEffect(() => {
    const loadMetrics = () => {
      try {
        const stored = localStorage.getItem('gpt_forge_analytics');
        if (stored) {
          const parsed = JSON.parse(stored);
          setMetrics({
            ...parsed,
            lastUpdated: new Date(parsed.lastUpdated)
          });
        }
      } catch (error) {
        console.error('Error loading analytics:', error);
      }
    };

    loadMetrics();
  }, []);

  const saveMetrics = (updatedMetrics: UsageMetrics) => {
    try {
      localStorage.setItem('gpt_forge_analytics', JSON.stringify(updatedMetrics));
      setMetrics(updatedMetrics);
    } catch (error) {
      console.error('Error saving analytics:', error);
    }
  };

  const trackMessage = (
    message: string,
    model: string,
    assistant: string,
    isUser: boolean
  ) => {
    const today = new Date().toISOString().split('T')[0];
    const estimatedTokens = Math.ceil(message.length / 4); // Stima approssimativa
    const pricing = MODEL_PRICING[model] || MODEL_PRICING['default'];
    const estimatedCost = isUser
      ? (estimatedTokens / 1000) * pricing.prompt
      : (estimatedTokens / 1000) * pricing.completion;

    const updated: UsageMetrics = {
      ...metrics,
      totalMessages: metrics.totalMessages + 1,
      totalTokens: metrics.totalTokens + estimatedTokens,
      totalCost: metrics.totalCost + estimatedCost,
      messagesPerDay: {
        ...metrics.messagesPerDay,
        [today]: (metrics.messagesPerDay[today] || 0) + 1
      },
      tokensPerModel: {
        ...metrics.tokensPerModel,
        [model]: (metrics.tokensPerModel[model] || 0) + estimatedTokens
      },
      costPerModel: {
        ...metrics.costPerModel,
        [model]: (metrics.costPerModel[model] || 0) + estimatedCost
      },
      assistantUsage: {
        ...metrics.assistantUsage,
        [assistant]: (metrics.assistantUsage[assistant] || 0) + 1
      },
      averageMessageLength:
        (metrics.averageMessageLength * metrics.totalMessages + message.length) /
        (metrics.totalMessages + 1),
      lastUpdated: new Date()
    };

    saveMetrics(updated);
  };

  const trackConversation = () => {
    const updated = {
      ...metrics,
      conversationCount: metrics.conversationCount + 1,
      lastUpdated: new Date()
    };
    saveMetrics(updated);
  };

  const updateKeywords = (messages: Array<{ text: string; sender: string }>) => {
    // Estrazione keyword semplificata
    const keywords: Record<string, number> = {};
    const stopWords = new Set([
      'il', 'lo', 'la', 'i', 'gli', 'le', 'un', 'uno', 'una',
      'di', 'a', 'da', 'in', 'con', 'su', 'per', 'tra', 'fra',
      'e', 'o', 'che', 'chi', 'cui', 'è', 'sono', 'sei', 'siamo', 'siete',
      'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
      'of', 'with', 'by', 'from', 'is', 'are', 'was', 'were', 'be', 'been'
    ]);

    messages.forEach(msg => {
      const words = msg.text
        .toLowerCase()
        .replace(/[^\w\s]/g, '')
        .split(/\s+/)
        .filter(w => w.length > 3 && !stopWords.has(w));

      words.forEach(word => {
        keywords[word] = (keywords[word] || 0) + 1;
      });
    });

    const topKeywords = Object.entries(keywords)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 20)
      .map(([keyword, count]) => ({ keyword, count }));

    const updated = {
      ...metrics,
      topKeywords,
      lastUpdated: new Date()
    };

    saveMetrics(updated);
  };

  const resetMetrics = () => {
    const initial: UsageMetrics = {
      totalMessages: 0,
      totalTokens: 0,
      totalCost: 0,
      messagesPerDay: {},
      tokensPerModel: {},
      costPerModel: {},
      assistantUsage: {},
      averageMessageLength: 0,
      topKeywords: [],
      conversationCount: 0,
      lastUpdated: new Date()
    };
    saveMetrics(initial);
  };

  const exportMetrics = () => {
    const dataStr = JSON.stringify(metrics, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `gpt-forge-analytics-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return {
    metrics,
    trackMessage,
    trackConversation,
    updateKeywords,
    resetMetrics,
    exportMetrics
  };
};
