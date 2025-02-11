import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import ToggleCampusMap from '../ToggleCampusMap';

// Mock navigation
jest.mock('@react-navigation/native', () => ({
  useRoute: () => ({
    params: { campus: 'SGW' }
  })
}));

// Mock map components
jest.mock('../SGWMap', () => {
  const { View } = require('react-native');
  return jest.fn(props => <View testID="sgw-map" {...props} />);
});

jest.mock('../LoyolaMap', () => {
  const { View } = require('react-native');
  return jest.fn(props => <View testID="loyola-map" {...props} />);
});

describe('ToggleCampusMap', () => {
  it('renders with default SGW campus', () => {
    const { getByTestId, getByText } = render(<ToggleCampusMap />);
    
    expect(getByTestId('sgw-map')).toBeTruthy();
    expect(getByText('SGW Campus')).toBeTruthy();
    expect(getByText('Loyola Campus')).toBeTruthy();
  });

  it('switches between campuses when toggle buttons are pressed', () => {
    const { getByText, queryByTestId } = render(<ToggleCampusMap />);
    
    // Initial state should show SGW map
    expect(queryByTestId('sgw-map')).toBeTruthy();
    expect(queryByTestId('loyola-map')).toBeNull();

    // Switch to Loyola
    fireEvent.press(getByText('Loyola Campus'));
    expect(queryByTestId('loyola-map')).toBeTruthy();
    expect(queryByTestId('sgw-map')).toBeNull();

    // Switch back to SGW
    fireEvent.press(getByText('SGW Campus'));
    expect(queryByTestId('sgw-map')).toBeTruthy();
    expect(queryByTestId('loyola-map')).toBeNull();
  });

  it('passes searchText prop to map components', () => {
    const searchText = 'H-110';
    const { getByTestId } = render(<ToggleCampusMap searchText={searchText} />);
    
    const sgwMap = getByTestId('sgw-map');
    expect(sgwMap.props.searchText).toBe(searchText);
  });

  it('applies correct styles to active/inactive buttons', () => {
    const { getByText } = render(<ToggleCampusMap />);
    
    const sgwButton = getByText('SGW Campus').parent;
    const loyolaButton = getByText('Loyola Campus').parent;

    // Check initial state (SGW active)
    expect(sgwButton.props.style).toContainEqual(expect.objectContaining({
      backgroundColor: '#800000'
    }));
    expect(loyolaButton.props.style).not.toContainEqual(expect.objectContaining({
      backgroundColor: '#800000'
    }));

    // Switch to Loyola and check styles
    fireEvent.press(loyolaButton);
    expect(loyolaButton.props.style).toContainEqual(expect.objectContaining({
      backgroundColor: '#800000'
    }));
    expect(sgwButton.props.style).not.toContainEqual(expect.objectContaining({
      backgroundColor: '#800000'
    }));
  });
});