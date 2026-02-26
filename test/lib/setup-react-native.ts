/**
 * React Native Setup for Tests
 * 
 * This must be imported FIRST before any other imports that use React Native.
 * It sets up global mocks that will be used when React Native modules are imported.
 */

// Set up global mocks before any React Native imports
if (typeof global !== 'undefined') {
  // Mock Platform
  if (!(global as any).Platform) {
    (global as any).Platform = {
      OS: 'web',
      select: (obj: any) => obj.web || obj.default || obj.ios,
      Version: 1,
    };
  }

  // Mock AsyncStorage
  if (!(global as any).AsyncStorage) {
    const storage: Record<string, string> = {};
    (global as any).AsyncStorage = {
      getItem: async (key: string) => storage[key] || null,
      setItem: async (key: string, value: string) => { storage[key] = value; },
      removeItem: async (key: string) => { delete storage[key]; },
      clear: async () => { Object.keys(storage).forEach(k => delete storage[k]); },
      getAllKeys: async () => Object.keys(storage),
      multiGet: async (keys: string[]) => keys.map(k => [k, storage[k] || null]),
      multiSet: async (pairs: Array<[string, string]>) => {
        pairs.forEach(([k, v]) => { storage[k] = v; });
      },
      multiRemove: async (keys: string[]) => {
        keys.forEach(k => delete storage[k]);
      },
    };
  }
}

// Export mocks for direct import
export const Platform = (global as any).Platform;
export const AsyncStorage = (global as any).AsyncStorage;
