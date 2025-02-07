import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { NavigationContainer } from '@react-navigation/native';
import Chatbot from '../Chatbot';
import { sendMessageToOpenAI } from '../../services/openai';

// Mock navigation
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({
    navigate: jest.fn(),
  }),
  NavigationContainer: ({ children }) => <>{children}</>,
}));

// Mock OpenAI API call
jest.mock('../../services/openai', () => ({
  sendMessageToOpenAI: jest.fn(),
}));

describe('Chatbot Component', () => {
  it('renders correctly when visible', async () => {
    const { getByPlaceholderText, getByText } = render(
      <NavigationContainer>
        <Chatbot isVisible={true} onClose={jest.fn()} />
      </NavigationContainer>
    );

    await waitFor(() => expect(getByPlaceholderText('Type your message...')).toBeTruthy());
    expect(getByText('Send')).toBeTruthy();
  });

  it('sends a user message and displays it', async () => {
    sendMessageToOpenAI.mockResolvedValueOnce('This is a bot response');

    const { getByPlaceholderText, getByText, findByText } = render(
      <NavigationContainer>
        <Chatbot isVisible={true} onClose={jest.fn()} />
      </NavigationContainer>
    );

    const input = getByPlaceholderText('Type your message...');
    const sendButton = getByText('Send');

    fireEvent.changeText(input, 'Hello bot');
    fireEvent.press(sendButton);

    await waitFor(() => expect(findByText('Hello bot')).toBeTruthy());
    await waitFor(() => expect(findByText('This is a bot response')).toBeTruthy());
  });

  it('displays an error message when API call fails', async () => {
    sendMessageToOpenAI.mockRejectedValueOnce(new Error('API Error'));

    const { getByPlaceholderText, getByText, findByText } = render(
      <NavigationContainer>
        <Chatbot isVisible={true} onClose={jest.fn()} />
      </NavigationContainer>
    );

    const input = getByPlaceholderText('Type your message...');
    const sendButton = getByText('Send');

    fireEvent.changeText(input, 'Hello bot');
    fireEvent.press(sendButton);

    await waitFor(() =>
      expect(findByText('Error fetching response. Please try again.')).toBeTruthy()
    );
  });

  it('closes when the close button is pressed', async () => {
    const onCloseMock = jest.fn();
    const { getByText } = render(
      <NavigationContainer>
        <Chatbot isVisible={true} onClose={onCloseMock} />
      </NavigationContainer>
    );

    fireEvent.press(getByText('Close'));
    expect(onCloseMock).toHaveBeenCalled();
  });
});