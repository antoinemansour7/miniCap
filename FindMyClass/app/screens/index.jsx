import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import FloatingChatButton from '../../components/FloatingChatButton';

export default function Index() {
  return (
    <View style={styles.container}>
      {/* ...existing code... */}
      <Text style={styles.text}>Index Screen</Text>
      {/* ...existing code... */}
      <FloatingChatButton />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // ...existing code...
  },
  text: {
    // ...existing code...
  },
});
