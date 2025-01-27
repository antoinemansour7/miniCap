import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Modal, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { sendMessageToOpenAI } from '../services/openai';

const Chatbot = ({ isVisible, onClose }) => {
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const navigation = useNavigation();

  const sendMessage = async () => {
    if (!inputText.trim()) return;

    const userMessage = { id: Date.now(), text: inputText, isUser: true };
    setMessages((prevMessages) => [...prevMessages, userMessage]);
    setInputText('');

    try {
      const botResponse = await sendMessageToOpenAI(inputText);
      const botMessage = { id: Date.now() + 1, text: botResponse, isUser: false };
      setMessages((prevMessages) => [...prevMessages, botMessage]);
    } catch (error) {
      const errorMessage = { id: Date.now() + 1, text: 'Error fetching response. Please try again.', isUser: false };
      setMessages((prevMessages) => [...prevMessages, errorMessage]);
    }
  };

  return (
    <Modal visible={isVisible} animationType="slide" onRequestClose={onClose}>
      <View style={styles.modalContainer}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.navigate('screens/index')}>
            <Text style={styles.backButton}>Back</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={onClose}>
            <Text style={styles.closeButton}>Close</Text>
          </TouchableOpacity>
        </View>
        <ScrollView style={styles.chatContainer}>
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

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            value={inputText}
            onChangeText={setInputText}
            placeholder="Type your message..."
            onSubmitEditing={sendMessage}
          />
          <TouchableOpacity style={styles.sendButton} onPress={sendMessage}>
            <Text style={styles.sendButtonText}>Send</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: { flex: 1, backgroundColor: '#fff', padding: 20 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  backButton: {
    color: '#007AFF',
    fontSize: 16,
  },
  closeButton: {
    color: '#007AFF',
    fontSize: 16,
  },
  chatContainer: { flex: 1, paddingBottom: 10 },
  message: { padding: 10, marginVertical: 5, borderRadius: 10, maxWidth: '80%' },
  userMessage: { alignSelf: 'flex-end', backgroundColor: '#007AFF' },
  botMessage: { alignSelf: 'flex-start', backgroundColor: '#E5E5EA' },
  userText: { color: '#fff' },
  botText: { color: '#000' },
  inputContainer: {
    flexDirection: 'row',
    padding: 10,
    borderTopWidth: 1,
    borderTopColor: '#ccc',
  },
  input: { flex: 1, padding: 10, borderRadius: 20, backgroundColor: '#f0f0f0', marginRight: 10 },
  sendButton: {
    backgroundColor: '#007AFF',
    borderRadius: 20,
    padding: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonText: { color: '#fff', fontWeight: 'bold' },
});

export default Chatbot;