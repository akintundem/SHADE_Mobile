import React, { createContext, useContext, ReactNode } from 'react';
import { AgentContext, AgentMessage, Suggestion } from '../../../shared/services/agentService';

interface AgentProviderState {
  context: AgentContext | null;
  messages: AgentMessage[];
  suggestions: Suggestion[];
  setContext: (context: AgentContext) => void;
  ask: (message: string) => Promise<void>;
}

const defaultState: AgentProviderState = {
  context: null,
  messages: [],
  suggestions: [],
  setContext: () => {},
  ask: async () => {},
};

const AgentContext_ = createContext<AgentProviderState>(defaultState);

export function AgentProvider({ children }: { children: ReactNode }) {
  return <AgentContext_.Provider value={defaultState}>{children}</AgentContext_.Provider>;
}

export function useAgent(): AgentProviderState {
  return useContext(AgentContext_);
}
