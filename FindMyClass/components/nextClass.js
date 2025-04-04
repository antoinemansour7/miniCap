// nextClass.js

import fetchGoogleCalendarEvents from '../app/api/googleCalendar';
import { router } from 'expo-router';

// Define your mapping of building names to coordinates.
const buildingCoordinatesMap = {
  "JMSB": { latitude: 45.4945, longitude: -73.5780 },
  "EV": { latitude: 45.4950, longitude: -73.5770 },
  "HALL": { latitude: 45.4960, longitude: -73.5760 },
  "LEARNING SQUARE": { latitude: 45.496267, longitude: -73.579308 },
  // Add other building mappings as needed.
};

/**
 * Fetches events from Google Calendar, sorts them by start time,
 * and returns the next class event with destination coordinates determined.
 * @returns {Promise<Object|null>} The next class event or null if no events are found.
 */
export const getNextClassEvent = async () => {
  try {
    const events = await fetchGoogleCalendarEvents();
    if (!events || events.length === 0) {
      return null;
    }
    // Sort events by their start time (earliest first)
    events.sort((a, b) => {
      const aStart = new Date(a.start?.dateTime || a.start?.date);
      const bStart = new Date(b.start?.dateTime || b.start?.date);
      return aStart - bStart;
    });
    let nextEvent = events[0];
    // Determine the destination coordinates if not already provided
    if (!nextEvent.destinationCoordinates && nextEvent.location) {
      const rawLocation = nextEvent.location.trim().toUpperCase();
      let foundCoordinates = null;
      Object.keys(buildingCoordinatesMap).forEach((key) => {
        if (rawLocation.includes(key)) {
          foundCoordinates = buildingCoordinatesMap[key];
        }
      });
      nextEvent = {
        ...nextEvent,
        destinationCoordinates: foundCoordinates,
      };
    }
    console.log("Next class event:", nextEvent);
    return nextEvent;
  } catch (error) {
    console.error("Error fetching or processing next class event:", error);
    return null;
  }
};

/**
 * Navigates to the directions screen using the next class event's details.
 * This function uses the global router from expo-router.
 */
export const navigateToNextClass = async () => {
  const nextEvent = await getNextClassEvent();
  if (!nextEvent || !nextEvent.destinationCoordinates) {
    alert("Directions unavailable – no valid coordinates found for the next class.");
    return;
  }
  router.push({
    pathname: '/screens/directions',
    params: {
      destination: JSON.stringify(nextEvent.destinationCoordinates),
      buildingName: nextEvent.location || nextEvent.summary,
    },
  });
};

// Global export for easier import in other parts of the app.
export default { getNextClassEvent, navigateToNextClass };