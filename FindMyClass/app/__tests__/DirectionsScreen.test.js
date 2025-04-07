import React from 'react';
import { render } from '@testing-library/react-native';
import DirectionsScreen from '../screens/directions';

// Mock the dependencies with minimal implementations
jest.mock('expo-router', () => ({
  useLocalSearchParams: jest.fn(() => ({
    destination: JSON.stringify({
      latitude: 45.497092,
      longitude: -73.579037
    }),
    buildingName: 'Hall Building',
  })),
  useRouter: jest.fn()
}));

// Minimal mock for react-native-maps
jest.mock('react-native-maps', () => ({
  __esModule: true,
  default: () => null,
  Marker: () => null,
  Polyline: () => null,
  Circle: () => null,
  Overlay: () => null,
  Polygon: () => null,
}));

// Minimal mock for expo-location
jest.mock('expo-location', () => ({
  requestForegroundPermissionsAsync: jest.fn(() => Promise.resolve({ status: 'granted' })),
  getCurrentPositionAsync: jest.fn(() => Promise.resolve({
    coords: {
      latitude: 45.497092,
      longitude: -73.579037
    }
  })),
  getLastKnownPositionAsync: jest.fn(() => Promise.resolve({
    coords: {
      latitude: 45.497092,
      longitude: -73.579037
    }
  })),
  watchPositionAsync: jest.fn((options, callback) => {
    // Call the callback with a mock location update
    callback && callback({
      coords: {
        latitude: 45.498000,
        longitude: -73.580000
      }
    });
    return {
      remove: jest.fn()
    };
  })
}));

// Minimal mock for polyline
jest.mock('@mapbox/polyline', () => ({
  decode: jest.fn(() => [[45.497092, -73.579037], [45.498000, -73.580000]])
}));

// Minimal mock for pathfinding
jest.mock('pathfinding', () => {
  const mockGrid = {
    setWalkableAt: jest.fn(),
    clone: jest.fn(function() { return this; })
  };
  
  return {
    AStarFinder: jest.fn(() => ({
      findPath: jest.fn(() => [[0, 0], [1, 1]])
    })),
    Grid: jest.fn(() => mockGrid)
  };
});

// Minimal mocks for child components
jest.mock('../../components/directions/LocationSelector', () => () => null);
jest.mock('../../components/directions/ModalSearchBars', () => () => null);
jest.mock('../../components/directions/SwipeUpModal', () => () => null);
jest.mock('../../components/FloorPlans', () => () => null);
jest.mock('../../components/FloorSelector', () => () => null);

// Minimal mocks for building data
jest.mock('../../components/rooms/HallBuildingRooms', () => ({
  hallBuilding: { latitude: 45.497092, longitude: -73.579037 },
  hallBuildingFloors: [1, 2, 3],
  getStartLocationHall: jest.fn(() => ({ location: { x: 10, y: 10 } })),
  getStairsHall: jest.fn(() => [{ location: { x: 10, y: 10 } }]),
  getElevatorsHall: jest.fn(),
  floorGridsHall: { 1: [[]], 2: [[]], 8: [[]], 9: [[]] },
  transformFloorGridsHall: jest.fn(() => [
    [{latitude: 45.497, longitude: -73.579}, {latitude: 45.497, longitude: -73.578}],
    [{latitude: 45.497, longitude: -73.579}, {latitude: 45.497, longitude: -73.578}]
  ])
}));

jest.mock('../../components/rooms/JMSBBuildingRooms', () => ({
  jmsbBuilding: { latitude: 45.495587, longitude: -73.577855 },
  jmsbBounds: {},
  jmsbFlippedGrid: {},
  getStairsMB: jest.fn(() => [{ location: { x: 10, y: 10 } }]),
  getElevatorsMB: jest.fn(),
  floorGridsMB: { 1: [[]], 2: [[]], 8: [[]], 9: [[]] },
  getStartLocationJSMB: jest.fn(() => ({ location: { x: 10, y: 10 } })),
  transformFloorGridsMB: jest.fn(() => [
    [{latitude: 45.497, longitude: -73.579}, {latitude: 45.497, longitude: -73.578}],
    [{latitude: 45.497, longitude: -73.579}, {latitude: 45.497, longitude: -73.578}]
  ])
}));

jest.mock('../../components/rooms/VanierBuildingRooms', () => ({
  vanierBuilding: { latitude: 45.459224, longitude: -73.638464 },
  vanierBounds: {},
  vanierFlippedGrid: {},
  getStairsVL: jest.fn(() => [{ location: { x: 10, y: 10 } }]),
  getElevatorsVL: jest.fn(),
  floorGridsVL: { 1: [[]], 2: [[]], 8: [[]], 9: [[]] },
  getStartLocationVanier: jest.fn(() => ({ location: { x: 10, y: 10 } })),
  transformFloorGridsVL: jest.fn(() => [
    [{latitude: 45.497, longitude: -73.579}, {latitude: 45.497, longitude: -73.578}],
    [{latitude: 45.497, longitude: -73.579}, {latitude: 45.497, longitude: -73.578}]
  ])
}));

jest.mock('../../components/rooms/CCBuildingRooms', () => ({
  ccBuilding: { latitude: 45.458220, longitude: -73.640417 },
  ccBounds: {},
  ccFlippedGrid: {},
  getStairsCC: jest.fn(() => [{ location: { x: 10, y: 10 } }]),
  getElevatorsCC: jest.fn(),
  floorGridsCC: { 1: [[]], 2: [[]], 8: [[]], 9: [[]] },
  getStartLocationCC: jest.fn(() => ({ location: { x: 10, y: 10 } })),
  transformFloorGridsCC: jest.fn(() => [
    [{latitude: 45.497, longitude: -73.579}, {latitude: 45.497, longitude: -73.578}],
    [{latitude: 45.497, longitude: -73.579}, {latitude: 45.497, longitude: -73.578}]
  ])
}));

// Minimal mock for indoor utils
jest.mock('../../utils/indoorUtils', () => ({
  floorGrid: {},
  getFloorPlanBounds: jest.fn(),
  convertGridForPathfinding: jest.fn(() => ({
    setWalkableAt: jest.fn(),
    clone: jest.fn(function() { return this; })
  })),
  getPolygonBounds: jest.fn(),
  gridLines: {},
  horizontallyFlippedGrid: {},
  verticallyFlippedGrid: {},
  rotatedGrid: {},
  gridMapping: {},
  getClassCoordinates: jest.fn(() => ({
    latitude: 45.497092,
    longitude: -73.579037
  })),
  getFloorNumber: jest.fn((id) => {
    if (id === 'H-801') return '8';
    if (id === 'H-901') return '9';
    if (id === 'H-201') return '2';
    return '1';
  })
}));

// Minimal mock for shuttle utils
jest.mock('../../utils/shuttleUtils', () => ({
  isNearCampus: jest.fn((coords, campusCoords) => {
    // Mock logic for isNearCampus
    if (coords.latitude === 45.458424 && campusCoords.latitude === 45.458424) return true;
    if (coords.latitude === 45.495729 && campusCoords.latitude === 45.495729) return true;
    return false;
  }),
  getNextShuttleTime: jest.fn(() => '10:30 AM'),
  LOYOLA_COORDS: { latitude: 45.458424, longitude: -73.640259 },
  SGW_COORDS: { latitude: 45.495729, longitude: -73.578041 }
}));

// Mock fetch with different travel modes
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
            polyline: { points: 'abc' }
          }]
        }]
      }]
    })
  })
);

// Mock global Alert
global.Alert = { alert: jest.fn() };

describe('DirectionsScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // Basic test just to ensure component renders
  test('renders without crashing', () => {
    render(<DirectionsScreen />);
  });

  // Test different scenarios by manipulating the useLocalSearchParams mock
  test('handles different destination parameters', () => {
    // 1. Test with a valid destination
    require('expo-router').useLocalSearchParams.mockReturnValue({
      destination: JSON.stringify({
        latitude: 45.497092,
        longitude: -73.579037
      }),
      buildingName: 'Hall Building',
    });
    render(<DirectionsScreen />);

    // 2. Test with room parameters
    require('expo-router').useLocalSearchParams.mockReturnValue({
      destination: JSON.stringify({
        latitude: 45.497092,
        longitude: -73.579037
      }),
      buildingName: 'Hall Building',
      room: JSON.stringify({
        building: 'H',
        id: 'H-801',
        name: 'H-801',
        location: { x: 10, y: 20 }
      }),
      roomCoordinates: JSON.stringify({ x: 10, y: 20 })
    });
    render(<DirectionsScreen />);

    // 3. Test with missing destination
    require('expo-router').useLocalSearchParams.mockReturnValue({
      buildingName: 'Hall Building',
    });
    render(<DirectionsScreen />);

    // 4. Test with invalid destination JSON
    require('expo-router').useLocalSearchParams.mockReturnValue({
      destination: 'invalid-json',
      buildingName: 'Hall Building',
    });
    render(<DirectionsScreen />);

    // 5. Test with invalid coordinates in destination
    require('expo-router').useLocalSearchParams.mockReturnValue({
      destination: JSON.stringify({ invalid: 'data' }),
      buildingName: 'Hall Building',
    });
    render(<DirectionsScreen />);
  });

  // Test different location permissions
  test('handles different location permissions', () => {
    // 1. Test with granted permission
    require('expo-location').requestForegroundPermissionsAsync.mockResolvedValue({ status: 'granted' });
    render(<DirectionsScreen />);

    // 2. Test with denied permission
    require('expo-location').requestForegroundPermissionsAsync.mockResolvedValue({ status: 'denied' });
    render(<DirectionsScreen />);

    // 3. Test with location error
    require('expo-location').requestForegroundPermissionsAsync.mockRejectedValue(new Error('Location error'));
    render(<DirectionsScreen />);
  });

  // Test different fetch responses
  test('handles different fetch responses', () => {
    // 1. Test with valid response
    global.fetch.mockResolvedValue(
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
                polyline: { points: 'abc' }
              }]
            }]
          }]
        })
      })
    );
    render(<DirectionsScreen />);

    // 2. Test with fetch error
    global.fetch.mockRejectedValue(new Error('Network error'));
    render(<DirectionsScreen />);

    // 3. Test with empty routes
    global.fetch.mockResolvedValue(
      Promise.resolve({
        json: () => Promise.resolve({
          routes: []
        })
      })
    );
    render(<DirectionsScreen />);
  });

  // Test different room scenarios
  test('handles different room scenarios', () => {
    // 1. Test with first floor room
    require('expo-router').useLocalSearchParams.mockReturnValue({
      destination: JSON.stringify({
        latitude: 45.497092,
        longitude: -73.579037
      }),
      buildingName: 'Hall Building',
      room: JSON.stringify({
        building: 'H',
        id: 'H-101', // First floor
        name: 'H-101',
        location: { x: 10, y: 20 }
      }),
      roomCoordinates: JSON.stringify({ x: 10, y: 20 })
    });
    render(<DirectionsScreen />);

    // 2. Test with 8th floor room
    require('expo-router').useLocalSearchParams.mockReturnValue({
      destination: JSON.stringify({
        latitude: 45.497092,
        longitude: -73.579037
      }),
      buildingName: 'Hall Building',
      room: JSON.stringify({
        building: 'H',
        id: 'H-801', // 8th floor
        name: 'H-801',
        location: { x: 10, y: 20 }
      }),
      roomCoordinates: JSON.stringify({ x: 10, y: 20 })
    });
    render(<DirectionsScreen />);

    // 3. Test with 9th floor room
    require('expo-router').useLocalSearchParams.mockReturnValue({
      destination: JSON.stringify({
        latitude: 45.497092,
        longitude: -73.579037
      }),
      buildingName: 'Hall Building',
      room: JSON.stringify({
        building: 'H',
        id: 'H-901', // 9th floor
        name: 'H-901',
        location: { x: 10, y: 20 }
      }),
      roomCoordinates: JSON.stringify({ x: 10, y: 20 })
    });
    render(<DirectionsScreen />);
  });

  // Test different start rooms and destinations
  test('handles different start room and destination scenarios', () => {
    // 1. Start room and destination room in same building, same floor
    require('expo-router').useLocalSearchParams.mockReturnValue({
      destination: JSON.stringify({
        latitude: 45.497092,
        longitude: -73.579037
      }),
      buildingName: 'Hall Building',
      room: JSON.stringify({
        building: 'H',
        id: 'H-101', // First floor
        name: 'H-101',
        location: { x: 10, y: 20 }
      }),
      roomCoordinates: JSON.stringify({ x: 10, y: 20 })
    });
    const { rerender } = render(<DirectionsScreen />);

    // 2. Start room and destination room in same building, different floors
    require('expo-router').useLocalSearchParams.mockReturnValue({
      destination: JSON.stringify({
        latitude: 45.497092,
        longitude: -73.579037
      }),
      buildingName: 'Hall Building',
      room: JSON.stringify({
        building: 'H',
        id: 'H-801', // 8th floor
        name: 'H-801',
        location: { x: 10, y: 20 }
      }),
      roomCoordinates: JSON.stringify({ x: 10, y: 20 }),
      startRoom: JSON.stringify({
        building: 'H',
        id: 'H-201', // 2nd floor
        name: 'H-201',
        location: { x: 15, y: 25 }
      })
    });
    rerender(<DirectionsScreen />);

    // 3. Start room and destination in different buildings
    require('expo-router').useLocalSearchParams.mockReturnValue({
      destination: JSON.stringify({
        latitude: 45.497092,
        longitude: -73.579037
      }),
      buildingName: 'Hall Building',
      room: JSON.stringify({
        building: 'H',
        id: 'H-801',
        name: 'H-801',
        location: { x: 10, y: 20 }
      }),
      roomCoordinates: JSON.stringify({ x: 10, y: 20 }),
      startRoom: JSON.stringify({
        building: 'MB',
        id: 'MB-201',
        name: 'MB-201',
        location: { x: 15, y: 25 }
      })
    });
    rerender(<DirectionsScreen />);
  });

  // Test various polyline styles
  test('handles different travel modes for polyline styling', () => {
    // 1. Walking mode
    global.fetch.mockResolvedValueOnce(
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
                polyline: { points: 'abc' }
              }]
            }]
          }]
        })
      })
    );
    render(<DirectionsScreen />);

    // 2. Bus transit mode
    global.fetch.mockResolvedValueOnce(
      Promise.resolve({
        json: () => Promise.resolve({
          routes: [{
            legs: [{
              distance: { text: '3.0 km' },
              duration: { text: '20 mins' },
              steps: [{
                html_instructions: 'Take bus 24',
                distance: { text: '3.0 km' },
                duration: { text: '20 mins' },
                travel_mode: 'TRANSIT',
                polyline: { points: 'def' },
                transit_details: {
                  line: {
                    short_name: '24',
                    vehicle: { type: 'BUS' }
                  }
                }
              }]
            }]
          }]
        })
      })
    );
    render(<DirectionsScreen />);

    // 3. Metro transit mode with different lines
    global.fetch.mockResolvedValueOnce(
      Promise.resolve({
        json: () => Promise.resolve({
          routes: [{
            legs: [{
              distance: { text: '5.0 km' },
              duration: { text: '15 mins' },
              steps: [
                {
                  html_instructions: 'Take Green Line',
                  travel_mode: 'TRANSIT',
                  polyline: { points: 'ghi' },
                  transit_details: {
                    line: {
                      name: 'Ligne Verte',
                      vehicle: { type: 'METRO' }
                    }
                  }
                },
                {
                  html_instructions: 'Take Orange Line',
                  travel_mode: 'TRANSIT',
                  polyline: { points: 'jkl' },
                  transit_details: {
                    line: {
                      name: 'Ligne Orange',
                      vehicle: { type: 'METRO' }
                    }
                  }
                },
                {
                  html_instructions: 'Take Blue Line',
                  travel_mode: 'TRANSIT',
                  polyline: { points: 'mno' },
                  transit_details: {
                    line: {
                      name: 'Ligne Bleue',
                      vehicle: { type: 'METRO' }
                    }
                  }
                },
                {
                  html_instructions: 'Take Yellow Line',
                  travel_mode: 'TRANSIT',
                  polyline: { points: 'pqr' },
                  transit_details: {
                    line: {
                      name: 'Ligne Jaune',
                      vehicle: { type: 'METRO' }
                    }
                  }
                },
                {
                  html_instructions: 'Take Unknown Line',
                  travel_mode: 'TRANSIT',
                  polyline: { points: 'stu' },
                  transit_details: {
                    line: {
                      name: 'Ligne X',
                      vehicle: { type: 'METRO' }
                    }
                  }
                }
              ]
            }]
          }]
        })
      })
    );
    render(<DirectionsScreen />);

    // 4. Train transit mode
    global.fetch.mockResolvedValueOnce(
      Promise.resolve({
        json: () => Promise.resolve({
          routes: [{
            legs: [{
              steps: [{
                html_instructions: 'Take train',
                travel_mode: 'TRANSIT',
                polyline: { points: 'vwx' },
                transit_details: {
                  line: {
                    name: 'Train Line',
                    vehicle: { type: 'TRAIN' }
                  }
                }
              }]
            }]
          }]
        })
      })
    );
    render(<DirectionsScreen />);

    // 5. Driving mode
    global.fetch.mockResolvedValueOnce(
      Promise.resolve({
        json: () => Promise.resolve({
          routes: [{
            legs: [{
              steps: [{
                html_instructions: 'Drive north',
                travel_mode: 'DRIVING',
                polyline: { points: 'yz' }
              }]
            }]
          }]
        })
      })
    );
    render(<DirectionsScreen />);
  });

  // Test shuttle mode
  test('handles shuttle mode calculations', () => {
    // Valid shuttle route (Loyola to SGW)
    require('../../utils/shuttleUtils').isNearCampus.mockImplementation((coords, campusCoords) => {
      // Return true if one is near Loyola and one is near SGW
      const isLoyola = (Math.abs(coords.latitude - 45.458424) < 0.001);
      const isSGW = (Math.abs(coords.latitude - 45.495729) < 0.001);
      const isLoyolaCampus = (Math.abs(campusCoords.latitude - 45.458424) < 0.001);
      const isSGWCampus = (Math.abs(campusCoords.latitude - 45.495729) < 0.001);
      
      return (isLoyola && isSGWCampus) || (isSGW && isLoyolaCampus);
    });
    
    // Test valid shuttle route
    render(<DirectionsScreen />);

    // Invalid shuttle route
    require('../../utils/shuttleUtils').isNearCampus.mockReturnValue(false);
    render(<DirectionsScreen />);
  });

  // Test different zoom levels
  test('handles zoom level calculations', () => {
    // Render the component
    render(<DirectionsScreen />);
    
    // Note: We can't directly test the function, but by rendering,
    // we cover the code path for the calculateZoomLevel function
  });
});