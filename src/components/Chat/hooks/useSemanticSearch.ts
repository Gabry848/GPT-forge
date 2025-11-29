import { useState } from 'react';
import { ChatHistory } from './useChat';

export interface SearchResult {
  chatId: string;
  score: number;
  messages: Array<{ text: string; sender: string }>;
  timestamp: Date;
  assistant: string;
}

export const useSemanticSearch = () => {
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // Ricerca semplice basata su keyword con scoring
  const search = async (query: string, chatHistory: ChatHistory[]) => {
    setIsSearching(true);

    try {
      const keywords = query.toLowerCase().split(/\s+/).filter(k => k.length > 2);
      const results: SearchResult[] = [];

      chatHistory.forEach(chat => {
        let score = 0;
        const chatText = chat.messages.map(m => m.text).join(' ').toLowerCase();

        keywords.forEach(keyword => {
          const occurrences = (chatText.match(new RegExp(keyword, 'g')) || []).length;
          score += occurrences * 10;

          // Bonus per keyword nel contesto
          if (chatText.includes(keyword)) {
            score += 5;
          }
        });

        // Bonus per match esatto di frasi
        if (chatText.includes(query.toLowerCase())) {
          score += 50;
        }

        if (score > 0) {
          results.push({
            chatId: chat.id,
            score,
            messages: chat.messages.slice(0, 3), // Prime 3 messaggi come preview
            timestamp: chat.timestamp,
            assistant: chat.assistant
          });
        }
      });

      // Ordina per score decrescente
      results.sort((a, b) => b.score - a.score);

      setSearchResults(results);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setIsSearching(false);
    }
  };

  const clearResults = () => {
    setSearchResults([]);
  };

  return {
    searchResults,
    isSearching,
    search,
    clearResults
  };
};
