import React from 'react';
import { render } from '@testing-library/react-native';
import Profile from '../screens/profile';
import FloatingChatButton from '../../components/FloatingChatButton';

// Mock FloatingChatButton component
jest.mock('../../components/FloatingChatButton', () => () => <></>);

describe('Profile Screen', () => {
  it('renders profile screen correctly', () => {
    const { getByText } = render(<Profile />);
    expect(getByText('Profile Screen')).toBeTruthy();
  });

  it('renders the FloatingChatButton', () => {
    const { getByTestId } = render(<Profile />);
    expect(getByTestId('floating-chat-button')).toBeTruthy();
  });
});