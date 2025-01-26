import React from 'react';
import { View, StyleSheet } from 'react-native';
import ToggleCampusMap from '../../components/ToggleCampusMap';

export default function Map() {
  return (
    <View style={styles.container}>

      <ToggleCampusMap />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
