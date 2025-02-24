import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import BuildingMarker from '../BuildingMarker'; // Adjust path as needed
import { Marker, Polygon } from 'react-native-maps';
import { Alert } from 'react-native';

jest.mock('react-native-maps', () => {
  return {
    Marker: jest.fn(({ children, ...props }) => <>{children}</>),
    Callout: jest.fn(({ children }) => <>{children}</>),
    CalloutSubview: jest.fn(({ onPress, children }) => (
      <div onClick={onPress}>{children}</div>
    )),
    Polygon: jest.fn(() => null),
  };
});

describe('BuildingMarker Component', () => {
  const mockRouter = { push: jest.fn() };
  const mockBuilding = {
    id: '1',
    name: 'Test Building',
    description: 'A test building',
    purpose: 'Educational',
    facilities: 'Library, Labs',
    address: '123 Test St',
    contact: '123-456-7890',
    boundary: { outer: [{ latitude: 10, longitude: 10 }, { latitude: 20, longitude: 20 }] },
  };
  const mockPosition = { latitude: 10, longitude: 10 };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns null when position is missing', () => {
    const { queryByText } = render(
      <BuildingMarker
        building={mockBuilding}
        router={mockRouter}
        nearestBuilding={mockBuilding}
        position={null}
      />
    );
    expect(queryByText('Test Building')).toBeNull();
  });

  it('renders Polygon with default props when boundary is an empty object', () => {
    const buildingWithEmptyBoundary = { ...mockBuilding, boundary: {} };
    render(
      <BuildingMarker
        building={buildingWithEmptyBoundary}
        router={mockRouter}
        nearestBuilding={mockBuilding}
        position={mockPosition}
      />
    );
    expect(Polygon).toHaveBeenCalledWith(
      expect.objectContaining({
        coordinates: {},
      }),
      {}
    );
  });

  it('uses default stroke and fill colors for Polygon', () => {
    render(
      <BuildingMarker
        building={mockBuilding}
        router={mockRouter}
        nearestBuilding={mockBuilding}
        position={mockPosition}
      />
    );
    expect(Polygon).toHaveBeenCalledWith(
      expect.objectContaining({
        strokeColor: 'rgba(155, 27, 48, 0.8)',
        fillColor: 'rgba(155, 27, 48, 0.4)',
      }),
      {}
    );
  });

  it('renders correctly when nearestBuilding is undefined', () => {
    render(
      <BuildingMarker
        building={mockBuilding}
        router={mockRouter}
        nearestBuilding={undefined}
        position={mockPosition}
      />
    );
    expect(Marker).toHaveBeenCalledWith(expect.objectContaining({ pinColor: undefined }), {});
  });

  it('renders Polygon with holes if inner boundary exists', () => {
    const buildingWithHoles = {
      ...mockBuilding,
      boundary: {
        outer: [{ latitude: 10, longitude: 10 }, { latitude: 20, longitude: 20 }],
        inner: [{ latitude: 12, longitude: 12 }, { latitude: 18, longitude: 18 }],
      },
    };
    render(
      <BuildingMarker
        building={buildingWithHoles}
        router={mockRouter}
        nearestBuilding={mockBuilding}
        position={mockPosition}
      />
    );
    expect(Polygon).toHaveBeenCalledWith(
      expect.objectContaining({ holes: [buildingWithHoles.boundary.inner] }),
      {}
    );
  });

  it('does not render Polygon when building.boundary is not provided', () => {
    const buildingWithoutBoundary = { ...mockBuilding, boundary: undefined };
    render(
      <BuildingMarker
        building={buildingWithoutBoundary}
        router={mockRouter}
        nearestBuilding={mockBuilding}
        position={mockPosition}
      />
    );
    expect(Polygon).not.toHaveBeenCalled();
  });

  it('does not navigate if CalloutSubview is not pressed', () => {
    render(
      <BuildingMarker
        building={mockBuilding}
        router={mockRouter}
        nearestBuilding={mockBuilding}
        position={mockPosition}
      />
    );
    expect(mockRouter.push).not.toHaveBeenCalled();
  });

  it('renders building name in callout when position is provided', () => {
    const { getByText } = render(
      <BuildingMarker
        building={mockBuilding}
        router={mockRouter}
        nearestBuilding={mockBuilding}
        position={mockPosition}
      />
    );
    // The callout should display the building name.
    expect(getByText('Test Building')).toBeTruthy();
  });

  it('navigates to directions on "Directions" button press', () => {
    const { getByText } = render(
      <BuildingMarker
        building={mockBuilding}
        router={mockRouter}
        nearestBuilding={mockBuilding}
        position={mockPosition}
      />
    );
    // Simulate pressing the Directions button.
    fireEvent.press(getByText('Directions'));
    expect(mockRouter.push).toHaveBeenCalledWith({
      pathname: '/screens/directions',
      params: {
        destination: JSON.stringify(mockPosition),
        buildingName: 'Test Building',
      },
    });
  });

  it('shows alert with building details on "More Info" button press', () => {
    const alertSpy = jest.spyOn(Alert, 'alert').mockImplementation(() => {});
    const { getByText } = render(
      <BuildingMarker
        building={mockBuilding}
        router={mockRouter}
        nearestBuilding={mockBuilding}
        position={mockPosition}
      />
    );
    // Simulate pressing the More Info button.
    fireEvent.press(getByText('More Info'));
    const expectedMessage =
      `🏢 Purpose: Educational\n` +
      `🛠 Facilities: Library, Labs\n` +
      `📍 Address: 123 Test St\n` +
      `☎ Contact: 123-456-7890\n` +
      `ℹ Description: A test building`;
    expect(alertSpy).toHaveBeenCalledWith(
      'Test Building',
      expectedMessage,
      [{ text: 'Close', style: 'cancel' }]
    );
    alertSpy.mockRestore();
  });

  it('does not break if position is an empty object', () => {
    const { getByText } = render(
      <BuildingMarker
        building={mockBuilding}
        router={mockRouter}
        nearestBuilding={mockBuilding}
        position={{}}
      />
    );
    // The callout displays the building name.
    expect(getByText('Test Building')).toBeTruthy();
  });
});
