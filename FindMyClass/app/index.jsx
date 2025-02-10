import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import "react-native-get-random-values";


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