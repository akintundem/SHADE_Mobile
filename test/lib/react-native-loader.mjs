/**
 * Custom Node.js Loader to Mock React Native Modules
 * 
 * This loader intercepts React Native imports and replaces them with mocks
 * before tsx tries to transform them.
 */

export async function resolve(specifier, context, nextResolve) {
  // Intercept react-native imports
  if (specifier === 'react-native' || specifier.startsWith('react-native/')) {
    // Return path to our mock
    return {
      shortCircuit: true,
      url: new URL('../lib/react-native-mock.ts', import.meta.url).href,
    };
  }
  
  // Intercept @react-native imports
  if (specifier.startsWith('@react-native/')) {
    // Return path to our mock (we'll need to handle specific modules)
    return {
      shortCircuit: true,
      url: new URL('../lib/react-native-mock.ts', import.meta.url).href,
    };
  }
  
  // Let Node.js handle other imports
  return nextResolve(specifier, context);
}
