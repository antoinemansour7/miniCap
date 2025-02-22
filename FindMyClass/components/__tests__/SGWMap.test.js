import React from 'react';
import { render, waitFor, fireEvent } from '@testing-library/react-native';
import SGWMap from '../SGWMap';
import SGWBuildings from '../SGWBuildings';
import useLocationHandler from '../../hooks/useLocationHandler';

// Set up global mock for the MapView ref
global.mockMapViewRef = { animateToRegion: jest.fn() };

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
        React.useImperativeHandle(ref, () => global.mockMapViewRef);
        return <View testID="map-view" {...props} />;
    });
    MockMapView.displayName = 'MockMapView';
    
    return {
        __esModule: true,
        default: MockMapView,
        Marker: (props) => {
            const { View } = require('react-native');
            return (
                <View
                    testID={`marker-${props.title || (props.building && props.building.name)}`}
                    {...props}
                />
            );
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
        global.mockMapViewRef.animateToRegion.mockClear();
        useLocationHandler.mockReturnValue({
            userLocation: null,
            nearestBuilding: null,
        });
    });

    const renderWithWrapper = (component) => {
        return render(component, { wrapper: TestWrapper });
    };

    it('renders correctly with initial state', () => {
        const { getByTestId } = renderWithWrapper(<SGWMap />);
        expect(getByTestId('map-view')).toBeTruthy();
    });

    it('renders all building markers', () => {
        const { getAllByTestId } = renderWithWrapper(<SGWMap />);
        // Use a RegExp matcher to retrieve all elements with testID starting with "marker-"
        const markers = getAllByTestId(/marker-/);
        expect(markers.length).toBe(SGWBuildings.length);
    });

    it('updates map region when search text changes', async () => {
        const { getByTestId } = renderWithWrapper(<SGWMap />);
        const searchInput = getByTestId('search-input');
        fireEvent.changeText(searchInput, 'Hall');

        await waitFor(() => {
            expect(global.mockMapViewRef.animateToRegion).toHaveBeenCalled();
        });
    });

    it('applies correct colors to building markers', () => {
        const { getByTestId } = renderWithWrapper(<SGWMap />);
        const hallBuilding = SGWBuildings.find(b => b.name.toLowerCase().includes('hall'));
        const marker = getByTestId(`marker-${hallBuilding.name}`);
        
        expect(marker.props.buildingColors).toBeDefined();
        expect(marker.props.buildingColors.H).toEqual({
            stroke: 'rgba(155, 27, 48, 0.8)',
            fill: 'rgba(155, 27, 48, 0.4)'
        });
    });

    it('handles buildings without boundary coordinates', () => {
        // Backup the original first building
        const originalBuilding = { ...SGWBuildings[0] };
        // Temporarily set boundary to null
        SGWBuildings[0].boundary = null;

        const { getByTestId } = renderWithWrapper(<SGWMap />);
        expect(getByTestId(`marker-${SGWBuildings[0].name}`)).toBeTruthy();

        // Restore the original building data
        SGWBuildings[0].boundary = originalBuilding.boundary;
    });
});
