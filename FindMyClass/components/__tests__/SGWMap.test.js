import React from 'react';
import { render, waitFor } from '@testing-library/react-native';
import SGWMap from '../SGWMap';
import SGWBuildings from '../SGWBuildings';
import useLocationHandler from '../../hooks/useLocationHandler';

// Mock BuildingMarker component
jest.mock('../BuildingMarker', () => {
    const React = require('react');
    const { View } = require('react-native');
    const MockBuildingMarker = (props) => (
        <View testID={`marker-${props.building.name}`} {...props} />
    );
    return MockBuildingMarker;
});

// Mock MapView and related components
jest.mock('react-native-maps', () => {
    const React = require('react');
    const { View } = require('react-native');
    const MockMapView = React.forwardRef((props, ref) => {
        React.useImperativeHandle(ref, () => ({
            animateToRegion: jest.fn(),
        }));
        return <View testID="map-view" {...props} />;
    });
    MockMapView.displayName = 'MockMapView';
    
    return {
        __esModule: true,
        default: MockMapView,
        Marker: (props) => {
            const { View } = require('react-native');
            return <View testID={`marker-${props.title}`} {...props} />;
        },
        Polygon: (props) => {
            const { View } = require('react-native');
            return <View testID={`polygon-${props.buildingId}`} {...props} />;
        },
        Callout: (props) => {
            const { View } = require('react-native');
            return <View testID="callout" {...props} />;
        },
        CalloutSubview: (props) => {
            const { View } = require('react-native');
            return <View testID="callout-subview" {...props} />;
        },
    };
});

// Mock location handler and router
jest.mock('../../hooks/useLocationHandler');
jest.mock('expo-router', () => ({
    useRouter: () => ({
        push: jest.fn(),
    }),
}));

// Test wrapper component
const TestWrapper = ({ children }) => {
    const { View } = require('react-native');
    return <View>{children}</View>;
};

describe('SGWMap Component', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        useLocationHandler.mockReturnValue({
            userLocation: null,
            nearestBuilding: null,
            noNearbyBuilding: false,
            messageVisible: false,
        });
    });

    const renderWithWrapper = (component) => {
        return render(component, { wrapper: TestWrapper });
    };

    // Update test cases to use renderWithWrapper
    it('renders correctly with initial state', () => {
        const { getByTestId } = renderWithWrapper(<SGWMap />);
        expect(getByTestId('map-view')).toBeTruthy();
    });

    it('renders all building markers', () => {
        const { getAllByTestId } = renderWithWrapper(<SGWMap />);
        const markers = getAllByTestId(/^marker-/);
        expect(markers.length).toBe(SGWBuildings.length);
    });

    it('shows message when no nearby building is found', () => {
        useLocationHandler.mockReturnValue({
            userLocation: { latitude: 45.4965, longitude: -73.5780 },
            nearestBuilding: null,
            noNearbyBuilding: true,
            messageVisible: true,
        });

        const { getByText } = renderWithWrapper(<SGWMap />);
        expect(getByText('You are not near any of the buildings')).toBeTruthy();
    });

    it('updates map region when search text changes', async () => {
        const mockAnimateToRegion = jest.fn();
        const mapRef = {
            current: {
                animateToRegion: mockAnimateToRegion,
            },
        };
        
        jest.spyOn(React, 'useRef').mockReturnValue(mapRef);

        const { rerender } = renderWithWrapper(<SGWMap searchText="" />);
        rerender(<SGWMap searchText="Hall" />);

        await waitFor(() => {
            expect(mockAnimateToRegion).toHaveBeenCalled();
        });
    });

    it('applies correct colors to building markers', () => {
        const { getByTestId } = renderWithWrapper(<SGWMap />);
        const hallBuilding = SGWBuildings.find(b => b.name.includes('Hall'));
        const marker = getByTestId(`marker-${hallBuilding.name}`);
        
        expect(marker.props.buildingColors).toBeDefined();
        expect(marker.props.buildingColors.H).toEqual({
            stroke: 'rgba(255, 204, 0, 0.8)',
            fill: 'rgba(255, 204, 0, 0.4)'
        });
    });

    it('handles buildings without boundary coordinates', () => {
        const buildingWithoutBoundary = {
            ...SGWBuildings[0],
            boundary: null,
            latitude: 45.4965,
            longitude: -73.5780,
        };

        const { getByTestId } = renderWithWrapper(
            <SGWMap buildings={[buildingWithoutBoundary]} />
        );

        expect(getByTestId(`marker-${buildingWithoutBoundary.name}`)).toBeTruthy();
    });
});