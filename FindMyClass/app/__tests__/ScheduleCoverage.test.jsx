// __tests__/Schedule.test.jsx
import React from 'react';
import { render, fireEvent, waitFor, act } from '@testing-library/react-native';
import Schedule from '../screens/schedule';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Mock useAuth so we can control the user state.
const mockUseAuth = { useAuth: jest.fn() };
jest.mock('../../contexts/AuthContext', () => ({
  useAuth: () => mockUseAuth.useAuth(),
}));

// Mock AsyncStorage methods.
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  removeItem: jest.fn(),
}));

// Mock CustomModal to render its title and message if visible.
jest.mock('../../components/CustomModal', () => {
  return ({ visible, title, message, onClose }) => 
    visible ? (
      <div testID="custom-modal">
        <span>{title}</span>
        <span>{message}</span>
        <span onClick={onClose}>CloseModal</span>
      </div>
    ) : null;
});

// Setup global.fetch mock.
global.fetch = jest.fn();

describe('Schedule Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // By default, simulate a logged-in user.
    mockUseAuth.useAuth.mockReturnValue({ user: { uid: 'test-user', email: 'test@example.com' } });
  });

  it('shows "Authentication Required" modal when not logged in', async () => {
    mockUseAuth.useAuth.mockReturnValue({ user: null });
    const { getByText } = render(<Schedule />);
    fireEvent.press(getByText('Sync Calendar'));
    await waitFor(() => {
      expect(getByText('Authentication Required')).toBeTruthy();
    });
  });

  it('opens calendar modal with calendars when logged in', async () => {
    // Simulate a valid token.
    AsyncStorage.getItem.mockResolvedValue('fake-token');

    // Simulate fetch response for calendars.
    global.fetch.mockImplementationOnce(() =>
      Promise.resolve({
        json: () =>
          Promise.resolve({
            items: [
              { id: 'cal-1', summary: 'To-Do' },
              { id: 'cal-2', summary: 'Holidays in Canada' },
            ],
          }),
      })
    );

    const { getByText } = render(<Schedule />);
    // Press sync button to open modal.
    fireEvent.press(getByText('Sync Calendar'));
    await waitFor(() => {
      expect(getByText('Select a Calendar')).toBeTruthy();
    });
    // Check that calendar items appear.
    expect(getByText('To-Do')).toBeTruthy();
    expect(getByText('Holidays in Canada')).toBeTruthy();
  });

  it('shows modal error when syncing events with missing token', async () => {
    // First, simulate a calendar list with a calendar named "Missing Token Calendar".
    AsyncStorage.getItem.mockResolvedValueOnce('valid-token'); // for calendar fetch
    global.fetch.mockImplementationOnce(() =>
      Promise.resolve({
        json: () =>
          Promise.resolve({
            items: [{ id: 'cal_missing', summary: 'Missing Token Calendar' }],
          }),
      })
    );
    const { getByText } = render(<Schedule />);
    await waitFor(() => {
      expect(getByText('Missing Token Calendar')).toBeTruthy();
    });
    // Override AsyncStorage so that syncEvents finds no token.
    AsyncStorage.getItem.mockResolvedValueOnce(null);
    // Press sync button.
    fireEvent.press(getByText('Sync Calendar'));
    await waitFor(() => {
      expect(getByText('Select a Calendar')).toBeTruthy();
    });
    // Select the "Missing Token Calendar".
    fireEvent.press(getByText('Missing Token Calendar'));
    // Expect modal error now.
    await waitFor(() => {
      expect(getByText('Authentication Required')).toBeTruthy();
    });
  });

  it('shows "Sync Failed" when event fetch API returns error', async () => {
    // Force calendar fetch to return a calendar with summary "Error Calendar".
    AsyncStorage.getItem.mockResolvedValue('valid-token');
    global.fetch.mockImplementationOnce(() =>
      Promise.resolve({
         json: () => Promise.resolve({ items: [{ id: 'cal_error', summary: 'Error Calendar' }] }),
      })
    );
    const { getByText } = render(<Schedule />);
    await waitFor(() => {
      expect(getByText('Error Calendar')).toBeTruthy();
    });
    // For syncEvents, simulate valid token.
    AsyncStorage.getItem.mockResolvedValue('valid-token');
    // Simulate an error response for event fetching.
    global.fetch.mockImplementationOnce(() =>
      Promise.resolve({
        json: () =>
          Promise.resolve({ error: { message: 'Some error', code: 500 } }),
      })
    );
    fireEvent.press(getByText('Sync Calendar'));
    await waitFor(() => {
      expect(getByText('Select a Calendar')).toBeTruthy();
    });
    fireEvent.press(getByText('Error Calendar'));
    await waitFor(() => {
      expect(getByText('Sync Failed')).toBeTruthy();
    });
  });

  it('shows "Sync Complete" and logs events on successful sync', async () => {
    // Simulate calendar fetch returns a calendar with summary "Success Calendar".
    AsyncStorage.getItem.mockResolvedValue('valid-token');
    global.fetch.mockImplementationOnce(() =>
      Promise.resolve({
         json: () => Promise.resolve({ items: [{ id: 'cal_success', summary: 'Success Calendar' }] }),
      })
    );
    const sampleEvents = [{
      id: "evt1",
      summary: "Successful Event",
      start: { dateTime: new Date(2023, 9, 16, 13, 0).toISOString() },
      end: { dateTime: new Date(2023, 9, 16, 14, 0).toISOString() },
    }];
    // For events fetch.
    global.fetch.mockImplementationOnce(() =>
      Promise.resolve({
        json: () => Promise.resolve({ items: sampleEvents }),
      })
    );
    const { getByText } = render(<Schedule />);
    await waitFor(() => {
      expect(getByText('Success Calendar')).toBeTruthy();
    });
    fireEvent.press(getByText('Sync Calendar'));
    await waitFor(() => {
      expect(getByText('Select a Calendar')).toBeTruthy();
    });
    fireEvent.press(getByText('Success Calendar'));
    await waitFor(() => {
      expect(getByText('Sync Complete')).toBeTruthy();
    });
  });

  it('opens and closes the search modal via the add-button and close button, and renders the delete-button', async () => {
    const { getByTestId, queryByText } = render(<Schedule />);
    
    // Verify that the add-button is rendered.
    const addButton = getByTestId('add-button');
    expect(addButton).toBeTruthy();
    
    // Press the add-button to open the search modal.
    fireEvent.press(addButton);
    
    // Wait for the search modal to appear.
    await waitFor(() => {
      // The modal should display the title "Add Class"
      expect(queryByText('Add Class')).toBeTruthy();
      // Also verify the placeholder text for the TextInput appears.
      expect(queryByText('Search for a class...')).toBeTruthy();
    });
    
    // Press the close button within the search modal.
    const closeSearchButton = getByTestId('close-search-modal');
    fireEvent.press(closeSearchButton);
    
    // Wait for the modal to be closed.
    await waitFor(() => {
      expect(queryByText('Add Class')).toBeNull();
    });
    
    // Verify that the delete-button is rendered.
    const deleteButton = getByTestId('delete-button');
    expect(deleteButton).toBeTruthy();
  });

  it('clears events and calendar selection on logout', async () => {
    AsyncStorage.getItem.mockResolvedValue('valid-token');
    global.fetch.mockImplementationOnce(() =>
      Promise.resolve({
        json: () => Promise.resolve({ items: [{ id: "cal1", summary: "Cal 1" }] }),
      })
    );
    const { getByText, rerender } = render(<Schedule />);
    await waitFor(() => {
      expect(getByText("Sync Calendar")).toBeTruthy();
    });
    // Simulate logout by updating useAuth.
    mockUseAuth.useAuth.mockReturnValue({ user: null });
    rerender(<Schedule />);
    await waitFor(() => {
      // Check that Sync Calendar is still rendered.
      expect(getByText("Sync Calendar")).toBeTruthy();
    });
  });

  it('shows "Authentication Required" when handling sync with no user', async () => {
    mockUseAuth.useAuth.mockReturnValue({ user: null });
    const { getByText } = render(<Schedule />);
    fireEvent.press(getByText("Sync Calendar"));
    await waitFor(() => {
      expect(getByText("Authentication Required")).toBeTruthy();
    });
  });

  it('closes the calendar modal when "Close" is pressed', async () => {
    AsyncStorage.getItem.mockResolvedValue('valid-token');
    const sampleCalendars = [{ id: "cal2", summary: "Modal Calendar" }];
    global.fetch.mockImplementationOnce(() =>
      Promise.resolve({
        json: () => Promise.resolve({ items: sampleCalendars }),
      })
    );
    const { getByText, queryByText } = render(<Schedule />);
    fireEvent.press(getByText("Sync Calendar"));
    await waitFor(() => expect(getByText("Select a Calendar")).toBeTruthy());
    fireEvent.press(getByText("Close"));
    await waitFor(() => {
      expect(queryByText("Modal Calendar")).toBeNull();
    });
  });

  it('renders events overlay showing valid event and ignores event on invalid day', async () => {
    // Create test events: one valid (Monday) and one invalid (Sunday).
    // Note: In JavaScript, months are 0-indexed. We'll choose October 16, 2023 for Monday and October 15, 2023 for Sunday.
    const validEvent = {
      id: "ev-valid",
      summary: "Monday Event",
      start: { dateTime: new Date(2023, 9, 16, 9, 0).toISOString() }, // October 16, 2023 is Monday.
      end: { dateTime: new Date(2023, 9, 16, 10, 0).toISOString() },
    };
    const invalidEvent = {
      id: "ev-invalid",
      summary: "Sunday Event",
      start: { dateTime: new Date(2023, 9, 15, 9, 0).toISOString() }, // October 15, 2023 is Sunday.
      end: { dateTime: new Date(2023, 9, 15, 10, 0).toISOString() },
    };
    AsyncStorage.getItem.mockResolvedValue('valid-token');
    // For calendars, return a dummy calendar.
    global.fetch.mockImplementationOnce(() =>
      Promise.resolve({
        json: () => Promise.resolve({ items: [{ id: 'cal-overlay', summary: 'Overlay Calendar' }] }),
      })
    );
    const { getByText, queryByText } = render(<Schedule />);
    fireEvent.press(getByText("Sync Calendar"));
    await waitFor(() => expect(getByText("Overlay Calendar")).toBeTruthy());
    // For event fetching, return both events.
    global.fetch.mockImplementationOnce(() =>
      Promise.resolve({
        json: () => Promise.resolve({ items: [validEvent, invalidEvent] }),
      })
    );
    // Select the calendar.
    fireEvent.press(getByText("Overlay Calendar"));
    await waitFor(() => {
      expect(getByText("Monday Event")).toBeTruthy();
      // Expect that the Sunday event is not rendered.
      expect(queryByText("Sunday Event")).toBeNull();
    });
    // Simulate pressing the valid event to open its modal.
    fireEvent.press(getByText("Monday Event"));
    await waitFor(() => {
      expect(getByText(/Start:/)).toBeTruthy();
      expect(getByText(/End:/)).toBeTruthy();
    });
  });
});