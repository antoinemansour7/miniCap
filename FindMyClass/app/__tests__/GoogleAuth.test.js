import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import GoogleAuth from '../auth/GoogleAuth';

// Mock expo-router's useRouter
jest.mock('expo-router', () => ({
  useRouter: () => ({ push: jest.fn() }),
}));

// Mock AuthContext
jest.mock('../../contexts/AuthContext', () => ({
  useAuth: () => ({ login: jest.fn() }),
}));

// Declare the mock inside the module factory to avoid out-of-scope references.
jest.mock('expo-auth-session/providers/google', () => {
  const promptAsync = jest.fn();
  return {
    useAuthRequest: jest.fn(() => [ {}, { type: null, params: {} }, promptAsync ]),
  };
});

describe('GoogleAuth Component', () => {
  it('renders the sign in button when not signed in', () => {
    const { getByText } = render(<GoogleAuth />);
    expect(getByText("Sign in with Google")).toBeTruthy();
  });

  it('calls promptAsync when the sign in button is pressed', () => {
    const { getByText } = render(<GoogleAuth />);
    // Retrieve promptAsync from the mocked useAuthRequest
    const { useAuthRequest } = require('expo-auth-session/providers/google');
    const promptAsync = useAuthRequest.mock.results[0].value[2];
  
    fireEvent.press(getByText("Sign in with Google"));
    expect(promptAsync).toHaveBeenCalled();
  });
});
