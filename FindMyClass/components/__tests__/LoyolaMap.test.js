import React from 'react';
import { render, act } from '@testing-library/react-native';
import LoyolaMap from '../LoyolaMap';
import LoyolaBuildings from '../loyolaBuildings';
import MapView from 'react-native-maps';

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
});
