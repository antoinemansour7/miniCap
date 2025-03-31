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