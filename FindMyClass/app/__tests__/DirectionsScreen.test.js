import React from 'react';
import { render, act, waitFor, fireEvent } from '@testing-library/react-native';
import DirectionsScreen from '../screens/directions';
import { Alert } from 'react-native';
import * as Location from 'expo-location';

// Mock dependencies
jest.mock('expo-router', () => ({
  useLocalSearchParams: jest.fn(() => ({
    destination: JSON.stringify({ latitude: 45.497092, longitude: -73.579037 }),
    buildingName: 'Hall Building',
  })),
  useRouter: jest.fn(),
}));

jest.mock('react-native-maps', () => {
  const { View } = require('react-native');
  const MockMapView = (props) => <View testID="map-view" {...props}>{props.children}</View>;
  MockMapView.fitToCoordinates = jest.fn();
  MockMapView.animateToRegion = jest.fn();
  MockMapView.Marker = (props) => <View testID="marker" {...props}>{props.children}</View>;
  MockMapView.Polyline = (props) => <View testID="polyline" {...props}>{props.children}</View>;
  MockMapView.Circle = (props) => <View testID="circle" {...props} />;
  return {
    __esModule: true,
    default: MockMapView,
    Marker: MockMapView.Marker,
    Polyline: MockMapView.Polyline,
    Circle: MockMapView.Circle,
    Overlay: () => null,
    Polygon: () => null,
  };
});

jest.mock('expo-location', () => ({
  requestForegroundPermissionsAsync: jest.fn(() => Promise.resolve({ status: 'granted' })),
  getCurrentPositionAsync: jest.fn(() => Promise.resolve({
    coords: { latitude: 45.497092, longitude: -73.579037 },
  })),
  getLastKnownPositionAsync: jest.fn(() => Promise.resolve({
    coords: { latitude: 45.497092, longitude: -73.579037 },
  })),
  watchPositionAsync: jest.fn(() => Promise.resolve({ remove: jest.fn() })),
}));

jest.mock('@mapbox/polyline', () => ({
  decode: jest.fn(() => [[45.497092, -73.579037], [45.497243, -73.578208]]),
}));

jest.mock('pathfinding', () => ({
  AStarFinder: jest.fn(() => ({
    findPath: jest.fn(() => [[0, 0], [1, 1]]),
  })),
  Grid: jest.fn(() => ({
    setWalkableAt: jest.fn(),
    clone: jest.fn(() => ({})),
  })),
}));

jest.mock('../../components/directions/LocationSelector', () => () => null);
jest.mock('../../components/directions/ModalSearchBars', () => () => null);
jest.mock('../../components/directions/SwipeUpModal', () => () => null);
jest.mock('../../components/FloorPlans', () => () => null);
jest.mock('../../components/FloorSelector', () => () => null);

const mockGrid = [[{ latitude: 45.497, longitude: -73.579 }], [{ latitude: 45.498, longitude: -73.580 }]];
jest.mock('../../components/rooms/HallBuildingRooms', () => ({
  hallBuilding: { latitude: 45.497092, longitude: -73.579037 },
  hallBuildingFloors: [1, 2, 3],
  getStartLocationHall: jest.fn(() => ({ location: { x: 0, y: 0 } })),
  getStairsHall: jest.fn(() => [{ location: { x: 1, y: 1 } }]),
  getElevatorsHall: jest.fn(),
  floorGridsHall: { 1: [[0, 1], [1, 0]], 2: [[0, 1], [1, 0]], 8: [[0, 1], [1, 0]] },
  transformFloorGridsHall: jest.fn(() => mockGrid),
}));

jest.mock('../../components/rooms/JMSBBuildingRooms', () => ({
  jmsbBuilding: { latitude: 45.495587, longitude: -73.577855 },
  jmsbBounds: {},
  jmsbFlippedGrid: {},
  getStairsMB: jest.fn(() => [{ location: { x: 1, y: 1 } }]),
  getElevatorsMB: jest.fn(),
  floorGridsMB: { 1: [[0, 1], [1, 0]], 2: [[0, 1], [1, 0]], 8: [[0, 1], [1, 0]] },
  getStartLocationJSMB: jest.fn(() => ({ location: { x: 0, y: 0 } })),
  transformFloorGridsMB: jest.fn(() => mockGrid),
}));

jest.mock('../../components/rooms/VanierBuildingRooms', () => ({
  vanierBuilding: { latitude: 45.459224, longitude: -73.638464 },
  vanierBounds: {},
  vanierFlippedGrid: {},
  getStairsVL: jest.fn(() => [{ location: { x: 1, y: 1 } }]),
  getElevatorsVL: jest.fn(),
  floorGridsVL: { 1: [[0, 1], [1, 0]], 2: [[0, 1], [1, 0]], 8: [[0, 1], [1, 0]] },
  getStartLocationVanier: jest.fn(() => ({ location: { x: 0, y: 0 } })),
  transformFloorGridsVL: jest.fn(() => mockGrid),
}));

jest.mock('../../components/rooms/CCBuildingRooms', () => ({
  ccBuilding: { latitude: 45.458220, longitude: -73.640417 },
  ccBounds: {},
  ccFlippedGrid: {},
  getStairsCC: jest.fn(() => [{ location: { x: 1, y: 1 } }]),
  getElevatorsCC: jest.fn(),
  floorGridsCC: { 1: [[0, 1], [1, 0]], 2: [[0, 1], [1, 0]], 8: [[0, 1], [1, 0]] },
  getStartLocationCC: jest.fn(() => ({ location: { x: 0, y: 0 } })),
  transformFloorGridsCC: jest.fn(() => mockGrid),
}));

jest.mock('../../utils/indoorUtils', () => ({
  floorGrid: {},
  getFloorPlanBounds: jest.fn(),
  convertGridForPathfinding: jest.fn(() => ({
    setWalkableAt: jest.fn(),
    clone: jest.fn(() => ({})),
  })),
  getPolygonBounds: jest.fn(),
  gridLines: {},
  horizontallyFlippedGrid: {},
  verticallyFlippedGrid: {},
  rotatedGrid: {},
  gridMapping: {},
  getClassCoordinates: jest.fn(() => ({ latitude: 45.497092, longitude: -73.579037 })),
  getFloorNumber: jest.fn(() => '1'),
}));

jest.mock('../../utils/shuttleUtils', () => ({
  isNearCampus: jest.fn(() => true),
  getNextShuttleTime: jest.fn(() => '10:30 AM'),
  LOYOLA_COORDS: { latitude: 45.458424, longitude: -73.640259 },
  SGW_COORDS: { latitude: 45.495729, longitude: -73.578041 },
}));

global.fetch = jest.fn(() =>
  Promise.resolve({
    json: () => Promise.resolve({
      routes: [{
        legs: [{
          distance: { text: '1.2 km' },
          duration: { text: '15 mins' },
          steps: [{
            html_instructions: 'Walk north',
            distance: { text: '100 m' },
            duration: { text: '2 mins' },
            travel_mode: 'WALKING',
            polyline: { points: 'abc' },
          }],
        }],
      }],
    }),
  })
);

describe('DirectionsScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    jest.spyOn(Alert, 'alert').mockImplementation(() => {});
    require('expo-router').useLocalSearchParams.mockReturnValue({
      destination: JSON.stringify({ latitude: 45.497092, longitude: -73.579037 }),
      buildingName: 'Hall Building',
    });
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  test('renders without crashing', async () => {
    const { getByTestId } = render(<DirectionsScreen />);
    await act(async () => {
      jest.advanceTimersByTime(1000);
    });
    expect(getByTestId('map-view')).toBeTruthy();
  });

  test('handles missing destination', async () => {
    require('expo-router').useLocalSearchParams.mockReturnValue({
      buildingName: 'Hall Building',
    });
    const { getByText } = render(<DirectionsScreen />);
    expect(getByText('Error: No destination provided.')).toBeTruthy();
  });

  test('handles invalid destination JSON', async () => {
    require('expo-router').useLocalSearchParams.mockReturnValue({
      destination: 'invalid-json',
      buildingName: 'Hall Building',
    });
    const { getByText } = render(<DirectionsScreen />);
    expect(getByText('Error: Invalid destination format.')).toBeTruthy();
  });

  test('handles destination with room', async () => {
    require('expo-router').useLocalSearchParams.mockReturnValue({
      destination: JSON.stringify({ latitude: 45.497092, longitude: -73.579037 }),
      buildingName: 'Hall Building',
      room: JSON.stringify({ building: 'H', id: 'H-801', name: 'H-801', location: { x: 1, y: 1 } }),
      roomCoordinates: JSON.stringify({ x: 1, y: 1 }),
    });
    require('../../utils/indoorUtils').getFloorNumber.mockReturnValue('8');
    const { getByTestId } = render(<DirectionsScreen />);
    await act(async () => {
      jest.advanceTimersByTime(1000);
    });
    expect(getByTestId('map-view')).toBeTruthy();
  });

  test('handles location permission denied', async () => {
    Location.requestForegroundPermissionsAsync.mockResolvedValue({ status: 'denied' });
    const { getByText } = render(<DirectionsScreen />);
    await act(async () => {
      jest.advanceTimersByTime(1000);
    });
    await waitFor(() => {
      expect(getByText('Location permission denied')).toBeTruthy();
    });
  });

  test('handles location error', async () => {
    Location.requestForegroundPermissionsAsync.mockRejectedValue(new Error('Location error'));
    const { getByText } = render(<DirectionsScreen />);
    await act(async () => {
      jest.advanceTimersByTime(1000);
    });
    await waitFor(() => {
      expect(getByText('Location error')).toBeTruthy();
    });
  });

  test('handles fetch error', async () => {
    global.fetch.mockRejectedValue(new Error('Network error'));
    const { getByText } = render(<DirectionsScreen />);
    await act(async () => {
      jest.advanceTimersByTime(1000);
    });
    expect(getByText('Network error')).toBeTruthy();
  });

  test('handles first floor room', async () => {
    require('expo-router').useLocalSearchParams.mockReturnValue({
      destination: JSON.stringify({ latitude: 45.497092, longitude: -73.579037 }),
      buildingName: 'Hall Building',
      room: JSON.stringify({ building: 'H', id: 'H-101', name: 'H-101', location: { x: 1, y: 1 } }),
      roomCoordinates: JSON.stringify({ x: 1, y: 1 }),
    });
    require('../../utils/indoorUtils').getFloorNumber.mockReturnValue('1');
    const { getByTestId } = render(<DirectionsScreen />);
    await act(async () => {
      jest.advanceTimersByTime(1000);
    });
    expect(getByTestId('map-view')).toBeTruthy();
  });

  test('handles eighth floor room', async () => {
    require('expo-router').useLocalSearchParams.mockReturnValue({
      destination: JSON.stringify({ latitude: 45.497092, longitude: -73.579037 }),
      buildingName: 'Hall Building',
      room: JSON.stringify({ building: 'H', id: 'H-801', name: 'H-801', location: { x: 1, y: 1 } }),
      roomCoordinates: JSON.stringify({ x: 1, y: 1 }),
    });
    require('../../utils/indoorUtils').getFloorNumber.mockReturnValue('8');
    const { getByTestId } = render(<DirectionsScreen />);
    await act(async () => {
      jest.advanceTimersByTime(1000);
    });
    expect(getByTestId('map-view')).toBeTruthy();
  });

  test('handles shuttle mode between campuses', async () => {
    require('../../utils/shuttleUtils').isNearCampus
      .mockReturnValueOnce(true) // Start at Loyola
      .mockReturnValueOnce(false) // Not SGW
      .mockReturnValueOnce(false) // Not Loyola
      .mockReturnValueOnce(true); // End at SGW
    const { getByText } = render(<DirectionsScreen />);
    await act(async () => {
      jest.advanceTimersByTime(1000);
    });
    expect(getByText('Shuttle departing at:')).toBeTruthy();
  });

  test('handles shuttle mode invalid route', async () => {
    require('../../utils/shuttleUtils').isNearCampus.mockReturnValue(false); // Neither campus
    const { getByTestId } = render(<DirectionsScreen />);
    await act(async () => {
      jest.advanceTimersByTime(1000);
    });
    expect(Alert.alert).toHaveBeenCalledWith(
      'Shuttle Service',
      'Shuttle service is only available between Loyola and SGW campuses.',
      expect.any(Array)
    );
  });

  test('renders indoor path for multi-floor route', async () => {
    require('expo-router').useLocalSearchParams.mockReturnValue({
      destination: JSON.stringify({ latitude: 45.497092, longitude: -73.579037 }),
      buildingName: 'Hall Building',
      room: JSON.stringify({ building: 'H', id: 'H-801', name: 'H-801', location: { x: 1, y: 1 } }),
      roomCoordinates: JSON.stringify({ x: 1, y: 1 }),
    });
    require('../../utils/indoorUtils').getFloorNumber.mockReturnValue('8');
    const { getByTestId } = render(<DirectionsScreen />);
    await act(async () => {
      jest.advanceTimersByTime(1000);
    });
    expect(getByTestId('polyline')).toBeTruthy();
    expect(getByTestId('marker')).toBeTruthy();
  });

  test('handles region change and building focus', async () => {
    const { getByTestId } = render(<DirectionsScreen />);
    await act(async () => {
      jest.advanceTimersByTime(1000);
    });
    const map = getByTestId('map-view');
    fireEvent(map, 'onRegionChange', {
      latitude: 45.497092,
      longitude: -73.579037,
      latitudeDelta: 0.001,
      longitudeDelta: 0.001,
    });
    expect(getByTestId('map-view')).toBeTruthy();
  });

  test('handles transit mode with bus', async () => {
    global.fetch.mockResolvedValueOnce({
      json: () => Promise.resolve({
        routes: [{
          legs: [{
            distance: { text: '5 km' },
            duration: { text: '30 mins' },
            steps: [{
              html_instructions: 'Take bus 165',
              distance: { text: '5 km' },
              duration: { text: '30 mins' },
              travel_mode: 'TRANSIT',
              transit_details: {
                line: { vehicle: { type: 'BUS' }, short_name: '165' },
              },
              polyline: { points: 'abc' },
            }],
          }],
        }],
      }),
    });
    const { getByTestId } = render(<DirectionsScreen />);
    await act(async () => {
      jest.advanceTimersByTime(1000);
    });
    expect(getByTestId('polyline')).toBeTruthy();
  });

  test('handles marker press', async () => {
    const { getByTestId } = render(<DirectionsScreen />);
    await act(async () => {
      jest.advanceTimersByTime(1000);
    });
    const marker = getByTestId('marker');
    fireEvent.press(marker);
    expect(getByTestId('map-view').props.children[0].type.fitToCoordinates).toBeDefined();
  });

  test('resets room state', async () => {
    require('expo-router').useLocalSearchParams.mockReturnValue({
      destination: JSON.stringify({ latitude: 45.497092, longitude: -73.579037 }),
      buildingName: 'Hall Building',
      room: JSON.stringify({ building: 'H', id: 'H-801', name: 'H-801', location: { x: 1, y: 1 } }),
      roomCoordinates: JSON.stringify({ x: 1, y: 1 }),
    });
    const { getByTestId, rerender } = render(<DirectionsScreen />);
    await act(async () => {
      jest.advanceTimersByTime(1000);
    });
    require('expo-router').useLocalSearchParams.mockReturnValue({
      destination: JSON.stringify({ latitude: 45.497092, longitude: -73.579037 }),
      buildingName: 'Hall Building',
    });
    rerender(<DirectionsScreen />);
    await act(async () => {
      jest.advanceTimersByTime(1000);
    });
    expect(getByTestId('map-view')).toBeTruthy();
  });

  test('handles driving mode', async () => {
    global.fetch.mockResolvedValueOnce({
      json: () => Promise.resolve({
        routes: [{
          legs: [{
            distance: { text: '2 km' },
            duration: { text: '10 mins' },
            steps: [{
              html_instructions: 'Drive north',
              distance: { text: '2 km' },
              duration: { text: '10 mins' },
              travel_mode: 'DRIVING',
              polyline: { points: 'abc' },
            }],
          }],
        }],
      }),
    });
    const { getByTestId } = render(<DirectionsScreen />);
    await act(async () => {
      jest.advanceTimersByTime(1000);
    });
    expect(getByTestId('polyline')).toBeTruthy();
  });
});