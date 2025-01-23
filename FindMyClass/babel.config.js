module.exports = function (api) {
  api.cache(true);
  return {
    presets: [
      'babel-preset-expo', // The new standard for Expo projects
      '@babel/preset-typescript', // Optional if using TypeScript
    ],
    plugins: [
      'react-native-reanimated/plugin', // Add this only if you use Reanimated
    ],
  };
};