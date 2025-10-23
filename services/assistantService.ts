import { http } from './httpClient';
import { 
  ChatRequest, 
  ShadeConversationRequest, 
  ShadeConversationResponse,
  AssistantChatResponse 
} from '../types';

export const assistantService = {
  // Chat with Assistant (BFF)
  async chat(request: ChatRequest) {
    const res = await http.post<AssistantChatResponse>('/api/v1/assistant/chat', request);
    return res.data;
  },

  // Shade AI Conversation
  async shadeChat(request: ShadeConversationRequest) {
    const res = await http.post<ShadeConversationResponse>('/api/v1/assistant/shade/chat', request);
    return res.data;
  },

  // Health check for assistant service
  async healthCheck() {
    const res = await http.get<{ service: string; status: string; timestamp: string }>('/api/v1/assistant/health');
    return res.data;
  },
};
