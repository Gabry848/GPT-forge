import { ChatMessage, Message } from '../hooks/useChat';

export interface ApiResponse {
  success: boolean;
  message?: string;
  error?: string;
}

export class OpenRouterService {
  private static async makeRequest(
    endpoint: string, 
    options: RequestInit = {}
  ): Promise<Response> {
    const response = await fetch(`https://openrouter.ai/api/v1${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'HTTP-Referer': window.location.origin,
        'X-Title': 'GPT Forge',
        ...options.headers,
      },
    });
    
    return response;
  }

  static async sendMessage(
    apiKey: string,
    model: string,
    chatHistory: ChatMessage[],
    userMessage: string
  ): Promise<{ success: boolean; response?: string; error?: string }> {
    try {
      const apiHistory: ChatMessage[] = [
        ...chatHistory,
        { role: 'user', content: userMessage }
      ];

      const response = await this.makeRequest('/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model,
          messages: apiHistory,
          temperature: 0.7,
          max_tokens: 2000,
          stream: false
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.error?.message || `Errore API: ${response.status}`);
      }

      const data = await response.json();
      const botResponse = data.choices?.[0]?.message?.content || 'Nessuna risposta ricevuta';

      return { success: true, response: botResponse };
    } catch (error) {
      console.error('Errore nell\'invio del messaggio:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Si è verificato un errore sconosciuto' 
      };
    }
  }

  static async testCustomModel(
    apiKey: string,
    model: string,
    customPrompt: string
  ): Promise<{ success: boolean; response?: string; error?: string }> {
    try {
      const testMessage = 'Ciao! Presentati brevemente seguendo il tuo ruolo.';
      
      const testHistory: ChatMessage[] = [
        { role: 'system', content: customPrompt.trim() },
        { role: 'user', content: testMessage }
      ];

      const response = await this.makeRequest('/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model,
          messages: testHistory,
          temperature: 0.7,
          max_tokens: 200,
          stream: false
        })
      });

      if (!response.ok) {
        throw new Error(`Errore API: ${response.status}`);
      }
      
      const data = await response.json();
      const botResponse = data.choices?.[0]?.message?.content || 'Nessuna risposta ricevuta';
      
      return { success: true, response: botResponse };
    } catch (error) {
      console.error('Errore nel test del modello:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Errore durante il test del modello'
      };
    }
  }

  static async getModels(): Promise<{ success: boolean; models?: any[]; error?: string }> {
    try {
      const response = await this.makeRequest('/models');
      
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
      
      return { success: true, models };
    } catch (error) {
      console.error('Errore nel caricamento dei modelli:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Impossibile caricare i modelli'
      };
    }
  }
}

export class ChatExportService {
  static exportChatAsJson(
    messages: Message[],
    assistantName: string,
    selectedModel: string
  ): void {
    const chatData = {
      assistant: assistantName,
      model: selectedModel,
      timestamp: new Date().toISOString(),
      messages: messages
    };
    
    const dataStr = JSON.stringify(chatData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `gpt-forge-chat-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    
    URL.revokeObjectURL(url);
  }
}
