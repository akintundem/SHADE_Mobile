import { http } from './httpClient';
import { ApiResponse } from '../types';

export interface ChatRequest {
    message: string;
    eventId: string;
    userId: string;
}

export interface ChatResponse {
    replyText: string;
    eventId: string;
    domains: string[];
}

export const aiService = {
    /**
     * Send a message to the AI Chat endpoint
     * @param request - ChatRequest
     * @returns ChatResponse
     */
    async sendMessage(request: ChatRequest) {
        const res = await http.post<ChatResponse>('/ai/chat', request);
        return res.data;
    },
};
