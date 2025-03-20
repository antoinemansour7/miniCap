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

  // Basic rendering (covers parts of the component header, text input, etc.)
  it('renders correctly when visible', () => {
    const { getByText, getByPlaceholderText } = render(
      <Chatbot isVisible={true} onClose={onCloseMock} />
    );
    expect(getByText('Campus Guide Chatbot')).toBeTruthy();
    expect(getByPlaceholderText('Type your message...')).toBeTruthy();
  });

  // Close button functionality (covering a small branch in the header)
  it('calls onClose when the close button is pressed', () => {
    const { getByText } = render(
      <Chatbot isVisible={true} onClose={onCloseMock} />
    );
    const closeButton = getByText('✕');
    fireEvent.press(closeButton);
    expect(onCloseMock).toHaveBeenCalled();
  });

  // Send a basic message (covers the default conversation building path)
  it('sends a message and displays bot response', async () => {
    const fakeBotResponse = 'This is a bot response';
    // Simulate no events so that schedule logic is skipped
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
    await waitFor(() => expect(getByText('Hello Chatbot')).toBeTruthy());
    // Wait for the bot response to appear
    await waitFor(() => expect(getByText(fakeBotResponse)).toBeTruthy());
  });

  // Covering the "next class" branch (lines ~71–73, and parts of the inline directions bubble)
  it('processes a "next class" query and shows inline directions bubble', async () => {
    // Create a fake calendar event with a location that matches one in buildingCoordinatesMap
    const fakeEvent = {
      summary: 'Calculus 101',
      location: 'JMSB Room 101',
      start: { dateTime: new Date().toISOString() },
    };
    fetchGoogleCalendarEvents.mockResolvedValueOnce([fakeEvent]);
    const fakeBotResponse = 'Here are your next class details';
    sendConversationToOpenAI.mockResolvedValueOnce(fakeBotResponse);

    const { getByPlaceholderText, getByText, findByText } = render(
      <Chatbot isVisible={true} onClose={onCloseMock} />
    );

    const input = getByPlaceholderText('Type your message...');
    fireEvent.changeText(input, 'What is my next class?');
    const sendButton = getByText('Send');
    fireEvent.press(sendButton);

    // Wait for bot response to be rendered
    await findByText(fakeBotResponse);
    // Now wait for the inline directions bubble
    const inlineButton = await findByText(/Get Directions to/, {}, { timeout: 3000 });
    expect(inlineButton).toBeTruthy();
  });

  // Covering the "schedule" branch (lines ~107–120 and 131)
  it('processes a "schedule" query and returns full schedule details', async () => {
    const fakeEvents = [
      {
        summary: 'Calculus 101',
        location: 'JMSB Room 101',
        start: { dateTime: new Date().toISOString() },
      },
      {
        summary: 'Physics 102',
        location: 'EV Room 202',
        start: { dateTime: new Date(Date.now() + 3600000).toISOString() },
      },
    ];
    fetchGoogleCalendarEvents.mockResolvedValueOnce(fakeEvents);
    const fakeBotResponse = 'Here is your full schedule';
    sendConversationToOpenAI.mockResolvedValueOnce(fakeBotResponse);

    const { getByPlaceholderText, getByText } = render(
      <Chatbot isVisible={true} onClose={onCloseMock} />
    );

    const input = getByPlaceholderText('Type your message...');
    fireEvent.changeText(input, 'Show my schedule');
    const sendButton = getByText('Send');
    fireEvent.press(sendButton);

    await waitFor(() => expect(getByText(fakeBotResponse)).toBeTruthy());
    // Check that the full schedule string (prepended with "Your full schedule:") is included
    expect(getByText(/Your full schedule:/)).toBeTruthy();
  });

  // Covering the branch when no events are returned (ensuring proper finalUserInput formatting)
  it('handles schedule query with no events', async () => {
    fetchGoogleCalendarEvents.mockResolvedValueOnce([]);
    const fakeBotResponse = 'No upcoming events found.\n\nUser question: Show my schedule';
    sendConversationToOpenAI.mockResolvedValueOnce(fakeBotResponse);

    const { getByPlaceholderText, getByText } = render(
      <Chatbot isVisible={true} onClose={onCloseMock} />
    );
    const input = getByPlaceholderText('Type your message...');
    fireEvent.changeText(input, 'Show my schedule');
    const sendButton = getByText('Send');
    fireEvent.press(sendButton);
    await waitFor(() => expect(getByText(fakeBotResponse)).toBeTruthy());
  });

  // Covering handleGetDirections (line ~173) and navigation (via inline bubble)
  it('navigates to directions screen when inline directions button is pressed', async () => {
    const fakeEvent = {
      summary: 'Calculus 101',
      location: 'JMSB Room 101',
      start: { dateTime: new Date().toISOString() },
    };
    fetchGoogleCalendarEvents.mockResolvedValueOnce([fakeEvent]);
    const fakeBotResponse = 'Here are your next class details';
    sendConversationToOpenAI.mockResolvedValueOnce(fakeBotResponse);

    const { getByPlaceholderText, getByText, findByText } = render(
      <Chatbot isVisible={true} onClose={onCloseMock} />
    );

    const input = getByPlaceholderText('Type your message...');
    fireEvent.changeText(input, 'What is my next class?');
    const sendButton = getByText('Send');
    fireEvent.press(sendButton);

    // Wait for inline bubble and then press it
    const inlineButton = await findByText(/Get Directions to/);
    fireEvent.press(inlineButton);

    // Verify that onClose was called and navigation occurred
    expect(onCloseMock).toHaveBeenCalled();
    expect(mockPush).toHaveBeenCalled();
    const pushCallArgs = mockPush.mock.calls[0][0];
    expect(pushCallArgs.pathname).toBe('/screens/directions');
    expect(pushCallArgs.params).toHaveProperty('destination');
    expect(pushCallArgs.params).toHaveProperty('buildingName');
  });

  // Covering the inline popup modal branch (lines ~185–192 and 243)
  it('closes the popup modal when its overlay is pressed', async () => {
    // Simulate a next class query that would trigger showing the popup modal.
    const fakeEvent = {
      summary: 'Calculus 101',
      location: 'JMSB Room 101',
      start: { dateTime: new Date().toISOString() },
    };
    fetchGoogleCalendarEvents.mockResolvedValueOnce([fakeEvent]);
    const fakeBotResponse = 'Here are your next class details';
    sendConversationToOpenAI.mockResolvedValueOnce(fakeBotResponse);

    const { getByPlaceholderText, getByText, queryByText, findByText } = render(
      <Chatbot isVisible={true} onClose={onCloseMock} />
    );

    const input = getByPlaceholderText('Type your message...');
    fireEvent.changeText(input, 'What is my next class?');
    const sendButton = getByText('Send');
    fireEvent.press(sendButton);

    // Wait for inline bubble to appear
    await findByText(/Get Directions to/);
    // The popup modal (with text "Next Directions") should also appear
    const popupText = await findByText('Next Directions');
    expect(popupText).toBeTruthy();
    // Simulate pressing on the popup overlay/button to close it
    fireEvent.press(popupText);
    // Wait for the popup modal to be dismissed
    await waitFor(() => {
      expect(queryByText('Next Directions')).toBeNull();
    });
  });

  // Error handling: when sendConversationToOpenAI fails (covering other branch)
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

    await waitFor(() =>
      expect(getByText('Error fetching response. Please try again.')).toBeTruthy()
    );
  });
});