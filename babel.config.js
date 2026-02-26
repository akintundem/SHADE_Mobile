require('dotenv').config();

const envPlugin = [
  'transform-inline-environment-variables',
  {
    include: [
      'API_BASE_URL',
      'GEOAPIFY_API_KEY',
      'AUTH0_DOMAIN',
      'AUTH0_CLIENT_ID',
      'AUTH0_AUDIENCE',
      'AUTH0_CONNECTION',
    ],
  },
];

module.exports = {
  presets: ['module:@react-native/babel-preset', 'nativewind/babel'],
  plugins: [envPlugin],
};
