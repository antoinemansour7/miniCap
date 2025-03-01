import React, { useState, useRef, useEffect } from 'react';
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
  ActivityIndicator,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { getAuth } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import fetchGoogleCalendarEvents from '../api/googleCalendar';
import { useAuth } from '../../contexts/AuthContext';

const { width } = Dimensions.get('window');

// We have 1 column for Time + 5 columns for Mon-Fri = 6 total
const TOTAL_COLUMNS = 6;
const CELL_WIDTH = (width - 32) / TOTAL_COLUMNS; // 32 = horizontal padding/margins if desired
const TIME_COLUMN_WIDTH = CELL_WIDTH; 
const BORDER_RADIUS = 12;

export default function Schedule() {
  const { user } = useAuth();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isEditMode, setIsEditMode] = useState(false);
  const [events, setEvents] = useState([]);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSynced, setLastSynced] = useState(null);
  const [showLoginPopup, setShowLoginPopup] = useState(false);

  // Animation values
  const addButtonAnim = useRef(new Animated.Value(0)).current;
  const deleteButtonAnim = useRef(new Animated.Value(0)).current;
  const editButtonRotation = useRef(new Animated.Value(0)).current;

  // Half-hour intervals from 8:00 to 22:00
  const timeSlots = Array.from({ length: 29 }, (_, i) => {
    const hour = Math.floor(i / 2) + 8; 
    const minute = i % 2 === 0 ? '00' : '30';
    return `${hour.toString().padStart(2, '0')}:${minute}`;
  });

  // Monday–Friday
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];

  // Close search modal
  const closeSearch = () => {
    setIsSearchOpen(false);
    setSearchQuery('');
  };

  // Handle calendar sync
  const handleSync = async () => {
    const auth = getAuth();
    if (!auth.currentUser) {
      // Clear cached token to avoid stale data
      await AsyncStorage.removeItem("googleAccessToken");
      setShowLoginPopup(true);
      return;
    }
    const googleAccessToken = await AsyncStorage.getItem("googleAccessToken");
    if (!googleAccessToken) {
      setShowLoginPopup(true);
      return;
    }
    setIsSyncing(true);
    try {
      const fetchedEvents = await fetchGoogleCalendarEvents();
      setEvents(fetchedEvents || []);
      setLastSynced(new Date());
    } catch (error) {
      console.error("Sync failed:", error);
    } finally {
      setIsSyncing(false);
    }
  };

  // Clear events if user logs out
  useEffect(() => {
    if (!user) {
      setEvents([]);
      setLastSynced(null);
      AsyncStorage.removeItem("googleAccessToken");
    }
  }, [user]);

  // Header row for days
  const renderHeader = () => (
    <View style={styles.headerRow}>
      {/* Leftmost cell: "Time" label */}
      <View style={[styles.timeColumn, styles.headerCell]}>
        <Text style={styles.headerText}>Time</Text>
      </View>
      {/* Monday–Friday */}
      {days.map((day, index) => (
        <View key={day} style={[styles.dayColumn, styles.headerCell]}>
          <Text style={styles.headerText}>{day}</Text>
        </View>
      ))}
    </View>
  );

  // Render each time row
  const renderRow = ({ item: time, index: timeIndex }) => (
    <View style={styles.row}>
      {/* Leftmost cell: time label */}
      <View style={styles.timeColumn}>
        <Text style={styles.timeText}>{time}</Text>
      </View>
      {/* Cells for Mon–Fri */}
      {days.map((day, dayIndex) => (
        <View key={`${day}-${time}`} style={styles.cell} />
      ))}
    </View>
  );

  // Render event boxes on top of the grid
  const renderEventsOverlay = () => (
    <View style={styles.eventsOverlay}>
      {events.map((event, idx) => {
        const startDate = new Date(event.start.dateTime || event.start.date);
        const endDate = new Date(event.end.dateTime || event.end.date);

        // Duration in hours (for height)
        const durationHours = (endDate - startDate) / (1000 * 60 * 60);
        const eventHeight = Math.max(durationHours * 60, 30); // minimum 30 px
        // Calculate top position from 8:00
        const hoursFrom8 = startDate.getHours() + startDate.getMinutes()/60 - 8;
        const topPosition = hoursFrom8 * 60;

        // Day index (Mon=1 in JS, so dayIndex = getDay() - 1 => 0-based for array)
        const dayIndex = startDate.getDay() - 1; 
        if (dayIndex < 0 || dayIndex >= days.length) return null; // skip if weekend

        const leftPosition = TIME_COLUMN_WIDTH + dayIndex * CELL_WIDTH;

        return (
          <View
            key={idx}
            style={[
              styles.eventBox,
              {
                top: topPosition,
                left: leftPosition,
                width: CELL_WIDTH,
                height: eventHeight,
              },
            ]}
          >
            <Text style={styles.eventBoxText} numberOfLines={2}>
              {event.summary}
            </Text>
          </View>
        );
      })}
    </View>
  );

  // Animations for floating buttons
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

  return (
    <View style={styles.container}>
      {/* Popup for non-logged-in user */}
      <Modal
        visible={showLoginPopup}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowLoginPopup(false)}
      >
        <TouchableWithoutFeedback onPress={() => setShowLoginPopup(false)}>
          <View style={styles.modalBackground}>
            <View style={styles.modalContainer}>
              <Text style={styles.modalTitle}>Google Login Required</Text>
              <Text style={styles.modalMessage}>
                User not logged in. Please sign in with Google.
              </Text>
              <TouchableOpacity
                style={styles.modalButton}
                onPress={() => setShowLoginPopup(false)}
              >
                <Text style={styles.modalButtonText}>OK</Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      {/* Sync Header */}
      <View style={styles.syncHeader}>
        <TouchableOpacity
          style={styles.syncButton}
          onPress={handleSync}
          disabled={isSyncing}
        >
          {isSyncing ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.syncButtonText}>Sync Calendar</Text>
          )}
        </TouchableOpacity>
        {lastSynced && (
          <Text style={styles.lastSyncedText}>
            Last synced: {lastSynced.toLocaleTimeString()}
          </Text>
        )}
      </View>

      {/* Grid + events overlay */}
      <View style={{ flex: 1 }}>
        {/* Absolute events overlay on top of the FlatList */}
        {renderEventsOverlay()}
        <FlatList
          data={timeSlots}
          renderItem={renderRow}
          keyExtractor={(item) => item}
          ListHeaderComponent={renderHeader}
          // Make the header row “sticky” at the top if desired:
          stickyHeaderIndices={[0]}
          contentContainerStyle={styles.gridContent}
        />
      </View>

      {/* Floating action buttons */}
      <Animated.View style={[styles.floatingButton, styles.addButton, addButtonTransform]}>
        <TouchableOpacity testID="add-button" onPress={() => setIsSearchOpen(true)}>
          <MaterialIcons name="add" size={24} color="#fff" />
        </TouchableOpacity>
      </Animated.View>

      <Animated.View style={[styles.floatingButton, styles.deleteButton, deleteButtonTransform]}>
        <TouchableOpacity testID="delete-button">
          <MaterialIcons name="delete" size={24} color="#fff" />
        </TouchableOpacity>
      </Animated.View>

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
                  <TouchableOpacity testID="close-search-modal" onPress={closeSearch}>
                    <MaterialIcons name="close" size={24} color="#666" />
                  </TouchableOpacity>
                </View>
                <View style={styles.searchInputContainer}>
                  <MaterialIcons name="search" size={20} color="#666" style={styles.searchIcon} />
                  <TextInput
                    testID="search-input"
                    style={styles.searchInput}
                    placeholder="Search for a class..."
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    autoFocus
                  />
                </View>
                <View style={styles.searchResults}>
                  {/* Search results here */}
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
  },
  syncHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  syncButton: {
    backgroundColor: '#912338',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  syncButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  lastSyncedText: {
    fontSize: 12,
    color: '#666',
  },
  gridContent: {
    paddingBottom: 100, // Extra space if you have floating buttons
  },
  headerRow: {
    flexDirection: 'row',
    backgroundColor: '#f2f2f2',
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#ccc',
  },
  headerCell: {
    paddingVertical: 10,
  },
  row: {
    flexDirection: 'row',
    minHeight: 50,
    borderBottomWidth: 1,
    borderColor: '#eee',
  },
  timeColumn: {
    width: TIME_COLUMN_WIDTH,
    borderRightWidth: 1,
    borderColor: '#ccc',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 5,
  },
  dayColumn: {
    width: CELL_WIDTH,
    borderRightWidth: 1,
    borderColor: '#ccc',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cell: {
    width: CELL_WIDTH,
    borderRightWidth: 1,
    borderColor: '#eee',
  },
  timeText: {
    fontSize: 12,
    color: '#666',
  },
  headerText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#333',
  },

  // Events overlay
  eventsOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  eventBox: {
    position: 'absolute',
    backgroundColor: '#912338',
    borderRadius: 6,
    padding: 4,
    overflow: 'hidden',
  },
  eventBoxText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '600',
  },

  // Floating buttons
  floatingButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    backgroundColor: '#912338',
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  addButton: {
    // will animate upward
  },
  deleteButton: {
    // will animate upward
  },

  // Modals
  modalBackground: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: '#fff',
    width: '80%',
    padding: 20,
    borderRadius: 8,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  modalMessage: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
  },
  modalButton: {
    backgroundColor: '#912338',
    paddingVertical: 8,
    borderRadius: 4,
  },
  modalButtonText: {
    color: '#fff',
    textAlign: 'center',
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    padding: 20,
  },
  searchContainer: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
  },
  searchHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  searchTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f2f2f2',
    borderRadius: 8,
    marginTop: 10,
    paddingHorizontal: 8,
  },
  searchIcon: {
    marginRight: 5,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 8,
  },
  searchResults: {
    marginTop: 16,
  },
});