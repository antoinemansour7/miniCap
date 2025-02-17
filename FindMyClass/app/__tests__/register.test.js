import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import Register from '../auth/register'; // Ensure this is the correct path
import { useRouter } from 'expo-router';
import { registerUser } from '../api/auth';

jest.mock('expo-router', () => ({
  useRouter: jest.fn(),
}));

jest.mock('../api/auth', () => ({
  registerUser: jest.fn(),
}));

describe('Register Component', () => {
  let mockRouter;

  beforeEach(() => {
    mockRouter = { push: jest.fn() };
    useRouter.mockReturnValue(mockRouter);
  });

  test('renders correctly', () => {
    const { getByText, getByPlaceholderText, getAllByText } = render(<Register />);

    expect(getAllByText('Register').length).toBeGreaterThan(0); // Checks that there is at least one 'Register' text
    expect(getByPlaceholderText('First Name')).toBeTruthy();
    expect(getByPlaceholderText('Last Name')).toBeTruthy();
    expect(getByPlaceholderText('Email')).toBeTruthy();
    expect(getByPlaceholderText('Password')).toBeTruthy();
    expect(getByText('Already a User? Login!')).toBeTruthy();
  });

  test('updates input fields correctly', () => {
    const { getByPlaceholderText } = render(<Register />);

    fireEvent.changeText(getByPlaceholderText('First Name'), 'John');
    fireEvent.changeText(getByPlaceholderText('Last Name'), 'Doe');
    fireEvent.changeText(getByPlaceholderText('Email'), 'johndoe@example.com');
    fireEvent.changeText(getByPlaceholderText('Password'), 'password123');

    expect(getByPlaceholderText('First Name').props.value).toBe('John');
    expect(getByPlaceholderText('Last Name').props.value).toBe('Doe');
    expect(getByPlaceholderText('Email').props.value).toBe('johndoe@example.com');
    expect(getByPlaceholderText('Password').props.value).toBe('password123');
  });

  test('calls handleRegister and API when register button is pressed', async () => {
    registerUser.mockResolvedValueOnce(); // Mock successful API response

    const { getByPlaceholderText, getByTestId } = render(<Register />);

    fireEvent.changeText(getByPlaceholderText('First Name'), 'John');
    fireEvent.changeText(getByPlaceholderText('Last Name'), 'Doe');
    fireEvent.changeText(getByPlaceholderText('Email'), 'johndoe@example.com');
    fireEvent.changeText(getByPlaceholderText('Password'), 'password123');

    fireEvent.press(getByTestId('register-button')); // Select button by testID

    await waitFor(() => {
      expect(registerUser).toHaveBeenCalledWith(
        'johndoe@example.com',
        'password123',
        'John',
        'Doe'
      );
    });
  });

  test('navigates to login screen when "Already a User? Login!" is pressed', () => {
    const { getByText } = render(<Register />);
    
    fireEvent.press(getByText('Already a User? Login!'));

    expect(mockRouter.push).toHaveBeenCalledWith('/auth/login');
  });

  test('shows alert on failed registration', async () => {
    const mockError = new Error('Email already in use');
    registerUser.mockRejectedValueOnce(mockError);

    jest.spyOn(window, 'alert').mockImplementation(() => {}); // Mock window.alert

    const { getByText, getByPlaceholderText, getByTestId } = render(<Register />);

    fireEvent.changeText(getByPlaceholderText('Email'), 'taken@example.com');
    fireEvent.changeText(getByPlaceholderText('Password'), 'password123');
    fireEvent.changeText(getByPlaceholderText('First Name'), 'Jane');
    fireEvent.changeText(getByPlaceholderText('Last Name'), 'Doe');

    fireEvent.press(getByTestId('register-button'));

    await waitFor(() => {
      expect(window.alert).toHaveBeenCalledWith('Registration Error', 'Email already in use');
    });

    window.alert.mockRestore(); // Restore alert function
  });
});