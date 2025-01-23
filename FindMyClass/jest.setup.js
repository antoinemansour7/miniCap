import 'react-native-gesture-handler/jestSetup';

jest.mock('expo-modules-core', () => ({
  NativeModulesProxy: { ExponentDevice: { getPlatformName: () => 'ios' } },
  EventEmitter: jest.fn(),
}));

jest.mock('react-native-reanimated', () => ({
  createAnimatedComponent: jest.fn(),
  useSharedValue: jest.fn(),
  useAnimatedStyle: jest.fn(),
}));