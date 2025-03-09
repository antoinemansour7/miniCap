import React, {useEffect} from 'react';
import { View, StyleSheet } from 'react-native';
import { useRoute } from '@react-navigation/native'; 
import ToggleCampusMap from '../components/ToggleCampusMap';
import FloatingChatButton from '../components/FloatingChatButton';
import 'react-native-get-random-values'
import RNUxcam from 'react-native-ux-cam';
import { uxCamKey } from './secrets';

export default function MapScreen() {  // Renamed to avoid conflict
  const route = useRoute();
  const searchText = route?.params?.searchText || ''; // Cleaner fallback
  
  useEffect(() => {
  
  RNUxcam.optIntoSchematicRecordings(); // Enable iOS screen recordings

  const configuration = {
      userAppKey: uxCamKey,  // Replace with your UXCam API key
      enableAutomaticScreenNameTagging: false,
      enableAdvancedGestureRecognition: true, // Default is true
      enableImprovedScreenCapture: true, // Improves Android screen capture
      occlusions: [], // Add occlusion settings if needed
    };

    RNUxcam.startWithConfiguration(configuration);
  }, []);



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