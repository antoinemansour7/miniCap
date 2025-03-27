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
import CustomModal from '../../components/CustomModal';
import { useTheme } from '../../contexts/ThemeContext'; // ✅ Dark mode context
import { useLanguage } from '../../contexts/LanguageContext'; // 🌍 Language context

const { width } = Dimensions.get('window');
const TOTAL_COLUMNS = 6;
const CELL_WIDTH = (width - 32) / TOTAL_COLUMNS;
const TIME_COLUMN_WIDTH = CELL_WIDTH;
const BORDER_RADIUS = 12;
const CELL_HEIGHT = 50;

export default function Schedule() {
  const { user } = useAuth();
  const { darkMode } = useTheme(); // ✅ Use dark mode
  const { t } = useLanguage(); // ✅ Use translations
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const [events, setEvents] = useState([]);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSynced, setLastSynced] = useState(null);

  const [selectedEvent, setSelectedEvent] = useState(null);
  const [eventModalVisible, setEventModalVisible] = useState(false);
  const [modalConfig, setModalConfig] = useState({
    visible: false,
    type: 'error',
    message: t?.syncError || 'Please sign in with Google to sync your schedule.',
    title: t?.googleLoginRequired || 'Google Login Required'
  });

  const addButtonAnim = useRef(new Animated.Value(0)).current;
  const deleteButtonAnim = useRef(new Animated.Value(0)).current;

  const timeSlots = Array.from({ length: 15 }, (_, i) => {
    const hour = i + 8;
    return `${hour.toString().padStart(2, '0')}:00`;
  });

  const days = [t?.mon || 'Mon', t?.tue || 'Tue', t?.wed || 'Wed', t?.thu || 'Thu', t?.fri || 'Fri'];

  const closeSearch = () => {
    setIsSearchOpen(false);
    setSearchQuery('');
  };

  const handleSync = async () => {
    const auth = getAuth();
    if (!auth.currentUser) {
      setModalConfig({
        visible: true,
        type: 'error',
        title: t?.authRequired || 'Authentication Required',
        message: t?.syncError || 'Please sign in to sync your calendar.'
      });
      await AsyncStorage.removeItem('googleAccessToken');
      return;
    }
    const googleAccessToken = await AsyncStorage.getItem('googleAccessToken');
    if (!googleAccessToken) {
      setModalConfig({
        visible: true,
        type: 'error',
        title: t?.googleLoginRequired || 'Google Login Required',
        message: t?.syncError || 'Please sign in with Google to sync your schedule.'
      });
      return;
    }
    setIsSyncing(true);
    try {
      const fetchedEvents = await fetchGoogleCalendarEvents();
      setEvents(fetchedEvents || []);
      setLastSynced(new Date());
      setModalConfig({
        visible: true,
        type: 'success',
        title: t?.syncComplete || 'Sync Complete',
        message: t?.syncSuccess || 'Your calendar has been successfully synchronized.'
      });
    } catch (error) {
      console.error('Sync failed:', error);
      setModalConfig({
        visible: true,
        type: 'error',
        title: t?.syncFailed || 'Sync Failed',
        message: error.message || t?.syncError || 'Failed to sync calendar. Please try again.'
      });
    } finally {
      setIsSyncing(false);
    }
  };

  useEffect(() => {
    if (!user) {
      setEvents([]);
      setLastSynced(null);
      AsyncStorage.removeItem('googleAccessToken');
    }
  }, [user]);

  const renderHeader = () => (
    <View style={[styles.headerRow, { backgroundColor: darkMode ? '#222' : '#f2f2f2' }]}>
      <View style={[styles.timeColumn, styles.headerCell]}>
        <Text style={[styles.headerText, { color: darkMode ? '#fff' : '#333' }]}>{t?.time || 'Time'}</Text>
      </View>
      {days.map((day, index) => (
        <View key={day} style={[styles.dayColumn, styles.headerCell]}>
          <Text style={[styles.headerText, { color: darkMode ? '#fff' : '#333' }]}>{day}</Text>
        </View>
      ))}
    </View>
  );

  const renderRow = ({ item: time, index: timeIndex }) => (
    <View style={[styles.row, { backgroundColor: darkMode ? '#111' : '#fff' }]}>
      <View style={styles.timeColumn}>
        <Text style={[styles.timeText, { color: darkMode ? '#fff' : '#666' }]}>{time}</Text>
      </View>
      {days.map((day, dayIndex) => (
        <View key={`${day}-${time}`} style={styles.cell} />
      ))}
    </View>
  );

  const renderEventsOverlay = () => (
    <View style={styles.eventsOverlay}>
      {events.map((event) => {
        const startDate = new Date(event.start.dateTime || event.start.date);
        const endDate = new Date(event.end.dateTime || event.end.date);

        const durationHours = (endDate - startDate) / (1000 * 60 * 60);
        const eventHeight = Math.max(durationHours * CELL_HEIGHT, CELL_HEIGHT);

        const timeFrom8 = startDate.getHours() + startDate.getMinutes() / 60 - 8;
        const EVENT_OFFSET = 36;
        const topPosition = timeFrom8 * CELL_HEIGHT + EVENT_OFFSET;

        const dayIndex = startDate.getDay() - 1;
        if (dayIndex < 0 || dayIndex >= days.length) return null;
        const leftPosition = TIME_COLUMN_WIDTH + dayIndex * CELL_WIDTH;

        return (
          <TouchableOpacity
            key={event.id || `${event.summary}-${event.start.dateTime || event.start.date}`}
            onPress={() => handleEventPress(event)}>
            <View
              style={[
                styles.eventBox,
                { top: topPosition, left: leftPosition, width: CELL_WIDTH, height: eventHeight },
              ]}>
              <Text style={styles.eventBoxText} numberOfLines={2}>
                {event.summary}
              </Text>
            </View>
          </TouchableOpacity>
        );
      })}
    </View>
  );

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
    <View style={[styles.container, { backgroundColor: darkMode ? '#111' : '#fff' }]}>
      <CustomModal
        visible={modalConfig.visible}
        onClose={() => setModalConfig((prev) => ({ ...prev, visible: false }))}
        type={modalConfig.type}
        title={modalConfig.title}
        message={modalConfig.message}
      />

      <View style={styles.syncHeader}>
        <TouchableOpacity
          style={styles.syncButton}
          onPress={handleSync}
          disabled={isSyncing}>
          {isSyncing ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.syncButtonText}>{t?.syncCalendar || 'Sync Calendar'}</Text>
          )}
        </TouchableOpacity>
        {lastSynced && (
          <Text style={[styles.lastSyncedText, { color: darkMode ? '#fff' : '#666' }]}>
            Last synced: {lastSynced.toLocaleTimeString()}
          </Text>
        )}
      </View>

      <View style={{ flex: 1 }}>
        {renderEventsOverlay()}
        <FlatList
          data={timeSlots}
          renderItem={renderRow}
          keyExtractor={(item) => item}
          ListHeaderComponent={renderHeader}
          stickyHeaderIndices={[0]}
          contentContainerStyle={styles.gridContent}
        />
      </View>

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

      <Modal visible={isSearchOpen} transparent={true} animationType="fade" onRequestClose={closeSearch}>
        <TouchableWithoutFeedback onPress={closeSearch}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback>
              <View style={styles.searchContainer}>
                <View style={styles.searchHeader}>
                  <Text style={styles.searchTitle}>{t?.addClass || 'Add Class'}</Text>
                  <TouchableOpacity testID="close-search-modal" onPress={closeSearch}>
                    <MaterialIcons name="close" size={24} color="#666" />
                  </TouchableOpacity>
                </View>
                <View style={styles.searchInputContainer}>
                  <MaterialIcons name="search" size={20} color="#666" style={styles.searchIcon} />
                  <TextInput
                    testID="search-input"
                    style={styles.searchInput}
                    placeholder={t?.searchClass || 'Search for a class...'}
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    autoFocus
                  />
                </View>
                <View style={styles.searchResults} />
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      <Modal visible={eventModalVisible} transparent={true} animationType="slide" onRequestClose={() => setEventModalVisible(false)}>
        <TouchableWithoutFeedback onPress={() => setEventModalVisible(false)}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback>
              <View style={styles.modalContainer}>
                {selectedEvent && (
                  <>
                    <Text style={styles.modalTitle}>{selectedEvent.summary}</Text>
                    <Text style={styles.modalMessage}>
                      Start: {new Date(selectedEvent.start.dateTime || selectedEvent.start.date).toLocaleString()}
                    </Text>
                    <Text style={styles.modalMessage}>
                      End: {new Date(selectedEvent.end.dateTime || selectedEvent.end.date).toLocaleString()}
                    </Text>
                    {selectedEvent.location && (
                      <Text style={styles.modalMessage}>Location: {selectedEvent.location}</Text>
                    )}
                  </>
                )}
                <TouchableOpacity style={styles.modalButton} onPress={() => setEventModalVisible(false)}>
                  <Text style={styles.modalButtonText}>{t?.close || 'Close'}</Text>
                </TouchableOpacity>
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
    zIndex: 9999, // Added zIndex to ensure overlay is on top
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
    alignItems: 'center', // Center content horizontally
    justifyContent: 'center', // Center content vertically
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center', // Center title text
  },
  modalMessage: {
    fontSize: 16,
    marginBottom: 5,
    textAlign: 'center', // Center message text
  },
  modalButton: {
    backgroundColor: '#912338',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 4,
    marginTop: 15,
    alignSelf: 'center', // Center button horizontally
  },
  modalButtonText: {
    color: '#fff',
    textAlign: 'center',
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center', // Added to center the pop-up
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