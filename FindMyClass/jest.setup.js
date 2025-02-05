import 'react-native-gesture-handler/jestSetup';

// Mock `expo-font`
jest.mock('expo-font', () => ({
  useFonts: () => [true, false], // Mock fonts as loaded
}));

// Mock `expo-splash-screen`
jest.mock('expo-splash-screen', () => ({
  hideAsync: jest.fn(),
  preventAutoHideAsync: jest.fn(),
}));

// Mock `expo-modules-core`
jest.mock('expo-modules-core', () => ({
  NativeModulesProxy: { ExponentDevice: { getPlatformName: () => 'ios' } },
  EventEmitter: jest.fn(),
}));

// Mock `react-native-reanimated`
jest.mock('react-native-reanimated', () => ({
  createAnimatedComponent: jest.fn(),
  useSharedValue: jest.fn(),
  useAnimatedStyle: jest.fn(),
}));

// Mock `@react-navigation/native`
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({
    navigate: jest.fn(),
    dispatch: jest.fn(),
    setParams: jest.fn(),
  }),
  DrawerActions: {
    openDrawer: jest.fn(),
  },
}));

// Mock `expo-router/drawer`
jest.mock('expo-router/drawer', () => ({
  Drawer: ({ children }) => children, // Render children directly
}));

// Mock `react-native-gesture-handler`
jest.mock('react-native-gesture-handler', () => {
  const { View } = require('react-native');
  return {
    GestureHandlerRootView: View,
  };
});

// Mock `react-native-vector-icons`
jest.mock('@expo/vector-icons', () => ({
  MaterialIcons: 'MaterialIcons',
  Ionicons: 'Ionicons',
}));

// Silence React Native logs in Jest
jest.mock('react-native/Libraries/Utilities/Platform', () => ({
  OS: 'ios',
  select: (obj) => obj.ios,
}));