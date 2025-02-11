import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import Card from '../../components/Card';

export default function Index() {
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      <View style={styles.titleContainer}>
        <Ionicons name="location" size={30} color="#9B1B30" style={styles.icon} />
        <Text style={styles.title}>Campus Map</Text>
      </View>

      <View style={styles.row}>
        <Card 
          iconName="map" 
          title="SGW Map" 
          onPress={() => navigation.navigate('screens/map', { campus: 'SGW' })}
        />
        <Card 
          iconName="map" 
          title="LOY Map" 
          onPress={() => navigation.navigate('screens/map', { campus: 'Loyola' })}
        />
      </View>
      
      <View style={styles.row}>
        <Card 
          iconName="person" 
          title="Profile" 
          onPress={() => navigation.navigate('screens/profile')}
        />
        <Card 
          iconName="settings" 
          title="Settings" 
        />
      </View>

      <View style={styles.row}>
        <Card 
          iconName="calendar" 
          title="My Schedule" 
          onPress={() => navigation.navigate('screens/schedule')}
        />
        <Card 
          iconName="lock-closed" 
          title="Security" 
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 40,
  },
  icon: {
    marginRight: 10,
  },
  title: {
    fontSize: 30,
    fontWeight: 'bold',
    color: '#333',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    width: '100%',
  },
});
