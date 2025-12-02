import { http } from '../../../common/services/httpClient';
import { 
  ChatRequest, 
  ShadeConversationRequest, 
  ShadeConversationResponse,
  AssistantChatResponse 
} from '../types/assistant';

export const assistantService = {
  // Chat with Assistant (BFF)
  async chat(request: ChatRequest) {
    try {
      const res = await http.post<AssistantChatResponse>('/api/v1/assistant/chat', request);
      return res.data;
    } catch (error) {
      // TODO: Chat service is returning 500 errors - return fallback response
      return {
        reply: "I'm having trouble reaching our planning assistant right now. Please try again shortly.",
        toolUsed: 'fallback',
        data: null,
        showChips: false,
        chatId: request.chatId || 'fallback-chat',
        userId: request.userId || 'unknown',
        eventId: request.eventId,
        ui: null,
        structuredResponse: null,
        uitype: 'chat' as const,
        success: false,
        error: 'Service temporarily unavailable'
      };
    }
  },

  // Shade AI Conversation
  async shadeChat(request: ShadeConversationRequest) {
    try {
      const res = await http.post<ShadeConversationResponse>('/api/v1/assistant/shade/chat', request);
      return res.data;
    } catch (error) {
      // TODO: Shade chat service is returning 500 errors - return fallback response
      return {
        sessionId: request.sessionId,
        message: "I'm having trouble reaching our planning assistant right now. Please try again shortly.",
        intent: 'systemIssue',
        collectedData: null,
        missingFields: null,
        followUpQuestions: null,
        suggestions: null,
        action: null,
        timestamp: null,
        requiresConfirmation: false,
        confirmationMessage: null
      };
    }
  },

  // Health check for assistant service
  async healthCheck() {
    const res = await http.get<{ service: string; status: string; timestamp: string }>('/api/v1/assistant/health');
    return res.data;
  },
};
