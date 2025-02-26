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
import { sendMessageToOpenAI } from '../services/openai';
import { v4 as uuidv4 } from 'uuid';

const Chatbot = ({ isVisible, onClose }) => {
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const scrollViewRef = useRef();

  const sendMessage = async () => {
    if (!inputText.trim()) return;

    const userMessage = { id: uuidv4(), text: inputText, isUser: true };
    setMessages(prevMessages => [...prevMessages, userMessage]);
    setInputText('');

    try {
      const botResponse = await sendMessageToOpenAI(inputText);
      const botMessage = { id: uuidv4(), text: botResponse, isUser: false };
      setMessages(prevMessages => [...prevMessages, botMessage]);
    } catch (error) {
      const errorMessage = { 
        id: uuidv4(), 
        text: 'Error fetching response. Please try again.', 
        isUser: false 
      };
      setMessages(prevMessages => [...prevMessages, errorMessage]);
    }
  };

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