import React from 'react';
import { render, fireEvent, act } from '@testing-library/react-native';
import { NavigationContainer } from '@react-navigation/native';
import { useNavigation, DrawerActions } from '@react-navigation/native';
import Layout from '../_layout';

// Mock Drawer with proper screen options handling
jest.mock('expo-router/drawer', () => {
  const React = require('react');
  return {
    Drawer: {
      Navigator: ({ children, screenOptions }) => {
        const options = screenOptions({ 
          route: { name: 'screens/map' }  // Force map screen for testing
        });
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

// Mock navigation with proper dispatch handling
const mockDispatch = jest.fn();
const mockSetParams = jest.fn();

jest.mock('@react-navigation/native', () => ({
  ...jest.requireActual('@react-navigation/native'),
  useNavigation: () => ({
    dispatch: mockDispatch,
    setParams: mockSetParams,
  }),
  DrawerActions: {
    openDrawer: jest.fn(() => 'openDrawer'),
  },
}));

// Update font mock to allow testing different states
let mockFontsLoaded = true;
let mockFontError = null;

jest.mock('expo-font', () => ({
  useFonts: () => [mockFontsLoaded, mockFontError],
}));

const mockHideAsync = jest.fn();
jest.mock('expo-splash-screen', () => ({
  hideAsync: mockHideAsync
}));

// Mock GestureHandlerRootView
jest.mock('react-native-gesture-handler', () => ({
  GestureHandlerRootView: ({ children }) => children,
}));

describe('Layout Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockFontsLoaded = true;
    mockFontError = null;
    mockHideAsync.mockReset();
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
    
    expect(mockDispatch).toHaveBeenCalledWith(DrawerActions.openDrawer());
  });

  it('updates search text and navigation params', async () => {
    const { getByPlaceholderText } = render(
      <NavigationContainer>
        <Layout />
      </NavigationContainer>
    );
    
    const searchInput = getByPlaceholderText('Search for buildings, locations...');
    fireEvent.changeText(searchInput, 'test search');
    
    expect(mockSetParams).toHaveBeenCalledWith({ searchText: 'test search' });
  });

  it('returns null when fonts are not loaded and no error', () => {
    mockFontsLoaded = false;
    mockFontError = null;
    
    const { container } = render(
      <NavigationContainer>
        <Layout />
      </NavigationContainer>
    );
    
    expect(container.toJSON()).toBeNull();
  });

  it('calls hideAsync when fonts are loaded', async () => {
    mockHideAsync.mockImplementation(() => Promise.resolve());
    
    render(
      <NavigationContainer>
        <Layout />
      </NavigationContainer>
    );

    // Use act to handle the async callback
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 100));
    });
    
    expect(mockHideAsync).toHaveBeenCalled();
  });

  it('calls hideAsync when font error occurs', async () => {
    mockFontsLoaded = false;
    mockFontError = new Error('Font loading error');
    mockHideAsync.mockImplementation(() => Promise.resolve());
    
    render(
      <NavigationContainer>
        <Layout />
      </NavigationContainer>
    );

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 100));
    });
    
    expect(mockHideAsync).toHaveBeenCalled();
  });
});
