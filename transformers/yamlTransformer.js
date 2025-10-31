const upstreamTransformer = require('@react-native/metro-babel-transformer');
const yaml = require('yaml');

function transformYaml(sourceText) {
  try {
    const parsed = yaml.parse(sourceText);
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch (error) {
    console.warn('⚠️  Failed to parse dev-config.yml:', error?.message || error);
    return {};
  }
}

module.exports.transform = function ({ src, filename, options }) {
  if (filename.endsWith('.yml') || filename.endsWith('.yaml')) {
    const parsed = transformYaml(src);
    return {
      code: `module.exports = ${JSON.stringify(parsed)};`,
      map: { mappings: '' },
    };
  }

  return upstreamTransformer.transform({ src, filename, options });
};
