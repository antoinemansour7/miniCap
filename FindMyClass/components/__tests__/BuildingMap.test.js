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



jest.mock('expo-router', () => ({
  useRouter: () => ({ push: jest.fn() }),
}));

jest.mock('../../hooks/useLocationHandler');


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

jest.mock('../BuildingMarker', () => {
  const React = require('react');
  const { View } = require('react-native');
  return () => <View testID="building-marker" />;
});

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

describe('BuildingMap Extended Tests - Additions', () => {
  const buildingsMock = [
    {
      id: '1',
      name: 'Building One',
      latitude: 45,
      longitude: -73,
      boundary: { outer: [{ latitude: 45.5, longitude: -73.5 }, { latitude: 45.6, longitude: -73.6 }] },
    },
  ];

  const defaultProps = {
    buildings: buildingsMock,
    initialRegion: { latitude: 45, longitude: -73, latitudeDelta: 0.05, longitudeDelta: 0.05 },
    buildingsRegion: { latitude: 45, longitude: -73 },
    searchCoordinates: jest.fn(() => ({ latitude: 45.5, longitude: -73.5 })),
    recenterDeltaUser: { latitudeDelta: 0.05, longitudeDelta: 0.05 },
    recenterDeltaBuildings: { latitudeDelta: 0.1, longitudeDelta: 0.1 },
    getMarkerPosition: jest.fn(() => ({ latitude: 45, longitude: -73 })),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    useLocationHandler.mockReturnValue({
      userLocation: { latitude: 45, longitude: -73 },
      nearestBuilding: buildingsMock[0],
    });
  });

  it('sets hallBuildingFocused to true when zoomed in and centered on Hall', async () => {
    const { getByText } = render(<BuildingMap {...defaultProps} />);

    await act(async () => {
      onRegionChangeCompleteMock({
        latitude: 45,
        longitude: -73,
        latitudeDelta: 0.001,
        longitudeDelta: 0.001,
      });
    });

    await waitFor(() => {
      expect(getByText('1')).toBeTruthy();
    });
  });

  it('handles classroom search and sets classroomLocation correctly', async () => {
    const classroom = {
      id: 'H-921',
      name: 'H-921',
      building: true,
      object: { id: 'H' },
      location: { x: 5, y: 5 },
    };

    const updatedProps = {
      ...defaultProps,
      buildings: [...defaultProps.buildings, classroom],
    };

    const { getByPlaceholderText } = render(<BuildingMap {...updatedProps} />);

    await act(async () => {
      fireEvent.changeText(getByPlaceholderText(/search/i), 'H-921');
    });

    expect(defaultProps.getMarkerPosition).toHaveBeenCalledWith(expect.objectContaining({ id: 'H' }));
  });

  it('debounces category selection to prevent duplicate fetches', async () => {
    const { getByText } = render(<BuildingMap {...defaultProps} />);

    const chip = getByText(/Restaurant/);
    fireEvent.press(chip);
    fireEvent.press(chip);

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledTimes(1);
    });
  });

  it('toggles map center between user and building when recenter pressed', async () => {
    const { getByText } = render(<BuildingMap {...defaultProps} />);

    const button = await waitFor(() => getByText('📍'));

    await act(async () => {
      fireEvent.press(button);
    });

    expect(defaultProps.getMarkerPosition).toHaveBeenCalled();
  });
});

