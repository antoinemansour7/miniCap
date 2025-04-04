// nextClass.js
import fetchGoogleCalendarEvents from '../app/api/googleCalendar';
import { router } from 'expo-router';

const buildingCoordinatesMap = {
  "JMSB": { latitude: 45.4945, longitude: -73.5780 },
  "EV": { latitude: 45.4950, longitude: -73.5770 },
  "HALL": { latitude: 45.4960, longitude: -73.5760 },
  "LEARNING SQUARE": { latitude: 45.496267, longitude: -73.579308 },
  // Add other building mappings as needed.
};

/**
 * Fetches Google Calendar events, sorts them by start time, and returns the next class event.
 * If the event’s location matches one of the keys in buildingCoordinatesMap,
 * its destinationCoordinates property is set accordingly.
 * @returns {Promise<Object|null>} The next class event or null if no events are found.
 */
export async function getNextClassEvent() {
  try {
    const events = await fetchGoogleCalendarEvents();
    if (!events || events.length === 0) return null;

    // Sort events by their start time (earliest first)
    events.sort((a, b) => {
      const aStart = new Date(a.start?.dateTime || a.start?.date);
      const bStart = new Date(b.start?.dateTime || b.start?.date);
      return aStart - bStart;
    });

    let nextEvent = events[0];
    // If destinationCoordinates are not provided, try to determine them by matching the event location.
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
    return nextEvent;
  } catch (error) {
    console.error("Error in getNextClassEvent:", error);
    return null;
  }
}

/**
 * Navigates to the directions screen using the next class event's details.
 * If no valid event is found or if there are no valid coordinates, it alerts the user.
 */
export async function navigateToNextClass() {
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
}

// Optionally export an object for global import
export default { getNextClassEvent, navigateToNextClass };