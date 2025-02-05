import React from 'react';
import { render } from '@testing-library/react-native';
import Map from '../screens/map';
import { useRoute } from '@react-navigation/native';
import ToggleCampusMap from '../../components/ToggleCampusMap';
import FloatingChatButton from '../../components/FloatingChatButton';

// Mock navigation route
jest.mock('@react-navigation/native', () => ({
  useRoute: jest.fn(),
}));

// Mock components
jest.mock('../../components/ToggleCampusMap', () => jest.fn(() => null));
jest.mock('../../components/FloatingChatButton', () => jest.fn(() => null));

describe('Map Screen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

 

  it('passes searchText to ToggleCampusMap', () => {
    useRoute.mockReturnValue({ params: { searchText: 'Library' } });

    render(<Map />);
    expect(ToggleCampusMap).toHaveBeenCalledWith(
      expect.objectContaining({ searchText: 'Library' }),
      {}
    );
  });

  it('renders FloatingChatButton', () => {
    useRoute.mockReturnValue({ params: { searchText: '' } });

    const { getByTestId } = render(<Map />);
    expect(FloatingChatButton).toHaveBeenCalled();
  });
});