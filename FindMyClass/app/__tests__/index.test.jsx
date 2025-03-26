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

jest.mock('../../contexts/ThemeContext', () => ({
  useTheme: () => ({ darkMode: false }),
}));

// ✅ Card mock with safe scoped Text import
jest.mock('../../components/Card', () => {
  return function MockCard(props) {
    const { Text } = require('react-native');
    return (
      <Text onPress={props.onPress} testID={props.iconName}>
        {props.title}
      </Text>
    );
  };
});

describe('Home Index Screen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
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
    const { getAllByTestId } = render(<Index />);
    fireEvent.press(getAllByTestId('map')[0]);
    expect(mockNavigate).toHaveBeenCalledWith('index', { campus: 'SGW' });
  });

  it('navigates to Loyola map', () => {
    const { getAllByTestId } = render(<Index />);
    fireEvent.press(getAllByTestId('map')[1]);
    expect(mockNavigate).toHaveBeenCalledWith('index', { campus: 'Loyola' });
  });

  it('navigates to profile', () => {
    const { getByTestId } = render(<Index />);
    fireEvent.press(getByTestId('person'));
    expect(mockNavigate).toHaveBeenCalledWith('screens/profile');
  });

  it('navigates to settings', () => {
    const { getByTestId } = render(<Index />);
    fireEvent.press(getByTestId('settings'));
    expect(mockNavigate).toHaveBeenCalledWith('screens/settings');
  });

  it('navigates to schedule', () => {
    const { getByTestId } = render(<Index />);
    fireEvent.press(getByTestId('calendar'));
    expect(mockNavigate).toHaveBeenCalledWith('screens/schedule');
  });

  it('does not crash on security card press', () => {
    const { getByTestId } = render(<Index />);
    fireEvent.press(getByTestId('lock-closed'));
    expect(mockNavigate).not.toHaveBeenCalledWith('screens/security');
  });
});
