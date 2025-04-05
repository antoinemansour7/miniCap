import React from 'react';
import { render, act, waitFor } from '@testing-library/react-native';
import DirectionsScreen from '../screens/directions';
import { Alert } from 'react-native';

// Correct expo-location mock
jest.mock('expo-location', () => ({
  requestForegroundPermissionsAsync: jest.fn(),
  getLastKnownPositionAsync: jest.fn(),
  getCurrentPositionAsync: jest.fn(),
  watchPositionAsync: jest.fn(),
  Accuracy: { High: 3 },
}));

// Mock expo-router
jest.mock('expo-router', () => ({
  useLocalSearchParams: jest.fn(),
}));
import { useLocalSearchParams } from 'expo-router';
import * as Location from 'expo-location';

// ✅ Define inline component mocks without external variables
jest.mock('../../components/directions/LocationSelector', () => {
  return () => {
    const React = require('react');
    const { Text } = require('react-native');
    return <Text>Location Selector</Text>;
  };
});
jest.mock('../../components/directions/ModalSearchBars', () => {
  return () => {
    const React = require('react');
    const { Text } = require('react-native');
    return <Text>Modal Search Bars</Text>;
  };
});
jest.mock('../../components/directions/SwipeUpModal', () => {
  return () => {
    const React = require('react');
    const { Text } = require('react-native');
    return <Text>Swipe Up Modal</Text>;
  };
});
jest.mock('../../components/directions/DirectionsMap', () => {
  return () => {
    const React = require('react');
    const { Text } = require('react-native');
    return <Text>Directions Map</Text>;
  };
});

// Shuttle utils
jest.mock('../../utils/shuttleUtils', () => ({
  isNearCampus: jest.fn(() => true),
  getNextShuttleTime: jest.fn(() => '12:00 PM'),
  getNextThreeShuttleTimes: jest.fn(() => ['12:00 PM', '12:30 PM', '1:00 PM']),
  LOYOLA_COORDS: { latitude: 45.458, longitude: -73.640 },
  SGW_COORDS: { latitude: 45.497, longitude: -73.578 },
  getLoyolaShuttleStop: jest.fn(() => ({ latitude: 45.458, longitude: -73.641 })),
  getSGWShuttleStop: jest.fn(() => ({ latitude: 45.497, longitude: -73.579 })),
}));

jest.mock('../../components/directions/RouteHandler', () => ({
  fetchRouteData: jest.fn(() =>
    Promise.resolve({
      routes: [{ legs: [{ duration: { value: 600 } }] }],
    })
  ),
  updateRouteInformation: jest.fn((_, __, ___, ____, setRouteSegments, setTransferMarkers, setRouteInfo, setDirections) => {
    setRouteSegments([{ dummy: true }]);
    setTransferMarkers([{ dummy: true }]);
    setRouteInfo({ distance: '1km', duration: '10min' });
    setDirections([{ id: 1, instruction: 'Walk straight' }]);
  }),
}));

jest.mock('../../components/directions/IndoorDirectionsHandler', () => ({
  setupIndoorNavigation: jest.fn(),
  calculatePathCoordinates: jest.fn(() => [{ x: 0, y: 0 }, { x: 1, y: 1 }]),
}));

jest.spyOn(Alert, 'alert').mockImplementation(() => {});

describe('DirectionsScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    Location.requestForegroundPermissionsAsync.mockResolvedValue({ status: 'granted' });
    Location.getLastKnownPositionAsync.mockResolvedValue({
      coords: { latitude: 45.5, longitude: -73.6 },
    });
    Location.getCurrentPositionAsync.mockResolvedValue({
      coords: { latitude: 45.5, longitude: -73.6 },
    });
    Location.watchPositionAsync.mockResolvedValue({ remove: jest.fn() });

    useLocalSearchParams.mockReturnValue({
      destination: JSON.stringify({ latitude: 45.497, longitude: -73.578 }),
      buildingName: 'Hall Building',
    });
  });

  it('renders successfully and loads a walking route', async () => {
    const { getByText } = render(<DirectionsScreen />);
    await act(async () => {
      await waitFor(() => {
        expect(getByText('Directions Map')).toBeTruthy();
      });
    });
    expect(getByText('Location Selector')).toBeTruthy();
  });

  it('shows full screen error when destination param is invalid', () => {
    useLocalSearchParams.mockReturnValue({});
    const { getByText } = render(<DirectionsScreen />);
    expect(getByText('Error: No destination provided.')).toBeTruthy();
  });

  it('triggers shuttle logic when SHUTTLE mode is set', async () => {
    useLocalSearchParams.mockReturnValue({
      destination: JSON.stringify({ latitude: 45.458, longitude: -73.640 }),
      buildingName: 'Loyola',
    });

    const { getByText } = render(<DirectionsScreen />);
    await act(async () => {
      await waitFor(() => {
        expect(getByText('Directions Map')).toBeTruthy();
      });
    });
  });

  it('handles location permission denied error', async () => {
    Location.requestForegroundPermissionsAsync.mockResolvedValueOnce({ status: 'denied' });
    const { getByText } = render(<DirectionsScreen />);
    await act(async () => {
      await waitFor(() => {
        expect(getByText(/Location permission denied/i)).toBeTruthy();
      });
    });
  });

  it('handles fetchRouteData throwing an error gracefully', async () => {
    const mockFetchRoute = require('../../components/directions/RouteHandler').fetchRouteData;
    mockFetchRoute.mockRejectedValueOnce(new Error('API failed'));
    const { getByText } = render(<DirectionsScreen />);
    await act(async () => {
      await waitFor(() => {
        expect(getByText(/API failed/i)).toBeTruthy();
      });
    });
  });

  it('clears error after 5 seconds', async () => {
    const mockFetchRoute = require('../../components/directions/RouteHandler').fetchRouteData;
    mockFetchRoute.mockRejectedValueOnce(new Error('API failed'));
    jest.useFakeTimers();
    const { getByText, queryByText } = render(<DirectionsScreen />);
    await act(async () => {
      await waitFor(() => {
        expect(getByText(/API failed/i)).toBeTruthy();
      });
    });

    act(() => {
      jest.advanceTimersByTime(5000);
    });

    expect(queryByText(/API failed/i)).toBeNull();
    jest.useRealTimers();
  });
});
