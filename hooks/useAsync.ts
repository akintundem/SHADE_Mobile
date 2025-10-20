import { useState, useCallback, useRef, useEffect } from 'react';

export interface AsyncState<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
}

export interface AsyncActions<T> {
  execute: (...args: any[]) => Promise<T>;
  reset: () => void;
  setData: (data: T | null) => void;
  setError: (error: Error | null) => void;
}

export interface UseAsyncOptions {
  immediate?: boolean;
  onSuccess?: (data: any) => void;
  onError?: (error: Error) => void;
  resetOnExecute?: boolean;
}

export function useAsync<T = any>(
  asyncFunction: (...args: any[]) => Promise<T>,
  options: UseAsyncOptions = {}
): [AsyncState<T>, AsyncActions<T>] {
  const { immediate = false, onSuccess, onError, resetOnExecute = true } = options;
  
  const [state, setState] = useState<AsyncState<T>>({
    data: null,
    loading: false,
    error: null,
  });

  const isMountedRef = useRef(true);
  const asyncFunctionRef = useRef(asyncFunction);

  // Update the async function ref when it changes
  useEffect(() => {
    asyncFunctionRef.current = asyncFunction;
  }, [asyncFunction]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const execute = useCallback(async (...args: any[]) => {
    if (!isMountedRef.current) return;

    if (resetOnExecute) {
      setState(prev => ({ ...prev, loading: true, error: null }));
    } else {
      setState(prev => ({ ...prev, loading: true }));
    }

    try {
      const result = await asyncFunctionRef.current(...args);
      
      if (isMountedRef.current) {
        setState(prev => ({ ...prev, data: result, loading: false, error: null }));
        onSuccess?.(result);
      }
      
      return result;
    } catch (error) {
      if (isMountedRef.current) {
        const errorObj = error instanceof Error ? error : new Error(String(error));
        setState(prev => ({ ...prev, loading: false, error: errorObj }));
        onError?.(errorObj);
      }
      throw error;
    }
  }, [onSuccess, onError, resetOnExecute]);

  const reset = useCallback(() => {
    if (isMountedRef.current) {
      setState({ data: null, loading: false, error: null });
    }
  }, []);

  const setData = useCallback((data: T | null) => {
    if (isMountedRef.current) {
      setState(prev => ({ ...prev, data }));
    }
  }, []);

  const setError = useCallback((error: Error | null) => {
    if (isMountedRef.current) {
      setState(prev => ({ ...prev, error }));
    }
  }, []);

  // Execute immediately if requested
  useEffect(() => {
    if (immediate) {
      execute();
    }
  }, [immediate, execute]);

  const actions: AsyncActions<T> = {
    execute,
    reset,
    setData,
    setError,
  };

  return [state, actions];
}

// Specialized hooks for common patterns
export function useAsyncCallback<T = any>(
  asyncFunction: (...args: any[]) => Promise<T>,
  options: UseAsyncOptions = {}
) {
  return useAsync(asyncFunction, { ...options, immediate: false });
}

export function useAsyncEffect<T = any>(
  asyncFunction: (...args: any[]) => Promise<T>,
  deps: any[] = [],
  options: UseAsyncOptions = {}
) {
  return useAsync(asyncFunction, { ...options, immediate: true });
}
