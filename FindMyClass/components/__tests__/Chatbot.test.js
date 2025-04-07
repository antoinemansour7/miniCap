import React from 'react';
import { render, fireEvent, waitFor, act } from '@testing-library/react-native';
import Chatbot from '../Chatbot'; // Adjust path as needed
import { sendConversationToOpenAI } from '../../services/openai';
import fetchGoogleCalendarEvents from '../../app/api/googleCalendar';
import { useRouter } from 'expo-router';

// Mock the required dependencies
jest.mock('../../services/openai', () => ({
  sendConversationToOpenAI: jest.fn()
}));

jest.mock('../../app/api/googleCalendar', () => jest.fn());

jest.mock('expo-router', () => ({
  useRouter: jest.fn()
}));

jest.mock('uuid', () => ({
  v4: jest.fn(() => 'test-uuid')
}));

// Mock timer functions
jest.useFakeTimers();

describe('Chatbot Component', () => {
  const mockOnClose = jest.fn();
  const mockPush = jest.fn();
  
  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();
    
    // Mock router
    useRouter.mockReturnValue({
      push: mockPush
    });
    
    // Mock OpenAI response
    sendConversationToOpenAI.mockResolvedValue('This is a bot response');
    
    // Mock Google Calendar events
    fetchGoogleCalendarEvents.mockResolvedValue([]);
  });

  it('renders correctly when visible', () => {
    const { getByText, getByPlaceholderText } = render(
      <Chatbot isVisible={true} onClose={mockOnClose} />
    );
    
    expect(getByText('Campus Guide Chatbot')).toBeTruthy();
    expect(getByPlaceholderText('Type your message...')).toBeTruthy();
    expect(getByText('Send')).toBeTruthy();
  });

  it('closes when the close button is pressed', () => {
    const { getByText } = render(
      <Chatbot isVisible={true} onClose={mockOnClose} />
    );
    
    fireEvent.press(getByText('✕'));
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('sends a message and receives a response', async () => {
    const { getByText, getByPlaceholderText, findByText } = render(
      <Chatbot isVisible={true} onClose={mockOnClose} />
    );
    
    const input = getByPlaceholderText('Type your message...');
    fireEvent.changeText(input, 'Hello');
    
    const sendButton = getByText('Send');
    fireEvent.press(sendButton);
    
    // Verify the message was added
    expect(getByText('Hello')).toBeTruthy();
    
    // Wait for the bot response
    await waitFor(() => {
      expect(sendConversationToOpenAI).toHaveBeenCalled();
    });
    
    const botResponse = await findByText('This is a bot response');
    expect(botResponse).toBeTruthy();
  });


  it('handles next class request with calendar events', async () => {
    // Mock calendar events with a next class
    const mockEvent = {
      summary: 'Math 101',
      location: 'JMSB Building',
      start: { dateTime: new Date().toISOString() }
    };
    
    fetchGoogleCalendarEvents.mockResolvedValue([mockEvent]);
    
    const { getByPlaceholderText, getByText, findByText } = render(
      <Chatbot isVisible={true} onClose={mockOnClose} />
    );
    
    const input = getByPlaceholderText('Type your message...');
    fireEvent.changeText(input, 'What is my next class?');
    
    const sendButton = getByText('Send');
    fireEvent.press(sendButton);
    
    await waitFor(() => {
      expect(fetchGoogleCalendarEvents).toHaveBeenCalled();
    });
    
    await findByText('This is a bot response');
    await findByText(/Get Directions to JMSB Building/i);
    
    // Verify the directions popup is shown
    expect(sendConversationToOpenAI).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({
          content: expect.stringContaining('JMSB Building')
        })
      ])
    );
  });

  
  it('handles general schedule request', async () => {
    // Mock calendar events for schedule
    const mockEvents = [
      {
        summary: 'Math 101',
        location: 'JMSB Building',
        start: { dateTime: new Date(Date.now() + 3600000).toISOString() }
      },
      {
        summary: 'Physics 202',
        location: 'EV Building',
        start: { dateTime: new Date(Date.now() + 7200000).toISOString() }
      }
    ];
    
    fetchGoogleCalendarEvents.mockResolvedValue(mockEvents);
    
    const { getByPlaceholderText, getByText, findByText } = render(
      <Chatbot isVisible={true} onClose={mockOnClose} />
    );
    
    const input = getByPlaceholderText('Type your message...');
    fireEvent.changeText(input, 'Show me my schedule');
    
    const sendButton = getByText('Send');
    fireEvent.press(sendButton);
    
    await waitFor(() => {
      expect(fetchGoogleCalendarEvents).toHaveBeenCalled();
    });
    
    await findByText('This is a bot response');
    expect(sendConversationToOpenAI).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({
          content: expect.stringContaining('Your full schedule')
        })
      ])
    );
  });

  it('handles API errors gracefully', async () => {
    // Mock API failure
    sendConversationToOpenAI.mockRejectedValue(new Error('API Error'));
    
    const { getByPlaceholderText, getByText, findByText } = render(
      <Chatbot isVisible={true} onClose={mockOnClose} />
    );
    
    const input = getByPlaceholderText('Type your message...');
    fireEvent.changeText(input, 'Hello');
    
    const sendButton = getByText('Send');
    fireEvent.press(sendButton);
    
    const errorMessage = await findByText('Error fetching response. Please try again.');
    expect(errorMessage).toBeTruthy();
  });

  it('does not send empty messages', () => {
    const { getByPlaceholderText, getByText } = render(
      <Chatbot isVisible={true} onClose={mockOnClose} />
    );
    
    const input = getByPlaceholderText('Type your message...');
    fireEvent.changeText(input, '   '); // Just whitespace
    
    const sendButton = getByText('Send');
    fireEvent.press(sendButton);
    
    expect(sendConversationToOpenAI).not.toHaveBeenCalled();
  });

});