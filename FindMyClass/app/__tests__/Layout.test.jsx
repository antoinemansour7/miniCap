import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import Layout from '../_layout';
import { DrawerActions } from '@react-navigation/native';

// Mock expo-router/drawer to avoid invalid component errors
jest.mock('expo-router/drawer', () => ({
  Drawer: ({ children }) => <>{children}</>,
}));

// Mock useNavigation to prevent errors in Jest
jest.mock('@react-navigation/native', () => {
  return {
    useNavigation: () => ({
      dispatch: jest.fn(),
      setParams: jest.fn(),
    }),
    DrawerActions: {
      openDrawer: jest.fn(),
    },
  };
});

describe('Layout Component', () => {
  it('renders without crashing', () => {
    const { getByText } = render(<Layout />);
    expect(getByText('Map')).toBeTruthy();
  });

  it('updates search text', () => {
    const { getByPlaceholderText } = render(<Layout />);
    const searchInput = getByPlaceholderText('Search for buildings, locations...');
    
    fireEvent.changeText(searchInput, 'Hall Building');
    expect(searchInput.props.value).toBe('Hall Building');
  });

  it('displays correct drawer items', () => {
    const { getByText } = render(<Layout />);
    expect(getByText('Home')).toBeTruthy();
    expect(getByText('Map')).toBeTruthy();
    expect(getByText('Login')).toBeTruthy();
    expect(getByText('Register')).toBeTruthy();
    expect(getByText('Profile')).toBeTruthy();
  });

  it('opens drawer on menu button press', () => {
    const { getByTestId } = render(<Layout />);
    const menuButton = getByTestId('menu-button');
    fireEvent.press(menuButton);
    expect(DrawerActions.openDrawer).toHaveBeenCalled();
  });
});