import React from 'react';
import { render } from '@testing-library/react-native';
import { View } from 'react-native';
import Profile from '../screens/profile';

// Replace the hardcoded AuthContext mock with one using an allowed out-of-scope variable
const mockUseAuth = jest.fn();
jest.mock('../../contexts/AuthContext', () => ({
  useAuth: () => mockUseAuth(),
}));

// Update the FloatingChatButton mock to include a testID
jest.mock('../../components/FloatingChatButton', () => {
  // This mock is now tracked in coverage
  const React = require('react');
  const { View } = require('react-native');
  return () => React.createElement(View, { testID: 'floating-chat-button' });
});

// Ensure default value for logged in user in beforeEach
beforeEach(() => {
  mockUseAuth.mockReturnValue({ user: { email: 'test@example.com' } });
});

describe('Profile Screen', () => {
  it('renders profile screen correctly when logged in', () => {
    const { getByText } = render(<Profile />);
    expect(getByText('Welcome, test@example.com')).toBeTruthy();
  });

  it('renders the FloatingChatButton', () => {
    const { getByTestId } = render(<Profile />);
    expect(getByTestId('floating-chat-button')).toBeTruthy();
  });

  // New test covering the not logged in branch (lines 12-15 in profile.jsx)
  it('renders warning message when not logged in', () => {
    mockUseAuth.mockReturnValue({ user: null });
    const { getByText } = render(<Profile />);
    expect(getByText('Please log in to access your profile.')).toBeTruthy();
  });
});