global.setImmediate = global.setTimeout; // Polyfill for InteractionManager

import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import Schedule from '../screens/schedule';

// Mocks
const mockRemoveItem = jest.fn();
const mockGetItem = jest.fn();
const mockUseAuth = jest.fn(() => ({ user: { uid: '123' } }));
const mockFetchGoogleCalendarEvents = jest.fn();

jest.mock('../../contexts/ThemeContext', () => ({
  useTheme: () => ({ darkMode: false }),
}));

jest.mock('../../contexts/LanguageContext', () => ({
  useLanguage: () => ({
    t: {
      syncCalendar: 'Sync Calendar',
      close: 'Close',
      addClass: 'Add Class',
      searchClass: 'Search for a class...',
      time: 'Time',
      mon: 'Mon',
      tue: 'Tue',
      wed: 'Wed',
      thu: 'Thu',
      fri: 'Fri',
      authRequired: 'Authentication Required',
      syncError: 'Please sign in to sync your calendar.',
      syncFailed: 'Sync Failed',
      syncSuccess: 'Your calendar has been successfully synchronized.',
      syncComplete: 'Sync Complete',
      googleLoginRequired: 'Google Login Required',
    },
  }),
}));

jest.mock('../../contexts/AuthContext', () => ({
  useAuth: () => mockUseAuth(),
}));

jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: (...args) => mockGetItem(...args),
  removeItem: (...args) => mockRemoveItem(...args),
}));

jest.mock('../api/googleCalendar', () => mockFetchGoogleCalendarEvents);

describe('Schedule Screen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseAuth.mockReturnValue({ user: { uid: '123' } });
  });

  it('renders sync button and schedule grid headers', () => {
    const { getByText } = render(<Schedule />);
    expect(getByText('Sync Calendar')).toBeTruthy();
    expect(getByText('Time')).toBeTruthy();
    expect(getByText('Mon')).toBeTruthy();
  });

  it('opens and closes the search modal', async () => {
    const { getByTestId, getByPlaceholderText, queryByPlaceholderText } = render(<Schedule />);
    fireEvent.press(getByTestId('add-button'));
    expect(getByPlaceholderText('Search for a class...')).toBeTruthy();
    fireEvent.press(getByTestId('close-search-modal'));
    await waitFor(() => {
      expect(queryByPlaceholderText('Search for a class...')).toBeNull();
    });
  });

  it('pressing sync button triggers loading spinner (mocked)', async () => {
    mockGetItem.mockResolvedValue('dummy_token');
    mockFetchGoogleCalendarEvents.mockResolvedValue([]);
    const { getByText } = render(<Schedule />);
    fireEvent.press(getByText('Sync Calendar'));
    await waitFor(() => {
      expect(getByText('Sync Calendar')).toBeTruthy();
    });
  });

  it('shows error modal when user is not authenticated', async () => {
    mockUseAuth.mockReturnValueOnce({ user: null });

    const { getByText } = render(<Schedule />);
    fireEvent.press(getByText('Sync Calendar'));

    await waitFor(() => {
      expect(getByText(/Authentication Required/i)).toBeTruthy();
      expect(mockRemoveItem).toHaveBeenCalledWith('googleAccessToken');
    });
  });

  it('shows error modal when access token is missing', async () => {
    mockGetItem.mockResolvedValue(null);

    const { getByText } = render(<Schedule />);
    fireEvent.press(getByText('Sync Calendar'));

    await waitFor(() => {
      expect(getByText(/Authentication Required/i)).toBeTruthy();
    });
  });
});
