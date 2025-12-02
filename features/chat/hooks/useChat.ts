import { useState, useCallback } from 'react';
import { Message } from '../components/ChatMessage';
import { VenueCardDTO } from '../../../agent/types/assistant';
import { sampleVenues } from '../data/chatData';
import { aiService } from '../../agent/services/aiService';

interface UseChatProps {
    eventId: string;
    userId: string;
}

interface UseChatReturn {
    messages: Message[];
    isLoading: boolean;
    sendMessage: (text: string) => Promise<void>;
    sendVenueInquiry: (venue: VenueCardDTO) => Promise<void>;
}

export const useChat = ({ eventId, userId }: UseChatProps): UseChatReturn => {
    const [messages, setMessages] = useState<Message[]>([
        {
            id: '1',
            text: "Hey there! 👋 I'm Shade, and I'm so excited to help you plan something special! Whether it's a dreamy wedding, an unforgettable birthday bash, or a professional corporate event, I've got you covered from start to finish.\n\nI can help with venues, guest lists, budgets, invitations, and so much more. What kind of celebration are we planning together? 🎉",
            isUser: false,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
    ]);
    const [isLoading, setIsLoading] = useState(false);

    const sendMessage = useCallback(async (text: string) => {
        if (!text.trim()) return;

        const newMessage: Message = {
            id: Date.now().toString(),
            text: text,
            isUser: true,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };

        setMessages(prev => [...prev, newMessage]);
        setIsLoading(true);

        try {
            const response = await aiService.sendMessage({
                message: text,
                eventId,
                userId
            });

            const aiResponse: Message = {
                id: (Date.now() + 1).toString(),
                text: response.replyText,
                isUser: false,
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            };

            setMessages(prev => [...prev, aiResponse]);

            // TODO: Handle domains/actions from response if needed (e.g. show venues if domain is 'venue')
            // For now, we keep the existing mock logic for venues as a fallback or if specific keywords trigger it
            // But strictly following the user request, we just display the replyText.

        } catch (error: any) {
            console.error('Failed to send message:', error);

            // Handle error message for user
            const errorMessage: Message = {
                id: (Date.now() + 1).toString(),
                text: "I'm having trouble connecting right now. Please try again later.",
                isUser: false,
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                isError: true
            };
            setMessages(prev => [...prev, errorMessage]);

        } finally {
            setIsLoading(false);
        }
    }, [eventId, userId]);

    const sendVenueInquiry = useCallback(async (venue: VenueCardDTO) => {
        // Simulate API call for sending inquiry
        await new Promise(resolve => setTimeout(() => resolve(null), 1000));

        const successMessage: Message = {
            id: Date.now().toString(),
            text: `Perfect! I've sent your inquiry to ${venue.name}. They typically respond within 24 hours. I'll keep you updated on their response!`,
            isUser: false,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
        setMessages(prev => [...prev, successMessage]);
    }, []);

    return {
        messages,
        isLoading,
        sendMessage,
        sendVenueInquiry,
    };
};
