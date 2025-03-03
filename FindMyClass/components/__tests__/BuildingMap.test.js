import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import BuildingMap from '../components/BuildingMap';
import useLocationHandler from '../hooks/useLocationHandler';
import MapView from 'react-native-maps';

// Mock useLocationHandler to control its return values
jest.mock('../hooks/useLocationHandler', () => ({
  __esModule: true,
  default: jest.fn(() => ({
    userLocation: { latitude: 37.7749, longitude: -122.4194 },
    nearestBuilding: { id: 1, name: 'Test Building' },
  })),
}));

describe('BuildingMap Component', () => {
  const mockBuildings = [
    { id: 1, name: 'Building A', latitude: 37.7749, longitude: -122.4194 },
    { id: 2, name: 'Building B', latitude: 37.7755, longitude: -122.4200 },
  ];

  const mockSearchCoordinates = jest.fn((building) => ({
    latitude: building.latitude,
    longitude: building.longitude,
  }));

  const mockGetMarkerPosition = jest.fn((building) => ({
    latitude: building.latitude,
    longitude: building.longitude,
  }));

  test('renders map and markers correctly', async () => {
    const { getByTestId, getAllByTestId } = render(
      <BuildingMap
        buildings={mockBuildings}
        initialRegion={{ latitude: 37.7749, longitude: -122.4194, latitudeDelta: 0.01, longitudeDelta: 0.01 }}
        buildingsRegion={{ latitude: 37.7749, longitude: -122.4194 }}
        searchCoordinates={mockSearchCoordinates}
        recenterDeltaUser={{ latitudeDelta: 0.01, longitudeDelta: 0.01 }}
        recenterDeltaBuildings={{ latitudeDelta: 0.02, longitudeDelta: 0.02 }}
        getMarkerPosition={mockGetMarkerPosition}
      />
    );

    // Ensure the map is rendered
    expect(getByTestId('map-view')).toBeTruthy();

    // Ensure markers for buildings are rendered
    const buildingMarkers = getAllByTestId('building-marker');
    expect(buildingMarkers.length).toBe(mockBuildings.length);
  });

  test('searching for a building updates map position', async () => {
    const { getByPlaceholderText } = render(
      <BuildingMap
        buildings={mockBuildings}
        initialRegion={{ latitude: 37.7749, longitude: -122.4194, latitudeDelta: 0.01, longitudeDelta: 0.01 }}
        buildingsRegion={{ latitude: 37.7749, longitude: -122.4194 }}
        searchCoordinates={mockSearchCoordinates}
        recenterDeltaUser={{ latitudeDelta: 0.01, longitudeDelta: 0.01 }}
        recenterDeltaBuildings={{ latitudeDelta: 0.02, longitudeDelta: 0.02 }}
        getMarkerPosition={mockGetMarkerPosition}
      />
    );

    const searchInput = getByPlaceholderText('Search...');
    fireEvent.changeText(searchInput, 'Building A');

    await waitFor(() => {
      expect(mockSearchCoordinates).toHaveBeenCalledWith(mockBuildings[0]);
    });
  });

  test('recenter button centers on user location', async () => {
    const { getByTestId, getByText } = render(
      <BuildingMap
        buildings={mockBuildings}
        initialRegion={{ latitude: 37.7749, longitude: -122.4194, latitudeDelta: 0.01, longitudeDelta: 0.01 }}
        buildingsRegion={{ latitude: 37.7749, longitude: -122.4194 }}
        searchCoordinates={mockSearchCoordinates}
        recenterDeltaUser={{ latitudeDelta: 0.01, longitudeDelta: 0.01 }}
        recenterDeltaBuildings={{ latitudeDelta: 0.02, longitudeDelta: 0.02 }}
        getMarkerPosition={mockGetMarkerPosition}
      />
    );

    // Ensure recenter button exists
    const recenterButton = getByTestId('recenter-button');
    expect(recenterButton).toBeTruthy();

    fireEvent.press(recenterButton);

    // Expect the map to animate to user location
    await waitFor(() => {
      expect(mockGetMarkerPosition).toHaveBeenCalledWith(mockBuildings[0]);
    });
  });
});
