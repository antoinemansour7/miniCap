import React from 'react';
import { render, fireEvent, act } from '@testing-library/react-native';
import FloatingChatButton from '../FloatingChatButton';

// Mock the MaterialIcons component
jest.mock('@expo/vector-icons', () => ({
  MaterialIcons: 'MaterialIcons',
}));

// Mock the Chatbot component
jest.mock('../Chatbot', () => {
  return jest.fn(({ isVisible, onClose }) => {
    return isVisible ? <div testID="mock-chatbot">Chatbot</div> : null;
  });
});

describe('FloatingChatButton', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  it('renders correctly with initial state', () => {
    const { getByTestId, queryByTestId } = render(<FloatingChatButton />);
    
    // Check if the chat button is rendered
    const chatButton = getByTestId('chat-button');
    expect(chatButton).toBeTruthy();
    
    // Check if the Chatbot is not visible initially
    const chatbot = queryByTestId('mock-chatbot');
    expect(chatbot).toBeNull();
  });

  it('shows Chatbot when button is pressed', async () => {
    const { getByTestId, queryByTestId } = render(<FloatingChatButton />);
    
    // Press the chat button wrapped in act
    await act(async () => {
      fireEvent.press(getByTestId('chat-button'));
    });
    
    // Check if Chatbot is now visible
    const chatbot = queryByTestId('mock-chatbot');
    expect(chatbot).toBeTruthy();
  });

  it('hides Chatbot when onClose is triggered', async () => {
    const { getByTestId, queryByTestId } = render(<FloatingChatButton />);
    
    // Show the Chatbot first
    await act(async () => {
      fireEvent.press(getByTestId('chat-button'));
    });
    
    // Verify Chatbot is visible
    expect(queryByTestId('mock-chatbot')).toBeTruthy();
    
    // Trigger onClose wrapped in act
    await act(async () => {
      const mockChatbot = require('../Chatbot');
      const { onClose } = mockChatbot.mock.calls[0][0];
      onClose();
    });
    
    // Check if Chatbot is hidden
    expect(queryByTestId('mock-chatbot')).toBeNull();
  });

  it('applies correct styles to the container and button', () => {
    const { getByTestId } = render(<FloatingChatButton />);
    const button = getByTestId('chat-button');
    const container = button.parent;
    
    // Test container styles
    expect(container.props.style).toEqual({
      position: 'absolute',
      bottom: 80,
      right: 20,
    });
    
    // Test button styles
    const buttonStyles = button.props.style;
    expect(buttonStyles).toEqual({
      backgroundColor: '#912338',
      padding: 15,
      borderRadius: 30,
      elevation: 5,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25,
      shadowRadius: 3.84,
    });
  });
});