import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import FloatingChatButton from '../../components/FloatingChatButton';

export default function Login() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Login Screen</Text>
      <FloatingChatButton />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    fontSize: 20,
    fontWeight: 'bold',
  },
});
