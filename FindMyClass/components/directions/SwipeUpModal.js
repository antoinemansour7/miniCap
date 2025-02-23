import React, { useCallback, useMemo, useRef } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import BottomSheet, { BottomSheetView, BottomSheetFlatList } from '@gorhom/bottom-sheet';

const SwipeUpModal = ({ distance, duration, directions }) => {
  const bottomSheetRef = useRef(null);
  const snapPoints = useMemo(() => ['15%', '50%', '74%'], []);

  
  const handleSheetChanges = useCallback((index) => {
    console.log('handleSheetChanges', index);
  }, []);

  return (
    <BottomSheet
      ref={bottomSheetRef}
      onChange={handleSheetChanges}
      index={1}
      snapPoints={snapPoints}
    >
      <View style={styles.headerContainer}>
        <Text style={styles.headerText}>Route Information</Text>
        <Text style={styles.infoText}>Distance: {distance}</Text>
        <Text style={styles.infoText}>Duration: {duration}</Text>
      </View>

      
      <BottomSheetView style={styles.listContainer}>
        <BottomSheetFlatList
          data={directions}
          keyExtractor={(item, index) => index.toString()}
          renderItem={({ item }) => (
            <View style={styles.itemContainer}>
              <Text style={styles.stepText}>{item.instruction}</Text>
              <Text style={styles.subText}>{item.distance} - {item.duration}</Text>
            </View>
          )}
          contentContainerStyle={styles.flatListContent}
          keyboardBehavior="interactive"
          enablePanDownToClose={true}
          
        />
      </BottomSheetView>
    </BottomSheet>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    backgroundColor: 'white',
  },
  headerText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  infoText: {
    fontSize: 16,
  },
  listContainer: {
    // This ensures the list gets space inside the BottomSheet
    backgroundColor: 'white',
    margin: 16,
  },
  itemContainer: {
    padding: 10,
    marginVertical: 5,
    marginHorizontal: 16,
    backgroundColor: "#f0f0f0",
    borderRadius: 6,
  },
  stepText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  subText: {
    fontSize: 12,
    color: '#555',
  },
  flatListContent: {
    paddingBottom: 20, // Ensures enough space for scrolling
  },
});

export default SwipeUpModal;
