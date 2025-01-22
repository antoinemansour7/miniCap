jest.mock('expo-modules-core', () => ({
  NativeModulesProxy: {
    ExponentDevice: {
      getPlatformName: () => 'ios',
    },
  },
  EventEmitter: {
    setNativeEventEmitter: () => {},
  },
}));

jest.mock('react-native-reanimated', () => ({
  default: {
    createAnimatedComponent: jest.fn(),
    Value: jest.fn(),
  },
}));

jest.mock('react-native/Libraries/Animated/NativeAnimatedHelper');