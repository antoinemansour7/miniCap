import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { Text, Button, View } from 'react-native';
import { AuthProvider, useAuth } from '../AuthContext';

// Test component to consume AuthContext
const TestComponent = () => {
  const { user, login, logout } = useAuth();
  return (
    <View>
      <Text testID="user">{user ? user.email : 'no user'}</Text>
      <Button testID="loginButton" title="Login" onPress={() => login({ email: 'test@example.com' })} />
      <Button testID="logoutButton" title="Logout" onPress={logout} />
    </View>
  );
};

describe('AuthContext', () => {
  it('provides default value as null', () => {
    const { getByTestId } = render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );
    expect(getByTestId('user').props.children).toBe('no user');
  });

  it('updates user on login', () => {
    const { getByTestId } = render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );
    fireEvent.press(getByTestId('loginButton'));
    expect(getByTestId('user').props.children).toBe('test@example.com');
  });

  it('clears user on logout', () => {
    const { getByTestId } = render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );
    fireEvent.press(getByTestId('loginButton'));
    expect(getByTestId('user').props.children).toBe('test@example.com');
    fireEvent.press(getByTestId('logoutButton'));
    expect(getByTestId('user').props.children).toBe('no user');
  });
});
