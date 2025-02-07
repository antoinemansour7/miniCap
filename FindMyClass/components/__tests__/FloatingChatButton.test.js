import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import FloatingChatButton from '../FloatingChatButton';
import { NavigationContainer } from '@react-navigation/native';

// Mock Chatbot to prevent it from actually rendering
jest.mock('../Chatbot', () => jest.fn(() => null));

describe('FloatingChatButton Component', () => {
  it('renders the chat button', () => {
    const { getByTestId } = render(
      <NavigationContainer>
        <FloatingChatButton />
      </NavigationContainer>
    );

    expect(getByTestId('floating-chat-button')).toBeTruthy();
  });

  it('opens the chatbot when the button is pressed', async () => {
    const { getByTestId } = render(
      <NavigationContainer>
        <FloatingChatButton />
      </NavigationContainer>
    );

    fireEvent.press(getByTestId('floating-chat-button'));
    await waitFor(() => expect(getByTestId('chatbot')).toBeTruthy());
  });

  it('closes the chatbot when the close button is pressed', async () => {
    const { getByTestId, queryByTestId } = render(
      <NavigationContainer>
        <FloatingChatButton />
      </NavigationContainer>
    );

    fireEvent.press(getByTestId('floating-chat-button'));
    await waitFor(() => expect(getByTestId('chatbot')).toBeTruthy());

    fireEvent.press(getByTestId('close-chatbot'));
    await waitFor(() => expect(queryByTestId('chatbot')).toBeNull());
  });
});