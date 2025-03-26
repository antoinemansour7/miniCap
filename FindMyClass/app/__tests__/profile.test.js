import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import Profile from '../screens/profile';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';

jest.mock('../../contexts/AuthContext', () => ({
  useAuth: jest.fn(),
}));

jest.mock('../../contexts/LanguageContext', () => ({
  useLanguage: () => ({
    t: {
      pleaseLogin: 'Please log in to continue',
      login: 'Login',
      addPhoto: 'Add Photo',
      changePhoto: 'Change Photo',
      welcome: 'Welcome',
      viewSchedule: 'View Schedule',
      permissionError: 'Permission denied',
      photoAccessError: 'Photo access error',
      imageError: 'Image error occurred',
    },
  }),
}));

jest.mock('../../contexts/ThemeContext', () => ({
  useTheme: () => ({ darkMode: false }),
}));

jest.mock('expo-router', () => ({
  useRouter: jest.fn(),
}));

jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
}));

jest.mock('expo-image-picker', () => ({
  requestMediaLibraryPermissionsAsync: jest.fn(),
  launchImageLibraryAsync: jest.fn(),
  MediaTypeOptions: {
    Images: 'Images',
  },
}));

jest.mock('../../components/FloatingChatButton', () => () => <></>);

describe('Profile Screen', () => {
  const mockPush = jest.fn();
  const { useAuth } = require('../../contexts/AuthContext');

  beforeEach(() => {
    jest.clearAllMocks();
    useRouter.mockReturnValue({ push: mockPush });
  });
  it('renders login screen if user is not authenticated', async () => {
    useAuth.mockReturnValue({ user: null });
    ImagePicker.requestMediaLibraryPermissionsAsync.mockResolvedValue({ status: 'granted' });
    const { getByText } = render(<Profile />);
  
    expect(getByText('Please log in to continue')).toBeTruthy();
    fireEvent.press(getByText('Login'));
    expect(mockPush).toHaveBeenCalledWith('/auth/login');
  });
  

  it('renders user profile with no photoURL and placeholder image', async () => {
    useAuth.mockReturnValue({ user: { displayName: 'Baraa', email: 'baraa@example.com' } });
    AsyncStorage.getItem.mockResolvedValueOnce(null);
    ImagePicker.requestMediaLibraryPermissionsAsync.mockResolvedValue({ status: 'granted' });

    const { getByText } = render(<Profile />);
    await waitFor(() => {
      expect(getByText('Add Photo')).toBeTruthy();
      expect(getByText('Change Photo')).toBeTruthy();
      expect(getByText('Welcome, Baraa')).toBeTruthy();
    });
  });

  it('navigates to schedule screen on button press', async () => {
    useAuth.mockReturnValue({ user: { displayName: 'Test User' } });
    AsyncStorage.getItem.mockResolvedValue(null);
    ImagePicker.requestMediaLibraryPermissionsAsync.mockResolvedValue({ status: 'granted' });

    const { getByText } = render(<Profile />);
    await waitFor(() => fireEvent.press(getByText('View Schedule')));
    expect(mockPush).toHaveBeenCalledWith('/screens/schedule');
  });

  it('shows error message if permission denied on mount', async () => {
    useAuth.mockReturnValue({ user: { displayName: 'Test User' } });
    ImagePicker.requestMediaLibraryPermissionsAsync.mockResolvedValue({ status: 'denied' });
    AsyncStorage.getItem.mockResolvedValue(null);

    const { getByText } = render(<Profile />);
    await waitFor(() => {
      expect(getByText('Permission denied')).toBeTruthy();
    });
  });

  it('sets and saves new image when picked successfully', async () => {
    useAuth.mockReturnValue({ user: { displayName: 'Test User' } });
    AsyncStorage.getItem.mockResolvedValue(null);
    ImagePicker.requestMediaLibraryPermissionsAsync.mockResolvedValue({ status: 'granted' });
    ImagePicker.launchImageLibraryAsync.mockResolvedValue({
      canceled: false,
      assets: [{ uri: 'mock-uri' }],
    });

    const { getByText } = render(<Profile />);
    await waitFor(() => fireEvent.press(getByText('Change Photo')));
    expect(AsyncStorage.setItem).toHaveBeenCalledWith('profile_picture', 'mock-uri');
  });

  it('shows image error on picker exception', async () => {
    useAuth.mockReturnValue({ user: { displayName: 'Test User' } });
    AsyncStorage.getItem.mockResolvedValue(null);
    ImagePicker.requestMediaLibraryPermissionsAsync.mockResolvedValue({ status: 'granted' });
    ImagePicker.launchImageLibraryAsync.mockRejectedValue(new Error('error'));

    const { getByText } = render(<Profile />);
    await waitFor(() => fireEvent.press(getByText('Change Photo')));
    await waitFor(() => {
      expect(getByText('Image error occurred')).toBeTruthy();
    });
  });
});
