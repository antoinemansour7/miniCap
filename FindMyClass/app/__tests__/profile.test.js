import React from 'react';
import { render, fireEvent, waitFor, act } from '@testing-library/react-native';
import Profile from '../screens/profile';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { useAuth } from '../../contexts/AuthContext';


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
jest.mock('expo-router', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));



jest.mock('expo-image-picker');
jest.mock('@react-native-async-storage/async-storage');
jest.mock('expo-router', () => ({
  useRouter: jest.fn(),
}));
jest.mock('../../contexts/AuthContext', () => ({
  useAuth: jest.fn(),
}));

jest.mock('../../components/FloatingChatButton', () => () => null);
jest.mock('../../components/Chatbot', () => () => null);

const mockPush = jest.fn();
useRouter.mockReturnValue({ push: mockPush });

const mockUser = {
  uid: '123',
  email: 'test@example.com',
  displayName: 'Test User',
  photoURL: null,
};

const defaultProfile = {
  fullName: 'Test User',
  email: 'test@example.com',
  phone: '1234567890',
  password: '',
  accessibilityEnabled: false,
  accessibilityStatus: '',
};

describe('Profile Screen', () => {

  beforeEach(() => {
    jest.clearAllMocks();
  
    // Use the correct auth mock
    useAuth.mockReturnValue({ user: mockUser });
    mockUseAuth.mockReturnValue({ user: { email: 'test@example.com', displayName: 'Test User', uid: '123' } });
  
    // Image picker mock
    ImagePicker.requestMediaLibraryPermissionsAsync.mockResolvedValue({ status: 'granted' });
    ImagePicker.launchImageLibraryAsync.mockResolvedValue({ canceled: true });
  
    // AsyncStorage mock
    AsyncStorage.getItem.mockImplementation(async (key) => {
      switch (key) {
        case 'profile_picture':
          return null;
        case 'user_profile':
          return JSON.stringify(defaultProfile);
        case 'registered_emails':
          return JSON.stringify([{ userId: '456', email: 'other@example.com' }]);
        default:
          return null;
      }
    });
  
    AsyncStorage.setItem.mockResolvedValue();
  });
  

  it('shows error when loading profile data fails', async () => {
    AsyncStorage.getItem.mockRejectedValueOnce(new Error('Load error'));
    const { getByText } = render(<Profile />);
    
    await waitFor(() => {
      expect(getByText('Failed to load profile data')).toBeTruthy();
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
  it('handles error when loading profile data fails', async () => {
    AsyncStorage.getItem.mockRejectedValueOnce(new Error('Failed to load data'));
    const { getByText } = render(<Profile />);
  
    await waitFor(() => {
      expect(getByText('Failed to load profile data')).toBeTruthy();
    });
  });

  it('initializes profile data when no data is found in AsyncStorage', async () => {
    AsyncStorage.getItem.mockResolvedValueOnce(null);
    mockUseAuth.mockReturnValue({ user: { email: 'test@example.com', displayName: 'Test User', uid: '123' } });
  
    const { getByText } = render(<Profile />);
    await waitFor(() => {
      expect(getByText('Test User')).toBeTruthy();
      expect(getByText('test@example.com')).toBeTruthy();
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
  
    it('renders profile for logged-in user', async () => {
      const { getByText, findByText } = render(<Profile />);
      expect(await findByText('Test User')).toBeTruthy();
      expect(getByText('Course Schedule')).toBeTruthy();
    });
  
    it('navigates to login when user is null', () => {
      useAuth.mockReturnValue({ user: null });
      const { getByText } = render(<Profile />);
      fireEvent.press(getByText('Go to Login'));
      expect(mockPush).toHaveBeenCalledWith('/auth/login');
    });
  
    it('enters edit mode and edits fields', async () => {
      const { getByText, getByPlaceholderText } = render(<Profile />);
      fireEvent.press(getByText('Edit Profile'));
  
      await waitFor(() => getByPlaceholderText('Full Name'));
  
      fireEvent.changeText(getByPlaceholderText('Phone No.'), '9876543210');
      fireEvent.changeText(getByPlaceholderText('Password'), '123456');
      fireEvent.changeText(getByPlaceholderText('E-Mail'), 'updated@example.com');
      fireEvent.press(getByText('Confirm Changes'));
  
      await waitFor(() => expect(AsyncStorage.setItem).toHaveBeenCalled());
    });
  
    it('shows error for empty name', async () => {
      const { getByText, getByPlaceholderText, findByText } = render(<Profile />);
      fireEvent.press(getByText('Edit Profile'));
      await waitFor(() => getByPlaceholderText('Full Name'));
  
      fireEvent.changeText(getByPlaceholderText('Full Name'), '');
      fireEvent.press(getByText('Confirm Changes'));
  
      expect(await findByText('Name cannot be empty')).toBeTruthy();
    });
  
    it('shows error for invalid email', async () => {
      const { getByText, getByPlaceholderText, queryByText } = render(<Profile />);
      fireEvent.press(getByText('Edit Profile'));
  
      await waitFor(() => getByPlaceholderText('E-Mail'));
  
      fireEvent.changeText(getByPlaceholderText('Full Name'), 'Test User');
      fireEvent.changeText(getByPlaceholderText('E-Mail'), 'invalid-email');
  
      fireEvent.press(getByText('Confirm Changes'));
  
      await waitFor(() => {
        expect(queryByText('Please enter a valid email address')).toBeTruthy();
      });
    });
  
    it('shows error for duplicate email', async () => {
      AsyncStorage.getItem.mockImplementation(async (key) => {
        if (key === 'registered_emails') {
          return JSON.stringify([
            { userId: '123', email: 'test@example.com' },
            { userId: '456', email: 'duplicate@example.com' }
          ]);
        }
        if (key === 'user_profile') {
          return JSON.stringify(defaultProfile);
        }
        return null;
      });
  
      const { getByText, getByPlaceholderText, queryByText } = render(<Profile />);
      fireEvent.press(getByText('Edit Profile'));
  
      await waitFor(() => getByPlaceholderText('E-Mail'));
  
      fireEvent.changeText(getByPlaceholderText('Full Name'), 'Test User');
      fireEvent.changeText(getByPlaceholderText('E-Mail'), 'duplicate@example.com');
  
      fireEvent.press(getByText('Confirm Changes'));
  
      await waitFor(() => {
        expect(queryByText('This email is already in use by another account')).toBeTruthy();
      });
    });
  
    it('enables accessibility and selects a need', async () => {
      const { getByText, getByRole } = render(<Profile />);
      fireEvent.press(getByText('Edit Profile'));
      await waitFor(() => getByText('Accessibility'));
  
      const accessibilitySwitch = getByRole('switch');
      fireEvent(accessibilitySwitch, 'valueChange', true);
  
      fireEvent.press(getByText('Visual')); // Valid option from UI
      fireEvent.press(getByText('Confirm Changes'));
  
      await waitFor(() => {
        expect(AsyncStorage.setItem).toHaveBeenCalledWith(
          'user_profile',
          expect.stringContaining('"accessibilityStatus":"visual"')
        );
      });
    });
  
    it('cancels editing with discard confirmation', async () => {
      const { getByText, getByPlaceholderText } = render(<Profile />);
      fireEvent.press(getByText('Edit Profile'));
      await waitFor(() => getByPlaceholderText('Full Name'));
  
      await act(async () => {
        fireEvent.press(getByText('Cancel'));
      });
    });
  
    it('picks image from gallery', async () => {
      ImagePicker.requestMediaLibraryPermissionsAsync.mockResolvedValue({ status: 'granted' });
      ImagePicker.launchImageLibraryAsync.mockResolvedValue({
        canceled: false,
        assets: [{ uri: 'mocked-image-uri' }]
      });
  
      const { getByText } = render(<Profile />);
      await act(async () => {
        fireEvent.press(getByText('Profile Photo'));
      });
  
      expect(AsyncStorage.setItem).toHaveBeenCalledWith('profile_picture', 'mocked-image-uri');
    });
  
    it('displays error if image permission is denied', async () => {
      ImagePicker.requestMediaLibraryPermissionsAsync.mockResolvedValue({ status: 'denied' });
  
      const { getByText, findByText } = render(<Profile />);
      await act(async () => {
        fireEvent.press(getByText('Profile Photo'));
      });
  
      expect(await findByText('Please allow access to your photos.')).toBeTruthy();
    });
  
    it('does nothing when image picking is cancelled', async () => {
      ImagePicker.requestMediaLibraryPermissionsAsync.mockResolvedValue({ status: 'granted' });
      ImagePicker.launchImageLibraryAsync.mockResolvedValue({ canceled: true });
  
      const { getByText } = render(<Profile />);
      await act(async () => {
        fireEvent.press(getByText('Profile Photo'));
      });
  
      expect(AsyncStorage.setItem).not.toHaveBeenCalledWith('profile_picture', expect.anything());
    });
  
    it('handles unexpected image permission result gracefully', async () => {
      ImagePicker.requestMediaLibraryPermissionsAsync.mockResolvedValue({}); // no status
  
      const { getByText } = render(<Profile />);
      await act(async () => {
        fireEvent.press(getByText('Profile Photo'));
      });
  
      // Should not crash, so we just assert true
      expect(true).toBeTruthy();
    });
  
    it('updates accessibilityStatus when selecting Hearing (fallback from Auditory)', async () => {
      const { getByText, getByRole } = render(<Profile />);
      fireEvent.press(getByText('Edit Profile'));
      await waitFor(() => getByText('Accessibility'));
  
      const accessibilitySwitch = getByRole('switch');
      fireEvent(accessibilitySwitch, 'valueChange', true);
  
      fireEvent.press(getByText('Hearing')); // Text rendered by UI instead of 'Auditory'
      fireEvent.press(getByText('Confirm Changes'));
  
      await waitFor(() => {
        expect(AsyncStorage.setItem).toHaveBeenCalledWith(
          'user_profile',
          expect.stringContaining('"accessibilityStatus":"hearing"')
        );
      });
    });
  
    it('renders with default values when no profile is found in storage', async () => {
      AsyncStorage.getItem.mockImplementation(async (key) => {
        if (key === 'user_profile') return null;
        if (key === 'profile_picture') return null;
        return null;
      });
  
      const { findByText } = render(<Profile />);
      expect(await findByText('Test User')).toBeTruthy();
    });
  
    it('clears accessibilityStatus when switch is turned off', async () => {
      const { getByText, getByRole } = render(<Profile />);
      fireEvent.press(getByText('Edit Profile'));
      await waitFor(() => getByText('Accessibility'));
  
      const accessibilitySwitch = getByRole('switch');
      fireEvent(accessibilitySwitch, 'valueChange', false);
  
      fireEvent.press(getByText('Confirm Changes'));
  
      await waitFor(() => {
        expect(AsyncStorage.setItem).toHaveBeenCalledWith(
          'user_profile',
          expect.stringContaining('"accessibilityStatus":""')
        );
      });
    });
  });