import React from 'react';
import { render, fireEvent, waitFor, act } from '@testing-library/react-native';
import { NavigationContainer } from '@react-navigation/native';
import Chatbot from '../Chatbot';
import { sendConversationToOpenAI } from '../../services/openai';
import fetchGoogleCalendarEvents from '../app/api/googleCalendar';
import { useRouter } from 'expo-router';

// Use fake timers to test the popup timer
jest.useFakeTimers();

// Mock the router
const pushMock = jest.fn();
jest.mock('expo-router', () => ({
  useRouter: () => ({
    push: pushMock,
  }),
}));

// Mock OpenAI API call
jest.mock('../../services/openai', () => ({
  sendConversationToOpenAI: jest.fn(),
}));

// Mock the Google Calendar fetch function
jest.mock('../app/api/googleCalendar', () => jest.fn());

describe('Chatbot Component', () => {
  const onCloseMock = jest.fn();

  beforeEach(() => {
    onCloseMock.mockClear();
    pushMock.mockClear();
    sendConversationToOpenAI.mockClear();
    fetchGoogleCalendarEvents.mockClear();
  });

  it('renders correctly when visible', async () => {
    const { getByPlaceholderText, getByText } = render(
      <NavigationContainer>
        <Chatbot isVisible={true} onClose={onCloseMock} />
      </NavigationContainer>
    );

    await waitFor(() => expect(getByPlaceholderText('Type your message...')).toBeTruthy());
    expect(getByText('Send')).toBeTruthy();
  });

  it('sends a generic user message and displays bot response', async () => {
    sendConversationToOpenAI.mockResolvedValueOnce('This is a generic bot response');

    const { getByPlaceholderText, getByText, findByText } = render(
      <NavigationContainer>
        <Chatbot isVisible={true} onClose={onCloseMock} />
      </NavigationContainer>
    );

    const input = getByPlaceholderText('Type your message...');
    const sendButton = getByText('Send');

    fireEvent.changeText(input, 'Hello bot');
    fireEvent.press(sendButton);

    await waitFor(() => expect(findByText('Hello bot')).toBeTruthy());
    await waitFor(() => expect(findByText('This is a generic bot response')).toBeTruthy());
  });

  it('displays an error message when OpenAI API call fails', async () => {
    sendConversationToOpenAI.mockRejectedValueOnce(new Error('API Error'));

    const { getByPlaceholderText, getByText, findByText } = render(
      <NavigationContainer>
        <Chatbot isVisible={true} onClose={onCloseMock} />
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
    const { getByText } = render(
      <NavigationContainer>
        <Chatbot isVisible={true} onClose={onCloseMock} />
      </NavigationContainer>
    );

    const closeButton = getByText('✕');
    fireEvent.press(closeButton);
    expect(onCloseMock).toHaveBeenCalled();
  });

  it('displays inline directions bubble and dismisses popup after 10 seconds for "next class" query', async () => {
    // Create a mock event with a future start and a location that matches the mapping.
    const futureDate = new Date(Date.now() + 3600000).toISOString(); // 1 hour from now
    const mockEvent = {
      summary: 'Math 101',
      start: { dateTime: futureDate },
      location: 'JMSB',
    };
    fetchGoogleCalendarEvents.mockResolvedValueOnce([mockEvent]);
    sendConversationToOpenAI.mockResolvedValueOnce('Bot response for next class');

    const { getByPlaceholderText, getByText, queryByText } = render(
      <NavigationContainer>
        <Chatbot isVisible={true} onClose={onCloseMock} />
      </NavigationContainer>
    );

    const input = getByPlaceholderText('Type your message...');
    fireEvent.changeText(input, 'next class');
    fireEvent.press(getByText('Send'));

    // Wait for the bot's response to be rendered and inline directions bubble to appear
    await waitFor(() => getByText(/Your next class details:/));
    const inlineBubble = getByText(/Get Directions to JMSB/);
    expect(inlineBubble).toBeTruthy();

    // Check that after 10 seconds, the popup modal is dismissed.
    act(() => {
      jest.advanceTimersByTime(10000);
    });
    await waitFor(() => {
      expect(queryByText('Next Directions')).toBeNull();
    });
  });

  it('navigates to directions when inline directions bubble is pressed', async () => {
    // Create a mock event with a future start and a location that matches the mapping.
    const futureDate = new Date(Date.now() + 3600000).toISOString();
    const mockEvent = {
      summary: 'Physics 201',
      start: { dateTime: futureDate },
      location: 'HALL',
    };
    fetchGoogleCalendarEvents.mockResolvedValueOnce([mockEvent]);
    sendConversationToOpenAI.mockResolvedValueOnce('Bot response for next class');

    const { getByPlaceholderText, getByText } = render(
      <NavigationContainer>
        <Chatbot isVisible={true} onClose={onCloseMock} />
      </NavigationContainer>
    );

    const input = getByPlaceholderText('Type your message...');
    fireEvent.changeText(input, 'next class');
    fireEvent.press(getByText('Send'));

    const inlineBubble = await waitFor(() => getByText(/Get Directions to HALL/));
    expect(inlineBubble).toBeTruthy();

    fireEvent.press(inlineBubble);
    await waitFor(() => {
      expect(onCloseMock).toHaveBeenCalled();
      expect(pushMock).toHaveBeenCalledWith({
        pathname: '/screens/directions',
        params: {
          destination: JSON.stringify({ latitude: 45.4960, longitude: -73.5760 }),
          buildingName: 'HALL'
        }
      });
    });
  });
});