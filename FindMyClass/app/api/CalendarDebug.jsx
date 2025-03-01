import React, { useState } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  StyleSheet, 
  RefreshControl, 
  ActivityIndicator, 
  TouchableOpacity, 
  Modal,
  TouchableWithoutFeedback 
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getAuth } from 'firebase/auth'; // NEW import
import fetchGoogleCalendarEvents from './googleCalendar';

export default function CalendarDebug() {
  const [events, setEvents] = useState([]);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [showLoginPopup, setShowLoginPopup] = useState(false); // NEW state

  const loadEvents = async () => {
    // NEW: Check if user is signed in via Firebase auth
    const auth = getAuth();
    if (!auth.currentUser) {
      setShowLoginPopup(true);
      setEvents([]);
      return;
    }
    // Check for stored Google access token before fetching
    const googleAccessToken = await AsyncStorage.getItem("googleAccessToken");
    if (!googleAccessToken) {
      setShowLoginPopup(true);
      setEvents([]);
      return;
    }
    try {
      setError(null);
      setIsSyncing(true);
      const fetchedEvents = await fetchGoogleCalendarEvents();
      setEvents(fetchedEvents || []);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching events:', err);
    } finally {
      setIsSyncing(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadEvents();
    setRefreshing(false);
  };

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
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

      <View style={styles.syncButtonContainer}>
        <TouchableOpacity style={styles.syncButton} onPress={loadEvents} disabled={isSyncing}>
          {isSyncing ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.syncButtonText}>Sync Calendar</Text>
          )}
        </TouchableOpacity>
      </View>
      <Text style={styles.header}>Calendar Debug View</Text>
      
      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Error: {error}</Text>
        </View>
      )}

      {events.length === 0 && !error ? (
        <Text style={styles.noEvents}>No events found</Text>
      ) : (
        events.map((event, index) => (
          <View key={event.id || index} style={styles.eventContainer}>
            <Text style={styles.eventTitle}>Event: {event.summary}</Text>
            <Text style={styles.eventDetail}>ID: {event.id}</Text>
            <Text style={styles.eventDetail}>Start: {event.start?.dateTime || event.start?.date}</Text>
            <Text style={styles.eventDetail}>End: {event.end?.dateTime || event.end?.date}</Text>
            <Text style={styles.rawData}>Raw data: {JSON.stringify(event, null, 2)}</Text>
          </View>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 16,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
  },
  errorContainer: {
    backgroundColor: '#ffebee',
    padding: 10,
    borderRadius: 5,
    marginBottom: 10,
  },
  errorText: {
    color: '#c62828',
  },
  noEvents: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginTop: 20,
  },
  eventContainer: {
    backgroundColor: '#f5f5f5',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
  },
  eventTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  eventDetail: {
    fontSize: 14,
    color: '#666',
    marginBottom: 3,
  },
  rawData: {
    fontSize: 12,
    color: '#999',
    marginTop: 10,
    fontFamily: 'monospace',
  },
  syncButtonContainer: { alignItems: 'center', marginBottom: 20 },
  syncButton: { backgroundColor: '#912338', paddingVertical: 10, paddingHorizontal: 20, borderRadius: 5 },
  syncButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  modalBackground: { 
    flex: 1, 
    backgroundColor: 'rgba(0,0,0,0.5)', 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  modalContainer: {
    width: '80%',
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 8,
    alignItems: 'center',
  },
  modalTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 10 },
  modalMessage: { fontSize: 16, textAlign: 'center', marginBottom: 20 },
  modalButton: { backgroundColor: '#912338', borderRadius: 5, paddingVertical: 10, paddingHorizontal: 20 },
  modalButtonText: { color: '#fff', fontSize: 16 },
});
