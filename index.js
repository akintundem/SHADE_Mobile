/**
 * @format
 */

/* global globalThis */

// Suppress React Native Firebase modular deprecation warnings
// The modular API has initialization timing issues, so we use the default export
// This is a temporary solution until the timing issue is resolved
if (typeof globalThis !== 'undefined') {
  globalThis.RNFB_SILENCE_MODULAR_DEPRECATION_WARNINGS = true;
}

import { AppRegistry } from 'react-native';
import App from './App';
import { name as appName } from './app.json';

AppRegistry.registerComponent(appName, () => App);
