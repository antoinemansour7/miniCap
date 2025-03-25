import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import ToggleCampusMap from '../ToggleCampusMap';
import { useRoute } from '@react-navigation/native';

jest.mock('@react-navigation/native', () => ({
  useRoute: jest.fn(),
}));

jest.mock('../SGWMap', () => {
  const { View } = require('react-native');
  return jest.fn((props) => <View testID="sgw-map" {...props} />);
});

jest.mock('../LoyolaMap', () => {
  const { View } = require('react-native');
  return jest.fn((props) => <View testID="loyola-map" {...props} />);
});

describe('ToggleCampusMap', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders SGWMap when campus param is SGW', () => {
    useRoute.mockReturnValue({ params: { campus: 'SGW' } });

    const { getByTestId, getByText } = render(<ToggleCampusMap />);

    expect(getByTestId('sgw-map')).toBeTruthy();
    expect(getByText('Loyola')).toBeTruthy();
  });

  it('renders LoyolaMap when campus param is Loyola', () => {
    useRoute.mockReturnValue({ params: { campus: 'Loyola' } });

    const { getByTestId, getByText } = render(<ToggleCampusMap />);

    expect(getByTestId('loyola-map')).toBeTruthy();
    expect(getByText('SGW')).toBeTruthy();
  });

  it('defaults to SGW when no campus param provided', () => {
    useRoute.mockReturnValue({ params: {} });

    const { getByTestId, getByText } = render(<ToggleCampusMap />);

    expect(getByTestId('sgw-map')).toBeTruthy();
    expect(getByText('Loyola')).toBeTruthy();
  });

  it('toggles from SGW to Loyola and back correctly', () => {
    useRoute.mockReturnValue({ params: { campus: 'SGW' } });

    const { getByTestId, getByText, queryByTestId } = render(<ToggleCampusMap />);

    // Initial SGW
    expect(getByTestId('sgw-map')).toBeTruthy();
    expect(queryByTestId('loyola-map')).toBeNull();

    // Toggle to Loyola
    fireEvent.press(getByText('Loyola'));
    expect(getByTestId('loyola-map')).toBeTruthy();
    expect(queryByTestId('sgw-map')).toBeNull();

    // Toggle back to SGW
    fireEvent.press(getByText('SGW'));
    expect(getByTestId('sgw-map')).toBeTruthy();
    expect(queryByTestId('loyola-map')).toBeNull();
  });

  it('correctly updates map when route param changes', () => {
    const { rerender, getByTestId, queryByTestId } = render(<ToggleCampusMap />);

    useRoute.mockReturnValue({ params: { campus: 'SGW' } });
    rerender(<ToggleCampusMap />);
    expect(getByTestId('sgw-map')).toBeTruthy();
    expect(queryByTestId('loyola-map')).toBeNull();

    useRoute.mockReturnValue({ params: { campus: 'Loyola' } });
    rerender(<ToggleCampusMap />);
    expect(getByTestId('loyola-map')).toBeTruthy();
    expect(queryByTestId('sgw-map')).toBeNull();
  });

  it('passes searchText prop correctly to SGWMap and LoyolaMap', () => {
    useRoute.mockReturnValue({ params: { campus: 'SGW' } });

    const searchText = 'MB-1.210';
    const { getByTestId, getByText } = render(
      <ToggleCampusMap searchText={searchText} />
    );

    const sgwMap = getByTestId('sgw-map');
    expect(sgwMap.props.searchText).toBe(searchText);

    // Toggle to Loyola
    fireEvent.press(getByText('Loyola'));

    const loyolaMap = getByTestId('loyola-map');
    expect(loyolaMap.props.searchText).toBe(searchText);
  });

  it('renders correctly without crashing when searchText is undefined', () => {
    useRoute.mockReturnValue({ params: { campus: 'SGW' } });

    const { getByTestId } = render(<ToggleCampusMap />);

    expect(getByTestId('sgw-map')).toBeTruthy();
  });
});
