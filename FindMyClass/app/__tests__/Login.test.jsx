import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import Login from '../auth/login';
import { useRouter } from 'expo-router';
import { loginUser } from '../api/auth.js';
import { useAuth } from '../../contexts/AuthContext';
import * as GoogleAuthSession from 'expo-auth-session/providers/google';
import { signInWithCredential } from 'firebase/auth';

// Mock the router
jest.mock('expo-router', () => ({
  useRouter: () => ({ push: jest.fn() }),
}));

// Mock AuthContext
jest.mock('../../contexts/AuthContext', () => ({
  useAuth: () => ({ login: jest.fn() }),
}));

// Mock loginUser API
jest.mock('../api/auth.js', () => ({
  loginUser: jest.fn(),
}));

// Mock Google auth request hook
jest.mock('expo-auth-session/providers/google', () => ({
  useAuthRequest: jest.fn(() => [null, null, jest.fn()]),
}));

// Mock Firebase auth functions
jest.mock('firebase/auth', () => ({
  getAuth: jest.fn(),
  GoogleAuthProvider: { credential: jest.fn(() => 'credential') },
  signInWithCredential: jest.fn(),
}));

describe('Login Component - Full Coverage', () => {
  const mockRouterPush = jest.fn();
  const mockLogin = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    // Override router and auth mocks:
    require('expo-router').useRouter = () => ({ push: mockRouterPush });
    require('../../contexts/AuthContext').useAuth = () => ({ login: mockLogin });
  });

  it('renders all login form elements', () => {
    const { getByPlaceholderText, getByText } = render(<Login />);
    expect(getByPlaceholderText('Email')).toBeTruthy();
    expect(getByPlaceholderText('Password')).toBeTruthy();
    expect(getByText('Log In')).toBeTruthy();
    expect(getByText('Sign in with Google')).toBeTruthy();
    expect(getByText('Not a User? Register Now!')).toBeTruthy();
  });

  it('handles successful standard login', async () => {
    // Simulate a successful login
    loginUser.mockResolvedValue({ email: 'test@example.com' });
    const { getByPlaceholderText, getByText } = render(<Login />);
    fireEvent.changeText(getByPlaceholderText('Email'), 'test@example.com');
    fireEvent.changeText(getByPlaceholderText('Password'), 'password');
    fireEvent.press(getByText('Log In'));
    await waitFor(() => {
      expect(loginUser).toHaveBeenCalledWith('test@example.com', 'password');
      expect(mockLogin).toHaveBeenCalled();
      expect(mockRouterPush).toHaveBeenCalledWith('/screens/profile');
    });
  });

  it('handles login error', async () => {
    const errorMessage = 'Login failed';
    loginUser.mockRejectedValue(new Error(errorMessage));
    const { getByPlaceholderText, getByText } = render(<Login />);
    fireEvent.changeText(getByPlaceholderText('Email'), 'fail@example.com');
    fireEvent.changeText(getByPlaceholderText('Password'), 'wrongpassword');
    fireEvent.press(getByText('Log In'));
    await waitFor(() => {
      expect(loginUser).toHaveBeenCalledWith('fail@example.com', 'wrongpassword');
      // Error alert should be triggered (Assuming Alert is handled by the framework)
    });
  });

  it('navigates to register page when register link pressed', () => {
    const { getByText } = render(<Login />);
    fireEvent.press(getByText('Not a User? Register Now!'));
    expect(mockRouterPush).toHaveBeenCalledWith('/auth/register');
  });

  it('initiates Google sign-in flow when Google button pressed', () => {
    const mockPromptAsync = jest.fn();
    // Override useAuthRequest to return a dummy promptAsync
    GoogleAuthSession.useAuthRequest.mockReturnValue([{}, {}, mockPromptAsync]);
    const { getByText } = render(<Login />);
    fireEvent.press(getByText('Sign in with Google'));
    expect(mockPromptAsync).toHaveBeenCalled();
  });

  it('handles successful Google sign-in response', async () => {
    // Simulate a successful Google response
    const fakeResponse = { type: 'success', params: { id_token: 'dummy', access_token: 'dummyAccess' } };
    const mockPromptAsync = jest.fn();
    GoogleAuthSession.useAuthRequest.mockReturnValue([{}, fakeResponse, mockPromptAsync]);

    // Mock Firebase signInWithCredential to resolve with a dummy user
    signInWithCredential.mockResolvedValue({
      user: { displayName: 'Google User', email: 'google@example.com' },
    });
    render(<Login />);
    await waitFor(() => {
      expect(signInWithCredential).toHaveBeenCalled();
      expect(mockLogin).toHaveBeenCalled();
      expect(mockRouterPush).toHaveBeenCalledWith('/screens/profile');
    });
  });
});
