import { useState, useCallback } from 'react';
import { Message } from '../components/ChatMessage';
import { VenueCardDTO } from '../../../shared/types';
import { sampleVenues } from '../data/chatData';

interface UseChatReturn {
    messages: Message[];
    isLoading: boolean;
    sendMessage: (text: string) => Promise<void>;
    sendVenueInquiry: (venue: VenueCardDTO) => Promise<void>;
}

export const useChat = (): UseChatReturn => {
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
            // TODO: Replace with actual API call
            // const response = await api.chat.sendMessage(text);

            // Simulate network delay
            await new Promise(resolve => setTimeout(resolve, 1000));

            const aiResponse: Message = {
                id: (Date.now() + 1).toString(),
                text: "OMG, congratulations! 💍✨ This is such an exciting time! I found 5 amazing wedding venues that would be perfect for your special day. Take a look and tap on any venue to see more details!",
                isUser: false,
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            };

            setMessages(prev => [...prev, aiResponse]);

            // Simulate venue cards arriving shortly after
            // In a real API, these might come as part of the response or a separate stream
            setTimeout(() => {
                const venueMessage: Message = {
                    id: (Date.now() + 2).toString(),
                    text: "",
                    isUser: false,
                    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                    type: 'venue_card',
                    data: sampleVenues,
                };
                setMessages(prev => [...prev, venueMessage]);
            }, 500);

        } catch (error) {
            console.error('Failed to send message:', error);
            // Handle error state if needed
        } finally {
            setIsLoading(false);
        }
    }, []);

    const sendVenueInquiry = useCallback(async (venue: VenueCardDTO) => {
        // Simulate API call for sending inquiry
        await new Promise(resolve => setTimeout(resolve, 1000));

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
