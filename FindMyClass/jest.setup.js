import 'react-native-gesture-handler/jestSetup';

// Polyfill for crypto.getRandomValues (needed for uuid)
if (typeof crypto === 'undefined') {
  global.crypto = {
    getRandomValues: (arr) => {
      for (let i = 0; i < arr.length; i++) {
        arr[i] = Math.floor(Math.random() * 256);
      }
      return arr;
    },
  };
} else if (!crypto.getRandomValues) {
  crypto.getRandomValues = (arr) => {
    for (let i = 0; i < arr.length; i++) {
      arr[i] = Math.floor(Math.random() * 256);
    }
    return arr;
  };
}

// Firebase mocks
jest.mock('firebase/app', () => ({
  initializeApp: jest.fn(() => ({})),
}));

jest.mock('firebase/auth', () => ({
  getAuth: jest.fn(() => ({})),
  GoogleAuthProvider: {
    credential: jest.fn(),
  },
  signInWithCredential: jest.fn(() =>
    Promise.resolve({ user: { email: 'test@test.com', displayName: 'Test User' } })
  ),
}));

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
  requireOptionalNativeModule: jest.fn(), // Fix for "requireOptionalNativeModule is not a function"
}));

// Mock `react-native-reanimated`
jest.mock('react-native-reanimated', () => ({
  createAnimatedComponent: jest.fn(),
  useSharedValue: jest.fn(),
  useAnimatedStyle: jest.fn(),
}));

jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

// Mocks for secrets (this mock will be used by modules importing "../secrets")
jest.mock('../secrets', () => ({
  googleCalendarConfig: {
    baseUrl: 'https://www.googleapis.com/calendar/v3/calendars/primary/events',
    params: {
      maxResults: 10,
      orderBy: 'startTime',
      singleEvents: true,
    },
  },
  googleAPIKey: 'test-google-api-key',
  openaiAPIKey: 'test-openai-api-key',
  firebaseConfig: {
    apiKey: 'dummy',
    authDomain: 'dummy.firebaseapp.com',
    projectId: 'dummy',
    storageBucket: 'dummy.appspot.com',
    messagingSenderId: 'dummy',
    appId: 'dummy',
  },
}));

// Additional mocks for other secrets paths (if they are imported elsewhere)
jest.mock('../../app/secrets', () => ({
  googleAPIKey: 'test-google-api-key',
}));

jest.mock('../app/secrets', () => ({
  googleAPIKey: 'test-google-api-key',
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

// Mock `expo-location`
jest.mock('expo-location');

// Mock `axios` for API requests (prevent actual network calls)
jest.mock('axios', () => ({
  create: jest.fn(() => ({
    post: jest.fn().mockResolvedValue({
      data: {
        choices: [{ message: { content: 'Mocked API Response' } }],
      },
    }),
  })),
}));