import '@testing-library/jest-native/extend-expect';

// Mock expo-font
jest.mock('expo-font');

// Mock react-native reanimated
jest.mock('react-native-reanimated', () => {
  const Reanimated = require('react-native-reanimated/mock');
  Reanimated.default.call = () => {};
  return Reanimated;
});
