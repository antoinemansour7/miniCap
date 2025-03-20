import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import Chatbot from '../Chatbot';
import { sendConversationToOpenAI } from '../../services/openai';
import fetchGoogleCalendarEvents from '../../app/api/googleCalendar';

// Mock the OpenAI service
jest.mock('../../services/openai', () => ({
  sendConversationToOpenAI: jest.fn(),
}));

// Mock the Google Calendar API
jest.mock('../../app/api/googleCalendar', () => jest.fn());

// Create a mock for the Expo Router
const mockPush = jest.fn();
jest.mock('expo-router', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

describe('Chatbot Component', () => {
  const onCloseMock = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly when visible', () => {
    const { getByText, getByPlaceholderText } = render(
      <Chatbot isVisible={true} onClose={onCloseMock} />
    );
    expect(getByText('Campus Guide Chatbot')).toBeTruthy();
    expect(getByPlaceholderText('Type your message...')).toBeTruthy();
  });

  it('calls onClose when the close button is pressed', () => {
    const { getByText } = render(
      <Chatbot isVisible={true} onClose={onCloseMock} />
    );
    const closeButton = getByText('✕');
    fireEvent.press(closeButton);
    expect(onCloseMock).toHaveBeenCalled();
  });

  it('sends a message and displays bot response', async () => {
    const fakeBotResponse = 'This is a bot response';
    // Simulate no events so schedule logic is skipped
    fetchGoogleCalendarEvents.mockResolvedValueOnce([]);
    sendConversationToOpenAI.mockResolvedValueOnce(fakeBotResponse);

    const { getByPlaceholderText, getByText } = render(
      <Chatbot isVisible={true} onClose={onCloseMock} />
    );

    const input = getByPlaceholderText('Type your message...');
    fireEvent.changeText(input, 'Hello Chatbot');
    const sendButton = getByText('Send');
    fireEvent.press(sendButton);

    // Check that the user's message is rendered
    await waitFor(() =>
      expect(getByText('Hello Chatbot')).toBeTruthy()
    );

    // Wait for the bot response to appear
    await waitFor(() =>
      expect(getByText(fakeBotResponse)).toBeTruthy()
    );
  });

  it('processes a "next class" query and shows inline directions bubble', async () => {
    // Create a fake calendar event whose location contains "JMSB"
    const fakeEvent = {
      summary: 'Calculus 101',
      location: 'JMSB Room 101',
      start: { dateTime: new Date().toISOString() },
    };
    fetchGoogleCalendarEvents.mockResolvedValueOnce([fakeEvent]);
    const fakeBotResponse = 'Here are your next class details';
    sendConversationToOpenAI.mockResolvedValueOnce(fakeBotResponse);

    const { getByPlaceholderText, getByText } = render(
      <Chatbot isVisible={true} onClose={onCloseMock} />
    );

    const input = getByPlaceholderText('Type your message...');
    // The query includes "next class" to trigger schedule processing.
    fireEvent.changeText(input, 'What is my next class?');
    const sendButton = getByText('Send');
    fireEvent.press(sendButton);

    // Wait for the bot response to be rendered
    await waitFor(() =>
      expect(getByText(fakeBotResponse)).toBeTruthy()
    );

    // Check that an inline directions bubble appears (its text includes "Get Directions to")
    await waitFor(() =>
      expect(getByText(/Get Directions to/)).toBeTruthy()
    );
  });

  it('navigates to directions screen when inline directions button is pressed', async () => {
    // Create a fake event with location matching "JMSB"
    const fakeEvent = {
      summary: 'Calculus 101',
      location: 'JMSB Room 101',
      start: { dateTime: new Date().toISOString() },
    };
    fetchGoogleCalendarEvents.mockResolvedValueOnce([fakeEvent]);
    const fakeBotResponse = 'Here are your next class details';
    sendConversationToOpenAI.mockResolvedValueOnce(fakeBotResponse);

    const { getByPlaceholderText, getByText } = render(
      <Chatbot isVisible={true} onClose={onCloseMock} />
    );

    const input = getByPlaceholderText('Type your message...');
    fireEvent.changeText(input, 'What is my next class?');
    const sendButton = getByText('Send');
    fireEvent.press(sendButton);

    // Wait for the inline directions bubble to appear
    const inlineButton = await waitFor(() =>
      getByText(/Get Directions to/)
    );
    fireEvent.press(inlineButton);

    // Verify that the onClose callback is called and the router navigates to directions
    expect(onCloseMock).toHaveBeenCalled();
    expect(mockPush).toHaveBeenCalled();

    // Optionally, check that router.push was called with the expected parameters.
    const pushCallArgs = mockPush.mock.calls[0][0];
    expect(pushCallArgs.pathname).toBe('/screens/directions');
    expect(pushCallArgs.params).toHaveProperty('destination');
    expect(pushCallArgs.params).toHaveProperty('buildingName');
  });

  it('displays an error message when sendConversationToOpenAI fails', async () => {
    sendConversationToOpenAI.mockRejectedValueOnce(new Error('API Error'));
    fetchGoogleCalendarEvents.mockResolvedValueOnce([]);

    const { getByPlaceholderText, getByText } = render(
      <Chatbot isVisible={true} onClose={onCloseMock} />
    );

    const input = getByPlaceholderText('Type your message...');
    fireEvent.changeText(input, 'Hello Chatbot');
    const sendButton = getByText('Send');
    fireEvent.press(sendButton);

    // Wait for the error message to be rendered
    await waitFor(() =>
      expect(getByText('Error fetching response. Please try again.')).toBeTruthy()
    );
  });
});