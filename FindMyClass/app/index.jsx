import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useRoute } from '@react-navigation/native'; 
import ToggleCampusMap from '../components/ToggleCampusMap';
import 'react-native-get-random-values'


export default function MapScreen() {  // Renamed to avoid conflict
  const route = useRoute();
  const searchText = route?.params?.searchText || ''; // Cleaner fallback
  



  return (
    <View style={styles.container} testID="map-container">
      <ToggleCampusMap searchText={searchText} testID="toggle-campus-map" />
      {/* <FloatingChatButton testID="floating-chat-button" /> */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});