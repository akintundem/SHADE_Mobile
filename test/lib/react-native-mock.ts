/**
 * React Native Mock for Node.js Test Environment
 * 
 * This file provides mocks for React Native modules that are not available
 * in Node.js. Vitest will use this via alias configuration.
 */

// Mock Platform
export const Platform = {
  OS: 'web' as const,
  select: <T>(obj: { [key: string]: T }): T | undefined => {
    return obj.web || obj.default || obj.ios;
  },
  Version: 1,
};

// Mock AsyncStorage
const storage: Record<string, string> = {};

export const AsyncStorage = {
  getItem: async (key: string): Promise<string | null> => {
    return storage[key] || null;
  },
  setItem: async (key: string, value: string): Promise<void> => {
    storage[key] = value;
  },
  removeItem: async (key: string): Promise<void> => {
    delete storage[key];
  },
  clear: async (): Promise<void> => {
    Object.keys(storage).forEach(k => delete storage[k]);
  },
  getAllKeys: async (): Promise<string[]> => {
    return Object.keys(storage);
  },
  multiGet: async (keys: string[]): Promise<Array<[string, string | null]>> => {
    return keys.map(key => [key, storage[key] || null]);
  },
  multiSet: async (keyValuePairs: Array<[string, string]>): Promise<void> => {
    keyValuePairs.forEach(([key, value]) => {
      storage[key] = value;
    });
  },
  multiRemove: async (keys: string[]): Promise<void> => {
    keys.forEach(key => delete storage[key]);
  },
};

// Default export for default imports
export default {
  Platform,
  AsyncStorage,
};
