module.exports = {
  preset: 'jest-expo',
  transformIgnorePatterns: [
    // Update the regex to include react-native-google-places-autocomplete, @mapbox/polyline, and uuid.
    'node_modules/(?!((jest-)?react-native|@react-native(-community)?|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@unimodules/.*|unimodules|sentry-expo|native-base|react-native-svg|react-native-google-places-autocomplete|@mapbox/polyline|uuid)/)'
  ],
  setupFiles: ['<rootDir>/jest.setup.js'],
  moduleNameMapper: {
    '^react-native$': 'react-native',
  },
  collectCoverage: true,
  coverageDirectory: 'coverage',
  coverageReporters: ['json', 'lcov', 'text', 'clover'],
  collectCoverageFrom: [
    'app/**/*.{js,jsx}',
    'components/**/*.{js,jsx}',
    '!**/node_modules/**',
    '!**/coverage/**',
    '!**/jest.setup.js',
    '!**/*.config.js',
    '!**/_layout.jsx',  // Exclude _layout.jsx
    '!**/app/secrets.js' // Exclude secrets.js
  ],
  testPathIgnorePatterns: ['/node_modules/', '/android/', '/ios/'],
};