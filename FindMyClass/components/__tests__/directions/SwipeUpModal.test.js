import React from 'react';
import { render } from '@testing-library/react-native';
import SwipeUpModal from '../../directions/SwipeUpModal'; // Adjust path as necessary
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

jest.mock('@gorhom/bottom-sheet', () => {
  const React = require('react');
  const { View, FlatList } = require('react-native');

  return {
    __esModule: true,
    default: React.forwardRef((props, ref) => <View ref={ref} {...props} />),
    BottomSheetView: View,
    BottomSheetFlatList: ({ data, renderItem }) => (
      <View>
        {data.map((item, index) => (
          <View key={index}>{renderItem({ item })}</View>
        ))}
      </View>
    ),
  };
});

jest.mock('@expo/vector-icons/MaterialIcons', () => 'MaterialIcons');


describe('SwipeUpModal Component', () => {
  const mockDirections = [
    { instruction: 'Turn right', distance: '50m', duration: '30s' },
    { instruction: 'Turn left', distance: '100m', duration: '1min' },
  ];

  test('renders correctly with props', () => {
    const { getByText } = render(<SwipeUpModal distance="500m" duration="5min" directions={mockDirections} />);
    expect(getByText('500m 5min')).toBeTruthy();
    expect(getByText('Turn right')).toBeTruthy();
    expect(getByText('50m - 30s')).toBeTruthy();
  });

  test('renders fallback text when no directions are provided', () => {
    const { getByText } = render(<SwipeUpModal distance="500m" duration="5min" directions={[]} />);
    expect(getByText('500m 5min')).toBeTruthy();
  });

  test('renders multiple directions', () => {
    const { getByText } = render(<SwipeUpModal distance="500m" duration="5min" directions={mockDirections} />);
    expect(getByText('Turn right')).toBeTruthy();
    expect(getByText('Turn left')).toBeTruthy();
  });

  test('renders correct icons for directions', () => {
    const { getAllByTestId } = render(<SwipeUpModal distance="500m" duration="5min" directions={mockDirections} />);
    expect(getAllByTestId('MaterialIcons')).toHaveLength(2);
  });

  test('returns correct icons for different instructions', () => {
    const directionsWithIcons = [
      { instruction: 'Go straight', distance: '50m', duration: '30s' },
      { instruction: 'Take stairs', distance: '100m', duration: '1min' },
      { instruction: 'Take elevator', distance: '20m', duration: '30s' },
      { instruction: 'Arrived at destination', distance: '0m', duration: '0s' },
      { instruction: 'Random instruction', distance: '10m', duration: '10s' },
    ];
    
    const { getAllByTestId } = render(
      <SwipeUpModal distance="500m" duration="5min" directions={directionsWithIcons} />
    );
    
    const icons = getAllByTestId('MaterialIcons');
    expect(icons).toBeTruthy();
  });

  test('handles sheet changes correctly', () => {
    const consoleSpy = jest.spyOn(console, 'log');
    const { getByTestId } = render(
      <SwipeUpModal distance="500m" duration="5min" directions={mockDirections} />
    );
    
    // Trigger onChange (simulating sheet movement)
    const bottomSheet = getByTestId('bottom-sheet');
    bottomSheet.props.onChange(2);
    
    expect(consoleSpy).toHaveBeenCalledWith('handleSheetChanges', 2);
    consoleSpy.mockRestore();
  });

  test('renders with empty directions array', () => {
    const { getByText } = render(
      <SwipeUpModal distance="500m" duration="5min" directions={[]} />
    );
    expect(getByText('500m 5min')).toBeTruthy();
  });

  test('renders with undefined directions', () => {
    const { getByText } = render(
      <SwipeUpModal distance="500m" duration="5min" />
    );
    expect(getByText('500m 5min')).toBeTruthy();
  });
});
