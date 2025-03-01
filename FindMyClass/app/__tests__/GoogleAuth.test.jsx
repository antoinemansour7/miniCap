import React from 'react';
import { render, waitFor } from '@testing-library/react-native';
import GoogleAuth from '../auth/GoogleAuth';
import { useRouter } from 'expo-router';
import { useAuth } from '../../contexts/AuthContext';
import * as GoogleAuthSession from 'expo-auth-session/providers/google';
import { signInWithCredential, GoogleAuthProvider } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Mock router and auth context
jest.mock('expo-router', () => ({
  useRouter: () => ({ push: jest.fn() }),
}));
jest.mock('../../contexts/AuthContext', () => ({
  useAuth: () => ({ login: jest.fn() }),
}));

// Mock expo-auth-session hook
jest.mock('expo-auth-session/providers/google', () => ({
  useAuthRequest: jest.fn(),
}));

// Mock Firebase auth functions
jest.mock('firebase/auth', () => ({
  getAuth: jest.fn(),
  GoogleAuthProvider: { credential: jest.fn(() => 'credential') },
  signInWithCredential: jest.fn(),
}));

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  setItem: jest.fn(),
}));

describe('GoogleAuth Component', () => {
  const mockRouterPush = jest.fn();
  const mockLogin = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    require('expo-router').useRouter = () => ({ push: mockRouterPush });
    require('../../contexts/AuthContext').useAuth = () => ({ login: mockLogin });
  });

  it('renders the Sign in with Google button', () => {
    // Provide default dummy return: no response, dummy promptAsync
    GoogleAuthSession.useAuthRequest.mockReturnValue([{}, null, jest.fn()]);
    const { getByText } = render(<GoogleAuth />);
    expect(getByText('Sign in with Google')).toBeTruthy();
  });

  it('handles a successful Google sign in', async () => {
    const fakeResponse = { type: 'success', params: { id_token: 'fakeIdToken', access_token: 'fakeAccessToken' } };
    const mockPromptAsync = jest.fn();
    // Overriding useAuthRequest to return our fake response
    GoogleAuthSession.useAuthRequest.mockReturnValue([{}, fakeResponse, mockPromptAsync]);
    // Mock signInWithCredential to resolve with a dummy user
    signInWithCredential.mockResolvedValue({
      user: { displayName: 'Google User', email: 'google@example.com' },
    });
    render(<GoogleAuth />);
    await waitFor(() => {
      // Check that the Firebase credential function was called with our id_token
      expect(GoogleAuthProvider.credential).toHaveBeenCalledWith('fakeIdToken');
      // Verify signInWithCredential is called with any auth instance and our dummy 'credential'
      expect(signInWithCredential).toHaveBeenCalledWith(expect.anything(), 'credential');
      // Verify AuthContext login is called with dummy user
      expect(mockLogin).toHaveBeenCalled();
      // Verify the Google access token is stored
      expect(AsyncStorage.setItem).toHaveBeenCalledWith("googleAccessToken", "fakeAccessToken");
      // Verify navigation to profile is performed
      expect(mockRouterPush).toHaveBeenCalledWith('/screens/profile');
    });
  });
});
