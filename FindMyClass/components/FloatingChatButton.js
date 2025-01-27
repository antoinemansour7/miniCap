import React, { useState } from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import Chatbot from './Chatbot';

const FloatingChatButton = () => {
  const [isChatVisible, setIsChatVisible] = useState(false);

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.chatButton}
        onPress={() => setIsChatVisible(true)}
      >
        <MaterialIcons name="chat" size={30} color="white" />
      </TouchableOpacity>
      <Chatbot isVisible={isChatVisible} onClose={() => setIsChatVisible(false)} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 80, // Adjusted to avoid overlapping
    right: 20,
  },
  chatButton: {
    backgroundColor: '#912338', // Concordia burgundy
    padding: 15,
    borderRadius: 30,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
});

export default FloatingChatButton;