import React from 'react';
import { render } from '@testing-library/react-native';
import { expect } from '@testing-library/jest-native';
import TabTwoScreen from '../explore';
import { expect } from '@jest/globals';

// Mock expo-router
jest.mock('expo-router', () => ({
  Link: ({ children }) => children,
  Tabs: ({ children }) => children,
}));

// Mock expo-web-browser
jest.mock('expo-web-browser', () => ({
  openBrowserAsync: jest.fn(),
}));

// Mock components
jest.mock('@/components/ParallaxScrollView', () => ({
  __esModule: true,
  default: ({ children }) => children,
}));

jest.mock('@/components/Collapsible', () => ({
  Collapsible: ({ children }) => children,
}));

jest.mock('@/components/ExternalLink', () => ({
  ExternalLink: ({ children }) => children,
}));

jest.mock('@/components/ThemedText', () => ({
  ThemedText: ({ children }) => children,
}));

jest.mock('@/components/ui/IconSymbol', () => ({
  IconSymbol: () => null,
}));

// Mock navigation
jest.mock('@react-navigation/bottom-tabs', () => ({
  createBottomTabNavigator: () => ({
    Navigator: ({ children }) => children,
    Screen: ({ children }) => children,
  }),
  useBottomTabBarHeight: () => 49,
}));

// Mock safe area context
jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ bottom: 34, top: 47 }),
  SafeAreaProvider: ({ children }) => children,
}));

describe('TabTwoScreen', () => {
  it('renders correctly', () => {
    const { getByText } = render(<TabTwoScreen />);
    expect(getByText('Explore')).toBeTruthy();
  });
});