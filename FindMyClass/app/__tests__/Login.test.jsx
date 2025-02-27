import React from 'react';
import { render } from '@testing-library/react-native';
import Login from './login';

// Mock expo-router
jest.mock('expo-router', () => ({
  useRouter: () => ({ push: jest.fn() }),
}));

// Mock AuthContext
jest.mock('../../contexts/AuthContext', () => ({
  useAuth: () => ({ login: jest.fn() }),
}));

// Mock login API function
jest.mock('../api/auth.js', () => ({
  loginUser: jest.fn().mockResolvedValue({ email: 'test@example.com' }),
}));

describe('Login Component', () => {
  it('renders the login form elements', () => {
    const { getByPlaceholderText, getByText } = render(<Login />);
    expect(getByPlaceholderText('Email')).toBeTruthy();
    expect(getByPlaceholderText('Password')).toBeTruthy();
    expect(getByText('Login with Google')).toBeTruthy();
  });
});
