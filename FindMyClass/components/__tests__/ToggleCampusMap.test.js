import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import ToggleCampusMap from '../ToggleCampusMap';

// Mock the SGWMap and LoyolaMap components correctly
jest.mock('../SGWMap', () => {
  const { View } = require('react-native'); // Import View inside mock
  return () => <View testID="sgw-map" />;
});

jest.mock('../LoyolaMap', () => {
  const { View } = require('react-native'); // Import View inside mock
  return () => <View testID="loyola-map" />;
});

describe('ToggleCampusMap Component', () => {
  it('should render SGWMap by default', () => {
    const { getByTestId } = render(<ToggleCampusMap />);
    expect(getByTestId('sgw-map')).toBeTruthy();
  });

  it('should switch to LoyolaMap when button is pressed', () => {
    const { getByText, getByTestId } = render(<ToggleCampusMap />);
    
    fireEvent.press(getByText('Loyola Campus'));

    expect(getByTestId('loyola-map')).toBeTruthy();
  });

  it('should switch back to SGWMap when button is pressed again', () => {
    const { getByText, getByTestId } = render(<ToggleCampusMap />);
    
    fireEvent.press(getByText('Loyola Campus'));
    fireEvent.press(getByText('SGW Campus'));

    expect(getByTestId('sgw-map')).toBeTruthy();
  });
});