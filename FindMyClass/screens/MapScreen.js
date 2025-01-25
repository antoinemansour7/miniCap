import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const Body = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Map </Text>
    </View>
  );
};

const MapScreen = () => {
    return ( 
        <>
            <Body/>        
        </>
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

export default MapScreen;