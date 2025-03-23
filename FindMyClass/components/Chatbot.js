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
import { useRouter } from 'expo-router';

// Import the function that sends an array of messages to OpenAI
import { sendConversationToOpenAI } from '../services/openai';
// Import your existing Google Calendar fetch function
import fetchGoogleCalendarEvents from '../app/api/googleCalendar';

// A simple mapping from building names to coordinates (update with your actual coordinates)
const buildingCoordinatesMap = {
  "JMSB": { latitude: 45.4945, longitude: -73.5780 },
  "EV": { latitude: 45.4950, longitude: -73.5770 },
  "HALL": { latitude: 45.4960, longitude: -73.5760 },
  // Add other building mappings as needed.
};

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
- If a user asks about their schedule, you should first check their Google Calendar events. If there are no events, tell the user to login with Google.
- When giving the next class details, include the time and location, and say that you have added a link to the directions of the next class.
- For directions, note that the shuttle is only available between the two campuses. The EV, Hall, and JMSB buildings are on the SGW campus, and "S2" indicates the second floor in the basement.
- If a user asks about the weather, give the Montreal weather of the day.
`
};

const Chatbot = ({ isVisible, onClose }) => {
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  // State for storing the next class event with destination coordinates
  const [nextClassEvent, setNextClassEvent] = useState(null);
  const [showDirectionsPopup, setShowDirectionsPopup] = useState(false);
  const scrollViewRef = useRef(null);
  const router = useRouter();

  const sendMessage = async () => {
    if (!inputText.trim()) return;

    // 1) Add the user message to state
    const userMessage = { id: uuidv4(), text: inputText, isUser: true };
    setMessages(prev => [...prev, userMessage]);
    setInputText('');

    // 2) Process schedule-related queries
    let finalUserInput = inputText;
    try {
      const lowerInput = inputText.toLowerCase();
      if (lowerInput.includes('next class') || lowerInput.includes('schedule')) {
        const events = await fetchGoogleCalendarEvents();
        if (events.length > 0) {
          // Sort events by start time so that the soonest event is first
          events.sort((a, b) => {
            const aStart = new Date(a.start?.dateTime || a.start?.date);
            const bStart = new Date(b.start?.dateTime || b.start?.date);
            return aStart - bStart;
          });
          if (lowerInput.includes('next class')) {
            // For "next class", pick only the earliest event
            let nextEvent = events[0];
            // If destinationCoordinates is not provided, try to determine it by matching the event location
            if (!nextEvent.destinationCoordinates && nextEvent.location) {
              const rawLocation = nextEvent.location.trim().toUpperCase();
              let foundCoordinates = null;
              Object.keys(buildingCoordinatesMap).forEach((key) => {
                if (rawLocation.includes(key)) {
                  foundCoordinates = buildingCoordinatesMap[key];
                }
              });
              nextEvent = {
                ...nextEvent,
                destinationCoordinates: foundCoordinates,
              };
            }
            setNextClassEvent(nextEvent);

            // Format the start time
            const startStr = nextEvent.start?.dateTime || nextEvent.start?.date;
            let formattedTime = '';
            if (startStr) {
              const eventDate = new Date(startStr);
              formattedTime = eventDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            }
            const location = nextEvent.location || 'No location provided';
            const directionsContext = `Note: EV, Hall, and JMSB are on the SGW campus. "S2" indicates the second floor in the basement. The shuttle operates only between the two campuses.`;
            const eventsText = `Title: ${nextEvent.summary}, Time: ${formattedTime}, Location: ${location}\n${directionsContext}`;
            finalUserInput = `Your next class details:\n${eventsText}\n\nUser question: ${inputText}`;
          } else {
            // For a generic "schedule" query, show the full schedule overview
            setNextClassEvent(null);
            const eventsText = events
              .map(event => {
                const startStr = event.start?.dateTime || event.start?.date;
                let formattedTime = '';
                if (startStr) {
                  const eventDate = new Date(startStr);
                  formattedTime = eventDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                }
                const location = event.location || 'No location provided';
                return `Title: ${event.summary}, Time: ${formattedTime}, Location: ${location}`;
              })
              .join('\n');
            finalUserInput = `Your full schedule:\n${eventsText}\n\nUser question: ${inputText}`;
          }
        } else {
          finalUserInput = `No upcoming events found.\n\nUser question: ${inputText}`;
          setNextClassEvent(null);
        }
      }
    } catch (error) {
      console.error("Error processing schedule queries:", error);
      // Optionally fallback to original input
      finalUserInput = inputText;
    }

    // 3) Build the conversation for OpenAI
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
      const botMessage = { id: uuidv4(), text: botResponse, isUser: false };
      setMessages(prev => [...prev, botMessage]);
      // After bot reply, if a next-class event exists and popup isn't already shown, show the directions popup
      if (nextClassEvent && nextClassEvent.destinationCoordinates && !showDirectionsPopup) {
        setShowDirectionsPopup(true);
      }
    } catch (error) {
      console.error(error);
      const errorMessage = {
        id: uuidv4(),
        text: 'Error fetching response. Please try again.',
        isUser: false
      };
      setMessages(prev => [...prev, errorMessage]);
    }
  };

  // Handler for the "Get Directions" button
  const handleGetDirections = () => {
    console.log("Get Directions pressed");
    if (nextClassEvent && nextClassEvent.destinationCoordinates) {
      setShowDirectionsPopup(false);
      // Close the Chatbot modal before navigating
      onClose();
      router.push({
        pathname: '/screens/directions',
        params: {
          destination: JSON.stringify(nextClassEvent.destinationCoordinates),
          buildingName: nextClassEvent.location || nextClassEvent.summary
        }
      });
    } else {
      alert("Directions unavailable – no valid coordinates found for this event.");
    }
  };

  useEffect(() => {
    if (scrollViewRef.current) {
      scrollViewRef.current.scrollToEnd({ animated: true });
    }
  }, [messages]);

  useEffect(() => {
    if (showDirectionsPopup) {
      console.log("Popup shown, starting 10-second timer...");
      const timer = setTimeout(() => {
        console.log("Timer finished: closing popup.");
        setShowDirectionsPopup(false);
      }, 10000); // 10 seconds
      return () => {
        console.log("Clearing timer.");
        clearTimeout(timer);
      };
    }
  }, [showDirectionsPopup]);

  return (
    <Modal visible={isVisible} animationType="slide" onRequestClose={onClose}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.modalContainer}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Campus Guide Chatbot</Text>
            <TouchableOpacity style={styles.closeButtonContainer} onPress={onClose}>
              <Text style={styles.closeButton}>✕</Text>
            </TouchableOpacity>
          </View>
          {/* Chat messages with inline directions module */}
          <ScrollView style={styles.chatContainer} contentContainerStyle={styles.chatContent} ref={scrollViewRef}>
            {messages.map(message => (
              <View key={message.id} style={[styles.message, message.isUser ? styles.userMessage : styles.botMessage]}>
                <Text style={message.isUser ? styles.userText : styles.botText}>{message.text}</Text>
              </View>
            ))}
            {nextClassEvent && nextClassEvent.destinationCoordinates && (
              <View style={styles.inlineDirectionsBubble}>
                <TouchableOpacity onPress={handleGetDirections}>
                  <Text style={styles.inlineDirectionsText}>
                    Get Directions to {nextClassEvent.location || nextClassEvent.summary}
                  </Text>
                </TouchableOpacity>
              </View>
            )}
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
        {/* Popup Modal: displayed after bot reply, appears inline */}
        {showDirectionsPopup && (
          <Modal transparent animationType="fade" visible={showDirectionsPopup}>
            <TouchableOpacity style={styles.popupOverlay} onPress={() => setShowDirectionsPopup(false)}>
              <View style={styles.popupBubble}>
                <TouchableOpacity onPress={handleGetDirections}>
                  <Text style={styles.popupText}>Next Directions</Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          </Modal>
        )}
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fdfdfd',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#ffffff',
    margin: 20,
    borderRadius: 20,
    shadowColor: '#333',
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 8,
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
    fontSize: 20,
    color: '#fff',
    fontWeight: '700',
  },
  closeButtonContainer: {
    padding: 5,
  },
  closeButton: {
    fontSize: 24,
    color: '#fff',
  },
  chatContainer: {
    flex: 1,
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 15,
  },
  chatContent: {
    paddingVertical: 15,
  },
  message: {
    padding: 14,
    marginVertical: 8,
    borderRadius: 12,
    maxWidth: '80%',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  userMessage: {
    alignSelf: 'flex-end',
    backgroundColor: '#912338',
  },
  botMessage: {
    alignSelf: 'flex-start',
    backgroundColor: '#e1e1e1',
  },
  userText: {
    color: '#fff',
    fontSize: 16,
  },
  botText: {
    color: '#333',
    fontSize: 16,
  },
  inputContainer: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: '#ccc',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 15,
    backgroundColor: '#f9f9f9',
    borderRadius: 30,
    fontSize: 16,
    color: '#333',
  },
  sendButton: {
    backgroundColor: '#912338',
    borderRadius: 30,
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
  // Inline directions bubble (within chat messages)
  inlineDirectionsBubble: {
    alignSelf: 'center',
    marginVertical: 10,
    backgroundColor: '#912338',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 30,
  },
  inlineDirectionsText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  // Popup modal bubble styles
  popupOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center'
  },
  popupBubble: {
    backgroundColor: '#912338',
    paddingVertical: 15,
    paddingHorizontal: 25,
    borderRadius: 30,
  },
  popupText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold'
  },
});

export default Chatbot;