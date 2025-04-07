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
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getAuth } from 'firebase/auth';
import { googleCalendarConfig } from '../secrets';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { useLanguage } from '../../contexts/LanguageContext';
import CustomModal from '../../components/CustomModal';

const { width } = Dimensions.get('window');

// Constants for grid layout
const TOTAL_COLUMNS = 6;
const CELL_WIDTH = (width - 32) / TOTAL_COLUMNS; // 32 = horizontal padding/margins if desired
const TIME_COLUMN_WIDTH = CELL_WIDTH;
const BORDER_RADIUS = 12;
const CELL_HEIGHT = 50;

// --- FETCH CALENDARS FUNCTION ---
// This function fetches the user's calendars.
const fetchGoogleCalendars = async () => {
  try {
    const googleAccessToken = await AsyncStorage.getItem("googleAccessToken");
    if (!googleAccessToken) {
      console.error("No Google access token found. Please sign in with Google.");
      return [];
    }
    const url = "https://www.googleapis.com/calendar/v3/users/me/calendarList";
    const response = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${googleAccessToken}`,
        Accept: "application/json",
      },
    });
    const data = await response.json();
    if (data.error) {
      console.error("Google Calendar API Error:", data.error);
      return [];
    }
    console.log("Retrieved Calendars:", data.items);
    return data.items || [];
  } catch (error) {
    console.error("Error fetching Google Calendars:", error);
    return [];
  }
};

// --- DYNAMIC FETCH EVENTS FUNCTION ---
// This function builds the URL dynamically using the provided calendarId.
const fetchEventsForCalendar = async (calendarId) => {
  try {
    const googleAccessToken = await AsyncStorage.getItem("googleAccessToken");
    if (!googleAccessToken) {
      console.error("No Google OAuth access token found. Please sign in again.");
      return [];
    }
    // Build URL using the calendarId instead of a static link.
    // Here we define our parameters inline; you could also use values from googleCalendarConfig.
    const params = new URLSearchParams({
      maxResults: 20,
      orderBy: 'startTime',
      singleEvents: true,
      timeMin: new Date().toISOString(),
    });
    const url = `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events?${params}`;

    const response = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${googleAccessToken}`,
        Accept: "application/json",
      },
    });

    const data = await response.json();
    if (data.error) {
      console.error(`Google Calendar API Error for calendar ${calendarId}:`, data.error);
      return [];
    }
    console.log(`Events for calendar "${calendarId}":`, data.items);
    return data.items || [];
  } catch (error) {
    console.error("Error fetching calendar events:", error);
    return [];
  }
};

export default function Schedule() {
  const { user } = useAuth();
  const { darkMode } = useTheme();
  const { t } = useLanguage();
  
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
    message: 'Please sign in with Google to sync your schedule.',
    title: 'Google Login Required',
  });

  // State for calendar selection
  const [calendars, setCalendars] = useState([]);
  const [selectedCalendar, setSelectedCalendar] = useState(null);
  const [calendarModalVisible, setCalendarModalVisible] = useState(false);

  // Animation values
  const addButtonAnim = useRef(new Animated.Value(0)).current;
  const deleteButtonAnim = useRef(new Animated.Value(0)).current;

  // One-hour intervals from 8:00 to 22:00 (15 slots)
  const timeSlots = Array.from({ length: 15 }, (_, i) => {
    const hour = i + 8;
    return `${hour.toString().padStart(2, '0')}:00`;
  });

  // Monday–Friday labels
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];

  // Theme-specific dynamic styles
  const dynamicStyles = {
    container: {
      backgroundColor: darkMode ? '#121212' : '#fff',
    },
    headerRow: {
      backgroundColor: darkMode ? '#333' : '#f2f2f2',
      borderColor: darkMode ? '#444' : '#ccc',
    },
    headerText: {
      color: darkMode ? '#fff' : '#333',
    },
    timeText: {
      color: darkMode ? '#ccc' : '#666',
    },
    row: {
      borderColor: darkMode ? '#333' : '#eee',
    },
    cell: {
      borderColor: darkMode ? '#333' : '#eee',
    },
    timeColumn: {
      borderColor: darkMode ? '#444' : '#ccc',
    },
    dayColumn: {
      borderColor: darkMode ? '#444' : '#ccc',
    },
    lastSyncedText: {
      color: darkMode ? '#bbb' : '#666',
    },
    modalContainer: {
      backgroundColor: darkMode ? '#222' : '#fff',
    },
    modalTitle: {
      color: darkMode ? '#fff' : '#000',
    },
    modalMessage: {
      color: darkMode ? '#ddd' : '#333',
    },
    searchContainer: {
      backgroundColor: darkMode ? '#222' : '#fff',
    },
    searchTitle: {
      color: darkMode ? '#fff' : '#000',
    },
    searchInputContainer: {
      backgroundColor: darkMode ? '#333' : '#f2f2f2',
    },
    searchIcon: {
      color: darkMode ? '#bbb' : '#666',
    },
    searchInput: {
      color: darkMode ? '#fff' : '#000',
    },
    calendarItem: {
      borderColor: darkMode ? '#444' : '#eee',
    },
    calendarItemText: {
      color: darkMode ? '#fff' : '#333',
    },
  };

  // Close search modal
  const closeSearch = () => {
    setIsSearchOpen(false);
    setSearchQuery('');
  };

  // Load available calendars when the user is logged in.
  useEffect(() => {
    const loadCalendars = async () => {
      const fetchedCalendars = await fetchGoogleCalendars();
      if (fetchedCalendars && fetchedCalendars.length > 0) {
        setCalendars(fetchedCalendars);
      }
    };
    if (user) {
      loadCalendars();
    }
  }, [user]);

  // Auto-sync events when a new calendar is chosen
  useEffect(() => {
    if (selectedCalendar) {
      syncEvents();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCalendar]);

  // Function to sync events using the selected calendar's ID
  const syncEvents = async () => {
    const googleAccessToken = await AsyncStorage.getItem('googleAccessToken');
    if (!googleAccessToken) {
      setModalConfig({
        visible: true,
        type: 'error',
        title: 'Google Login Required',
        message: 'Please sign in with Google to sync your schedule.',
      });
      return;
    }
    setIsSyncing(true);
    try {
      console.log("Fetching events for calendar ID:", selectedCalendar.id);
      const fetchedEvents = await fetchEventsForCalendar(selectedCalendar.id);
      setEvents(fetchedEvents || []);
      setLastSynced(new Date());
      setModalConfig({
        visible: true,
        type: 'success',
        title: t.syncComplete,
        message: 'Your calendar has been successfully synchronized.',
      });
    } catch (error) {
      console.error('Sync failed:', error);
      setModalConfig({
        visible: true,
        type: 'error',
        title: t.syncFailed,
        message: error.message || 'Failed to sync calendar. Please try again.',
      });
    } finally {
      setIsSyncing(false);
    }
  };

  // Clear events and calendar selection on logout
  useEffect(() => {
    if (!user) {
      setEvents([]);
      setLastSynced(null);
      setSelectedCalendar(null);
      AsyncStorage.removeItem('googleAccessToken');
    }
  }, [user]);

  // When pressing the sync button, check login status.
  const handleSync = () => {
    if (!user) {
      setModalConfig({
        visible: true,
        type: 'error',
        title: 'Authentication Required',
        message: 'Please sign in with Google to sync your calendar.',
      });
      return;
    }
    // Clear previous selection so the user can choose a calendar every time
    setSelectedCalendar(null);
    setCalendarModalVisible(true);
  };

  // Render calendar selection modal
  const renderCalendarModal = () => (
    <Modal
      visible={calendarModalVisible}
      transparent={true}
      animationType="slide"
      onRequestClose={() => setCalendarModalVisible(false)}
    >
      <TouchableWithoutFeedback onPress={() => setCalendarModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <TouchableWithoutFeedback>
            <View style={[styles.modalContainer, dynamicStyles.modalContainer, { maxHeight: '80%' }]}>
              <Text style={[styles.modalTitle, dynamicStyles.modalTitle]}>Select a Calendar</Text>
              <FlatList
                data={calendars}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    onPress={() => {
                      console.log("Selected calendar:", item);
                      setSelectedCalendar(item);
                      setCalendarModalVisible(false);
                    }}
                    style={[styles.calendarItem, dynamicStyles.calendarItem]}
                  >
                    <Text style={[styles.calendarItemText, dynamicStyles.calendarItemText]}>{item.summary}</Text>
                  </TouchableOpacity>
                )}
              />
              <TouchableOpacity
                style={styles.modalButton}
                onPress={() => setCalendarModalVisible(false)}
              >
                <Text style={styles.modalButtonText}>Close</Text>
              </TouchableOpacity>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );

  // Render header for the schedule grid (Time and Days)
  const renderHeader = () => (
    <View style={[styles.headerRow, dynamicStyles.headerRow]}>
      <View style={[styles.timeColumn, styles.headerCell, dynamicStyles.timeColumn]}>
        <Text style={[styles.headerText, dynamicStyles.headerText]}>Time</Text>
      </View>
      {days.map((day) => (
        <View key={day} style={[styles.dayColumn, styles.headerCell, dynamicStyles.dayColumn]}>
          <Text style={[styles.headerText, dynamicStyles.headerText]}>{day}</Text>
        </View>
      ))}
    </View>
  );

  // Render each time row for the grid
  const renderRow = ({ item: time }) => (
    <View style={[styles.row, dynamicStyles.row]}>
      <View style={[styles.timeColumn, dynamicStyles.timeColumn]}>
        <Text style={[styles.timeText, dynamicStyles.timeText]}>{time}</Text>
      </View>
      {days.map((day) => (
        <View key={`${day}-${time}`} style={[styles.cell, dynamicStyles.cell]} />
      ))}
    </View>
  );

  const handleEventPress = (event) => {
    setSelectedEvent(event);
    setEventModalVisible(true);
  };

  // Render the events overlay on the grid
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
            onPress={() => handleEventPress(event)}
          >
            <View
              style={[
                styles.eventBox,
                { top: topPosition, left: leftPosition, width: CELL_WIDTH, height: eventHeight },
              ]}
            >
              <Text style={styles.eventBoxText} numberOfLines={2}>
                {event.summary}
              </Text>
            </View>
          </TouchableOpacity>
        );
      })}
    </View>
  );

  // Floating button animations
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
    <View style={[styles.container, dynamicStyles.container]}>
      <CustomModal
        visible={modalConfig.visible}
        onClose={() => setModalConfig((prev) => ({ ...prev, visible: false }))}
        type={modalConfig.type}
        title={modalConfig.title}
        message={modalConfig.message}
        darkMode={darkMode}
      />

      {renderCalendarModal()}

      <View style={styles.syncHeader}>
        <TouchableOpacity style={styles.syncButton} onPress={handleSync} disabled={isSyncing}>
          {isSyncing ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.syncButtonText}>{t.syncCalendar}</Text>
          )}
        </TouchableOpacity>
        {lastSynced && (
          <Text style={[styles.lastSyncedText, dynamicStyles.lastSyncedText]}>
            {t.lastSynced} {lastSynced.toLocaleTimeString()}
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

      <Modal
        visible={isSearchOpen}
        transparent={true}
        animationType="fade"
        onRequestClose={closeSearch}
      >
        <TouchableWithoutFeedback onPress={closeSearch}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback>
              <View style={[styles.searchContainer, dynamicStyles.searchContainer]}>
                <View style={styles.searchHeader}>
                  <Text style={[styles.searchTitle, dynamicStyles.searchTitle]}>Add Class</Text>
                  <TouchableOpacity testID="close-search-modal" onPress={closeSearch}>
                    <MaterialIcons name="close" size={24} color={darkMode ? "#bbb" : "#666"} />
                  </TouchableOpacity>
                </View>
                <View style={[styles.searchInputContainer, dynamicStyles.searchInputContainer]}>
                  <MaterialIcons name="search" size={20} color={darkMode ? "#bbb" : "#666"} style={styles.searchIcon} />
                  <TextInput
                    testID="search-input"
                    style={[styles.searchInput, dynamicStyles.searchInput]}
                    placeholder="Search for a class..."
                    placeholderTextColor={darkMode ? "#777" : "#999"}
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

      <Modal
        visible={eventModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setEventModalVisible(false)}
      >
        <TouchableWithoutFeedback onPress={() => setEventModalVisible(false)}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback>
              <View style={[styles.modalContainer, dynamicStyles.modalContainer]}>
                {selectedEvent && (
                  <>
                    <Text style={[styles.modalTitle, dynamicStyles.modalTitle]}>{selectedEvent.summary}</Text>
                    <Text style={[styles.modalMessage, dynamicStyles.modalMessage]}>
                      Start: {new Date(selectedEvent.start.dateTime || selectedEvent.start.date).toLocaleString()}
                    </Text>
                    <Text style={[styles.modalMessage, dynamicStyles.modalMessage]}>
                      End: {new Date(selectedEvent.end.dateTime || selectedEvent.end.date).toLocaleString()}
                    </Text>
                    {selectedEvent.location && (
                      <Text style={[styles.modalMessage, dynamicStyles.modalMessage]}>
                        Location: {selectedEvent.location}
                      </Text>
                    )}
                  </>
                )}
                <TouchableOpacity
                  style={styles.modalButton}
                  onPress={() => setEventModalVisible(false)}
                >
                  <Text style={styles.modalButtonText}>Close</Text>
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
  container: { flex: 1, backgroundColor: '#fff' },
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
  syncButtonText: { color: '#fff', fontSize: 14, fontWeight: '600' },
  lastSyncedText: { fontSize: 12, color: '#666' },
  gridContent: { paddingBottom: 100 },
  headerRow: {
    flexDirection: 'row',
    backgroundColor: '#f2f2f2',
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#ccc',
  },
  headerCell: { paddingVertical: 10 },
  row: { flexDirection: 'row', minHeight: 50, borderBottomWidth: 1, borderColor: '#eee' },
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
  cell: { width: CELL_WIDTH, borderRightWidth: 1, borderColor: '#eee' },
  timeText: { fontSize: 12, color: '#666' },
  headerText: { fontSize: 12, fontWeight: 'bold', color: '#333' },
  eventsOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 9999 },
  eventBox: { position: 'absolute', backgroundColor: '#912338', borderRadius: 6, padding: 4, overflow: 'hidden' },
  eventBoxText: { color: '#fff', fontSize: 10, fontWeight: '600' },
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
  addButton: {},
  deleteButton: {},
  modalBackground: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  modalContainer: {
    backgroundColor: '#fff',
    width: '80%',
    padding: 20,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 10, textAlign: 'center' },
  modalMessage: { fontSize: 16, marginBottom: 5, textAlign: 'center' },
  modalButton: { backgroundColor: '#912338', paddingVertical: 8, paddingHorizontal: 16, borderRadius: 4, marginTop: 15, alignSelf: 'center' },
  modalButtonText: { color: '#fff', textAlign: 'center' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.3)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  searchContainer: { backgroundColor: '#fff', borderRadius: 8, padding: 16 },
  searchHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  searchTitle: { fontSize: 18, fontWeight: '600' },
  searchInputContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f2f2f2', borderRadius: 8, marginTop: 10, paddingHorizontal: 8 },
  searchIcon: { marginRight: 5 },
  searchInput: { flex: 1, paddingVertical: 8 },
  searchResults: { marginTop: 16 },
  calendarItem: { padding: 12, borderBottomWidth: 1, borderColor: '#eee' },
  calendarItemText: { fontSize: 16, color: '#333' },
});