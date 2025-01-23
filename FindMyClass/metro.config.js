const { getDefaultConfig } = require('expo/metro-config');

module.exports = (() => {
  const config = getDefaultConfig(__dirname);
  
  const { resolver } = config;

  config.resolver = {
    ...resolver,
    extraNodeModules: {
      ...resolver.extraNodeModules,
      '@react-native/js-polyfills': require.resolve('@react-native/js-polyfills'),
    },
  };

  return config;
})();