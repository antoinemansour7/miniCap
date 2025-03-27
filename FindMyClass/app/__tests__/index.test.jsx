import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import Index from '../screens/index';

const mockNavigate = jest.fn();

jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({ navigate: mockNavigate }),
}));

jest.mock('../../contexts/LanguageContext', () => ({
  useLanguage: () => ({
    t: {
      map: 'Map',
      sgwMap: 'SGW Map',
      loyMap: 'LOY Map',
      profile: 'Profile',
      settings: 'Settings',
      mySchedule: 'My Schedule',
      security: 'Security',
    },
  }),
}));

// Mock ThemeContext once for all tests
jest.mock('../../contexts/ThemeContext', () => ({
  useTheme: jest.fn(),
}));

// ✅ Card mock with safe scoped Text import
jest.mock('../../components/Card', () => {
  return function MockCard(props) {
    const { Text } = require('react-native');
    return (
      <Text onPress={props.onPress} testID={props.testID}>
        {props.title}
      </Text>
    );
  };
});

describe('Home Index Screen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset mock to default (dark mode)
    require('../../contexts/ThemeContext').useTheme.mockReturnValue({ darkMode: true });
  });

  it('renders all card titles', () => {
    const { getByText } = render(<Index />);
    expect(getByText('SGW Map')).toBeTruthy();
    expect(getByText('LOY Map')).toBeTruthy();
    expect(getByText('Profile')).toBeTruthy();
    expect(getByText('Settings')).toBeTruthy();
    expect(getByText('My Schedule')).toBeTruthy();
    expect(getByText('Security')).toBeTruthy();
  });

  it('navigates to SGW map', () => {
    const { getByTestId } = render(<Index />);
    fireEvent.press(getByTestId('sgw-map-card'));
    expect(mockNavigate).toHaveBeenCalledWith('index', { campus: 'SGW' });
  });

  it('navigates to Loyola map', () => {
    const { getByTestId } = render(<Index />);
    fireEvent.press(getByTestId('loy-map-card'));
    expect(mockNavigate).toHaveBeenCalledWith('index', { campus: 'Loyola' });
  });

  it('navigates to profile', () => {
    const { getByTestId } = render(<Index />);
    fireEvent.press(getByTestId('profile-card'));
    expect(mockNavigate).toHaveBeenCalledWith('screens/profile');
  });

  it('navigates to settings', () => {
    const { getByTestId } = render(<Index />);
    fireEvent.press(getByTestId('settings-card'));
    expect(mockNavigate).toHaveBeenCalledWith('screens/settings');
  });

  it('navigates to schedule', () => {
    const { getByTestId } = render(<Index />);
    fireEvent.press(getByTestId('schedule-card'));
    expect(mockNavigate).toHaveBeenCalledWith('screens/schedule');
  });

  it('does not crash on security card press', () => {
    const { getByTestId } = render(<Index />);
    fireEvent.press(getByTestId('security-card'));
    expect(mockNavigate).not.toHaveBeenCalledWith('screens/security');
  });

  it('applies correct dark mode background color', () => {
    const { getByTestId } = render(<Index />);
    const container = getByTestId('index-container');
    const containerStyle = container.props.style[1]; // Accessing the second object in the array
    expect(containerStyle.backgroundColor).toBe('#000'); // Dark mode background color check
  });
  
  it('applies correct dark mode text color', () => {
    const { getByTestId } = render(<Index />);
    const titleText = getByTestId('map-title');
    const titleTextStyle = titleText.props.style[1]; // Accessing the second object in the array
    expect(titleTextStyle.color).toBe('#fff'); // Dark mode text color check
  });

  // Change to light mode for the following tests
  it('applies correct light mode background color', () => {
    require('../../contexts/ThemeContext').useTheme.mockReturnValue({ darkMode: false }); // Switch to light mode
    const { getByTestId } = render(<Index />);
    const container = getByTestId('index-container');
    const containerStyle = container.props.style[1]; // Accessing the second object in the array
    expect(containerStyle.backgroundColor).toBe('#fff'); // Light mode background color check
  });
  
  it('applies correct light mode text color', () => {
    require('../../contexts/ThemeContext').useTheme.mockReturnValue({ darkMode: false }); // Switch to light mode
    const { getByTestId } = render(<Index />);
    const titleText = getByTestId('map-title');
    const titleTextStyle = titleText.props.style[1]; // Accessing the second object in the array
    expect(titleTextStyle.color).toBe('#333'); // Light mode text color check
  });
});
