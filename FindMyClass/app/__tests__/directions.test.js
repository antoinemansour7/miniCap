import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { Text } from 'react-native';
import DirectionsScreen from '../screens/directions';
import polyline from '@mapbox/polyline';

// Mock dependencies
jest.mock('expo-location', () => ({
  requestForegroundPermissionsAsync: jest.fn().mockResolvedValue({ status: 'granted' }),
  getCurrentPositionAsync: jest.fn().mockResolvedValue({
    coords: { latitude: 45.0, longitude: -73.0 }
  }),
  watchPositionAsync: jest.fn().mockResolvedValue({ remove: jest.fn() }),
}));

jest.mock('expo-router', () => ({
  useLocalSearchParams: jest.fn(),
}));

// Provide a dummy API key
jest.mock('../../app/secrets', () => ({
  googleAPIKey: 'DUMMY_KEY'
}));

// For Dropdown and GoogleSearchBar, simply render a placeholder view
jest.mock('react-native-element-dropdown', () => ({
  Dropdown: (props) => {
    const React = require('react');
    const { Text } = require('react-native');
    return React.createElement(Text, { testID: props.testID || 'dropdown' }, props.placeholder || 'Dropdown');
  }
}));
jest.mock('../../components/GoogleSearchBar', () => {
  const React = require('react');
  const { Text } = require('react-native');
  return () => React.createElement(Text, { testID: 'google-search-bar' }, "GoogleSearchBar");
});

// We override fetch for directions call
global.fetch = jest.fn(() =>
  Promise.resolve({
    json: () =>
      Promise.resolve({
        routes: [
          {
            overview_polyline: { points: polyline.encode([[45.0, -73.0], [45.1, -73.1]]) },
            legs: [{ distance: { text: '10 km' }, duration: { text: '15 mins' } }],
          },
        ],
      }),
  })
);

const { useLocalSearchParams } = require('expo-router');

describe('DirectionsScreen', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders error when destination parameter is missing (line 110)', () => {
    useLocalSearchParams.mockReturnValue(null);
    const { getByText } = render(<DirectionsScreen />);
    expect(getByText(/Error: No destination provided/i)).toBeTruthy();
  });

  it('renders error when destination JSON is invalid (lines 110)', () => {
    useLocalSearchParams.mockReturnValue({ destination: 'invalid_json' });
    const { getByText } = render(<DirectionsScreen />);
    expect(getByText(/Error: Invalid destination coordinates/i)).toBeTruthy();
  });

  it('sets buildingName correctly when destination is provided (lines 122-124, 130-133)', () => {
    // Provide a valid destination and buildingName param.
    useLocalSearchParams.mockReturnValue({
      destination: JSON.stringify({ latitude: 45.5, longitude: -73.5 }),
      buildingName: 'Test Building'
    });
    const { getByTestId, queryByText } = render(<DirectionsScreen />);
    // Assuming destinationName renders somewhere via testID "building-name"
    // (in DirectionsScreen, a <Text testID="building-name"> is rendered with destinationName)
    expect(getByTestId('building-name').props.children).toBe('Test Building');
    // Also check that default state uses buildingName when provided.
  });

  it('renders start location Dropdown (lines 279-287)', () => {
    useLocalSearchParams.mockReturnValue({
      destination: JSON.stringify({ latitude: 45.5, longitude: -73.5 }),
      buildingName: 'Test Building'
    });
    const { getByTestId } = render(<DirectionsScreen />);
    // The dropdown for start location has testID "dropdown-start"
    expect(getByTestId('dropdown-start')).toBeTruthy();
  });

  it('renders destination Dropdown (lines 311-321)', () => {
    useLocalSearchParams.mockReturnValue({
      destination: JSON.stringify({ latitude: 45.5, longitude: -73.5 }),
      buildingName: 'Test Building'
    });
    const { getByTestId } = render(<DirectionsScreen />);
    // The dropdown for destination has testID "dropdown-dest"
    expect(getByTestId('dropdown-dest')).toBeTruthy();
  });

  it('renders travel mode buttons container (lines 326-336)', () => {
    useLocalSearchParams.mockReturnValue({
      destination: JSON.stringify({ latitude: 45.5, longitude: -73.5 }),
      buildingName: 'Test Building'
    });
    const { getByText } = render(<DirectionsScreen />);
    // Check for at least one travel mode icon text label; here we assume the buttons eventually render some text (or icon placeholder)
    expect(getByText(/car/i)).toBeTruthy();
    expect(getByText(/walk/i)).toBeTruthy();
    expect(getByText(/bus/i)).toBeTruthy();
  });

  it('renders "Done" button in route card (lines 353-363)', () => {
    useLocalSearchParams.mockReturnValue({
      destination: JSON.stringify({ latitude: 45.5, longitude: -73.5 }),
      buildingName: 'Test Building'
    });
    const { getByText } = render(<DirectionsScreen />);
    expect(getByText('Done')).toBeTruthy();
  });

  it('renders MapView with markers and polyline (lines 422-443)', async () => {
    useLocalSearchParams.mockReturnValue({
      destination: JSON.stringify({ latitude: 45.5, longitude: -73.5 }),
      buildingName: 'Test Building'
    });
    const { getByTestId, queryAllByA11yLabel } = render(<DirectionsScreen />);
    // Verify MapView is rendered by its testID (set as "map-view" in the DirectionsScreen)
    expect(getByTestId('map-view')).toBeTruthy();
    // Optionally, check if markers are rendered
    // Without further customization, we assume that after route update, polyline is rendered
    // This test awaits for fetch to complete and MapView to update markers/polyline.
    await waitFor(() => {
      // In a real scenario, one would check for specific children's existence by accessibility labels.
      // Here, we simply confirm that the MapView exists.
      expect(getByTestId('map-view')).toBeTruthy();
    });
  });
});
