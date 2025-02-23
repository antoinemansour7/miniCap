import React, { useCallback, useMemo, useRef } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import BottomSheet, { BottomSheetView, BottomSheetFlatList } from '@gorhom/bottom-sheet';
import "react-native-get-random-values";

const SwipeUpModal = () => {
  // ref
  const bottomSheetRef = useRef(null);
  const snapPoints = useMemo(() => [ '20%','50%', '90%'], []);

  const data = useMemo(
    () =>
      Array(50)
        .fill(0)
        .map((_, index) => `index-${index}`),
    []
  );
  const renderItem = useCallback(
    ({ item }) => (
      <View style={styles.itemContainer}>
        <Text> helll  oo{item}</Text>
      </View>
    ),
    []
  );

  // callbacks
  const handleSheetChanges = useCallback((index) => {
    console.log('handleSheetChanges', index);
  }, []);

  // renders
  return (

      <BottomSheet
        ref={bottomSheetRef}
        onChange={handleSheetChanges}
        index={1}
        snapPoints={snapPoints}
      >
        <BottomSheetView style={styles.contentContainer}>
          <Text>Awesome 🎉</Text>
          <BottomSheetFlatList
          data={data}
          keyExtractor={(i) => i}
          renderItem={renderItem}
          contentContainerStyle={styles.contentContainerFlat}
        />
        </BottomSheetView>



      </BottomSheet>

  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'grey',
  },
  contentContainer: {
    flex: 1,
    padding: 36,
    alignItems: 'center',
  },
  itemContainer: {
    padding: 6,
    margin: 6,
    backgroundColor: "#eee",
  },
  contentContainerFlat: {
    backgroundColor: "white",
  },
});

export default SwipeUpModal;
