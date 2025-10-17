import React, { createContext, useContext, useMemo, useState } from 'react';
import { askAgent, AgentMessage, AgentContext } from '../services/agentService';

type Suggestion = { type: 'tip' | 'risk' | 'action'; text: string };

type AgentState = {
  messages: AgentMessage[];
  suggestions: Suggestion[];
  ask: (ctx: AgentContext, message?: string) => Promise<void>;
  setContext: (ctx: AgentContext) => void;
  context: AgentContext | null;
};

const AgentCtx = createContext<AgentState | null>(null);

export const AgentProvider = ({ children }: { children: React.ReactNode }) => {
  const [messages, setMessages] = useState<AgentMessage[]>([]);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [context, setContext] = useState<AgentContext | null>(null);

  const ask = async (ctx: AgentContext, message?: string) => {
    if (!ctx) return;
    const next = message ? [...messages, { role: 'user', content: message }] : messages;
    const result = await askAgent(ctx, next);
    if (result?.reply) setMessages([...next, { role: 'assistant', content: result.reply }]);
    if (result?.suggestions) setSuggestions(result.suggestions);
  };

  const value = useMemo(() => ({ messages, suggestions, ask, context, setContext }), [messages, suggestions, context]);
  return <AgentCtx.Provider value={value}>{children}</AgentCtx.Provider>;
};

export const useAgent = () => {
  const ctx = useContext(AgentCtx);
  if (!ctx) throw new Error('useAgent must be used within AgentProvider');
  return ctx;
};


