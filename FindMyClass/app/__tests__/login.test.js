import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import Login from '../screens/login';
import { loginUser } from '../api/auth';
import { useRouter } from 'expo-router';

// Mock API and router
jest.mock('../api/auth', () => ({
  loginUser: jest.fn(),
}));

jest.mock('expo-router', () => ({
  useRouter: jest.fn(),
}));

describe('Login Screen', () => {
  let routerMock;

  beforeEach(() => {
    routerMock = { push: jest.fn() };
    useRouter.mockReturnValue(routerMock);
  });

  it('renders login screen correctly', () => {
    const { getByText, getByPlaceholderText } = render(<Login />);

    expect(getByText('Login')).toBeTruthy();
    expect(getByPlaceholderText('Email')).toBeTruthy();
    expect(getByPlaceholderText('Password')).toBeTruthy();
    expect(getByText('Log In')).toBeTruthy();
  });

  it('updates email and password fields', () => {
    const { getByPlaceholderText } = render(<Login />);
    
    const emailInput = getByPlaceholderText('Email');
    const passwordInput = getByPlaceholderText('Password');

    fireEvent.changeText(emailInput, 'test@example.com');
    fireEvent.changeText(passwordInput, 'password123');

    expect(emailInput.props.value).toBe('test@example.com');
    expect(passwordInput.props.value).toBe('password123');
  });

  it('calls loginUser and navigates to profile on success', async () => {
    loginUser.mockResolvedValueOnce({ email: 'test@example.com' });

    const { getByText, getByPlaceholderText } = render(<Login />);
    const emailInput = getByPlaceholderText('Email');
    const passwordInput = getByPlaceholderText('Password');
    const loginButton = getByText('Log In');

    fireEvent.changeText(emailInput, 'test@example.com');
    fireEvent.changeText(passwordInput, 'password123');
    fireEvent.press(loginButton);

    await waitFor(() => {
      expect(loginUser).toHaveBeenCalledWith('test@example.com', 'password123');
      expect(routerMock.push).toHaveBeenCalledWith('/screens/profile');
    });
  });

  it('shows error alert when login fails', async () => {
    loginUser.mockRejectedValueOnce(new Error('Invalid credentials'));

    const { getByText, getByPlaceholderText, getByRole } = render(<Login />);
    const emailInput = getByPlaceholderText('Email');
    const passwordInput = getByPlaceholderText('Password');
    const loginButton = getByText('Log In');

    fireEvent.changeText(emailInput, 'wrong@example.com');
    fireEvent.changeText(passwordInput, 'wrongpassword');
    fireEvent.press(loginButton);

    await waitFor(() => {
      expect(getByRole('alert')).toBeTruthy();
      expect(loginUser).toHaveBeenCalledWith('wrong@example.com', 'wrongpassword');
    });
  });

  it('navigates to register screen when "Register Now" is pressed', () => {
    const { getByText } = render(<Login />);
    const registerButton = getByText('Not a User? Register Now!');

    fireEvent.press(registerButton);

    expect(routerMock.push).toHaveBeenCalledWith('/register');
  });
});