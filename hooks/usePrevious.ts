import { useRef, useEffect } from 'react';

export function usePrevious<T>(value: T): T | undefined {
  const ref = useRef<T>();
  
  useEffect(() => {
    ref.current = value;
  });
  
  return ref.current;
}

export function usePreviousValue<T>(value: T): T | undefined {
  return usePrevious(value);
}
