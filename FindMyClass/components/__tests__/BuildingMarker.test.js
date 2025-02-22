import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import BuildingMarker from '../BuildingMarker'; // Adjust path as needed
import { Marker, Polygon } from 'react-native-maps';

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
    const mockBuildingColors = { '1': { stroke: 'blue', fill: 'green' } };

    it('returns null when position is missing', () => {
        const { queryByText } = render(
            <BuildingMarker
                building={mockBuilding}
                router={mockRouter}
                nearestBuilding={mockBuilding}
                buildingColors={mockBuildingColors}
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
                buildingColors={mockBuildingColors}
                position={mockPosition}
            />
        );
        expect(Polygon).toHaveBeenCalledWith(
            expect.objectContaining({
                coordinates: {}, // Since outer is undefined, it falls back to the empty object
            }),
            {}
        );
    });

    it('uses default stroke and fill colors when buildingColors is missing entry for building', () => {
        const buildingColorsWithoutEntry = {};
        render(
            <BuildingMarker
                building={mockBuilding}
                router={mockRouter}
                nearestBuilding={mockBuilding}
                buildingColors={buildingColorsWithoutEntry}
                position={mockPosition}
            />
        );
        expect(Polygon).toHaveBeenCalledWith(
            expect.objectContaining({
                strokeColor: 'rgba(0, 0, 0, 0.8)',
                fillColor: 'rgba(0, 0, 0, 0.4)',
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
                buildingColors={mockBuildingColors}
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
                buildingColors={mockBuildingColors}
                position={mockPosition}
            />
        );
        expect(Polygon).toHaveBeenCalledWith(
            expect.objectContaining({ holes: [buildingWithHoles.boundary.inner] }),
            {}
        );
    });

    it('does not navigate if CalloutSubview is not pressed', () => {
        render(
            <BuildingMarker
                building={mockBuilding}
                router={mockRouter}
                nearestBuilding={mockBuilding}
                buildingColors={mockBuildingColors}
                position={mockPosition}
            />
        );
        expect(mockRouter.push).not.toHaveBeenCalled();
    });

    it('does not break if position is an empty object', () => {
        const { getByText } = render(
            <BuildingMarker
                building={mockBuilding}
                router={mockRouter}
                nearestBuilding={mockBuilding}
                buildingColors={mockBuildingColors}
                position={{}}
            />
        );
        // Since the building name isn't rendered as text,
        // we check for the building description instead.
        expect(getByText('A test building')).toBeTruthy();
    });

    it('navigates to directions on button press', () => {
        const { getByText } = render(
            <BuildingMarker
                building={mockBuilding}
                router={mockRouter}
                nearestBuilding={mockBuilding}
                buildingColors={mockBuildingColors}
                position={mockPosition}
            />
        );
        fireEvent.press(getByText('Get Directions'));
        expect(mockRouter.push).toHaveBeenCalledWith({
            pathname: '/screens/directions',
            params: {
                destination: JSON.stringify(mockPosition),
                buildingName: 'Test Building',
            },
        });
    });
});
