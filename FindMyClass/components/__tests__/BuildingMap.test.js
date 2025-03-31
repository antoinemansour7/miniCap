import React from 'react';
import { render, fireEvent, waitFor, act } from '@testing-library/react-native';
import BuildingMap from '../BuildingMap';
import useLocationHandler from '../../hooks/useLocationHandler';

// Mock expo-router
jest.mock('expo-router', () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
}));

// Mock useLocationHandler hook
jest.mock('../../hooks/useLocationHandler');

// ---- react-native-maps mock with exposed onRegionChangeComplete ---- //
let onRegionChangeCompleteMock = jest.fn();

jest.mock('react-native-maps', () => {
  const React = require('react');
  const { View } = require('react-native');

  const MockMapView = React.forwardRef((props, ref) => {
    onRegionChangeCompleteMock = props.onRegionChangeComplete;

    React.useImperativeHandle(ref, () => ({
      getCamera: () =>
        Promise.resolve({
          center: { latitude: 46, longitude: -74 },
        }),
      animateToRegion: jest.fn(),
    }));

    return <View {...props}>{props.children}</View>;
  });

  const MockMarker = (props) => <View {...props} />;
  const MockPolygon = (props) => <View {...props} />;

  return {
    __esModule: true,
    default: MockMapView,
    Marker: MockMarker,
    Polygon: MockPolygon,
  };
});

// Mock bottom sheet component
jest.mock('@gorhom/bottom-sheet', () => {
  const React = require('react');
  const { View } = require('react-native');

  const BottomSheet = React.forwardRef((props, ref) => {
    React.useImperativeHandle(ref, () => ({
      snapToIndex: jest.fn(),
    }));

    return <View {...props} />;
  });

  const BottomSheetView = (props) => <View {...props} />;

  return { __esModule: true, default: BottomSheet, BottomSheetView };
});

// Mock BuildingMarker component
jest.mock('../BuildingMarker', () => {
  const React = require('react');
  const { View } = require('react-native');
  return () => <View testID="building-marker" />;
});

// Mock fetch for places API
global.fetch = jest.fn(() =>
  Promise.resolve({
    json: () =>
      Promise.resolve({
        results: [
          {
            place_id: '1',
            name: 'Test Place',
            geometry: { location: { lat: 45.1, lng: -73.1 } },
            vicinity: '123 Test Street',
            types: ['restaurant'],
            rating: 4.5,
          },
        ],
      }),
  })
);

describe('BuildingMap Extended Tests', () => {
  const buildingsMock = [
    {
      id: '1',
      name: 'Building One',
      boundary: { outer: [{ latitude: 45.5, longitude: -73.5 }, { latitude: 45.6, longitude: -73.6 }] },
    },
    {
      id: '2',
      name: 'Building Two',
      boundary: { outer: [{ latitude: 45.7, longitude: -73.7 }, { latitude: 45.8, longitude: -73.8 }] },
    },
  ];

  const defaultProps = {
    buildings: buildingsMock,
    initialRegion: { latitude: 45, longitude: -73, latitudeDelta: 0.05, longitudeDelta: 0.05 },
    buildingsRegion: { latitude: 45, longitude: -73 },
    searchCoordinates: jest.fn(() => ({ latitude: 45.5, longitude: -73.5 })),
    recenterDeltaUser: { latitudeDelta: 0.05, longitudeDelta: 0.05 },
    recenterDeltaBuildings: { latitudeDelta: 0.1, longitudeDelta: 0.1 },
    getMarkerPosition: jest.fn(() => ({ latitude: 45.5, longitude: -73.5 })),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    useLocationHandler.mockReturnValue({
      userLocation: { latitude: 45, longitude: -73 },
      nearestBuilding: buildingsMock[0],
    });
  });

  it('renders correctly with all required components', () => {
    const { getByText, getAllByTestId } = render(<BuildingMap {...defaultProps} />);

    expect(getByText(/Restaurant/)).toBeTruthy();
    expect(getByText(/Café/)).toBeTruthy();
    expect(getAllByTestId('building-marker').length).toBeGreaterThan(0);
  });

  it('recenters map when recenter button is pressed', async () => {
    const { getByText } = render(<BuildingMap {...defaultProps} />);

    await waitFor(() => {
      expect(getByText('📍')).toBeTruthy();
    });

    await act(async () => {
      fireEvent.press(getByText('📍'));
    });

    expect(defaultProps.getMarkerPosition).toHaveBeenCalled();
  });

  it('searches and zooms into a building correctly', async () => {
    const { getByPlaceholderText } = render(<BuildingMap {...defaultProps} />);

    const searchBar = getByPlaceholderText(/search/i);
    await act(async () => {
      fireEvent.changeText(searchBar, 'Building One');
    });

    expect(defaultProps.searchCoordinates).toHaveBeenCalledWith(buildingsMock[0]);
  });

  it('fetches places correctly upon selecting a category', async () => {
    const { getByText } = render(<BuildingMap {...defaultProps} />);

    await act(async () => {
      fireEvent.press(getByText(/Restaurant/));
    });

    await waitFor(() => {
      expect(fetch).toHaveBeenCalled();
      expect(getByText('Restaurant Nearby')).toBeTruthy();
    });
  });

  it('handles empty results gracefully', async () => {
    fetch.mockImplementationOnce(() => Promise.resolve({ json: () => Promise.resolve({ results: [] }) }));

    const { getByText } = render(<BuildingMap {...defaultProps} />);

    await act(async () => {
      fireEvent.press(getByText(/Café/));
    });

    await waitFor(() => {
      expect(getByText(/No results found/)).toBeTruthy();
    });
  });

  it('zooms to a specific place when a place item is pressed', async () => {
    const { getByText } = render(<BuildingMap {...defaultProps} />);

    await act(async () => {
      fireEvent.press(getByText(/Restaurant/));
    });

    await waitFor(() => {
      expect(getByText('Test Place')).toBeTruthy();
    });

    await act(async () => {
      fireEvent.press(getByText('Test Place'));
    });

    expect(defaultProps.getMarkerPosition).toHaveBeenCalled();
  });

  it('displays POI name when zoom level is high enough (>= 16)', async () => {
    const { getByText, getAllByText } = render(<BuildingMap {...defaultProps} />);
  
    // Select the category first
    await act(async () => {
      fireEvent.press(getByText(/Restaurant/));
    });
  
    // Simulate zoom in (high zoom level)
    await act(async () => {
      onRegionChangeCompleteMock({
        latitude: 45,
        longitude: -73,
        latitudeDelta: 0.001, // zoomed in
        longitudeDelta: 0.001,
      });
    });
  
    // Wait for UI to reflect
    await waitFor(() => {
      const places = getAllByText('Test Place');
      // Expect two instances: one in bottom sheet + one on the marker label
      expect(places.length).toBe(2);
    });
  });
  
  it('does not display POI name when zoom level is low (< 16)', async () => {
    const { getByText, queryAllByText } = render(<BuildingMap {...defaultProps} />);
  
    // Select the category first
    await act(async () => {
      fireEvent.press(getByText(/Restaurant/));
    });
  
    // Simulate zoom out (low zoom level)
    await act(async () => {
      onRegionChangeCompleteMock({
        latitude: 45,
        longitude: -73,
        latitudeDelta: 1, // zoomed out
        longitudeDelta: 1,
      });
    });
  
    // Wait for UI to reflect
    await waitFor(() => {
      const places = queryAllByText('Test Place');
      // Expect only one instance: in bottom sheet
      expect(places.length).toBe(1);
    });
  });  
});

describe('BuildingMap Region Change and Building Focus Tests', () => {
  const mockBuildings = [
    {
      id: 'H',
      name: 'Hall Building',
      latitude: 45.497163,
      longitude: -73.578535,
      boundary: [
        { latitude: 45.497163, longitude: -73.578535 },
        { latitude: 45.497263, longitude: -73.578635 }
      ]
    },
    {
      id: 'MB',
      name: 'JMSB Building',
      latitude: 45.495244,
      longitude: -73.579321,
      boundary: [
        { latitude: 45.495244, longitude: -73.579321 },
        { latitude: 45.495344, longitude: -73.579421 }
      ]
    },
    {
      id: 'VL',
      name: 'Vanier Library',
      latitude: 45.459120,
      longitude: -73.638264,
      boundary: [
        { latitude: 45.459120, longitude: -73.638264 },
        { latitude: 45.459220, longitude: -73.638364 }
      ]
    }
  ];

  const setupProps = {
    ...defaultProps,
    buildings: mockBuildings
  };

  it('handles region change and updates zoom level correctly', async () => {
    const { getByTestId } = render(<BuildingMap {...setupProps} />);
    
    await act(async () => {
      onRegionChangeCompleteMock({
        latitude: 45.497163,
        longitude: -73.578535,
        latitudeDelta: 0.001, // High zoom level
        longitudeDelta: 0.001
      });
    });

    // Test high zoom level focus
    expect(zoomLevel).toBeGreaterThan(18);
  });

  it('detects Hall Building focus correctly', async () => {
    const { getByTestId } = render(<BuildingMap {...setupProps} />);
    
    await act(async () => {
      onRegionChangeCompleteMock({
        latitude: 45.497163,
        longitude: -73.578535,
        latitudeDelta: 0.0001,
        longitudeDelta: 0.0001
      });
    });

    const floorSelector = getByTestId('hall-floor-selector');
    expect(floorSelector).toBeTruthy();
  });

  it('detects JMSB Building focus correctly', async () => {
    const { getByTestId } = render(<BuildingMap {...setupProps} />);
    
    await act(async () => {
      onRegionChangeCompleteMock({
        latitude: 45.495244,  // JMSB coordinates
        longitude: -73.579321,
        latitudeDelta: 0.0001,
        longitudeDelta: 0.0001
      });
    });

    const jmsbFloorSelector = getByTestId('jmsb-floor-selector');
    expect(jmsbFloorSelector).toBeTruthy();
  });

  it('updates selected floor correctly', async () => {
    const { getByTestId } = render(<BuildingMap {...setupProps} />);
    
    // Focus on Hall Building first
    await act(async () => {
      onRegionChangeCompleteMock({
        latitude: 45.497163,
        longitude: -73.578535,
        latitudeDelta: 0.0001,
        longitudeDelta: 0.0001
      });
    });

    // Change floor using testID
    await act(async () => {
      fireEvent.press(getByTestId('hall-floor-2-button'));
    });

    // Check if correct floor plan is displayed
    const overlay = getByTestId('hall-building-overlay');
    expect(overlay).toBeTruthy();
  });

  it('handles search functionality correctly', async () => {
    const { getByPlaceholderText } = render(<BuildingMap {...setupProps} />);
    
    const searchBar = getByPlaceholderText(/search/i);
    
    await act(async () => {
      fireEvent.changeText(searchBar, 'H-920');
    });

    // Verify that the map focuses on the correct location
    expect(mapRef.current.animateToRegion).toHaveBeenCalledWith(
      expect.objectContaining({
        latitude: expect.any(Number),
        longitude: expect.any(Number),
        latitudeDelta: 0.001,
        longitudeDelta: 0.001
      })
    );
  });

  it('handles invalid room searches gracefully', async () => {
    const { getByPlaceholderText } = render(<BuildingMap {...setupProps} />);
    
    const searchBar = getByPlaceholderText(/search/i);
    
    await act(async () => {
      fireEvent.changeText(searchBar, 'INVALID-ROOM');
    });

    // Verify that no focus change occurred
    expect(mapRef.current.animateToRegion).not.toHaveBeenCalled();
  });

  it('calculates building distances correctly', async () => {
    const { getByTestId } = render(<BuildingMap {...setupProps} />);
    
    const mockUserLocation = {
      latitude: 45.497163,
      longitude: -73.578535
    };

    await act(async () => {
      useLocationHandler.mockReturnValue({
        userLocation: mockUserLocation,
        nearestBuilding: mockBuildings[0]
      });
    });

    // Trigger region change
    await act(async () => {
      onRegionChangeCompleteMock({
        latitude: 45.497163,
        longitude: -73.578535,
        latitudeDelta: 0.001,
        longitudeDelta: 0.001
      });
    });

    // Verify that the nearest building is calculated correctly
    expect(useLocationHandler).toHaveBeenCalledWith(
      mockBuildings,
      expect.any(Function)
    );
  });
});
