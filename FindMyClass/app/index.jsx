import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { FIREBASE_API_KEY } from '@env';

console.log(FIREBASE_API_KEY); // Ensure this prints the correct value

export default function Home() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Welcome to FindMyClass</Text>
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