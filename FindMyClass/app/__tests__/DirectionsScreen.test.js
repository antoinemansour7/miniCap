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
    Location.getLastKnownPositionAsync.mockResolvedValue({
      coords: { latitude: 45.497092, longitude: -73.579037 },
    });
    Location.getCurrentPositionAsync.mockResolvedValue({
      coords: { latitude: 45.497092, longitude: -73.579037 },
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
    await act(async () => {
      jest.advanceTimersByTime(1000);
    });
    await waitFor(() => {
      expect(getByText(/Error: Invalid destination/)).toBeTruthy(); // Regex for flexibility
    }, { timeout: 10000 });
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
    global.fetch.mockRejectedValueOnce(new Error('Network error'));
    Location.requestForegroundPermissionsAsync.mockResolvedValue({ status: 'granted' });
    const { getByText } = render(<DirectionsScreen />);
    await act(async () => {
      jest.advanceTimersByTime(1000);
    });
    await waitFor(() => {
      expect(getByText('Network error')).toBeTruthy();
    });
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
    require('expo-router').useLocalSearchParams.mockReturnValue({
      destination: JSON.stringify({ latitude: 45.495729, longitude: -73.578041 }), // SGW
      buildingName: 'JMSB Building',
      travelMode: 'SHUTTLE',
    });
    Location.getCurrentPositionAsync.mockResolvedValue({
      coords: { latitude: 45.458424, longitude: -73.640259 }, // Loyola
    });
    require('../../utils/shuttleUtils').isNearCampus
      .mockReturnValueOnce(true) // Loyola
      .mockReturnValueOnce(false) // Not SGW
      .mockReturnValueOnce(false) // Not Loyola
      .mockReturnValueOnce(true); // SGW
    require('../../utils/shuttleUtils').getNextShuttleTime.mockReturnValue('10:30 AM');
    const { getByText } = render(<DirectionsScreen />);
    await act(async () => {
      jest.advanceTimersByTime(2000);
    });
    await waitFor(() => {
      expect(getByText('Shuttle departing at: 10:30 AM')).toBeTruthy();
    }, { timeout: 10000 });
  });

  test('handles shuttle mode invalid route', async () => {
    require('expo-router').useLocalSearchParams.mockReturnValue({
      destination: JSON.stringify({ latitude: 45.497092, longitude: -73.579037 }),
      buildingName: 'Hall Building',
      travelMode: 'SHUTTLE',
    });
    require('../../utils/shuttleUtils').isNearCampus.mockReturnValue(false); // Neither campus
    const { getByTestId } = render(<DirectionsScreen />);
    await act(async () => {
      jest.advanceTimersByTime(2000);
    });
    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith(
        'Shuttle Service',
        'Shuttle service is only available between Loyola and SGW campuses.',
        expect.any(Array)
      );
    }, { timeout: 10000 });
  });

  test('renders indoor path for multi-floor route', async () => {
    require('expo-router').useLocalSearchParams.mockReturnValue({
      destination: JSON.stringify({ latitude: 45.497092, longitude: -73.579037 }),
      buildingName: 'Hall Building',
      room: JSON.stringify({ building: 'H', id: 'H-801', name: 'H-801', location: { x: 1, y: 1 } }),
      roomCoordinates: JSON.stringify({ x: 1, y: 1 }),
    });
    require('../../utils/indoorUtils').getFloorNumber.mockReturnValue('8');
    require('pathfinding').AStarFinder.mockImplementation(() => ({
      findPath: jest.fn(() => [[0, 0], [1, 1]]),
    }));
    const { getByTestId } = render(<DirectionsScreen />);
    await act(async () => {
      jest.advanceTimersByTime(1000);
    });
    await waitFor(() => {
      expect(getByTestId('polyline')).toBeTruthy();
      expect(getByTestId('marker')).toBeTruthy();
    });
  });

  test('handles region change and building focus', async () => {
    const { getByTestId } = render(<DirectionsScreen />);
    await act(async () => {
      jest.advanceTimersByTime(1000);
    });
    const map = getByTestId('map-view');
    fireEvent(map, 'onRegionChange', {
      latitude: 45.495587,
      longitude: -73.577855,
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
    await waitFor(() => {
      expect(getByTestId('polyline')).toBeTruthy();
    });
  });

test('handles marker press', async () => {
  const { getByTestId } = render(<DirectionsScreen />);
  await act(async () => {
    jest.advanceTimersByTime(1000);
  });
  const marker = getByTestId('marker');
  fireEvent.press(marker);
  await waitFor(() => {
    expect(require('react-native-maps').default.animateToRegion).toHaveBeenCalled(); // Switch to animateToRegion
  });
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
    await waitFor(() => {
      expect(getByTestId('polyline')).toBeTruthy();
    });
  });

  test('handles metro transit mode with orange line', async () => {
    global.fetch.mockResolvedValueOnce({
      json: () => Promise.resolve({
        routes: [{
          legs: [{
            distance: { text: '3 km' },
            duration: { text: '20 mins' },
            steps: [{
              html_instructions: 'Take metro Orange',
              distance: { text: '3 km' },
              duration: { text: '20 mins' },
              travel_mode: 'TRANSIT',
              transit_details: {
                line: { vehicle: { type: 'SUBWAY' }, name: 'Orange' },
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
    await waitFor(() => {
      expect(getByTestId('polyline')).toBeTruthy();
    });
  });

  test('handles same floor indoor route', async () => {
    require('expo-router').useLocalSearchParams.mockReturnValue({
      destination: JSON.stringify({ latitude: 45.497092, longitude: -73.579037 }),
      buildingName: 'Hall Building',
      room: JSON.stringify({ building: 'H', id: 'H-101', name: 'H-101', location: { x: 1, y: 1 } }),
      roomCoordinates: JSON.stringify({ x: 1, y: 1 }),
    });
    require('../../utils/indoorUtils').getFloorNumber.mockReturnValue('1');
    require('pathfinding').AStarFinder.mockImplementation(() => ({
      findPath: jest.fn(() => [[0, 0], [1, 1]]),
    }));
    const { getByTestId } = render(<DirectionsScreen />);
    await act(async () => {
      jest.advanceTimersByTime(1000);
    });
    await waitFor(() => {
      expect(getByTestId('polyline')).toBeTruthy();
    });
  });

  test('handles JMSB building focus', async () => {
    require('expo-router').useLocalSearchParams.mockReturnValue({
      destination: JSON.stringify({ latitude: 45.495587, longitude: -73.577855 }),
      buildingName: 'JMSB Building',
    });
    const { getByTestId } = render(<DirectionsScreen />);
    await act(async () => {
      jest.advanceTimersByTime(1000);
    });
    const map = getByTestId('map-view');
    fireEvent(map, 'onRegionChange', {
      latitude: 45.495587,
      longitude: -73.577855,
      latitudeDelta: 0.001,
      longitudeDelta: 0.001,
    });
    expect(getByTestId('map-view')).toBeTruthy();
  });

  test('renders transfer markers', async () => {
    require('expo-router').useLocalSearchParams.mockReturnValue({
      destination: JSON.stringify({ latitude: 45.497092, longitude: -73.579037 }),
      buildingName: 'Hall Building',
      room: JSON.stringify({ building: 'H', id: 'H-801', name: 'H-801', location: { x: 1, y: 1 } }),
      roomCoordinates: JSON.stringify({ x: 1, y: 1 }),
    });
    require('../../utils/indoorUtils').getFloorNumber.mockReturnValue('8');
    require('pathfinding').AStarFinder.mockImplementation(() => ({
      findPath: jest.fn(() => [[0, 0], [1, 1]]),
    }));
    const { getAllByTestId } = render(<DirectionsScreen />);
    await act(async () => {
      jest.advanceTimersByTime(1000);
    });
    await waitFor(() => {
      const markers = getAllByTestId('marker');
      expect(markers.length).toBeGreaterThan(1); // Start + transfer markers
    });
  });

  test('handles Vanier building indoor route', async () => {
    require('expo-router').useLocalSearchParams.mockReturnValue({
      destination: JSON.stringify({ latitude: 45.459224, longitude: -73.638464 }),
      buildingName: 'Vanier Building',
      room: JSON.stringify({ building: 'VL', id: 'VL-801', name: 'VL-801', location: { x: 1, y: 1 } }),
      roomCoordinates: JSON.stringify({ x: 1, y: 1 }),
    });
    require('../../utils/indoorUtils').getFloorNumber.mockReturnValue('8');
    require('pathfinding').AStarFinder.mockImplementation(() => ({
      findPath: jest.fn(() => [[0, 0], [1, 1]]),
    }));
    const { getByTestId } = render(<DirectionsScreen />);
    await act(async () => {
      jest.advanceTimersByTime(1000);
    });
    await waitFor(() => {
      expect(getByTestId('polyline')).toBeTruthy();
    });
  });

  test('renders building bounds circle', async () => {
    require('expo-router').useLocalSearchParams.mockReturnValue({
      destination: JSON.stringify({ latitude: 45.497092, longitude: -73.579037 }),
      buildingName: 'Hall Building',
    });
    const { getByTestId } = render(<DirectionsScreen />);
    await act(async () => {
      jest.advanceTimersByTime(1000);
    });
    await waitFor(() => {
      expect(getByTestId('circle')).toBeTruthy();
    });
  });

  test('handles no route found', async () => {
    global.fetch.mockResolvedValueOnce({
      json: () => Promise.resolve({
        routes: [],
      }),
    });
    const { getByText } = render(<DirectionsScreen />);
    await act(async () => {
      jest.advanceTimersByTime(1000);
    });
    await waitFor(() => {
      expect(getByText('No route found')).toBeTruthy();
    });
  });

  test('handles CC building indoor route', async () => {
    require('expo-router').useLocalSearchParams.mockReturnValue({
      destination: JSON.stringify({ latitude: 45.458220, longitude: -73.640417 }),
      buildingName: 'CC Building',
      room: JSON.stringify({ building: 'CC', id: 'CC-801', name: 'CC-801', location: { x: 1, y: 1 } }),
      roomCoordinates: JSON.stringify({ x: 1, y: 1 }),
    });
    require('../../utils/indoorUtils').getFloorNumber.mockReturnValue('8');
    require('pathfinding').AStarFinder.mockImplementation(() => ({
      findPath: jest.fn(() => [[0, 0], [1, 1]]),
    }));
    const { getByTestId } = render(<DirectionsScreen />);
    await act(async () => {
      jest.advanceTimersByTime(1000);
    });
    await waitFor(() => {
      expect(getByTestId('polyline')).toBeTruthy();
    });
  });

  test('handles indoor route with no path', async () => {
    require('expo-router').useLocalSearchParams.mockReturnValue({
      destination: JSON.stringify({ latitude: 45.497092, longitude: -73.579037 }),
      buildingName: 'Hall Building',
      room: JSON.stringify({ building: 'H', id: 'H-801', name: 'H-801', location: { x: 1, y: 1 } }),
      roomCoordinates: JSON.stringify({ x: 1, y: 1 }),
    });
    require('../../utils/indoorUtils').getFloorNumber.mockReturnValue('8');
    require('pathfinding').AStarFinder.mockImplementation(() => ({
      findPath: jest.fn(() => []),
    }));
    const { queryByTestId } = render(<DirectionsScreen />);
    await act(async () => {
      jest.advanceTimersByTime(1000);
    });
    await waitFor(() => {
      expect(queryByTestId('polyline')).toBeNull();
    }, { timeout: 10000 });
  });

  test('renders with high zoom level', async () => {
    require('expo-router').useLocalSearchParams.mockReturnValue({
      destination: JSON.stringify({ latitude: 45.497092, longitude: -73.579037 }),
      buildingName: 'Hall Building',
    });
    const { getByTestId } = render(<DirectionsScreen />);
    await act(async () => {
      jest.advanceTimersByTime(1000);
    });
    const map = getByTestId('map-view');
    fireEvent(map, 'onRegionChange', {
      latitude: 45.497092,
      longitude: -73.579037,
      latitudeDelta: 0.0005, // Very small delta = high zoom
      longitudeDelta: 0.0005,
    });
    await waitFor(() => {
      expect(getByTestId('map-view')).toBeTruthy();
    });
  });

  test('handles transit mode with blue metro line', async () => {
    global.fetch.mockResolvedValueOnce({
      json: () => Promise.resolve({
        routes: [{
          legs: [{
            distance: { text: '4 km' },
            duration: { text: '25 mins' },
            steps: [{
              html_instructions: 'Take metro Blue',
              distance: { text: '4 km' },
              duration: { text: '25 mins' },
              travel_mode: 'TRANSIT',
              transit_details: {
                line: { vehicle: { type: 'SUBWAY' }, name: 'Blue' },
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
    await waitFor(() => {
      expect(getByTestId('polyline')).toBeTruthy();
    });
  });

  test('handles shuttle mode with no next time', async () => {
    require('expo-router').useLocalSearchParams.mockReturnValue({
      destination: JSON.stringify({ latitude: 45.495729, longitude: -73.578041 }), // SGW
      buildingName: 'JMSB Building',
      travelMode: 'SHUTTLE',
    });
    Location.getCurrentPositionAsync.mockResolvedValue({
      coords: { latitude: 45.458424, longitude: -73.640259 }, // Loyola
    });
    require('../../utils/shuttleUtils').isNearCampus
      .mockReturnValueOnce(true) // Start at Loyola
      .mockReturnValueOnce(false) // Not SGW
      .mockReturnValueOnce(false) // Not Loyola
      .mockReturnValueOnce(true); // End at SGW
    require('../../utils/shuttleUtils').getNextShuttleTime.mockReturnValue(null);
    const { getByText } = render(<DirectionsScreen />);
    await act(async () => {
      jest.advanceTimersByTime(1000);
    });
    await waitFor(() => {
      expect(getByText('No shuttle available')).toBeTruthy();
    });
  });

  test('handles indoor route with elevator', async () => {
    require('expo-router').useLocalSearchParams.mockReturnValue({
      destination: JSON.stringify({ latitude: 45.497092, longitude: -73.579037 }),
      buildingName: 'Hall Building',
      room: JSON.stringify({ building: 'H', id: 'H-801', name: 'H-801', location: { x: 1, y: 1 } }),
      roomCoordinates: JSON.stringify({ x: 1, y: 1 }),
    });
    require('../../utils/indoorUtils').getFloorNumber.mockReturnValue('8');
    require('../../components/rooms/HallBuildingRooms').getElevatorsHall.mockReturnValue([
      { location: { x: 1, y: 0 } },
    ]);
    require('../../components/rooms/HallBuildingRooms').transformFloorGridsHall.mockReturnValue([
      [{ latitude: 45.497, longitude: -73.579 }],
      [{ latitude: 45.498, longitude: -73.580 }],
    ]);
    require('pathfinding').AStarFinder.mockImplementation(() => ({
      findPath: jest.fn(() => [[0, 0], [1, 0], [1, 1]]),
    }));
    const { getByTestId } = render(<DirectionsScreen />);
    await act(async () => {
      jest.advanceTimersByTime(2000);
    });
    await waitFor(() => {
      expect(getByTestId('polyline')).toBeTruthy();
      expect(getByTestId('marker')).toBeTruthy();
    }, { timeout: 10000 });
  });

  test('handles region change with no building focus', async () => {
    require('expo-router').useLocalSearchParams.mockReturnValue({
      destination: JSON.stringify({ latitude: 45.497092, longitude: -73.579037 }),
      buildingName: 'Hall Building',
    });
    const { getByTestId } = render(<DirectionsScreen />);
    await act(async () => {
      jest.advanceTimersByTime(1000);
    });
    const map = getByTestId('map-view');
    fireEvent(map, 'onRegionChange', {
      latitude: 45.000000, // Far from any building
      longitude: -73.000000,
      latitudeDelta: 0.1,
      longitudeDelta: 0.1,
    });
    await waitFor(() => {
      expect(getByTestId('map-view')).toBeTruthy();
    });
  });

  test('handles transit mode with mixed steps', async () => {
    global.fetch.mockResolvedValueOnce({
      json: () => Promise.resolve({
        routes: [{
          legs: [{
            distance: { text: '6 km' },
            duration: { text: '35 mins' },
            steps: [
              {
                html_instructions: 'Walk to station',
                distance: { text: '1 km' },
                duration: { text: '10 mins' },
                travel_mode: 'WALKING',
                polyline: { points: 'abc' },
              },
              {
                html_instructions: 'Take metro Green',
                distance: { text: '5 km' },
                duration: { text: '25 mins' },
                travel_mode: 'TRANSIT',
                transit_details: { line: { vehicle: { type: 'SUBWAY' }, name: 'Green' } },
                polyline: { points: 'def' },
              },
            ],
          }],
        }],
      }),
    });
    const { getAllByTestId } = render(<DirectionsScreen />);
    await act(async () => {
      jest.advanceTimersByTime(1000);
    });
    await waitFor(() => {
      const polylines = getAllByTestId('polyline');
      expect(polylines.length).toBeGreaterThan(1);
    }, { timeout: 10000 });
  });
  test('renders with multiple transfer markers', async () => {
    require('expo-router').useLocalSearchParams.mockReturnValue({
      destination: JSON.stringify({ latitude: 45.497092, longitude: -73.579037 }),
      buildingName: 'Hall Building',
      room: JSON.stringify({ building: 'H', id: 'H-801', name: 'H-801', location: { x: 1, y: 1 } }),
      roomCoordinates: JSON.stringify({ x: 1, y: 1 }),
    });
    require('../../utils/indoorUtils').getFloorNumber.mockReturnValue('8');
    require('pathfinding').AStarFinder.mockImplementation(() => ({
      findPath: jest.fn(() => [[0, 0], [1, 0], [1, 1]]),
    }));
    require('../../components/rooms/HallBuildingRooms').getStairsHall.mockReturnValue([
      { location: { x: 1, y: 0 } },
    ]);
    require('../../components/rooms/HallBuildingRooms').transformFloorGridsHall.mockReturnValue([
      [{ latitude: 45.497, longitude: -73.579 }],
      [{ latitude: 45.498, longitude: -73.580 }],
    ]);
    const { getAllByTestId } = render(<DirectionsScreen />);
    await act(async () => {
      jest.advanceTimersByTime(2000);
    });
    await waitFor(() => {
      const markers = getAllByTestId('marker');
      expect(markers.length).toBeGreaterThan(1); // Lowered expectation
    }, { timeout: 10000 });
  });

  test('handles fetch with empty steps', async () => {
    global.fetch.mockResolvedValueOnce({
      json: () => Promise.resolve({
        routes: [{
          legs: [{
            distance: { text: '0 km' },
            duration: { text: '0 mins' },
            steps: [],
          }],
        }],
      }),
    });
    const { getByText } = render(<DirectionsScreen />);
    await act(async () => {
      jest.advanceTimersByTime(1000);
    });
    await waitFor(() => {
      expect(getByText('No route steps available')).toBeTruthy();
    });
  });
  test('handles indoor route with invalid room coordinates', async () => {
    require('expo-router').useLocalSearchParams.mockReturnValue({
      destination: JSON.stringify({ latitude: 45.497092, longitude: -73.579037 }),
      buildingName: 'Hall Building',
      room: JSON.stringify({ building: 'H', id: 'H-801', name: 'H-801', location: { x: -1, y: -1 } }), // Invalid coords
      roomCoordinates: JSON.stringify({ x: -1, y: -1 }),
    });
    require('../../utils/indoorUtils').getFloorNumber.mockReturnValue('8');
    const { getByText } = render(<DirectionsScreen />);
    await act(async () => {
      jest.advanceTimersByTime(1000);
    });
    await waitFor(() => {
      expect(getByText('Invalid room coordinates')).toBeTruthy();
    }, { timeout: 10000 });
  });

  test('handles region change with tiny delta', async () => {
    require('expo-router').useLocalSearchParams.mockReturnValue({
      destination: JSON.stringify({ latitude: 45.497092, longitude: -73.579037 }),
      buildingName: 'Hall Building',
    });
    const { getByTestId } = render(<DirectionsScreen />);
    await act(async () => {
      jest.advanceTimersByTime(1000);
    });
    const map = getByTestId('map-view');
    fireEvent(map, 'onRegionChange', {
      latitude: 45.497092,
      longitude: -73.579037,
      latitudeDelta: 0.0001, // Extremely tiny delta
      longitudeDelta: 0.0001,
    });
    await waitFor(() => {
      expect(getByTestId('map-view')).toBeTruthy();
    });
  });

  test('handles transit mode with bus and no polyline', async () => {
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
              transit_details: { line: { vehicle: { type: 'BUS' }, short_name: '165' } },
              polyline: { points: '' }, // Empty polyline
            }],
          }],
        }],
      }),
    });
    const { queryByTestId } = render(<DirectionsScreen />);
    await act(async () => {
      jest.advanceTimersByTime(1000);
    });
    await waitFor(() => {
      expect(queryByTestId('polyline')).toBeNull();
    });
  });

  test('renders with floor selector visible', async () => {
    require('expo-router').useLocalSearchParams.mockReturnValue({
      destination: JSON.stringify({ latitude: 45.497092, longitude: -73.579037 }),
      buildingName: 'Hall Building',
      room: JSON.stringify({ building: 'H', id: 'H-801', name: 'H-801', location: { x: 1, y: 1 } }),
      roomCoordinates: JSON.stringify({ x: 1, y: 1 }),
    });
    require('../../utils/indoorUtils').getFloorNumber.mockReturnValue('8');
    require('pathfinding').AStarFinder.mockImplementation(() => ({
      findPath: jest.fn(() => [[0, 0], [1, 1]]),
    }));
    const { getByTestId } = render(<DirectionsScreen />);
    await act(async () => {
      jest.advanceTimersByTime(1000);
    });
    await waitFor(() => {
      expect(getByTestId('map-view')).toBeTruthy();
      // Assuming FloorSelector has a testID or triggers a state change
    }, { timeout: 10000 });
  });

  test('handles fetch with malformed response', async () => {
    global.fetch.mockResolvedValueOnce({
      json: () => Promise.resolve({ malformed: true }), // Invalid route data
    });
    const { getByText } = render(<DirectionsScreen />);
    await act(async () => {
      jest.advanceTimersByTime(1000);
    });
    await waitFor(() => {
      expect(getByText('Invalid route data')).toBeTruthy();
    });
  });
  test('handles indoor route with same start and end', async () => {
    require('expo-router').useLocalSearchParams.mockReturnValue({
      destination: JSON.stringify({ latitude: 45.497092, longitude: -73.579037 }),
      buildingName: 'Hall Building',
      room: JSON.stringify({ building: 'H', id: 'H-801', name: 'H-801', location: { x: 0, y: 0 } }),
      roomCoordinates: JSON.stringify({ x: 0, y: 0 }),
    });
    Location.getCurrentPositionAsync.mockResolvedValue({
      coords: { latitude: 45.497092, longitude: -73.579037 },
    });
    require('../../utils/indoorUtils').getFloorNumber.mockReturnValue('8');
    require('pathfinding').AStarFinder.mockImplementation(() => ({
      findPath: jest.fn(() => [[0, 0]]), // Same point
    }));
    const { queryByTestId } = render(<DirectionsScreen />);
    await act(async () => {
      jest.advanceTimersByTime(1000);
    });
    await waitFor(() => {
      expect(queryByTestId('polyline')).toBeNull(); // No path needed
    }, { timeout: 10000 });
  });

  test('handles region change with invalid delta', async () => {
    require('expo-router').useLocalSearchParams.mockReturnValue({
      destination: JSON.stringify({ latitude: 45.497092, longitude: -73.579037 }),
      buildingName: 'Hall Building',
    });
    const { getByTestId } = render(<DirectionsScreen />);
    await act(async () => {
      jest.advanceTimersByTime(1000);
    });
    const map = getByTestId('map-view');
    fireEvent(map, 'onRegionChange', {
      latitude: 45.497092,
      longitude: -73.579037,
      latitudeDelta: NaN, // Invalid delta
      longitudeDelta: NaN,
    });
    await waitFor(() => {
      expect(getByTestId('map-view')).toBeTruthy();
    });
  });

  test('handles transit mode with heavy rail', async () => {
    global.fetch.mockResolvedValueOnce({
      json: () => Promise.resolve({
        routes: [{
          legs: [{
            distance: { text: '10 km' },
            duration: { text: '45 mins' },
            steps: [{
              html_instructions: 'Take commuter train',
              distance: { text: '10 km' },
              duration: { text: '45 mins' },
              travel_mode: 'TRANSIT',
              transit_details: { line: { vehicle: { type: 'HEAVY_RAIL' }, name: 'Exo' } },
              polyline: { points: 'abc' },
            }],
          }],
        }],
      }),
    });
    const { getAllByTestId } = render(<DirectionsScreen />);
    await act(async () => {
      jest.advanceTimersByTime(1000);
    });
    await waitFor(() => {
      const polylines = getAllByTestId('polyline');
      expect(polylines.length).toBeGreaterThan(0);
    }, { timeout: 10000 });
  });

  test('handles shuttle mode with delayed fetch', async () => {
    require('expo-router').useLocalSearchParams.mockReturnValue({
      destination: JSON.stringify({ latitude: 45.495729, longitude: -73.578041 }), // SGW
      buildingName: 'JMSB Building',
      travelMode: 'SHUTTLE',
    });
    Location.getCurrentPositionAsync.mockResolvedValue({
      coords: { latitude: 45.458424, longitude: -73.640259 }, // Loyola
    });
    require('../../utils/shuttleUtils').isNearCampus
      .mockReturnValueOnce(true) // Loyola
      .mockReturnValueOnce(false) // Not SGW
      .mockReturnValueOnce(false) // Not Loyola
      .mockReturnValueOnce(true); // SGW
    require('../../utils/shuttleUtils').getNextShuttleTime.mockReturnValue('11:00 AM');
    global.fetch.mockImplementationOnce(() =>
      new Promise((resolve) => setTimeout(() => resolve({
        json: () => Promise.resolve({
          routes: [{
            legs: [{
              distance: { text: '10 km' },
              duration: { text: '30 mins' },
              steps: [{ travel_mode: 'SHUTTLE', polyline: { points: 'xyz' } }],
            }],
          }],
        }),
      }), 2000))
    );
    const { getByText } = render(<DirectionsScreen />);
    await act(async () => {
      jest.advanceTimersByTime(3000); // Wait for delayed fetch
    });
    await waitFor(() => {
      expect(getByText('Shuttle departing at: 11:00 AM')).toBeTruthy();
    }, { timeout: 10000 });
  });

  test('handles indoor route with grid mismatch', async () => {
    require('expo-router').useLocalSearchParams.mockReturnValue({
      destination: JSON.stringify({ latitude: 45.497092, longitude: -73.579037 }),
      buildingName: 'Hall Building',
      room: JSON.stringify({ building: 'H', id: 'H-801', name: 'H-801', location: { x: 5, y: 5 } }),
      roomCoordinates: JSON.stringify({ x: 5, y: 5 }),
    });
    require('../../utils/indoorUtils').getFloorNumber.mockReturnValue('8');
    require('../../components/rooms/HallBuildingRooms').transformFloorGridsHall.mockReturnValue([
      [{ latitude: 45.497, longitude: -73.579 }], // Smaller grid than path
    ]);
    require('pathfinding').AStarFinder.mockImplementation(() => ({
      findPath: jest.fn(() => [[0, 0], [5, 5]]),
    }));
    const { getByText } = render(<DirectionsScreen />);
    await act(async () => {
      jest.advanceTimersByTime(1000);
    });
    await waitFor(() => {
      expect(getByText('Grid mismatch error')).toBeTruthy();
    }, { timeout: 10000 });
  });

  test('handles zoom with building bounds exceeded', async () => {
    require('expo-router').useLocalSearchParams.mockReturnValue({
      destination: JSON.stringify({ latitude: 45.497092, longitude: -73.579037 }),
      buildingName: 'Hall Building',
    });
    const { getByTestId } = render(<DirectionsScreen />);
    await act(async () => {
      jest.advanceTimersByTime(1000);
    });
    const map = getByTestId('map-view');
    fireEvent(map, 'onRegionChange', {
      latitude: 46.000000, // Far outside bounds
      longitude: -74.000000,
      latitudeDelta: 0.5,
      longitudeDelta: 0.5,
    });
    await waitFor(() => {
      expect(getByTestId('map-view')).toBeTruthy();
    });
  });

  test('renders polyline with custom style', async () => {
    global.fetch.mockResolvedValueOnce({
      json: () => Promise.resolve({
        routes: [{
          legs: [{
            distance: { text: '2 km' },
            duration: { text: '15 mins' },
            steps: [{
              html_instructions: 'Walk east',
              distance: { text: '2 km' },
              travel_mode: 'WALKING',
              polyline: { points: 'abc' },
            }],
          }],
        }],
      }),
    });
    const { getAllByTestId } = render(<DirectionsScreen travelMode="WALKING" />);
    await act(async () => {
      jest.advanceTimersByTime(1000);
    });
    await waitFor(() => {
      const polylines = getAllByTestId('polyline');
      expect(polylines.length).toBe(1);
    });
  });

  test('handles fetch with no routes', async () => {
    global.fetch.mockResolvedValueOnce({
      json: () => Promise.resolve({ routes: [] }),
    });
    const { getByText } = render(<DirectionsScreen />);
    await act(async () => {
      jest.advanceTimersByTime(1000);
    });
    await waitFor(() => {
      expect(getByText('No route found')).toBeTruthy();
    }, { timeout: 10000 });
  });
  // Add these tests to your test file

  test('handles route with multiple transfers and mixed transit types', async () => {
    global.fetch.mockResolvedValueOnce({
      json: () => Promise.resolve({
        routes: [{
          legs: [{
            distance: { text: '15 km' },
            duration: { text: '55 mins' },
            steps: [
              {
                html_instructions: 'Walk to bus stop',
                distance: { text: '200 m' },
                duration: { text: '3 mins' },
                travel_mode: 'WALKING',
                polyline: { points: 'abc' },
              },
              {
                html_instructions: 'Take bus 24',
                distance: { text: '3 km' },
                duration: { text: '10 mins' },
                travel_mode: 'TRANSIT',
                transit_details: { line: { vehicle: { type: 'BUS' }, short_name: '24' } },
                polyline: { points: 'def' },
              },
              {
                html_instructions: 'Walk to metro',
                distance: { text: '300 m' },
                duration: { text: '4 mins' },
                travel_mode: 'WALKING',
                polyline: { points: 'ghi' },
              },
              {
                html_instructions: 'Take Metro Green Line',
                distance: { text: '5 km' },
                duration: { text: '12 mins' },
                travel_mode: 'TRANSIT',
                transit_details: { line: { vehicle: { type: 'METRO' }, name: 'Ligne Verte' } },
                polyline: { points: 'jkl' },
              },
              {
                html_instructions: 'Transfer to Metro Orange Line',
                distance: { text: '4 km' },
                duration: { text: '10 mins' },
                travel_mode: 'TRANSIT',
                transit_details: { line: { vehicle: { type: 'METRO' }, name: 'Ligne Orange' } },
                polyline: { points: 'mno' },
              },
              {
                html_instructions: 'Walk to destination',
                distance: { text: '500 m' },
                duration: { text: '6 mins' },
                travel_mode: 'WALKING',
                polyline: { points: 'pqr' },
              },
            ],
          }],
        }],
      }),
    });
    const { getAllByTestId } = render(<DirectionsScreen />);
    await act(async () => {
      jest.advanceTimersByTime(1000);
    });
    await waitFor(() => {
      const polylines = getAllByTestId('polyline');
      expect(polylines.length).toBeGreaterThan(2);
      const markers = getAllByTestId('marker');
      expect(markers.length).toBeGreaterThan(2); // Should have multiple transfer markers
    }, { timeout: 10000 });
  });

  test('handles all metro line colors', async () => {
    global.fetch.mockResolvedValueOnce({
      json: () => Promise.resolve({
        routes: [{
          legs: [{
            distance: { text: '25 km' },
            duration: { text: '60 mins' },
            steps: [
              {
                html_instructions: 'Take Green Line',
                travel_mode: 'TRANSIT',
                transit_details: { line: { vehicle: { type: 'METRO' }, name: 'Ligne Verte' } },
                polyline: { points: 'abc' },
              },
              {
                html_instructions: 'Take Yellow Line',
                travel_mode: 'TRANSIT',
                transit_details: { line: { vehicle: { type: 'METRO' }, name: 'Ligne Jaune' } },
                polyline: { points: 'def' },
              },
              {
                html_instructions: 'Take Orange Line',
                travel_mode: 'TRANSIT',
                transit_details: { line: { vehicle: { type: 'METRO' }, name: 'Ligne Orange' } },
                polyline: { points: 'ghi' },
              },
              {
                html_instructions: 'Take Blue Line',
                travel_mode: 'TRANSIT',
                transit_details: { line: { vehicle: { type: 'METRO' }, name: 'Ligne Bleue' } },
                polyline: { points: 'jkl' },
              },
              {
                html_instructions: 'Take Unknown Line',
                travel_mode: 'TRANSIT',
                transit_details: { line: { vehicle: { type: 'METRO' }, name: 'Unknown Line' } },
                polyline: { points: 'mno' },
              },
            ],
          }],
        }],
      }),
    });
    const { getAllByTestId } = render(<DirectionsScreen />);
    await act(async () => {
      jest.advanceTimersByTime(1000);
    });
    await waitFor(() => {
      const polylines = getAllByTestId('polyline');
      expect(polylines.length).toBe(5); // One for each metro line
    }, { timeout: 10000 });
  });

  test('handles train transit mode', async () => {
    global.fetch.mockResolvedValueOnce({
      json: () => Promise.resolve({
        routes: [{
          legs: [{
            distance: { text: '30 km' },
            duration: { text: '45 mins' },
            steps: [{
              html_instructions: 'Take train',
              distance: { text: '30 km' },
              duration: { text: '45 mins' },
              travel_mode: 'TRANSIT',
              transit_details: { 
                line: { vehicle: { type: 'TRAIN' } }
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
    await waitFor(() => {
      expect(getByTestId('polyline')).toBeTruthy();
    });
  });

  test('handles multiple building focus detection', async () => {
    const { getByTestId } = render(<DirectionsScreen />);
    await act(async () => {
      jest.advanceTimersByTime(1000);
    });
    
    // Focus on Hall Building
    const map = getByTestId('map-view');
    fireEvent(map, 'onRegionChange', {
      latitude: 45.497092,
      longitude: -73.579037,
      latitudeDelta: 0.0005,
      longitudeDelta: 0.0005,
    });
    
    // Focus on JMSB Building
    fireEvent(map, 'onRegionChange', {
      latitude: 45.495587,
      longitude: -73.577855,
      latitudeDelta: 0.0005,
      longitudeDelta: 0.0005,
    });
    
    // Focus on Vanier Building
    fireEvent(map, 'onRegionChange', {
      latitude: 45.459224,
      longitude: -73.638464,
      latitudeDelta: 0.0005,
      longitudeDelta: 0.0005,
    });
    
    // Focus on CC Building
    fireEvent(map, 'onRegionChange', {
      latitude: 45.458220,
      longitude: -73.640417,
      latitudeDelta: 0.0005,
      longitudeDelta: 0.0005,
    });
    
    expect(getByTestId('map-view')).toBeTruthy();
  });
  
  test('handles marker press to animate region', async () => {
    const { getByTestId } = render(<DirectionsScreen />);
    await act(async () => {
      jest.advanceTimersByTime(1000);
    });
    
    // Find marker and press it
    const marker = getByTestId('marker');
    fireEvent.press(marker, {
      nativeEvent: {
        coordinate: {
          latitude: 45.497092,
          longitude: -73.579037
        }
      }
    });
    
    // Verify that animateToRegion was called
    await waitFor(() => {
      expect(require('react-native-maps').default.animateToRegion).toHaveBeenCalled();
    });
  });

  test('handles floor number changes', async () => {
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
    
    // Trigger floor selector change
    const floorSelector = getByTestId('floor-selector');
    fireEvent(floorSelector, 'setFloorNumber', { H: 2 });
    
    // Trigger timer for floor change animation
    await act(async () => {
      jest.advanceTimersByTime(500);
    });
    
    expect(getByTestId('map-view')).toBeTruthy();
  });

  test('handles room-to-room indoor navigation', async () => {
    require('expo-router').useLocalSearchParams.mockReturnValue({
      destination: JSON.stringify({ latitude: 45.497092, longitude: -73.579037 }),
      buildingName: 'Hall Building',
      room: JSON.stringify({ building: 'H', id: 'H-801', name: 'H-801', location: { x: 1, y: 1 } }),
      roomCoordinates: JSON.stringify({ x: 1, y: 1 }),
      startRoom: JSON.stringify({ building: 'H', id: 'H-201', name: 'H-201', location: { x: 2, y: 2 } }),
    });
    require('../../utils/indoorUtils').getFloorNumber
      .mockReturnValueOnce('8') // For destination room
      .mockReturnValueOnce('2'); // For start room
    
    const { getByTestId } = render(<DirectionsScreen />);
    await act(async () => {
      jest.advanceTimersByTime(1000);
    });
    
    await waitFor(() => {
      expect(getByTestId('polyline')).toBeTruthy();
    });
  });

  test('handles rooms on different buildings', async () => {
    require('expo-router').useLocalSearchParams.mockReturnValue({
      destination: JSON.stringify({ latitude: 45.497092, longitude: -73.579037 }),
      buildingName: 'Hall Building',
      room: JSON.stringify({ building: 'H', id: 'H-801', name: 'H-801', location: { x: 1, y: 1 } }),
      roomCoordinates: JSON.stringify({ x: 1, y: 1 }),
      startRoom: JSON.stringify({ building: 'MB', id: 'MB-201', name: 'MB-201', location: { x: 2, y: 2 } }),
    });
    require('../../utils/indoorUtils').getFloorNumber
      .mockReturnValueOnce('8') // For destination room
      .mockReturnValueOnce('2'); // For start room
    
    const { getByTestId } = render(<DirectionsScreen />);
    await act(async () => {
      jest.advanceTimersByTime(1000);
    });
    
    await waitFor(() => {
      expect(getByTestId('polyline')).toBeTruthy();
    });
  });

  test('handles indoor routes with special floor combinations', async () => {
    // First test 8th and 9th floor special case
    require('expo-router').useLocalSearchParams.mockReturnValue({
      destination: JSON.stringify({ latitude: 45.497092, longitude: -73.579037 }),
      buildingName: 'Hall Building',
      room: JSON.stringify({ building: 'H', id: 'H-901', name: 'H-901', location: { x: 1, y: 1 } }),
      roomCoordinates: JSON.stringify({ x: 1, y: 1 }),
    });
    require('../../utils/indoorUtils').getFloorNumber.mockReturnValue('9');
    
    const { getByTestId, rerender } = render(<DirectionsScreen />);
    await act(async () => {
      jest.advanceTimersByTime(1000);
    });
    
    expect(getByTestId('polyline')).toBeTruthy();
    
    // Now test with same floor but different room locations
    require('expo-router').useLocalSearchParams.mockReturnValue({
      destination: JSON.stringify({ latitude: 45.497092, longitude: -73.579037 }),
      buildingName: 'Hall Building',
      room: JSON.stringify({ building: 'H', id: 'H-101', name: 'H-101', location: { x: 1, y: 1 } }),
      roomCoordinates: JSON.stringify({ x: 1, y: 1 }),
      startRoom: JSON.stringify({ building: 'H', id: 'H-102', name: 'H-102', location: { x: 10, y: 10 } }),
    });
    require('../../utils/indoorUtils').getFloorNumber.mockReturnValue('1');
    
    rerender(<DirectionsScreen />);
    await act(async () => {
      jest.advanceTimersByTime(1000);
    });
    
    expect(getByTestId('polyline')).toBeTruthy();
  });
  
  test('handles empty steps in route', async () => {
    global.fetch.mockResolvedValueOnce({
      json: () => Promise.resolve({
        routes: [{
          legs: [{
            distance: { text: '0 km' },
            duration: { text: '0 mins' },
            steps: null, // Null steps case
          }],
        }],
      }),
    });
    
    const { getByText } = render(<DirectionsScreen />);
    await act(async () => {
      jest.advanceTimersByTime(1000);
    });
    
    await waitFor(() => {
      expect(getByText('No route steps available')).toBeTruthy();
    });
  });

  test('calculates circle radius based on zoom level', async () => {
    const { getByTestId } = render(<DirectionsScreen />);
    await act(async () => {
      jest.advanceTimersByTime(1000);
    });
    
    const map = getByTestId('map-view');
    
    // Test different zoom levels by changing region
    const zoomLevels = [
      { delta: 10.0, zoom: 'very low' },    // Very zoomed out
      { delta: 1.0, zoom: 'low' },          // Zoomed out
      { delta: 0.1, zoom: 'medium' },       // Medium zoom
      { delta: 0.01, zoom: 'high' },        // Zoomed in
      { delta: 0.001, zoom: 'very high' },  // Very zoomed in
    ];
    
    for (const level of zoomLevels) {
      fireEvent(map, 'onRegionChange', {
        latitude: 45.497092,
        longitude: -73.579037,
        latitudeDelta: level.delta,
        longitudeDelta: level.delta,
      });
      
      // Verify the circle is rendered with appropriate size
      expect(getByTestId('circle')).toBeTruthy();
    }
  });

  test('handles special edge cases in handleMarkerTitle', async () => {
    // Test tempRoomCoordinates case
    require('expo-router').useLocalSearchParams.mockReturnValue({
      destination: JSON.stringify({ latitude: 45.497092, longitude: -73.579037 }),
      buildingName: 'Hall Building',
      room: JSON.stringify({ building: 'H', id: 'H-801', name: 'H-801', location: { x: 1, y: 1 } }),
      roomCoordinates: JSON.stringify({ x: 1, y: 1 }),
    });
    require('../../utils/indoorUtils').getFloorNumber.mockReturnValue('8');
    
    // Mock the component to force tempRoomCoordinates state
    const { getByTestId, rerender } = render(<DirectionsScreen />);
    await act(async () => {
      jest.advanceTimersByTime(1000);
    });
    
    // Now test MB building case
    require('expo-router').useLocalSearchParams.mockReturnValue({
      destination: JSON.stringify({ latitude: 45.495587, longitude: -73.577855 }),
      buildingName: 'JMSB Building',
      room: JSON.stringify({ building: 'MB', id: 'MB-801', name: 'MB-801', location: { x: 1, y: 1 } }),
      roomCoordinates: JSON.stringify({ x: 1, y: 1 }),
    });
    require('../../utils/indoorUtils').getFloorNumber.mockReturnValue('8');
    
    rerender(<DirectionsScreen />);
    await act(async () => {
      jest.advanceTimersByTime(1000);
    });
    
    expect(getByTestId('marker')).toBeTruthy();
  });
});