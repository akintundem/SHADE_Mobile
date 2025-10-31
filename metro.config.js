const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');

/**
 * Metro configuration
 * https://reactnative.dev/docs/metro
 *
 * @type {import('@react-native/metro-config').MetroConfig}
 */
const defaultConfig = getDefaultConfig(__dirname);

defaultConfig.transformer = defaultConfig.transformer || {};
defaultConfig.transformer.babelTransformerPath = require.resolve('./transformers/yamlTransformer');

defaultConfig.resolver = defaultConfig.resolver || {};
defaultConfig.resolver.sourceExts = Array.from(
  new Set([...(defaultConfig.resolver.sourceExts || []), 'yml', 'yaml'])
);

const config = {
  server: {
    port: 8082,
  },
};

module.exports = mergeConfig(defaultConfig, config);
