import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, Text } from 'react-native';
import { useRoute } from '@react-navigation/native';
import SGWMap from './SGWMap';
import LoyolaMap from './LoyolaMap';

const ToggleCampusMap = ({ searchText }) => {
  const route = useRoute();
  const [selectedCampus, setSelectedCampus] = useState(route?.params?.campus || 'SGW');

  useEffect(() => {
    if (route?.params?.campus) {
      setSelectedCampus(route.params.campus);
    }
  }, [route?.params?.campus]);

  return (
    <View style={styles.container}>
      <View style={styles.mapContainer}>
        {selectedCampus === 'SGW' ? (
          <SGWMap searchText={searchText} />
        ) : (
          <LoyolaMap searchText={searchText} />
        )}
      </View>

      {/* Single Floating Toggle Button on the Left */}
      <TouchableOpacity
        style={styles.toggleButtonSingle}
        onPress={() =>
          setSelectedCampus((prev) => (prev === 'SGW' ? 'Loyola' : 'SGW'))
        }
      >
        <Text style={styles.toggleButtonText}>
          {selectedCampus === 'SGW' ? 'Loyola' : 'SGW'}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  mapContainer: {
    flex: 1,
  },

  toggleButtonSingle: {
    position: 'absolute',
    top: 110,
    left: 5,
    backgroundColor: '#800000',
    padding: 12,
    borderRadius: 25,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  toggleButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
    textAlign: 'center',
  },
});

export default ToggleCampusMap;
