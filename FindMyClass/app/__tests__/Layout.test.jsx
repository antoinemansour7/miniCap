// __tests__/Layout.test.jsx

// === MOCK: Override @react-navigation/native and define the mock navigation inside the factory ===
jest.mock('@react-navigation/native', () => {
  const ActualNav = jest.requireActual('@react-navigation/native');
  const mockNavigation = {
    dispatch: jest.fn(),
    setParams: jest.fn(),
  };
  // Make this object available to tests via the global object.
  global.mockNavigation = mockNavigation;
  return {
    ...ActualNav,
    useNavigation: () => mockNavigation,
    DrawerActions: {
      openDrawer: jest.fn(() => 'openDrawer'),
    },
  };
});

// === MOCK: Provide a fake Drawer from expo-router/drawer ===
jest.mock('expo-router/drawer', () => {
  const React = require('react');
  return {
    Drawer: {
      Navigator: ({ children, screenOptions }) => {
        const options = screenOptions({ route: { name: 'screens/map' } });
        return (
          <>
            {options.headerRight?.()}
            {options.headerTitle?.()}
            {children}
          </>
        );
      },
      Screen: ({ children }) => children,
    },
  };
});

import React from 'react';
import { render, fireEvent, act, waitFor } from '@testing-library/react-native';
import { NavigationContainer, DrawerActions } from '@react-navigation/native';
import Layout from '../_layout';
import * as SplashScreen from 'expo-splash-screen';
import * as Font from 'expo-font';

// === MOCK: Control expo-font behavior ===
let mockFontsLoaded = true;
let mockFontError = null;
jest.mock('expo-font', () => ({
  useFonts: () => [mockFontsLoaded, mockFontError],
}));

// === MOCK: Spy on expo-splash-screen.hideAsync ===
const mockHideAsync = jest.fn();
jest.mock('expo-splash-screen', () => ({
  hideAsync: mockHideAsync,
}));

describe('Layout Component', () => {
  beforeEach(() => {
    // Reset all mocks and state variables.
    jest.clearAllMocks();
    // Reset the navigation mock (attached as global.mockNavigation).
    global.mockNavigation.dispatch.mockClear();
    global.mockNavigation.setParams.mockClear();
    mockFontsLoaded = true;
    mockFontError = null;
  });

  it('renders without crashing', () => {
    const { getByTestId } = render(
      <NavigationContainer>
        <Layout />
      </NavigationContainer>
    );
    expect(getByTestId('menu-button')).toBeTruthy();
  });

  it('opens drawer when menu button is pressed', () => {
    const { getByTestId } = render(
      <NavigationContainer>
        <Layout />
      </NavigationContainer>
    );
    const menuButton = getByTestId('menu-button');
    fireEvent.press(menuButton);
    // Expect that the mock navigation's dispatch was called with DrawerActions.openDrawer()
    expect(global.mockNavigation.dispatch).toHaveBeenCalledWith(DrawerActions.openDrawer());
  });

  it('updates search text and navigation params', async () => {
    const { getByPlaceholderText } = render(
      <NavigationContainer>
        <Layout />
      </NavigationContainer>
    );
    const searchInput = getByPlaceholderText('Search for buildings, locations...');
    await act(async () => {
      fireEvent.changeText(searchInput, 'test search');
    });
    expect(global.mockNavigation.setParams).toHaveBeenCalledWith({ searchText: 'test search' });
  });

  it('returns null when fonts are not loaded and no error', () => {
    // Expect Layout to return null if fonts aren’t loaded.
    mockFontsLoaded = false;
    mockFontError = null;
    const { toJSON } = render(
      <NavigationContainer>
        <Layout />
      </NavigationContainer>
    );
    expect(toJSON()).toBeNull();
  });

  it('calls hideAsync when fonts are loaded after being not loaded', async () => {
    // Render initially with fonts not loaded.
    mockFontsLoaded = false;
    const { rerender } = render(
      <NavigationContainer>
        <Layout />
      </NavigationContainer>
    );
    // Now simulate that fonts become loaded.
    mockFontsLoaded = true;
    rerender(
      <NavigationContainer>
        <Layout />
      </NavigationContainer>
    );
    await waitFor(() => {
      expect(mockHideAsync).toHaveBeenCalled();
    });
  });

  it('calls hideAsync when a font error occurs after being not loaded', async () => {
    // Render initially with fonts not loaded.
    mockFontsLoaded = false;
    const { rerender } = render(
      <NavigationContainer>
        <Layout />
      </NavigationContainer>
    );
    // Now simulate a font error.
    mockFontError = new Error('Font loading error');
    rerender(
      <NavigationContainer>
        <Layout />
      </NavigationContainer>
    );
    await waitFor(() => {
      expect(mockHideAsync).toHaveBeenCalled();
    });
  });
});