import React from 'react';
import { render } from '@testing-library/react-native';
import MapScreen from '../index'; // ✅ Use the correct component name
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

    render(<MapScreen />); // ✅ Use the correct component name

    expect(ToggleCampusMap).toHaveBeenCalledWith(
      expect.objectContaining({ searchText: 'Library' }),
      {}
    );
  });

  it('renders FloatingChatButton', () => {
    useRoute.mockReturnValue({ params: { searchText: '' } });

    render(<MapScreen />); // ✅ Use the correct component name

    expect(FloatingChatButton).toHaveBeenCalled();
  });
});