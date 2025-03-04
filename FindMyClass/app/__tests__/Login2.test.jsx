import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { act } from 'react-test-renderer';
import Login from '../auth/login';
import { useRouter } from 'expo-router';
import { loginUser } from '../api/auth';
import { useAuth } from '../../contexts/AuthContext';
import * as GoogleAuthSession from 'expo-auth-session/providers/google';
import { getAuth, GoogleAuthProvider, signInWithCredential } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Mock the dependencies
jest.mock('expo-router', () => ({
  useRouter: jest.fn(() => ({ push: jest.fn() }))
}));

jest.mock('../../contexts/AuthContext', () => ({
  useAuth: jest.fn(() => ({ login: jest.fn() }))
}));

jest.mock('../api/auth', () => ({
  loginUser: jest.fn()
}));

jest.mock('expo-auth-session/providers/google', () => ({
  useAuthRequest: jest.fn()
}));

jest.mock('firebase/auth', () => ({
  getAuth: jest.fn(),
  GoogleAuthProvider: {
    credential: jest.fn(() => 'mock-credential')
  },
  signInWithCredential: jest.fn()
}));

jest.mock('@react-native-async-storage/async-storage', () => ({
  setItem: jest.fn(),
  getItem: jest.fn(),
  removeItem: jest.fn()
}));

describe('Login Component - Full Coverage', () => {
  // Clear all mocks before each test
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('shows and hides modal alert correctly', async () => {
    const { getByText, queryByText } = render(<Login />);
    
    loginUser.mockResolvedValue({ email: 'test@example.com' });
    
    await act(async () => {
      fireEvent.press(getByText('Log In'));
    });

    // Check if modal appears with success message
    expect(getByText('Welcome test@example.com')).toBeTruthy();

    // Wait for the timeout to hide the modal
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 1600));
    });

    // Modal should be gone
    expect(queryByText('Welcome test@example.com')).toBeNull();
  });

  it('shows error in modal and persists until closed', async () => {
    const errorMessage = 'Invalid credentials';
    loginUser.mockRejectedValue(new Error(errorMessage));
    
    const { getByText, queryByText, getByTestId } = render(<Login />);
    
    await act(async () => {
      fireEvent.press(getByText('Log In'));
    });

    // Check if modal appears with error message
    expect(getByText(errorMessage)).toBeTruthy();
    
    // Error modal should stay visible until manually closed
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 1600));
    });
    
    // Error message should still be visible
    expect(queryByText(errorMessage)).toBeTruthy();

    // Close modal manually
    fireEvent.press(getByTestId('modal-container'));
    
    // Modal should be gone
    expect(queryByText(errorMessage)).toBeNull();
  });

  it('handles Google sign-in modal timing correctly', async () => {
    const fakeResponse = { 
      type: 'success', 
      params: { id_token: 'dummy', access_token: 'dummyAccess' } 
    };
    
    GoogleAuthSession.useAuthRequest.mockReturnValue([{}, fakeResponse, jest.fn()]);
    signInWithCredential.mockResolvedValue({
      user: { displayName: 'Google User', email: 'google@example.com' }
    });

    const { getByText, queryByText } = render(<Login />);

    // Modal should show welcome message
    await waitFor(() => {
      expect(getByText('Welcome Google User')).toBeTruthy();
    });

    // Wait for 5 seconds (Google sign-in timeout)
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 5100));
    });

    // Modal should be gone
    expect(queryByText('Welcome Google User')).toBeNull();
  });
});
