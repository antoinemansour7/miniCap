import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Slot } from 'expo-router';
import DrawerNavigator from '../navigation/DrawerNavigator';
import { NavigationContainer } from '@react-navigation/native';

const Index = () => {
  return (
      <> 
      <DrawerNavigator/>
      {/* <Slot/> */}
      </> 
  );
};

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

export default Index;