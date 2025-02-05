import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  TextInput,
  TouchableWithoutFeedback,
  Dimensions,
  Animated,
  FlatList,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');
const TOTAL_COLUMNS = 6; // 1 time column + 5 day columns
const CELL_WIDTH = (width - 32) / TOTAL_COLUMNS; // Accounting for container padding
const TIME_COLUMN_WIDTH = CELL_WIDTH;
const BORDER_RADIUS = 12;

export default function Schedule() {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isEditMode, setIsEditMode] = useState(false);

  // Animation values
  const addButtonAnim = useRef(new Animated.Value(0)).current;
  const deleteButtonAnim = useRef(new Animated.Value(0)).current;
  const editButtonRotation = useRef(new Animated.Value(0)).current;

  // Time slots with half-hour intervals from 8:00 to 22:00
  const timeSlots = Array.from({ length: 29 }, (_, i) => {
    const hour = Math.floor(i / 2) + 8;
    const minute = i % 2 === 0 ? '00' : '30';
    return `${hour.toString().padStart(2, '0')}:${minute}`;
  });

  // Days of the week
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];

  const toggleEditMode = () => {
    const toValue = isEditMode ? 0 : 1;

    // Animate the buttons
    Animated.parallel([
      Animated.spring(addButtonAnim, {
        toValue,
        friction: 6,
        useNativeDriver: true,
      }),
      Animated.spring(deleteButtonAnim, {
        toValue,
        friction: 6,
        useNativeDriver: true,
      }),
      Animated.spring(editButtonRotation, {
        toValue,
        friction: 6,
        useNativeDriver: true,
      }),
    ]).start();

    setIsEditMode(!isEditMode);
  };

  const closeSearch = () => {
    setIsSearchOpen(false);
    setSearchQuery('');
  };

  // Transform animations
  const addButtonTransform = {
    transform: [
      {
        translateY: addButtonAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [0, -60],
        }),
      },
    ],
    opacity: addButtonAnim,
  };

  const deleteButtonTransform = {
    transform: [
      {
        translateY: deleteButtonAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [0, -120],
        }),
      },
    ],
    opacity: deleteButtonAnim,
  };

  const editButtonSpin = editButtonRotation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '45deg'],
  });

  // Render the header row
  const renderHeader = () => (
    <View style={[styles.header, styles.roundedTop]}>
      <View style={[styles.timeColumn, styles.roundedTopLeft]}>
        <Text style={styles.headerText}>Time</Text>
      </View>
      {days.map((day, index) => (
        <View
          key={day}
          style={[
            styles.dayColumn,
            index === days.length - 1 && styles.roundedTopRight,
          ]}
        >
          <Text style={styles.dayText}>{day}</Text>
        </View>
      ))}
    </View>
  );

  // Render each row in the grid
  const renderRow = ({ item: time, index: timeIndex }) => (
    <View
      style={[
        styles.row,
        timeIndex === timeSlots.length - 1 && styles.lastRow,
      ]}
    >
      <View
        style={[
          styles.timeColumn,
          timeIndex === timeSlots.length - 1 && styles.roundedBottomLeft,
        ]}
      >
        <Text style={styles.timeText}>{time}</Text>
      </View>
      {days.map((day, dayIndex) => (
        <TouchableOpacity
          key={`${day}-${time}`}
          style={[
            styles.cell,
            dayIndex === days.length - 1 && styles.lastColumnCell,
            timeIndex === timeSlots.length - 1 &&
              dayIndex === days.length - 1 &&
              styles.roundedBottomRight,
          ]}
          onPress={() => setIsSearchOpen(true)}
        />
      ))}
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Schedule Grid */}
      <FlatList
        data={timeSlots}
        renderItem={renderRow}
        keyExtractor={(item) => item}
        ListHeaderComponent={renderHeader}
        contentContainerStyle={styles.gridWrapper}
      />

      {/* Action Buttons */}
      <Animated.View style={[styles.floatingButton, styles.addButton, addButtonTransform]}>
        <TouchableOpacity onPress={() => setIsSearchOpen(true)}>
          <MaterialIcons name="add" size={24} color="#fff" />
        </TouchableOpacity>
      </Animated.View>

      <Animated.View style={[styles.floatingButton, styles.deleteButton, deleteButtonTransform]}>
        <TouchableOpacity>
          <MaterialIcons name="delete" size={24} color="#fff" />
        </TouchableOpacity>
      </Animated.View>

      <TouchableOpacity
        style={styles.editButton}
        onPress={toggleEditMode}
      >
        <Animated.View style={{ transform: [{ rotate: editButtonSpin }] }}>
          <MaterialIcons name="edit" size={24} color="#912338" />
        </Animated.View>
      </TouchableOpacity>

      {/* Search Modal */}
      <Modal
        visible={isSearchOpen}
        transparent={true}
        animationType="fade"
        onRequestClose={closeSearch}
      >
        <TouchableWithoutFeedback onPress={closeSearch}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback>
              <View style={styles.searchContainer}>
                <View style={styles.searchHeader}>
                  <Text style={styles.searchTitle}>Add Class</Text>
                  <TouchableOpacity onPress={closeSearch}>
                    <MaterialIcons name="close" size={24} color="#666" />
                  </TouchableOpacity>
                </View>
                <View style={styles.searchInputContainer}>
                  <MaterialIcons name="search" size={20} color="#666" style={styles.searchIcon} />
                  <TextInput
                    style={styles.searchInput}
                    placeholder="Search for a class..."
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    autoFocus
                  />
                </View>
                <View style={styles.searchResults}>
                  {/* Search results will go here */}
                </View>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingTop: 16,
    width: '100%',
  },
  gridWrapper: {
    width: width - 32,
    borderRadius: BORDER_RADIUS,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    backgroundColor: '#fff',
    marginBottom: 100,
  },
  header: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    backgroundColor: '#f8f8f8',
  },
  roundedTop: {
    borderTopLeftRadius: BORDER_RADIUS,
    borderTopRightRadius: BORDER_RADIUS,
  },
  roundedTopLeft: {
    borderTopLeftRadius: BORDER_RADIUS,
  },
  roundedTopRight: {
    borderTopRightRadius: BORDER_RADIUS,
  },
  roundedBottomLeft: {
    borderBottomLeftRadius: BORDER_RADIUS,
  },
  roundedBottomRight: {
    borderBottomRightRadius: BORDER_RADIUS,
  },
  timeColumn: {
    width: TIME_COLUMN_WIDTH,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
    borderRightWidth: 1,
    borderRightColor: '#e0e0e0',
  },
  dayColumn: {
    width: CELL_WIDTH,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
    borderRightWidth: 1,
    borderRightColor: '#e0e0e0',
  },
  headerText: {
    fontWeight: '600',
    color: '#333',
    fontSize: 14,
  },
  dayText: {
    fontWeight: '600',
    color: '#333',
    fontSize: 14,
  },
  row: {
    flexDirection: 'row',
    height: 60,
    width: '100%',
  },
  lastRow: {
    borderBottomWidth: 0,
  },
  cell: {
    width: CELL_WIDTH,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
    borderRightWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#e0e0e0',
    backgroundColor: '#fff',
  },
  lastColumnCell: {
    borderRightWidth: 0,
  },
  timeText: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  floatingButton: {
    position: 'absolute',
    right: 20,
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  addButton: {
    backgroundColor: '#4CAF50',
    bottom: 20,
  },
  deleteButton: {
    backgroundColor: '#F44336',
    bottom: 20,
  },
  editButton: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    backgroundColor: '#fff',
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchContainer: {
    width: '90%',
    maxHeight: '70%',
    backgroundColor: '#fff',
    borderRadius: BORDER_RADIUS,
    padding: 20,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  searchHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  searchTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    padding: 10,
    marginBottom: 15,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  searchResults: {
    flex: 1,
  },
});