import React from 'react';
import { render, screen, act } from '@testing-library/react-native';
import { useRouter } from 'expo-router';
import Home from '../index';

// Mock expo-router
jest.mock('expo-router', () => ({
  useRouter: jest.fn(),
  useSegments: jest.fn()
}));

describe('Home Component', () => {
  const mockReplace = jest.fn();

  beforeEach(() => {
    jest.useFakeTimers();
    useRouter.mockImplementation(() => ({
      replace: mockReplace
    }));
  });

  afterEach(() => {
    jest.clearAllTimers();
    jest.useRealTimers();
    mockReplace.mockClear();
  });

  it('shows loading indicator initially', () => {
    const { getByTestId } = render(<Home />);
    expect(getByTestId('loading-indicator')).toBeTruthy();
  });

  it('redirects to map screen after timeout', () => {
    render(<Home />);
    
    act(() => {
      jest.runAllTimers();
    });
    
    expect(mockReplace).toHaveBeenCalledWith('/screens/map');
  });
});