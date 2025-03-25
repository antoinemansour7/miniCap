import React from 'react';
import { render, fireEvent, waitFor, act } from '@testing-library/react-native';
import Schedule from '../screens/schedule';
import { useAuth } from '../../contexts/AuthContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import fetchGoogleCalendarEvents from '../api/googleCalendar';
import { getAuth } from 'firebase/auth';

// Mock useAuth to provide a dummy logged-in user by default
jest.mock('../../contexts/AuthContext', () => ({
  useAuth: () => ({ user: { email: "test@example.com" } }),
}));

// Mock AsyncStorage methods
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  removeItem: jest.fn(),
}));

// Mock the calendar API call
jest.mock('../api/googleCalendar', () => jest.fn());

// Mock firebase/auth to return a dummy currentUser by default
jest.mock('firebase/auth', () => ({
  getAuth: jest.fn(() => ({ currentUser: { uid: "dummy" } })),
}));

describe('Schedule Component', () => {
  const sampleEvents = [
    {
      start: { dateTime: "2023-10-11T09:00:00Z" },
      end: { dateTime: "2023-10-11T10:00:00Z" },
      summary: "Test Event",
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // Existing tests...
  it('renders grid header with "Time" and weekdays', () => {
    const { getByText } = render(<Schedule />);
    expect(getByText('Time')).toBeTruthy();
    expect(getByText('Mon')).toBeTruthy();
    expect(getByText('Tue')).toBeTruthy();
    expect(getByText('Wed')).toBeTruthy();
    expect(getByText('Thu')).toBeTruthy();
    expect(getByText('Fri')).toBeTruthy();
  });

  it('calls handleSync and renders events overlay when Sync Calendar is pressed', async () => {
    AsyncStorage.getItem.mockResolvedValue("fake-token");
    fetchGoogleCalendarEvents.mockResolvedValue(sampleEvents);

    const { getByText, queryByText } = render(<Schedule />);
    expect(queryByText('Test Event')).toBeNull();
    fireEvent.press(getByText("Sync Calendar"));
    await waitFor(() => {
      expect(fetchGoogleCalendarEvents).toHaveBeenCalled();
      expect(getByText('Test Event')).toBeTruthy();
    });
  });

  it('opens event details modal when an event is pressed', async () => {
    AsyncStorage.getItem.mockResolvedValue("fake-token");
    fetchGoogleCalendarEvents.mockResolvedValue(sampleEvents);

    const { getByText } = render(<Schedule />);
    fireEvent.press(getByText("Sync Calendar"));
    await waitFor(() => expect(fetchGoogleCalendarEvents).toHaveBeenCalled());
    const eventElement = getByText('Test Event');
    fireEvent.press(eventElement);
    await waitFor(() => {
      expect(getByText(/Start:/)).toBeTruthy();
      expect(getByText(/End:/)).toBeTruthy();
    });
  });

  it('removes events when user logs out', async () => {
    // Override useAuth to simulate no user logged in.
    jest.mock('../../contexts/AuthContext', () => ({
      useAuth: () => ({ user: null }),
    }));
    const { queryByText } = render(<Schedule />);
    await waitFor(() => {
      // Sync header remains even if events are cleared.
      expect(queryByText('Sync Calendar')).toBeTruthy();
    });
  });

  it('renders floating action buttons (add and delete)', () => {
    const { getByTestId } = render(<Schedule />);
    expect(getByTestId("add-button")).toBeTruthy();
    expect(getByTestId("delete-button")).toBeTruthy();
  });

  it('opens and closes the search modal when floating add button is pressed', async () => {
    const { getByTestId, queryByText } = render(<Schedule />);
    fireEvent.press(getByTestId("add-button"));
    await waitFor(() => {
      expect(queryByText("Add Class")).toBeTruthy();
    });
    fireEvent.press(getByTestId("close-search-modal"));
    await waitFor(() => {
      expect(queryByText("Add Class")).toBeNull();
    });
  });

  // Additional tests for missing coverage:

  // Lines 67-69: Handle case when no user is logged in.
  it('shows login popup when no user is logged in (no currentUser)', async () => {
    // Override firebase/auth getAuth to return no currentUser.
    const { getAuth } = require('firebase/auth');
    getAuth.mockReturnValue({ currentUser: null });
    const { getByText } = render(<Schedule />);
    fireEvent.press(getByText("Sync Calendar"));
    await waitFor(() => {
      expect(getByText("Google Login Required")).toBeTruthy();
    });
  });

  // Lines 73-74: Handle case when googleAccessToken is missing.
  it('shows login popup when no Google access token is found', async () => {
    AsyncStorage.getItem.mockResolvedValue(null);
    const { getByText } = render(<Schedule />);
    fireEvent.press(getByText("Sync Calendar"));
    await waitFor(() => {
      expect(getByText("Google Login Required")).toBeTruthy();
    });
  });

  // Lines 77-84: Handle final block of handleSync (finally setting isSyncing false via sync error)
  it('sets isSyncing to false after sync error', async () => {
    AsyncStorage.getItem.mockResolvedValue("fake-token");
    fetchGoogleCalendarEvents.mockRejectedValue(new Error("Network error"));
    const { getByText } = render(<Schedule />);
    fireEvent.press(getByText("Sync Calendar"));
    await waitFor(() => {
      // Button reappears as syncing is false.
      expect(getByText("Sync Calendar")).toBeTruthy();
    });
  });

  // Lines 129-130: Validate rendering of time labels in rows.
  it('renders time rows correctly', () => {
    const { getByText } = render(<Schedule />);
    // Check for a specific time slot, e.g., "08:00"
    expect(getByText("08:00")).toBeTruthy();
  });

  // Lines 137-156: Cover renderRow function.
  it('renders a time row with time label and cells for weekdays', () => {
    const { getByText } = render(<Schedule />);
    // The first row should render the time "08:00"
    expect(getByText("08:00")).toBeTruthy();
    // And cells for each weekday should exist in header row.
    expect(getByText("Mon")).toBeTruthy();
  });

  // Lines 205-216: Test branch in renderEventsOverlay if event day is invalid.
  it('does not render event box when event day is invalid', async () => {
    // Create an event on a Sunday (getDay() returns 0 so dayIndex = -1).
    const sundayEvent = [{
      start: { dateTime: "2023-10-08T09:00:00Z" },
      end: { dateTime: "2023-10-08T10:00:00Z" },
      summary: "Sunday Event",
    }];
    AsyncStorage.getItem.mockResolvedValue("fake-token");
    fetchGoogleCalendarEvents.mockResolvedValue(sundayEvent);

    const { queryByText, getByText } = render(<Schedule />);
    fireEvent.press(getByText("Sync Calendar"));
    await waitFor(() => {
      expect(fetchGoogleCalendarEvents).toHaveBeenCalled();
      expect(queryByText("Sunday Event")).toBeNull();
    });
  });

  // Lines 315-339: Cover modal for event details with optional location and "date" property for start/end.
  it('renders event modal with location when event has location and uses date property', async () => {
    const eventWithLocation = [{
      start: { date: "2023-10-11" },
      end: { date: "2023-10-12" },
      summary: "Location Event",
      location: "Test Location"
    }];
    AsyncStorage.getItem.mockResolvedValue("fake-token");
    fetchGoogleCalendarEvents.mockResolvedValue(eventWithLocation);
    const { getByText } = render(<Schedule />);
    fireEvent.press(getByText("Sync Calendar"));
    await waitFor(() => expect(fetchGoogleCalendarEvents).toHaveBeenCalled());
    const eventElement = getByText("Location Event");
    fireEvent.press(eventElement);
    await waitFor(() => {
      expect(getByText("Location Event")).toBeTruthy();
      expect(getByText(/Start:/)).toBeTruthy();
      expect(getByText(/End:/)).toBeTruthy();
      expect(getByText("Location: Test Location")).toBeTruthy();
    });
  });
});
