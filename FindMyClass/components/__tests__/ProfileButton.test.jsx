import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import ProfileButton from '../ProfileButton';

// Create mock implementations for useAuth and useRouter
jest.mock('../../contexts/AuthContext', () => ({
  useAuth: jest.fn(),
}));
jest.mock('expo-router', () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
}));

describe('ProfileButton component', () => {
  const { useAuth } = require('../../contexts/AuthContext');
  const router = require('expo-router').useRouter();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('opens modal and shows user options when logged in', async () => {
    useAuth.mockReturnValue({
      user: { email: 'test@example.com' },
      logout: jest.fn(),
    });
    const { getByTestId, getByText } = render(<ProfileButton />);
    // Press button to open modal
    fireEvent.press(getByTestId('profile-button'));

    // Wait for modal options to appear
    await waitFor(() => {
      expect(getByText('My Profile')).toBeTruthy();
      expect(getByText('Logout')).toBeTruthy();
    });
  });

  it('opens modal and shows guest options when not logged in', async () => {
    useAuth.mockReturnValue({
      user: null,
    });
    const { getByTestId, getByText } = render(<ProfileButton />);
    // Press button to open modal
    fireEvent.press(getByTestId('profile-button'));

    // Wait for modal options to appear
    await waitFor(() => {
      expect(getByText('Login')).toBeTruthy();
      expect(getByText('Signup')).toBeTruthy();
    });
  });
});

describe('ProfileButton component additional option tests', () => {
  const { useAuth } = require('../../contexts/AuthContext');
  const router = require('expo-router').useRouter();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('navigates to profile when "My Profile" is pressed (logged in)', async () => {
    const logoutMock = jest.fn();
    useAuth.mockReturnValue({ user: { email: 'test@example.com' }, logout: logoutMock });
    const { getByTestId, getByText, queryByText } = render(<ProfileButton />);
    fireEvent.press(getByTestId('profile-button'));
    // Wait for modal options
    await waitFor(() => {
      expect(getByText('My Profile')).toBeTruthy();
    });
    fireEvent.press(getByText('My Profile'));
    expect(router.push).toHaveBeenCalledWith('/screens/profile');
    // Modal closed; options should no longer be visible
    expect(queryByText('My Profile')).toBeNull();
  });

  it('calls logout and navigates to home when "Logout" is pressed (logged in)', async () => {
    const logoutMock = jest.fn();
    useAuth.mockReturnValue({ user: { email: 'test@example.com' }, logout: logoutMock });
    const { getByTestId, getByText } = render(<ProfileButton />);
    fireEvent.press(getByTestId('profile-button'));
    await waitFor(() => {
      expect(getByText('Logout')).toBeTruthy();
    });
    fireEvent.press(getByText('Logout'));
    expect(logoutMock).toHaveBeenCalled();
    expect(router.push).toHaveBeenCalledWith('/');
  });

  it('navigates to login when "Login" is pressed (guest)', async () => {
    useAuth.mockReturnValue({ user: null });
    const { getByTestId, getByText } = render(<ProfileButton />);
    fireEvent.press(getByTestId('profile-button'));
    await waitFor(() => {
      expect(getByText('Login')).toBeTruthy();
    });
    fireEvent.press(getByText('Login'));
    expect(router.push).toHaveBeenCalledWith('/screens/login');
  });

  it('navigates to register when "Signup" is pressed (guest)', async () => {
    useAuth.mockReturnValue({ user: null });
    const { getByTestId, getByText } = render(<ProfileButton />);
    fireEvent.press(getByTestId('profile-button'));
    await waitFor(() => {
      expect(getByText('Signup')).toBeTruthy();
    });
    fireEvent.press(getByText('Signup'));
    expect(router.push).toHaveBeenCalledWith('/screens/register');
  });
});
