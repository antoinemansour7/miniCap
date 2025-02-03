import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Card from '../../components/Card';

export default function Index() {
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      {/* First Row of Cards */}
      <View style={styles.row}>
        <Card iconName="map" title="SGW Map" onPress={() => navigation.navigate('SGWMap')} />
        <Card iconName="map" title="LOY Map" onPress={() => navigation.navigate('LoyolaMap')} />
      </View>
      
      {/* Second Row of Cards */}
      <View style={styles.row}>
        <Card iconName="person" title="Profile" />
        <Card iconName="settings" title="Settings" />
      </View>

      {/* Third Row of Cards */}
      <View style={styles.row}>
        <Card iconName="calendar" title="My Schedule" />
        <Card iconName="lock-closed" title="Security" />
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
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    width: '100%',
  },
});
