import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import BuildingMarker from '../BuildingMarker';

describe('BuildingMarker Component', () => {
    const mockRouter = { push: jest.fn() };
    const testBuilding = {
        id: 'TEST',
        name: 'Test Building',
        description: 'A test building',
        purpose: 'Test Purpose',
        facilities: 'Test Facilities',
        address: 'Test Address',
        contact: 'Test Contact',
        boundary: {
            outer: [
                { latitude: 37.78825, longitude: -122.4324 },
                { latitude: 37.78835, longitude: -122.4324 },
                { latitude: 37.78835, longitude: -122.4325 },
                { latitude: 37.78825, longitude: -122.4325 },
            ],
        },
    };
    const testPosition = { latitude: 37.7883, longitude: -122.43245 };

    it('renders marker and callout with building info', () => {
        const { getByText } = render(
            <BuildingMarker
                building={testBuilding}
                router={mockRouter}
                nearestBuilding={null}
                buildingColors={{
                    TEST: { stroke: 'rgba(0,0,0,0.8)', fill: 'rgba(0,0,0,0.4)' },
                }}
                position={testPosition}
            />
        );
        // Verify text contents in callout
        expect(getByText('Test Building')).toBeTruthy();
        expect(getByText('A test building')).toBeTruthy();
        expect(getByText('Test Purpose')).toBeTruthy();
        expect(getByText('Test Facilities')).toBeTruthy();
        expect(getByText('Test Address')).toBeTruthy();
        expect(getByText('Test Contact')).toBeTruthy();
        expect(getByText('Get Directions')).toBeTruthy();
    });

    it('navigates when "Get Directions" is pressed', () => {
        const { getByText } = render(
            <BuildingMarker
                building={testBuilding}
                router={mockRouter}
                nearestBuilding={null}
                buildingColors={{
                    TEST: { stroke: 'rgba(0,0,0,0.8)', fill: 'rgba(0,0,0,0.4)' },
                }}
                position={testPosition}
            />
        );
        fireEvent.press(getByText('Get Directions'));
        expect(mockRouter.push).toHaveBeenCalledWith({
            pathname: '/screens/directions',
            params: {
                destination: JSON.stringify(testPosition),
                buildingName: testBuilding.name,
            },
        });
    });

    it('does not render marker when no valid position is provided', () => {
        const testBuilding = {
            id: 'TEST',
            name: 'Test Building',
            description: 'A test building',
            purpose: 'Test Purpose',
            facilities: 'Test Facilities',
            address: 'Test Address',
            contact: 'Test Contact',
            boundary: {
                outer: [
                    { latitude: 37.78825, longitude: -122.4324 },
                    { latitude: 37.78835, longitude: -122.4324 },
                    { latitude: 37.78835, longitude: -122.4325 },
                    { latitude: 37.78825, longitude: -122.4325 },
                ],
            },
        };

        const mockRouter = { push: jest.fn() };
        // Passing undefined for the position should result in no marker rendered
        const { toJSON } = render(
            <BuildingMarker
                building={testBuilding}
                router={mockRouter}
                nearestBuilding={null}
                buildingColors={{
                    TEST: { stroke: 'rgba(0,0,0,0.8)', fill: 'rgba(0,0,0,0.4)' },
                }}
                position={undefined}
            />
        );
        expect(toJSON()).toBeNull();
    });

    it('renders marker with red pin when it is the nearest building', () => {
        const mockRouter = { push: jest.fn() };
        const testBuilding = {
            id: 'TEST',
            name: 'Test Building',
            description: 'A test building',
            purpose: 'Test Purpose',
            facilities: 'Test Facilities',
            address: 'Test Address',
            contact: 'Test Contact',
            boundary: {
                outer: [
                    { latitude: 37.78825, longitude: -122.4324 },
                    { latitude: 37.78835, longitude: -122.4324 },
                    { latitude: 37.78835, longitude: -122.4325 },
                    { latitude: 37.78825, longitude: -122.4325 },
                ],
            },
        };
        const testPosition = { latitude: 37.7883, longitude: -122.43245 };

        const { UNSAFE_getByType } = render(
            <BuildingMarker
                building={testBuilding}
                router={mockRouter}
                nearestBuilding={testBuilding}  // Branch: marker is nearest
                buildingColors={{
                    TEST: { stroke: 'rgba(0,0,0,0.8)', fill: 'rgba(0,0,0,0.4)' },
                }}
                position={testPosition}
            />
        );
        const markerElement = UNSAFE_getByType('Marker');
        // Verify that the Marker prop "pinColor" is set to red for the nearest building.
        expect(markerElement.props.pinColor).toBe('red');
    });

    it('renders polygon with holes when inner boundaries exist', () => {
        const mockRouter = { push: jest.fn() };
        const innerBoundary = [
            { latitude: 37.78826, longitude: -122.43242 },
            { latitude: 37.78836, longitude: -122.43242 },
            { latitude: 37.78836, longitude: -122.43252 },
            { latitude: 37.78826, longitude: -122.43252 },
        ];
        const testBuilding = {
            id: 'TEST',
            name: 'Test Building With Hole',
            description: 'A test building with inner boundary',
            purpose: 'Test Purpose',
            facilities: 'Test Facilities',
            address: 'Test Address',
            contact: 'Test Contact',
            boundary: {
                outer: [
                    { latitude: 37.78825, longitude: -122.4324 },
                    { latitude: 37.78835, longitude: -122.4324 },
                    { latitude: 37.78835, longitude: -122.4325 },
                    { latitude: 37.78825, longitude: -122.4325 },
                ],
                inner: innerBoundary,
            },
        };
        const testPosition = { latitude: 37.7883, longitude: -122.43245 };

        const { toJSON } = render(
            <BuildingMarker
                building={testBuilding}
                router={mockRouter}
                nearestBuilding={null}
                buildingColors={{
                    TEST: { stroke: 'rgba(0,0,0,0.8)', fill: 'rgba(0,0,0,0.4)' },
                }}
                position={testPosition}
            />
        );
        // Recursively find the Polygon element within the JSON tree.
        const findPolygonNode = (node) => {
            if (!node) return null;
            if (node.type === 'Polygon' && node.props && node.props.holes) {
                return node;
            }
            if (node.children && node.children.length) {
                for (const child of node.children) {
                    const found = findPolygonNode(child);
                    if (found) return found;
                }
            }
            return null;
        };
        const polygonNode = findPolygonNode(toJSON());
        expect(polygonNode).not.toBeNull();
        expect(polygonNode.props.holes).toEqual([innerBoundary]);
    });
});
