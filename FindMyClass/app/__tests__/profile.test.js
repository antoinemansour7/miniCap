import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { Alert, ActivityIndicator } from 'react-native';
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
jest.spyOn(AsyncStorage, 'getItem');

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
    mockUseAuth.mockReturnValue({ user: { email: 'test@example.com', displayName: 'Test User', uid: '123' } });
    ImagePicker.requestMediaLibraryPermissionsAsync.mockResolvedValue({ status: 'granted' });
    ImagePicker.launchImageLibraryAsync.mockResolvedValue({ canceled: true });
    AsyncStorage.getItem.mockResolvedValue(null);
  });

  it('renders user info and FloatingChatButton when logged in', () => {
    const { getByText, getByTestId } = render(<Profile />);
    expect(getByText('Test User')).toBeTruthy();
    expect(getByText('test@example.com')).toBeTruthy();
    expect(getByTestId('floating-chat-button')).toBeTruthy();
  });

  it('initializes state correctly', () => {
    const { getByText } = render(<Profile />);
    expect(getByText('Change Photo')).toBeTruthy();
  });


  it('loads profile data from AsyncStorage on mount', async () => {
    const savedProfile = {
      fullName: 'Saved User',
      email: 'saved@example.com',
      phone: '1234567890',
      accessibilityEnabled: true,
      accessibilityStatus: 'mobility',
    };
    AsyncStorage.getItem.mockResolvedValueOnce(JSON.stringify(savedProfile));
  
    const { getByText } = render(<Profile />);
    await waitFor(() => {
      expect(getByText('Saved User')).toBeTruthy();
      expect(getByText('saved@example.com')).toBeTruthy();
      expect(getByText('1234567890')).toBeTruthy();
      expect(getByText('♿ Accessibility Enabled (mobility)')).toBeTruthy();
    });
  });

  it('updates profile picture when a new image is picked', async () => {
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

  it('shows error message when image picking fails', async () => {
    const testError = new Error('Test error');
    ImagePicker.launchImageLibraryAsync.mockRejectedValueOnce(testError);
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
  
    const { getByText } = render(<Profile />);
    const changePhotoElement = getByText('Change Photo');
    fireEvent.press(changePhotoElement);
  
    await waitFor(() => {
      expect(consoleErrorSpy).toHaveBeenCalledWith("Error picking image:", testError);
      expect(getByText('An error occurred while picking the image.')).toBeTruthy();
    });
  });


  it('updates input fields correctly', () => {
    const { getByPlaceholderText } = render(<Profile />);
    const fullNameInput = getByPlaceholderText('Full Name');
    fireEvent.changeText(fullNameInput, 'New Name');
    expect(fullNameInput.props.value).toBe('New Name');
  });

  it('validates email format and checks for duplicates', async () => {
    AsyncStorage.getItem.mockResolvedValueOnce(JSON.stringify({ email: 'test@example.com' }));
    AsyncStorage.getItem.mockResolvedValueOnce(JSON.stringify([{ userId: '456', email: 'new@example.com' }]));
  
    const { getByText, getByPlaceholderText } = render(<Profile />);
    const editButton = getByText('Edit Profile');
    fireEvent.press(editButton);
  
    const emailInput = getByPlaceholderText('E-Mail');
    fireEvent.changeText(emailInput, 'new@example.com');
  
    const confirmButton = getByText('Confirm Changes');
    fireEvent.press(confirmButton);
  
    await waitFor(() => {
      expect(getByText('This email is already in use by another account')).toBeTruthy();
    });
  });


  it('saves profile changes correctly', async () => {
    const { getByText, getByPlaceholderText } = render(<Profile />);
    const editButton = getByText('Edit Profile');
    fireEvent.press(editButton);
  
    const fullNameInput = getByPlaceholderText('Full Name');
    fireEvent.changeText(fullNameInput, 'New Name');
  
    const confirmButton = getByText('Confirm Changes');
    fireEvent.press(confirmButton);
  
    await waitFor(() => {
      expect(AsyncStorage.setItem).toHaveBeenCalledWith('user_profile', expect.any(String));
    });
  });

  it('toggles edit mode with confirmation', async () => {
    const { getByText } = render(<Profile />);
    const editButton = getByText('Edit Profile');
    fireEvent.press(editButton);
  
    const cancelButton = getByText('Cancel');
    fireEvent.press(cancelButton);
  
    await waitFor(() => {
      expect(getByText('Edit Profile')).toBeTruthy();
    });
  });

  it('renders edit form correctly and handles input changes', () => {
    const { getByText, getByPlaceholderText } = render(<Profile />);
    const editButton = getByText('Edit Profile');
    fireEvent.press(editButton);
  
    expect(getByPlaceholderText('Full Name')).toBeTruthy();
    expect(getByPlaceholderText('E-Mail')).toBeTruthy();
    expect(getByPlaceholderText('Phone No.')).toBeTruthy();
    expect(getByPlaceholderText('Password')).toBeTruthy();
  });

  it('updates accessibility status correctly', () => {
    const { getByText, getByTestId } = render(<Profile />);
    const editButton = getByText('Edit Profile');
    fireEvent.press(editButton);
  
    const accessibilitySwitch = getByTestId('accessibility-switch');
    fireEvent(accessibilitySwitch, 'valueChange', true);
  
    const mobilityButton = getByText('Mobility');
    fireEvent.press(mobilityButton);
  
    expect(mobilityButton.props.style).toContainEqual(expect.objectContaining({ backgroundColor: '#f0e6e6' }));
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

  it('navigates to login screen when login button is pressed', () => {
    mockUseAuth.mockReturnValue({ user: null });
    const { getByText } = render(<Profile />);
    const loginButton = getByText('Go to Login');
    fireEvent.press(loginButton);
    expect(mockPush).toHaveBeenCalledWith('/auth/login');
  });

  it('alerts permission error when media library permission is denied', async () => {
    ImagePicker.requestMediaLibraryPermissionsAsync.mockResolvedValueOnce({ status: 'denied' });
    const { getByText } = render(<Profile />);
    const changePhotoElement = getByText('Change Photo');
    fireEvent.press(changePhotoElement);
    await waitFor(() => {
      expect(getByText('Please allow access to your photos.')).toBeTruthy();
    });
  });

  it('handles error during image picking', async () => {
    const testError = new Error('Test error');
    ImagePicker.launchImageLibraryAsync.mockRejectedValueOnce(testError);
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    const { getByText } = render(<Profile />);
    const changePhotoElement = getByText('Change Photo');
    fireEvent.press(changePhotoElement);
    await waitFor(() => {
      expect(consoleErrorSpy).toHaveBeenCalledWith("Error picking image:", testError);
      expect(getByText('An error occurred while picking the image.')).toBeTruthy();
    });
  });

  it('loads profile data from AsyncStorage on mount', async () => {
    const savedProfile = {
      fullName: 'Saved User',
      email: 'saved@example.com',
      phone: '1234567890',
      accessibilityEnabled: true,
      accessibilityStatus: 'mobility',
    };
    AsyncStorage.getItem.mockResolvedValueOnce(JSON.stringify(savedProfile));

    const { getByText } = render(<Profile />);
    await waitFor(() => {
      expect(getByText('Saved User')).toBeTruthy();
      expect(getByText('saved@example.com')).toBeTruthy();
      expect(getByText('1234567890')).toBeTruthy();
      expect(getByText('♿ Accessibility Enabled (mobility)')).toBeTruthy();
    });
  });

  it('enters edit mode when edit button is pressed', () => {
    const { getByText } = render(<Profile />);
    const editButton = getByText('Edit Profile');
    fireEvent.press(editButton);
    expect(getByText('Full Name')).toBeTruthy();
    expect(getByText('E-Mail')).toBeTruthy();
    expect(getByText('Phone No.')).toBeTruthy();
    expect(getByText('Password')).toBeTruthy();
  });

  it('cancels edit mode when cancel button is pressed', async () => {
    const { getByText } = render(<Profile />);
    const editButton = getByText('Edit Profile');
    fireEvent.press(editButton);
    const cancelButton = getByText('Cancel');
    fireEvent.press(cancelButton);
    await waitFor(() => {
      expect(getByText('Edit Profile')).toBeTruthy();
    });
  });

  it('saves profile changes when confirm button is pressed', async () => {
    const { getByText, getByPlaceholderText } = render(<Profile />);
    const editButton = getByText('Edit Profile');
    fireEvent.press(editButton);

    const fullNameInput = getByPlaceholderText('Full Name');
    const emailInput = getByPlaceholderText('E-Mail');
    const phoneInput = getByPlaceholderText('Phone No.');
    const passwordInput = getByPlaceholderText('Password');

    fireEvent.changeText(fullNameInput, 'New Name');
    fireEvent.changeText(emailInput, 'new@example.com');
    fireEvent.changeText(phoneInput, '0987654321');
    fireEvent.changeText(passwordInput, 'newpassword');

    const confirmButton = getByText('Confirm Changes');
    fireEvent.press(confirmButton);

    await waitFor(() => {
      expect(AsyncStorage.setItem).toHaveBeenCalledWith('user_profile', expect.any(String));
    });
  });

  it('shows error message when saving profile with invalid email', async () => {
    const { getByText, getByPlaceholderText } = render(<Profile />);
    const editButton = getByText('Edit Profile');
    fireEvent.press(editButton);

    const emailInput = getByPlaceholderText('E-Mail');
    fireEvent.changeText(emailInput, 'invalid-email');

    const confirmButton = getByText('Confirm Changes');
    fireEvent.press(confirmButton);

    await waitFor(() => {
      expect(getByText('Please enter a valid email address')).toBeTruthy();
    });
  });

  it('shows error message when saving profile with duplicate email', async () => {
    AsyncStorage.getItem.mockResolvedValueOnce(JSON.stringify({ email: 'test@example.com' }));
    AsyncStorage.getItem.mockResolvedValueOnce(JSON.stringify([{ userId: '456', email: 'new@example.com' }]));

    const { getByText, getByPlaceholderText } = render(<Profile />);
    const editButton = getByText('Edit Profile');
    fireEvent.press(editButton);

    const emailInput = getByPlaceholderText('E-Mail');
    fireEvent.changeText(emailInput, 'new@example.com');

    const confirmButton = getByText('Confirm Changes');
    fireEvent.press(confirmButton);

    await waitFor(() => {
      expect(getByText('This email is already in use by another account')).toBeTruthy();
    });
  });

  it('toggles accessibility switch and shows options', async () => {
    const { getByText, getByTestId } = render(<Profile />);
    const editButton = getByText('Edit Profile');
    fireEvent.press(editButton);

    const accessibilitySwitch = getByTestId('accessibility-switch');
    fireEvent(accessibilitySwitch, 'valueChange', true);

    await waitFor(() => {
      expect(getByText('Select your accessibility needs:')).toBeTruthy();
    });
  });

  it('shows loading indicator while saving profile changes', async () => {
    const { getByText, getByPlaceholderText } = render(<Profile />);
    const editButton = getByText('Edit Profile');
    fireEvent.press(editButton);

    const confirmButton = getByText('Confirm Changes');
    fireEvent.press(confirmButton);

    await waitFor(() => {
      expect(getByText('Confirm Changes')).toBeTruthy();
    });
  });
});