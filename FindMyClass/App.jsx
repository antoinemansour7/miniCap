import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Slot } from 'expo-router';

const App = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Hello World! App is working!</Text>
      <Slot />
    </View>
  );
};

export default App;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
  },
});