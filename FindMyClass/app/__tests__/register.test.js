import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import Register from '../screens/register';
import { registerUser } from '../api/auth';
import { useRouter } from 'expo-router';
import { Alert } from 'react-native';

// Mock API and router
jest.mock('../api/auth', () => ({
  registerUser: jest.fn(),
}));

jest.mock('expo-router', () => ({
  useRouter: jest.fn(),
}));

jest.spyOn(Alert, 'alert'); // Spy on Alert.alert

describe('Register Screen', () => {
  let routerMock;

  beforeEach(() => {
    routerMock = { push: jest.fn() };
    useRouter.mockReturnValue(routerMock);
    jest.clearAllMocks(); // Clear mocks before each test
  });

  it('renders register screen correctly', () => {
    const { getByText, getByPlaceholderText } = render(<Register />);

    expect(getByText('Register')).toBeTruthy(); // Title
    expect(getByPlaceholderText('First Name')).toBeTruthy();
    expect(getByPlaceholderText('Last Name')).toBeTruthy();
    expect(getByPlaceholderText('Email')).toBeTruthy();
    expect(getByPlaceholderText('Password')).toBeTruthy();
    expect(getByText('Already a User? Login!')).toBeTruthy();
  });

  it('updates input fields correctly', () => {
    const { getByPlaceholderText } = render(<Register />);
    const firstNameInput = getByPlaceholderText('First Name');
    const lastNameInput = getByPlaceholderText('Last Name');
    const emailInput = getByPlaceholderText('Email');
    const passwordInput = getByPlaceholderText('Password');

    fireEvent.changeText(firstNameInput, 'John');
    fireEvent.changeText(lastNameInput, 'Doe');
    fireEvent.changeText(emailInput, 'john@example.com');
    fireEvent.changeText(passwordInput, 'password123');

    expect(firstNameInput.props.value).toBe('John');
    expect(lastNameInput.props.value).toBe('Doe');
    expect(emailInput.props.value).toBe('john@example.com');
    expect(passwordInput.props.value).toBe('password123');
  });

  it('calls registerUser and navigates to login on success', async () => {
    registerUser.mockResolvedValueOnce({ message: 'User registered successfully' });

    const { getByPlaceholderText, getByTestId } = render(<Register />);
    const firstNameInput = getByPlaceholderText('First Name');
    const lastNameInput = getByPlaceholderText('Last Name');
    const emailInput = getByPlaceholderText('Email');
    const passwordInput = getByPlaceholderText('Password');
    const registerButton = getByTestId('registerButton'); // Select the correct button

    fireEvent.changeText(firstNameInput, 'Jane');
    fireEvent.changeText(lastNameInput, 'Smith');
    fireEvent.changeText(emailInput, 'jane@example.com');
    fireEvent.changeText(passwordInput, 'securepass');
    fireEvent.press(registerButton);

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith('Success', 'Registration Successful!');
      expect(routerMock.push).toHaveBeenCalledWith('/screens/login');
      expect(registerUser).toHaveBeenCalledWith('jane@example.com', 'securepass', 'Jane', 'Smith');
    });
  });

  it('shows error alert when registration fails', async () => {
    registerUser.mockRejectedValueOnce(new Error('User already exists'));

    const { getByPlaceholderText, getByTestId } = render(<Register />);
    const firstNameInput = getByPlaceholderText('First Name');
    const lastNameInput = getByPlaceholderText('Last Name');
    const emailInput = getByPlaceholderText('Email');
    const passwordInput = getByPlaceholderText('Password');
    const registerButton = getByTestId('registerButton');

    fireEvent.changeText(firstNameInput, 'Existing');
    fireEvent.changeText(lastNameInput, 'User');
    fireEvent.changeText(emailInput, 'existing@example.com');
    fireEvent.changeText(passwordInput, 'password');
    fireEvent.press(registerButton);

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith('Registration Error', 'User already exists');
      expect(registerUser).toHaveBeenCalledWith('existing@example.com', 'password', 'Existing', 'User');
    });
  });

  it('navigates to login screen when "Already a User? Login!" is pressed', () => {
    const { getByText } = render(<Register />);
    const loginLink = getByText('Already a User? Login!');

    fireEvent.press(loginLink);

    expect(routerMock.push).toHaveBeenCalledWith('/screens/login');
  });
});