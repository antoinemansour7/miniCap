import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, FlatList, StyleSheet } from 'react-native';
import fetchGoogleCalendars from '../api/fetchGoogleCalendars';
import fetchGoogleCalendarEvents from '../api/googleCalendar';

const CalendarSelection = () => {
  const [calendars, setCalendars] = useState([]);
  const [events, setEvents] = useState([]);
  const [selectedCalendar, setSelectedCalendar] = useState(null);

  // Fetch the user's calendars on mount
  useEffect(() => {
    const loadCalendars = async () => {
      const fetchedCalendars = await fetchGoogleCalendars();
      setCalendars(fetchedCalendars);
    };
    loadCalendars();
  }, []);

  const handleCalendarPress = async (calendar) => {
    // Set which calendar is selected
    setSelectedCalendar(calendar);

    // Fetch the events for the chosen calendar ID
    const fetchedEvents = await fetchGoogleCalendarEvents(calendar.id);
    setEvents(fetchedEvents);
  };

  const renderCalendarItem = ({ item }) => (
    <TouchableOpacity
      style={styles.calendarButton}
      onPress={() => handleCalendarPress(item)}
    >
      <Text style={styles.calendarButtonText}>{item.summary}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Available Calendars</Text>
      <FlatList
        data={calendars}
        keyExtractor={(item) => item.id}
        renderItem={renderCalendarItem}
        ListEmptyComponent={<Text>No calendars found.</Text>}
      />

      {selectedCalendar && (
        <View style={styles.eventsContainer}>
          <Text style={styles.selectedCalendarTitle}>
            Events for: {selectedCalendar.summary}
          </Text>
          {events.length > 0 ? (
            events.map((event) => (
              <Text key={event.id} style={styles.eventText}>
                {event.summary}
              </Text>
            ))
          ) : (
            <Text>No events found.</Text>
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    flex: 1,
    backgroundColor: '#fff'
  },
  title: {
    fontSize: 20,
    marginBottom: 10,
    fontWeight: 'bold'
  },
  calendarButton: {
    padding: 10,
    marginVertical: 5,
    backgroundColor: '#cfcfcf',
    borderRadius: 5
  },
  calendarButtonText: {
    fontSize: 16
  },
  eventsContainer: {
    marginTop: 20
  },
  selectedCalendarTitle: {
    fontSize: 18,
    marginBottom: 10,
    fontWeight: 'bold'
  },
  eventText: {
    fontSize: 16,
    marginBottom: 5
  }
});

export default CalendarSelection;