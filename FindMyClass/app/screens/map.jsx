import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useRoute } from '@react-navigation/native'; 
import ToggleCampusMap from '../../components/ToggleCampusMap';
import FloatingChatButton from '../../components/FloatingChatButton';

export default function Map() {
  const route = useRoute();
  const searchText = typeof route?.params?.searchText === 'string' ? route.params.searchText : '';

  return (
    <View style={styles.container} testID="map-container">
      <ToggleCampusMap searchText={searchText} testID="toggle-campus-map" />
      <FloatingChatButton testID="floating-chat-button" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});