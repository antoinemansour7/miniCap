import React, { useState } from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import Chatbot from './Chatbot';

const FloatingChatButton = () => {
  const [isChatVisible, setIsChatVisible] = useState(false);

  return (
    <View style={styles.container}>
      <TouchableOpacity
        testID="chat-button"  // ✅ Ensure testID is correctly set
        style={styles.chatButton}
        onPress={() => setIsChatVisible(true)}
      >
        <MaterialIcons name="chat" size={30} color="white" />
      </TouchableOpacity>
      {isChatVisible && <Chatbot isVisible={isChatVisible} onClose={() => setIsChatVisible(false)} />}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 80,
    right: 20,
  },
  chatButton: {
    backgroundColor: '#912338',
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