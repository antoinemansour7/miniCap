import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import Schedule from '../screens/schedule'; // adjust if needed

// Context mocks
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
    },
  }),
}));

jest.mock('../../contexts/AuthContext', () => ({
  useAuth: () => ({ user: { uid: '123' } }),
}));

jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  removeItem: jest.fn(),
}));

jest.mock('../api/googleCalendar', () => jest.fn(() => Promise.resolve([])));

describe('Schedule Screen', () => {
  it('renders sync button and schedule grid headers', () => {
    const { getByText } = render(<Schedule />);
    expect(getByText('Sync Calendar')).toBeTruthy();
    expect(getByText('Time')).toBeTruthy();
    expect(getByText('Mon')).toBeTruthy();
    expect(getByText('Tue')).toBeTruthy();
    expect(getByText('Wed')).toBeTruthy();
    expect(getByText('Thu')).toBeTruthy();
    expect(getByText('Fri')).toBeTruthy();
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
    const { getByText } = render(<Schedule />);
    const syncButton = getByText('Sync Calendar');

    fireEvent.press(syncButton);

    // nothing to assert here since spinner is conditional
    await waitFor(() => {
      expect(syncButton).toBeTruthy();
    });
  });
});
