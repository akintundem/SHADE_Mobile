import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  AgentContext as AgentContextType,
  AgentMessage,
  Suggestion,
  agentService,
} from '../services/agentService';

type AgentContextValue = {
  context?: AgentContextType;
  messages: AgentMessage[];
  suggestions: Suggestion[];
  isLoading: boolean;
  error?: string;
  ask: (context?: AgentContextType, message?: string) => Promise<void>;
  setContext: (context: AgentContextType) => void;
  reset: () => void;
};

const AgentContext = createContext<AgentContextValue | undefined>(undefined);

export const AgentProvider = ({ children }: { children: React.ReactNode }) => {
  const [context, setContextState] = useState<AgentContextType | null>(null);
  const [messages, setMessages] = useState<AgentMessage[]>([]);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const messagesRef = useRef<AgentMessage[]>([]);
  const contextRef = useRef<AgentContextType | null>(null);

  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  useEffect(() => {
    contextRef.current = context;
  }, [context]);

  const setContext = useCallback((ctx: AgentContextType) => {
    setContextState(ctx);
  }, []);

  const ask = useCallback(
    async (ctx?: AgentContextType, message?: string) => {
      const resolvedContext = ctx ?? contextRef.current;
      if (!resolvedContext) return;

      if (ctx) {
        setContextState(ctx);
      }

      setIsLoading(true);
      setError(null);

      let workingMessages = messagesRef.current;

      if (message?.trim()) {
        const userMessage: AgentMessage = {
          role: 'user',
          content: message.trim(),
          timestamp: new Date().toISOString(),
        };
        workingMessages = [...workingMessages, userMessage];
        setMessages((prev) => [...prev, userMessage]);
      }

      try {
        const response = await agentService.askAgent(resolvedContext, workingMessages);
        setSuggestions(response.suggestions || []);

        if (message?.trim()) {
          const assistantMessage: AgentMessage = {
            role: 'assistant',
            content: response.reply,
            timestamp: new Date().toISOString(),
          };
          setMessages((prev) => [...prev, assistantMessage]);
        }
      } catch (err) {
        const messageText = err instanceof Error ? err.message : 'Unable to reach agent';
        setError(messageText);
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  const reset = useCallback(() => {
    setMessages([]);
    setSuggestions([]);
    setError(null);
  }, []);

  const value = useMemo(
    () => ({
      context: context ?? undefined,
      messages,
      suggestions,
      isLoading,
      error: error ?? undefined,
      ask,
      setContext,
      reset,
    }),
    [context, messages, suggestions, isLoading, error, ask, setContext, reset],
  );

  return <AgentContext.Provider value={value}>{children}</AgentContext.Provider>;
};

export const useAgent = () => {
  const value = useContext(AgentContext);
  if (!value) {
    throw new Error('useAgent must be used within an AgentProvider');
  }
  return value;
};
