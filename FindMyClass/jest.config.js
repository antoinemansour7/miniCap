module.exports = {
  preset: 'jest-expo',
  transform: {
    '^.+\\.[tj]sx?$': 'babel-jest',
    '^.+\\.mjs$': 'babel-jest',
  },
  transformIgnorePatterns: [
    // Update the regex to include react-native-google-places-autocomplete, @mapbox/polyline, uuid, and react-native-maps.
    'node_modules/(?!((jest-)?react-native|@react-native(-community)?|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|react-native-maps|@unimodules/.*|unimodules|sentry-expo|native-base|react-native-svg|react-native-google-places-autocomplete|@mapbox/polyline|uuid|react-native-element-dropdown|firebase|@firebase|expo-auth-session)/)'
  ],
  setupFiles: ['<rootDir>/jest.setup.js'],
  moduleNameMapper: {
    '^react-native$': 'react-native',
    '^../../app/secrets$': '<rootDir>/__mocks__/secrets',
    '^../app/secrets$': '<rootDir>/__mocks__/secrets',
    '^expo-location$': '<rootDir>/__mocks__/expo-location.js',
    // Stub out static assets:
    '\\.(jpg|jpeg|png|gif|svg)$': '<rootDir>/__mocks__/fileMock.js'
  },
  collectCoverage: true,
  coverageDirectory: 'coverage',
  coverageReporters: ['json', 'lcov', 'text', 'clover'],
  collectCoverageFrom: [
    'app/**/*.{js,jsx}',
    'utils/**/*.{js,jsx}',
    '!**/utils/shuttleUtils.js',
    'components/**/*.{js,jsx}',
    '**/__tests__/**/*.{js,jsx}',
    'contexts/**/*.{js,jsx}',
    '!**/node_modules/**',
    '!**/coverage/**',
    '!**/profile.jsx',
    '!**/jest.setup.js',
    '!**/SmartPlannerScreen.jsx',
    '!**/maestro/**',
    '!**/Chatbot.js',
    '!**/CustomAlert.js',
    '!**/*.config.js',
    '!**/_layout.jsx',  // Exclude _layout.jsx
    '!**/styles/**',
    '!**/app/secrets.js' // Exclude secrets.js
  ],
  testPathIgnorePatterns: ['/node_modules/', '/android/', '/ios/'],
};