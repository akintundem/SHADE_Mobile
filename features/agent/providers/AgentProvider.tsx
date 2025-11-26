import React, { createContext, useContext, useState, ReactNode } from 'react';
import { AgentContext, AgentMessage, AgentResponse, Suggestion } from '../../../shared/services/agentService';

interface AgentProviderState {
  context: AgentContext | null;
  messages: AgentMessage[];
  suggestions: Suggestion[];
  setContext: (context: AgentContext) => void;
  ask: (message: string) => Promise<void>;
}

const AgentContext_ = createContext<AgentProviderState | undefined>(undefined);

export function AgentProvider({ children }: { children: ReactNode }) {
  const [context, setContextState] = useState<AgentContext | null>(null);
  const [messages, setMessages] = useState<AgentMessage[]>([]);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);

  const setContext = (newContext: AgentContext) => {
    setContextState(newContext);
  };

  const ask = async (message: string) => {
    try {
      // Add user message
      const userMessage: AgentMessage = {
        role: 'user',
        content: message,
        timestamp: new Date().toISOString(),
      };
      
      setMessages(prev => [...prev, userMessage]);
      
      // For now, just add a simple response
      const assistantMessage: AgentMessage = {
        role: 'assistant',
        content: 'Agent feature is currently being developed.',
        timestamp: new Date().toISOString(),
      };
      
      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Agent ask error:', error);
    }
  };

  const value: AgentProviderState = {
    context,
    messages,
    suggestions,
    setContext,
    ask,
  };

  return <AgentContext_.Provider value={value}>{children}</AgentContext_.Provider>;
}

export function useAgent(): AgentProviderState {
  const context = useContext(AgentContext_);
  if (context === undefined) {
    throw new Error('useAgent must be used within an AgentProvider');
  }
  return context;
}