import React from 'react';
import { render, waitFor, fireEvent } from '@testing-library/react-native';
import SGWMap from '../SGWMap';
import SGWBuildings from '../SGWBuildings';
import useLocationHandler from '../../hooks/useLocationHandler';

// Set up global mock for the MapView ref with a getCamera method for recenter button tests
global.mockMapViewRef = { 
  animateToRegion: jest.fn(),
  getCamera: jest.fn(() =>
    Promise.resolve({ center: { latitude: 45.45, longitude: -73.58 } })
  )
};

// Mock BuildingMarker component
jest.mock('../BuildingMarker', () => {
    const React = require('react');
    const { View } = require('react-native');
    const MockBuildingMarker = (props) => (
        <View testID={`marker-${props.building.name}`} {...props} />
    );
    return MockBuildingMarker;
});

// Update the Marker mock to distinguish user markers from building markers
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
            // If a marker has a coordinate but no title or building prop, assume it's the user marker.
            const { View } = require('react-native');
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
    const renderWithWrapper = (component) => {
        return render(component, { wrapper: TestWrapper });
    };

    beforeEach(() => {
        jest.clearAllMocks();
        global.mockMapViewRef.animateToRegion.mockClear();
        global.mockMapViewRef.getCamera.mockClear();
        // By default, set userLocation to null.
        useLocationHandler.mockReturnValue({
            userLocation: null,
            nearestBuilding: null,
        });
    });

    it('renders correctly with initial state', () => {
        const { getByTestId } = renderWithWrapper(<SGWMap />);
        expect(getByTestId('map-view')).toBeTruthy();
    });

    it('renders all building markers', () => {
        const { getAllByTestId } = renderWithWrapper(<SGWMap />);
        // Use a RegExp matcher to retrieve all elements with testID starting with "marker-"
        const markers = getAllByTestId(/marker-/);
        // Since userLocation is null by default, only building markers are rendered.
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

    it('calls animateToRegion with correct region when search text matches a building', async () => {
        const hallBuilding = SGWBuildings.find(b => b.name.toLowerCase().includes('hall'));
        const { getByTestId } = renderWithWrapper(<SGWMap />);
        const searchInput = getByTestId('search-input');
        fireEvent.changeText(searchInput, 'Hall');
        await waitFor(() => {
            expect(global.mockMapViewRef.animateToRegion).toHaveBeenCalledWith({
                latitude: hallBuilding.latitude,
                longitude: hallBuilding.longitude,
                latitudeDelta: 0.001,
                longitudeDelta: 0.001,
            });
        });
    });

    it('does not update region if search text does not match any building', async () => {
        const { getByTestId } = renderWithWrapper(<SGWMap />);
        const searchInput = getByTestId('search-input');
        fireEvent.changeText(searchInput, 'Nonexistent');
        await waitFor(() => {
            expect(global.mockMapViewRef.animateToRegion).not.toHaveBeenCalled();
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

    it('does not render recenter button when userLocation is null', () => {
        useLocationHandler.mockReturnValue({
            userLocation: null,
            nearestBuilding: null,
        });
        const { queryByText } = renderWithWrapper(<SGWMap />);
        expect(queryByText('📍')).toBeNull();
    });

    it('renders recenter button when userLocation is provided and far from buildings', async () => {
        useLocationHandler.mockReturnValue({
            userLocation: { latitude: 45.45, longitude: -73.58 },
            nearestBuilding: null,
        });
        // Ensure getCamera returns a camera with center far enough from the buildings region
        global.mockMapViewRef.getCamera = jest.fn(() =>
            Promise.resolve({ center: { latitude: 45.45, longitude: -73.58 } })
        );
        const { getByText } = renderWithWrapper(<SGWMap />);
        await waitFor(() => {
            expect(getByText('📍')).toBeTruthy();
        });
    });

    it('calls recenterMap when recenter button is pressed', async () => {
        useLocationHandler.mockReturnValue({
            userLocation: { latitude: 45.45, longitude: -73.58 },
            nearestBuilding: null,
        });
        global.mockMapViewRef.getCamera = jest.fn(() =>
            Promise.resolve({ center: { latitude: 45.45, longitude: -73.58 } })
        );
        const { getByText } = renderWithWrapper(<SGWMap />);
        const button = await waitFor(() => getByText('📍'));
        fireEvent.press(button);
        expect(global.mockMapViewRef.animateToRegion).toHaveBeenCalled();
    });

    it('renders user location marker when userLocation is provided', async () => {
        useLocationHandler.mockReturnValue({
            userLocation: { latitude: 45.45, longitude: -73.58 },
            nearestBuilding: null,
        });
        const { getByTestId } = renderWithWrapper(<SGWMap />);
        await waitFor(() => {
            expect(getByTestId('user-marker')).toBeTruthy();
        });
    });
});
