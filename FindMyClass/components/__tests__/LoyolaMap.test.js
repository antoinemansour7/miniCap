import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import LoyolaMap from '../LoyolaMap';
import LoyolaBuildings from '../loyolaBuildings';
import useLocationHandler from '../../hooks/useLocationHandler';

// Set up a global mock for the MapView ref with getCamera and animateToRegion
global.mockMapViewRef = {
  animateToRegion: jest.fn(),
  getCamera: jest.fn(() =>
    Promise.resolve({ center: { latitude: 45.4582, longitude: -73.6405 } })
  )
};

// Mock BuildingMarker to add a testID for each marker
jest.mock('../BuildingMarker', () => {
  const React = require('react');
  const { View } = require('react-native');
  return (props) => <View testID={`marker-${props.building.name}`} {...props} />;
});

// Mock react-native-maps to forward the ref and include getCamera
jest.mock('react-native-maps', () => {
  const React = require('react');
  const { View } = require('react-native');
  const MockMapView = React.forwardRef((props, ref) => {
    React.useImperativeHandle(ref, () => global.mockMapViewRef);
    return <View testID="map-view" {...props} />;
  });
  MockMapView.displayName = 'MockMapView';
  return {
    __esModule: true,
    default: MockMapView,
    Marker: (props) => {
      const { View } = require('react-native');
      // Render a user marker if coordinate exists but no title or building prop.
      if (props.coordinate && !props.title && !props.building) {
        return <View testID="user-marker" {...props} />;
      }
      return (
        <View
          testID={`marker-${props.title || (props.building && props.building.name)}`}
          {...props}
        />
      );
    },
    Polygon: View,
    PROVIDER_GOOGLE: 'google',
  };
});

// Mock useLocationHandler and expo-router
jest.mock('../../hooks/useLocationHandler');
jest.mock('expo-router', () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
}));

describe('LoyolaMap Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // By default, simulate a valid user location.
    useLocationHandler.mockReturnValue({
      userLocation: { latitude: 45.45, longitude: -73.64 },
      nearestBuilding: null,
    });
  });

  it('renders correctly', () => {
    const { getByTestId } = render(<LoyolaMap />);
    expect(getByTestId('map-view')).toBeTruthy();
  });

  it('updates region when searchText is provided', async () => {
    const { getByTestId } = render(<LoyolaMap />);
    const searchInput = getByTestId('search-input');
    fireEvent.changeText(searchInput, LoyolaBuildings[0].name);
    await waitFor(() => {
      expect(global.mockMapViewRef.animateToRegion).toHaveBeenCalled();
    });
  });

  it('renders all building markers', () => {
    const { getAllByTestId } = render(<LoyolaMap />);
    // Filter out the user marker; building markers have a testID matching the building name.
    const markers = getAllByTestId(/marker-/);
    const buildingMarkers = markers.filter((marker) => marker.props.testID !== 'user-marker');
    // Count only buildings with valid boundaries.
    const validBuildings = LoyolaBuildings.filter((building) => {
      const boundary = building.boundary?.outer || building.boundary;
      return boundary && boundary.length > 0;
    });
    expect(buildingMarkers.length).toBe(validBuildings.length);
  });

  it('renders user location marker when userLocation is provided', async () => {
    const { getByTestId } = render(<LoyolaMap />);
    await waitFor(() => {
      expect(getByTestId('user-marker')).toBeTruthy();
    });
  });

  it('renders recenter button when user is far from buildings', async () => {
    // Given the default userLocation and camera center, the recenter button should appear.
    const { getByText } = render(<LoyolaMap />);
    await waitFor(() => {
      expect(getByText('📍')).toBeTruthy();
    });
  });

  it('calls recenterMap when recenter button is pressed', async () => {
    const { getByText } = render(<LoyolaMap />);
    const recenterButton = await waitFor(() => getByText('📍'));
    fireEvent.press(recenterButton);
    expect(global.mockMapViewRef.animateToRegion).toHaveBeenCalled();
  });

  it('handles buildings without boundary coordinates', () => {
    // Backup the original first building
    const originalBuilding = { ...LoyolaBuildings[0] };
    // Temporarily set boundary to null
    LoyolaBuildings[0].boundary = null;
    const { getByTestId } = render(<LoyolaMap />);
    expect(getByTestId(`marker-${LoyolaBuildings[0].name}`)).toBeTruthy();
    // Restore the original building data
    LoyolaBuildings[0].boundary = originalBuilding.boundary;
  });
});
