import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import SGWMap from '../SGWMap';
import SGWBuildings from '../SGWBuildings';
import MapView, { Marker, Polygon } from 'react-native-maps';

jest.mock('react-native-maps', () => {
    const React = require('react');
    const { View } = require('react-native');

    return {
        __esModule: true,
        default: React.forwardRef((props, ref) => <View testID="map-view" ref={ref} {...props} />),
        Marker: (props) => <View testID={`marker-${props.title}`} {...props} />,
        Polygon: (props) => <View testID={`polygon-${props.buildingId}`} {...props} />,
    };
});

describe('SGWMap Component', () => {
    it('renders correctly', () => {
        const { getByTestId } = render(<SGWMap />);
        expect(getByTestId('map-view')).toBeTruthy();
    });

    it('renders markers for each building', () => {
        const { getByTestId } = render(<SGWMap />);
        
        SGWBuildings.forEach((building) => {
            expect(getByTestId(`marker-${building.name}`)).toBeTruthy();
        });
    });

    it('updates region when searchText is provided', async () => {
        const { rerender, getByTestId } = render(<SGWMap searchText="" />);

        rerender(<SGWMap searchText="Hall Building" />);
        
        await waitFor(() => {
            expect(getByTestId('map-view')).toBeTruthy();
        });
    });
});