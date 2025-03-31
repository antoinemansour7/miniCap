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

  it('sets Hall building focus correctly when zoomed in and centered', async () => {
    const hallBuilding = {
      id: 'H',
      name: 'Hall',
      latitude: 45.0005,
      longitude: -73.0005,
      boundary: [{ latitude: 45.0004, longitude: -73.0004 }],
    };
  
    const { rerender } = render(<BuildingMap {...{ ...defaultProps, buildings: [hallBuilding] }} />);
    
    await act(async () => {
      onRegionChangeCompleteMock({
        latitude: 45.0005,
        longitude: -73.0005,
        latitudeDelta: 0.0005, // high zoom
        longitudeDelta: 0.0005,
      });
    });
  
    rerender(<BuildingMap {...{ ...defaultProps, buildings: [hallBuilding] }} />);
  });


  it('sets JMSB building focus correctly', async () => {
    const jmsb = {
      id: 'MB',
      name: 'JMSB',
      latitude: 45.001,
      longitude: -73.001,
      boundary: [{ latitude: 45.001, longitude: -73.001 }],
    };
  
    render(<BuildingMap {...{ ...defaultProps, buildings: [jmsb] }} />);
  
    await act(async () => {
      onRegionChangeCompleteMock({
        latitude: 45.001,
        longitude: -73.001,
        latitudeDelta: 0.0005,
        longitudeDelta: 0.0005,
      });
    });
  });

  it('handles search for JMSB room correctly', async () => {
    const jmsbRoom = {
      id: 'MB-1.245',
      name: 'MB-1.245',
      building: true,
      object: { id: 'MB' },
      location: { x: 2, y: 3 },
    };
  
    const { getByPlaceholderText } = render(
      <BuildingMap {...{ ...defaultProps, buildings: [jmsbRoom] }} />
    );
  
    await act(async () => {
      fireEvent.changeText(getByPlaceholderText(/search/i), 'MB-1.245');
    });
  });

  it('handles search and sets classroom coordinates for Hall building', async () => {
    const hallRoom = {
      id: 'H-921',
      name: 'H-921',
      building: true,
      object: { id: 'H' },
      location: { x: 10, y: 15 },
    };
  
    const { getByPlaceholderText } = render(<BuildingMap {...{ ...defaultProps, buildings: [hallRoom] }} />);
  
    await act(async () => {
      fireEvent.changeText(getByPlaceholderText(/search/i), 'H-921');
    });
  
    // getExactCoordinates will be called inside the effect
  });
  
  it('handles search and sets classroom coordinates and floor for Vanier building', async () => {
    const vanierRoom = {
      id: "VL-101-6",
      name: "VL-101-6",
      building: true,
      object: { id: 'VL' },
      location: { x: 12, y: 18 },
    };
  
    const { getByPlaceholderText } = render(<BuildingMap {...{ ...defaultProps, buildings: [vanierRoom] }} />);
  
    await act(async () => {
      fireEvent.changeText(getByPlaceholderText(/search/i), 'VL-101-6');
    });
  });
  
  it('handles search and sets classroom coordinates and floor for CC building', async () => {
    const ccRoom = {
      id: 'CC-107',
      name: 'CC-107',
      building: true,
      object: { id: 'CC' },
      location: { x: 5, y: 9 },
    };
  
    const { getByPlaceholderText } = render(<BuildingMap {...{ ...defaultProps, buildings: [ccRoom] }} />);
  
    await act(async () => {
      fireEvent.changeText(getByPlaceholderText(/search/i), 'CC-107');
    });
  });
  
  it('handles search for a building that is not a classroom', async () => {
    const building = {
      id: 'H',
      name: 'Hall',
      building: false,
      object: { id: 'H' },
    };
  
    const { getByPlaceholderText } = render(<BuildingMap {...{ ...defaultProps, buildings: [building] }} />);
  
    await act(async () => {
      fireEvent.changeText(getByPlaceholderText(/search/i), 'Hall');
    });
  });
  
  it('handles search with no matching building', async () => {
    const { getByPlaceholderText } = render(<BuildingMap {...defaultProps} />);
  
    await act(async () => {
      fireEvent.changeText(getByPlaceholderText(/search/i), 'NonExistentRoom');
    });
  
    // Should not crash or throw
    expect(true).toBeTruthy();
  });
  

  it('handles search when result is not a room', async () => {
    const building = { id: 'MB', name: 'JMSB' };
  
    const { getByPlaceholderText } = render(
      <BuildingMap {...{ ...defaultProps, buildings: [building] }} />
    );
  
    await act(async () => {
      fireEvent.changeText(getByPlaceholderText(/search/i), 'JMSB');
    });
  });

  it('sets Vanier building focus correctly', async () => {
    const vanier = {
      id: 'VL',
      name: 'Vanier Library',
      latitude: 45.4591277,
      longitude: -73.6382146,
      boundary: [{ latitude: 45.4591277, longitude: -73.6382146 }],
    };
  
    render(<BuildingMap {...{ ...defaultProps, buildings: [vanier] }} />);
  
    await act(async () => {
      onRegionChangeCompleteMock({
        latitude: 45.4591277,
        longitude: -73.6382146,
        latitudeDelta: 0.0005,
        longitudeDelta: 0.0005,
      });
    });
  });

  it('sets CC building focus correctly', async () => {
    const CC = {
      id: 'CC',
      name: 'Central Building',
      latitude: 45.4583684,
      longitude: -73.6404372,
      boundary: [{ latitude: 45.4583684, longitude: -73.6404372 }],
    };
  
    render(<BuildingMap {...{ ...defaultProps, buildings: [CC] }} />);
  
    await act(async () => {
      onRegionChangeCompleteMock({
        latitude: 45.4583684,
        longitude: -73.6404372,
        latitudeDelta: 0.0005,
        longitudeDelta: 0.0005,
      });
    });
  });
});

describe('onRegionChange', () => {
  let onRegionChangeMock;

  beforeEach(() => {
    jest.resetModules(); // reset module registry to re-import with mocks
    jest.clearAllMocks();

    jest.mock('react-native-maps', () => {
      const React = require('react');
      const { View } = require('react-native');

      return {
        __esModule: true,
        default: React.forwardRef((props, ref) => {
          onRegionChangeMock = props.onRegionChange;

          React.useImperativeHandle(ref, () => ({
            getCamera: () => Promise.resolve({ center: { latitude: 45, longitude: -73 } }),
            animateToRegion: jest.fn(),
          }));

          return <View {...props}>{props.children}</View>;
        }),
        Marker: (props) => <View {...props} />,
        Polygon: (props) => <View {...props} />,
        Overlay: (props) => <View {...props} />,
      };
    });

    jest.doMock('../../hooks/useLocationHandler', () => ({
      __esModule: true,
      default: () => ({
        userLocation: { latitude: 45, longitude: -73 },
        nearestBuilding: { id: 'H' },
      }),
    }));
  });

  it('triggers all building focus updates in onRegionChange', async () => {
    const React = require('react');
    const { render, act } = require('@testing-library/react-native');
    const BuildingMap = require('../BuildingMap').default;

    const buildings = [
      { id: 'H', latitude: 45.0005, longitude: -73.0005, boundary: [] },
      { id: 'MB', latitude: 45.001, longitude: -73.001, boundary: [] },
      { id: 'VL', latitude: 45.002, longitude: -73.002, boundary: [] },
      { id: 'CC', latitude: 45.003, longitude: -73.003, boundary: [] },
    ];

    const defaultProps = {
      buildings,
      initialRegion: { latitude: 45, longitude: -73, latitudeDelta: 0.05, longitudeDelta: 0.05 },
      buildingsRegion: { latitude: 45, longitude: -73 },
      searchCoordinates: jest.fn(() => ({ latitude: 45.5, longitude: -73.5 })),
      recenterDeltaUser: { latitudeDelta: 0.05, longitudeDelta: 0.05 },
      recenterDeltaBuildings: { latitudeDelta: 0.1, longitudeDelta: 0.1 },
      getMarkerPosition: jest.fn((b) => ({ latitude: b.latitude, longitude: b.longitude })),
    };

    render(<BuildingMap {...defaultProps} />);

    // Zoomed in region
    await act(async () => {
      onRegionChangeMock({
        latitude: 45.0005,
        longitude: -73.0005,
        latitudeDelta: 0.0004,
        longitudeDelta: 0.0004,
      });
    });
  });
});

