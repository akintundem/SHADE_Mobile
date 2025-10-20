import React, { createContext, useContext, useMemo, useState, useCallback } from 'react';
import { askAgent, AgentMessage, AgentContext, Suggestion } from '../services/agentService';
import { useAsync } from '../hooks/useAsync';

export interface AgentState {
  messages: AgentMessage[];
  suggestions: Suggestion[];
  isLoading: boolean;
  error: Error | null;
  ask: (ctx: AgentContext, message?: string) => Promise<void>;
  setContext: (ctx: AgentContext) => void;
  clearMessages: () => void;
  context: AgentContext | null;
}

const AgentCtx = createContext<AgentState | null>(null);

export const AgentProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [messages, setMessages] = useState<AgentMessage[]>([]);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [context, setContext] = useState<AgentContext | null>(null);

  const [askState, askActions] = useAsync(
    async (ctx: AgentContext, message?: string) => {
      if (!ctx) throw new Error('Context is required');
      
      const next = message ? [...messages, { role: 'user' as const, content: message }] : messages;
      const result = await askAgent(ctx, next);
      
      if (result?.reply) {
        setMessages([...next, { role: 'assistant' as const, content: result.reply }]);
      }
      
      if (result?.suggestions) {
        setSuggestions(result.suggestions);
      }
      
      return result;
    }
  );

  const ask = useCallback(async (ctx: AgentContext, message?: string) => {
    try {
      await askActions.execute(ctx, message);
    } catch (error) {
      console.error('Failed to ask agent:', error);
    }
  }, [askActions]);

  const clearMessages = useCallback(() => {
    setMessages([]);
    setSuggestions([]);
  }, []);

  const value = useMemo<AgentState>(() => ({
    messages,
    suggestions,
    isLoading: askState.loading,
    error: askState.error,
    ask,
    setContext,
    clearMessages,
    context,
  }), [messages, suggestions, askState.loading, askState.error, ask, setContext, clearMessages, context]);

  return <AgentCtx.Provider value={value}>{children}</AgentCtx.Provider>;
};

export const useAgent = (): AgentState => {
  const ctx = useContext(AgentCtx);
  if (!ctx) {
    throw new Error('useAgent must be used within AgentProvider');
  }
  return ctx;
};


