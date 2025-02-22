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
    Marker: View,
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
    // Count buildings that have valid boundary coordinates
    const validBuildings = LoyolaBuildings.filter((building) => {
      const boundary = building.boundary?.outer || building.boundary;
      return boundary && boundary.length > 0;
    });
    const markers = getAllByTestId(/marker-/);
    expect(markers.length).toBe(validBuildings.length);
  });
});
