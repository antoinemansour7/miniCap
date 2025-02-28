import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, RefreshControl, ActivityIndicator } from 'react-native';
import fetchGoogleCalendarEvents from '../api/googleCalendar';

export default function CalendarDebug() {
  const [events, setEvents] = useState([]); // Initialize with empty array
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true); // Add loading state

  const loadEvents = async () => {
    try {
      setError(null);
      setLoading(true);
      const fetchedEvents = await fetchGoogleCalendarEvents();
      setEvents(fetchedEvents || []); // Ensure we always set an array
      console.log('Fetched events:', fetchedEvents); // Debug log
    } catch (err) {
      setError(err.message);
      console.error('Error fetching events:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEvents();
  }, []);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    loadEvents().finally(() => setRefreshing(false));
  }, []);

  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#912338" />
        <Text style={styles.loadingText}>Loading calendar events...</Text>
      </View>
    );
  }

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <Text style={styles.header}>Calendar Debug View</Text>
      
      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Error: {error}</Text>
        </View>
      )}

      {events?.length === 0 && !error ? (
        <Text style={styles.noEvents}>No events found</Text>
      ) : (
        events?.map((event, index) => (
          <View key={event?.id || index} style={styles.eventContainer}>
            <Text style={styles.eventTitle}>Event: {event?.summary}</Text>
            <Text style={styles.eventDetail}>ID: {event?.id}</Text>
            <Text style={styles.eventDetail}>Start: {event?.start?.dateTime || event?.start?.date}</Text>
            <Text style={styles.eventDetail}>End: {event?.end?.dateTime || event?.end?.date}</Text>
            <Text style={styles.rawData}>Raw data: {JSON.stringify(event, null, 2)}</Text>
          </View>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  // ...existing styles...
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  }
});
