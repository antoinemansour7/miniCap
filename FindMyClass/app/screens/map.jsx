import React from 'react';
import { View, StyleSheet } from 'react-native';
import ToggleCampusMap from '../../components/ToggleCampusMap';
import FloatingChatButton from '../../components/FloatingChatButton';

export default function Map() {
  return (
    <View style={styles.container}>
      <ToggleCampusMap />
      <FloatingChatButton />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
