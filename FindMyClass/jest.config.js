// Updated jest.config.js
module.exports = {
  preset: 'jest-expo',
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native|@react-native(-community)?)|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@unimodules/.*|unimodules|sentry-expo|native-base|react-native-svg)'
  ],
  setupFiles: ['<rootDir>/jest.setup.js'],
  moduleNameMapper: {
    '^react-native$': 'react-native',
  },
  // ✅ Enable Test Coverage Collection
  collectCoverage: true,  
  coverageDirectory: 'coverage',  
  coverageReporters: ['json', 'lcov', 'text', 'clover'],  // ✅ Ensure correct report formats
  collectCoverageFrom: [
    'app/**/*.{js,jsx}', // ✅ Collect coverage for all JS and JSX files in app/
    'components/**/*.{js,jsx}',
    '!**/node_modules/**', // ✅ Exclude node_modules
    '!**/coverage/**', // ✅ Exclude coverage reports
    '!**/jest.setup.js', // ✅ Exclude Jest setup files
    '!**/*.config.js' // ✅ Exclude config files
  ],
  testPathIgnorePatterns: ['/node_modules/', '/android/', '/ios/'],  // ✅ Ignore irrelevant folders
};