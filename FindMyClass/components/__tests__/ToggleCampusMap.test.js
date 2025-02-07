import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import ToggleCampusMap from '../ToggleCampusMap';
import SGWMap from '../SGWMap';
import LoyolaMap from '../LoyolaMap';

jest.mock('../SGWMap', () => jest.fn(() => <View testID="sgw-map" />));
jest.mock('../LoyolaMap', () => jest.fn(() => <View testID="loyola-map" />));

describe('ToggleCampusMap Component', () => {
    it('renders correctly', () => {
        const { getByTestId } = render(<ToggleCampusMap />);
        expect(getByTestId('sgw-map')).toBeTruthy();
    });

    it('toggles to Loyola campus when button is pressed', () => {
        const { getByText, queryByTestId } = render(<ToggleCampusMap />);
        
        // Ensure SGWMap is initially displayed
        expect(queryByTestId('sgw-map')).toBeTruthy();
        expect(queryByTestId('loyola-map')).toBeFalsy();
        
        // Click on Loyola Campus button
        fireEvent.press(getByText('Loyola Campus'));

        // Ensure LoyolaMap is displayed
        expect(queryByTestId('sgw-map')).toBeFalsy();
        expect(queryByTestId('loyola-map')).toBeTruthy();
    });

    it('toggles back to SGW campus when button is pressed', () => {
        const { getByText, queryByTestId } = render(<ToggleCampusMap />);
        
        // Switch to Loyola Campus first
        fireEvent.press(getByText('Loyola Campus'));

        // Ensure LoyolaMap is displayed
        expect(queryByTestId('loyola-map')).toBeTruthy();
        expect(queryByTestId('sgw-map')).toBeFalsy();

        // Switch back to SGW Campus
        fireEvent.press(getByText('SGW Campus'));

        // Ensure SGWMap is displayed
        expect(queryByTestId('loyola-map')).toBeFalsy();
        expect(queryByTestId('sgw-map')).toBeTruthy();
    });
});