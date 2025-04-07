import React, { useCallback, useMemo, useRef } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import BottomSheet, { BottomSheetView, BottomSheetFlatList } from '@gorhom/bottom-sheet';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

const getDirectionIcon = (instruction) => {
  const lowercase = instruction.toLowerCase();
  if (lowercase.includes('turn right')) return 'turn-right';
  if (lowercase.includes('turn left')) return 'turn-left';
  if (lowercase.includes('straight')) return 'straight';
  if (lowercase.includes('destination')) return 'place';
  if (lowercase.includes('stairs')) return 'stairs';
  if (lowercase.includes('elevator')) return 'elevator';
  return 'arrow-forward';
};

const SwipeUpModal = ({ distance, duration, directions }) => {
  const bottomSheetRef = useRef(null);
  const snapPoints = useMemo(() => ['8%' ,'15%', '50%', '74%'], []);

  const handleSheetChanges = useCallback((index) => {
    console.log('handleSheetChanges', index);
  }, []);

  const firstDirection = directions && directions.length > 0 ? directions[0] : null;
  const remainingDirections = directions ? directions.slice(1) : [];

  return (
    <BottomSheet
      ref={bottomSheetRef}
      onChange={handleSheetChanges}
      index={1}
      snapPoints={snapPoints}
      handleIndicatorStyle={{ backgroundColor: '#912338' }}
      testID="bottom-sheet"
    >
      <View style={styles.headerContainer}>
        <Text style={styles.headerText}> 
          {/* Directions - {distance} - {duration}  */}
          {distance} {duration}
           </Text>
        {firstDirection && (
          <View style={styles.headerContent}>
            <View style={styles.mainInfoContainer}>
              <View style={styles.iconContainer}>
                <MaterialIcons 
                  name={getDirectionIcon(firstDirection.instruction)}
                  size={28}
                  color="#912338"
                  testID="MaterialIcons"
                />
              </View>
              <View style={styles.mainTextContainer}>
                <Text style={styles.firstDirectionText}>{firstDirection.instruction}</Text>
                <Text style={styles.statsText}>{firstDirection.distance} - {firstDirection.duration}</Text>
              </View>
            </View>
          </View>
        )}
      </View>

      <BottomSheetView style={styles.listContainer}>
        <BottomSheetFlatList
          data={remainingDirections}
          keyExtractor={(item, index) => index.toString()}
          renderItem={({ item }) => (
            <View style={styles.itemContainer}>
              <View style={styles.iconContainer}>
                <MaterialIcons 
                  name={getDirectionIcon(item.instruction)}
                  size={24}
                  color="#912338"
                  testID="MaterialIcons"
                />
              </View>
              <View style={styles.textContainer}>
                <Text style={styles.stepText}>{item.instruction}</Text>
                <Text style={styles.subText}>{item.distance} - {item.duration}</Text>
              </View>
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
    padding:0,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    //alignItems: 'center', // Add this to center children horizontally
  },
  headerText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#912338',
    marginBottom: 8,
    textAlign: 'center', 
    
  },
  headerContent: {
    marginTop: 4,
  },
  mainInfoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 16,
  },
  mainTextContainer: {
    flex: 1,
  },
  firstDirectionText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#202124',
    marginBottom: 4,
  },
  statsText: {
    fontSize: 14,
    color: '#5f6368',
    marginBottom: 10,

  },
  iconContainer: {
    marginRight: 16,
    width: 28,
    alignItems: 'center',
  },
  listContainer: {
    backgroundColor: '#ffffff',
    flex: 1,
  },
  itemContainer: {
    padding: 16,
    marginVertical: 1,
    marginHorizontal: 0,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    flexDirection: 'row',
    alignItems: 'center',
  },
  textContainer: {
    flex: 1,
  },
  stepText: {
    fontSize: 16,
    color: '#202124',
    lineHeight: 24,
    marginBottom: 4,
  },
  subText: {
    fontSize: 14,
    color: '#5f6368',
  },
  flatListContent: {
    paddingBottom: 24,
  },
});

export default SwipeUpModal;
