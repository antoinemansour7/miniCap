import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Modal,
  ScrollView,
  SafeAreaView
} from 'react-native';
import { v4 as uuidv4 } from 'uuid';

// Import the new function that sends an array of messages
import { sendConversationToOpenAI } from '../services/openai';

// Import your existing Google Calendar fetch function
import fetchGoogleCalendarEvents from '../app/api/googleCalendar';

// Example system prompt to define the bot's behavior
const systemPrompt = {
  role: 'system',
  content: `
You are a Campus Guide Assistant for Concordia University. 
Your role is to:
- Help users access their class schedules.
- Provide Google Maps directions to their next class.
- Answer questions about SGW and Loyola campuses.
- Provide accessibility info (elevators, washrooms).
- If you do not know the answer, say so rather than inventing one.
-If a user asks about their schedule, you should first check their Google Calendar events. If there are no events, tell the user to login with google, do not say there is no upcomming events in his calendar.
-When you give the next class, also provide the location, and ask the user if they want directions to the class.
-If a user asks about the weather, give the montreal weather of the day.
-The current date is Tuesday, March 18 2025. Do not give out-dated information. Please access the real time information.

`
};

const Chatbot = ({ isVisible, onClose }) => {
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const scrollViewRef = useRef();

  // This function sends a new user message to the bot
  const sendMessage = async () => {
    if (!inputText.trim()) return;

    // 1) Add the user message to state
    const userMessage = { id: uuidv4(), text: inputText, isUser: true };
    setMessages(prevMessages => [...prevMessages, userMessage]);

    // Clear the input
    setInputText('');

    // 2) Check if the user wants schedule info
    let finalUserInput = inputText;
    const lowerInput = inputText.toLowerCase();

    if (lowerInput.includes('next class') || lowerInput.includes('schedule')) {
      const events = await fetchGoogleCalendarEvents();
      if (events.length > 0) {
        // Format each event
        const eventsText = events
          .map(event => {
            const start = event.start?.dateTime || event.start?.date;
            return `Title: ${event.summary}, Start: ${start}`;
          })
          .join('\n');
        finalUserInput = `User calendar events:\n${eventsText}\n\nUser question: ${inputText}`;
      } else {
        finalUserInput = `No upcoming events found.\n\nUser question: ${inputText}`;
      }
    }

    // 3) Build the entire conversation for OpenAI
    //    - Start with systemPrompt
    //    - Then add all previous messages
    //    - Finally add the new user message
    const conversation = [
      systemPrompt,
      ...messages.map(msg => ({
        role: msg.isUser ? 'user' : 'assistant',
        content: msg.text
      })),
      { role: 'user', content: finalUserInput }
    ];

    // 4) Send the conversation to OpenAI
    try {
      const botResponse = await sendConversationToOpenAI(conversation);
      // 5) Add the bot's reply to state
      const botMessage = { id: uuidv4(), text: botResponse, isUser: false };
      setMessages(prevMessages => [...prevMessages, botMessage]);
    } catch (error) {
      console.error(error);
      const errorMessage = {
        id: uuidv4(),
        text: 'Error fetching response. Please try again.',
        isUser: false
      };
      setMessages(prevMessages => [...prevMessages, errorMessage]);
    }
  };

  // Keep the ScrollView pinned to the bottom when messages update
  useEffect(() => {
    if (scrollViewRef.current) {
      scrollViewRef.current.scrollToEnd({ animated: true });
    }
  }, [messages]);

  return (
    <Modal visible={isVisible} animationType="slide" onRequestClose={onClose}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.modalContainer}>
          {/* Header with title and close button */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Chatbot</Text>
            <TouchableOpacity
              style={styles.closeButtonContainer}
              onPress={onClose}
            >
              <Text style={styles.closeButton}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* Chat messages */}
          <ScrollView
            style={styles.chatContainer}
            contentContainerStyle={styles.chatContent}
            ref={scrollViewRef}
          >
            {messages.map((message) => (
              <View
                key={message.id}
                style={[
                  styles.message,
                  message.isUser ? styles.userMessage : styles.botMessage,
                ]}
              >
                <Text style={message.isUser ? styles.userText : styles.botText}>
                  {message.text}
                </Text>
              </View>
            ))}
          </ScrollView>

          {/* Input area */}
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              value={inputText}
              onChangeText={setInputText}
              placeholder="Type your message..."
              placeholderTextColor="#888"
              onSubmitEditing={sendMessage}
            />
            <TouchableOpacity style={styles.sendButton} onPress={sendMessage}>
              <Text style={styles.sendButtonText}>Send</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f5f6fa',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#ffffff',
    margin: 20,
    borderRadius: 15,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#912338',
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  headerTitle: {
    fontSize: 18,
    color: '#fff',
    fontWeight: '600',
  },
  closeButtonContainer: {
    padding: 5,
  },
  closeButton: {
    fontSize: 20,
    color: '#fff',
  },
  chatContainer: {
    flex: 1,
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 10,
  },
  chatContent: {
    paddingVertical: 10,
  },
  message: {
    padding: 12,
    marginVertical: 6,
    borderRadius: 10,
    maxWidth: '80%',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  userMessage: {
    alignSelf: 'flex-end',
    backgroundColor: '#912338',
  },
  botMessage: {
    alignSelf: 'flex-start',
    backgroundColor: '#e5e5ea',
  },
  userText: {
    color: '#fff',
    fontSize: 16,
  },
  botText: {
    color: '#000',
    fontSize: 16,
  },
  inputContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    padding: 10,
    borderTopWidth: 1,
    borderTopColor: '#ddd',
  },
  input: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 15,
    backgroundColor: '#f0f0f0',
    borderRadius: 25,
    fontSize: 16,
    color: '#000',
  },
  sendButton: {
    backgroundColor: '#912338',
    borderRadius: 25,
    paddingVertical: 10,
    paddingHorizontal: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
  },
  sendButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default Chatbot;