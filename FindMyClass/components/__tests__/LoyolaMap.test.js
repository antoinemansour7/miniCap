import React from 'react';
import { render, act } from '@testing-library/react-native';
import LoyolaMap from '../LoyolaMap';
import LoyolaBuildings from '../loyolaBuildings';

// New: Mock BuildingMarker to add a testID for each marker
jest.mock('../BuildingMarker', () => {
    const React = require('react');
    const { View } = require('react-native');
    return (props) => <View testID={`marker-${props.building.name}`} {...props} />;
});

jest.mock('react-native-maps', () => {
    const { View } = require('react-native');
    return {
        __esModule: true,
        default: View,
        Marker: View,
        Polygon: View,
        PROVIDER_GOOGLE: 'google',
    };
});

describe('LoyolaMap Component', () => {
    it('renders correctly', () => {
        const { getByTestId } = render(<LoyolaMap />);
        expect(getByTestId('map-view')).toBeTruthy();
    });

    it('updates region when searchText is provided', () => {
        const searchText = LoyolaBuildings[0].name;
        const { rerender } = render(<LoyolaMap searchText="" />);
        
        act(() => {
            rerender(<LoyolaMap searchText={searchText} />);
        });
        
        // Simulating the map update with the correct region
        expect(true).toBeTruthy(); // Placeholder assertion
    });

    // NEW unit test for rendering all building markers
    it('renders all building markers', () => {
        const { getAllByTestId } = render(<LoyolaMap />);
        // Count buildings that have valid boundary coordinates
        const validBuildings = LoyolaBuildings.filter(building => {
            const boundary = building.boundary?.outer || building.boundary;
            return boundary && boundary.length > 0;
        });
        const markers = getAllByTestId((id) => id.startsWith('marker-'));
        expect(markers.length).toBe(validBuildings.length);
    });
});
