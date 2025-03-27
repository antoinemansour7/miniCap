import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { Text } from 'react-native';
import Card from '../Card';

// Mock Ionicons to avoid native/font loading issues
jest.mock('react-native-vector-icons/Ionicons', () => 'Icon');

// Mock the ThemeContext
jest.mock('../../contexts/ThemeContext', () => ({
  useTheme: jest.fn(),
}));

import { useTheme } from '../../contexts/ThemeContext';

describe('Card component', () => {
  const mockPress = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly in light mode', () => {
    useTheme.mockReturnValue({ darkMode: false });

    const { getByText } = render(
      <Card iconName="home" title="Home" onPress={mockPress} />
    );

    expect(getByText('Home')).toBeTruthy();
  });

  it('renders correctly in dark mode', () => {
    useTheme.mockReturnValue({ darkMode: true });

    const { getByText } = render(
      <Card iconName="moon" title="Dark Mode" onPress={mockPress} />
    );

    expect(getByText('Dark Mode')).toBeTruthy();
  });

  it('calls onPress when pressed', () => {
    useTheme.mockReturnValue({ darkMode: false });

    const { getByText } = render(
      <Card iconName="touch" title="Press Me" onPress={mockPress} />
    );

    // 🔥 simulate press by pressing the text (since it's inside TouchableOpacity)
    fireEvent.press(getByText('Press Me'));

    expect(mockPress).toHaveBeenCalledTimes(1);
  });

  it('renders JSX title properly', () => {
    useTheme.mockReturnValue({ darkMode: false });

    const customTitle = <Text testID="custom-title">Custom</Text>;

    const { getByTestId } = render(
      <Card iconName="settings" title={customTitle} onPress={mockPress} />
    );

    expect(getByTestId('custom-title')).toBeTruthy();
  });
});
