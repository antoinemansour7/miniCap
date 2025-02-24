import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { Alert } from 'react-native';
import Profile from '../screens/profile';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';

const mockUseAuth = jest.fn();
jest.mock('../../contexts/AuthContext', () => ({
  useAuth: () => mockUseAuth(),
}));

jest.mock('../../components/FloatingChatButton', () => {
  const React = require('react');
  const { View } = require('react-native');
  return () => React.createElement(View, { testID: 'floating-chat-button' });
});

// Mock expo-image-picker functions
jest.mock('expo-image-picker', () => ({
  requestMediaLibraryPermissionsAsync: jest.fn(),
  launchImageLibraryAsync: jest.fn(),
  MediaType: { Images: 'Images' },
  MediaTypeOptions: { Images: 'Images' },
}));

// Spy on AsyncStorage.setItem
jest.spyOn(AsyncStorage, 'setItem');

// Mock useRouter for login navigation tests
const mockPush = jest.fn();
jest.mock('expo-router', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

describe('Profile Screen', () => {
  beforeEach(() => {
    // Reset mocks and set default successful permission and canceled image picker.
    jest.clearAllMocks();
    mockUseAuth.mockReturnValue({ user: { email: 'test@example.com' } });
    ImagePicker.requestMediaLibraryPermissionsAsync.mockResolvedValue({ status: 'granted' });
    ImagePicker.launchImageLibraryAsync.mockResolvedValue({ canceled: true });
  });

  it('renders user info and FloatingChatButton when logged in', () => {
    const { getByText, getByTestId } = render(<Profile />);
    expect(getByText('Welcome, test@example.com')).toBeTruthy();
    expect(getByText('Change Photo')).toBeTruthy();
    expect(getByTestId('floating-chat-button')).toBeTruthy();
  });

  it('triggers image picker and updates profile on press', async () => {
    const dummyUri = 'dummy://image.png';
    ImagePicker.launchImageLibraryAsync.mockResolvedValueOnce({
      canceled: false,
      assets: [{ uri: dummyUri }],
    });

    const { getByText } = render(<Profile />);
    const changePhotoElement = getByText('Change Photo');
    fireEvent.press(changePhotoElement);

    await waitFor(() => {
      expect(AsyncStorage.setItem).toHaveBeenCalledWith('profile_picture', dummyUri);
    });
  });

  it('renders warning message and login button when not logged in', () => {
    mockUseAuth.mockReturnValue({ user: null });
    const { getByText } = render(<Profile />);
    expect(getByText('Please log in to access your profile.')).toBeTruthy();
    expect(getByText('Go to Login')).toBeTruthy();
  });

  it('navigates to login screen when login button is pressed (line 57)', () => {
    mockUseAuth.mockReturnValue({ user: null });
    const { getByText } = render(<Profile />);
    const loginButton = getByText('Go to Login');
    fireEvent.press(loginButton);
    expect(mockPush).toHaveBeenCalledWith('/screens/login');
  });

  it('alerts permission error when media library permission is denied (lines 27-28)', async () => {
    ImagePicker.requestMediaLibraryPermissionsAsync.mockResolvedValueOnce({ status: 'denied' });
    const alertSpy = jest.spyOn(Alert, 'alert');
    const { getByText } = render(<Profile />);
    const changePhotoElement = getByText('Change Photo');
    fireEvent.press(changePhotoElement);
    await waitFor(() => {
      expect(alertSpy).toHaveBeenCalledWith('Permission required', 'Please allow access to your photos.');
    });
  });

  it('handles error during image picking (lines 48-49)', async () => {
    const testError = new Error('Test error');
    ImagePicker.launchImageLibraryAsync.mockRejectedValueOnce(testError);
    const alertSpy = jest.spyOn(Alert, 'alert');
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    const { getByText } = render(<Profile />);
    const changePhotoElement = getByText('Change Photo');
    fireEvent.press(changePhotoElement);
    await waitFor(() => {
      expect(consoleErrorSpy).toHaveBeenCalledWith("Error picking image:", testError);
      expect(alertSpy).toHaveBeenCalledWith("Error", "An error occurred while picking the image.");
    });
  });
});
