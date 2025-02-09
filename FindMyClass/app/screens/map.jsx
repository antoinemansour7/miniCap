import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useRoute } from '@react-navigation/native';  // Using the useRoute hook
import ToggleCampusMap from '../../components/ToggleCampusMap';
import FloatingChatButton from '../../components/FloatingChatButton';


export default function Map() {
  const route = useRoute();
  const searchText = route?.params?.searchText || '';  // Get searchText from params

  return (
    <View style={styles.container}>
      <ToggleCampusMap searchText={searchText} />
      <FloatingChatButton />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
