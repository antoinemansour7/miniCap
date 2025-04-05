
// nextClass.test.js

import { getNextClassEvent, navigateToNextClass } from '../nextClass';
import fetchGoogleCalendarEvents from '../../app/api/googleCalendar';
import { router } from 'expo-router';

jest.mock('../../app/api/googleCalendar');
jest.mock('expo-router', () => ({
  router: {
    push: jest.fn(),
  },
}));

// Override global alert for tests
global.alert = jest.fn();

describe('nextClass.js', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getNextClassEvent', () => {
    it('should return null if no events are returned (empty array)', async () => {
      fetchGoogleCalendarEvents.mockResolvedValue([]);
      const result = await getNextClassEvent();
      expect(result).toBeNull();
    });

    it('should return null if fetchGoogleCalendarEvents returns null', async () => {
      fetchGoogleCalendarEvents.mockResolvedValue(null);
      const result = await getNextClassEvent();
      expect(result).toBeNull();
    });

    it('should sort events by start time and return the earliest event', async () => {
      const event1 = {
        start: { dateTime: "2025-04-04T10:00:00Z" },
        location: "JMSB",
        summary: "Class 1",
      };
      const event2 = {
        start: { dateTime: "2025-04-04T09:00:00Z" },
        location: "EV",
        summary: "Class 2",
      };
      // Return events in reverse order to test sorting.
      fetchGoogleCalendarEvents.mockResolvedValue([event1, event2]);
      const result = await getNextClassEvent();
      expect(result.summary).toEqual("Class 2");
    });

    it('should assign destinationCoordinates from location if not provided', async () => {
      const event = {
        start: { dateTime: "2025-04-04T10:00:00Z" },
        location: "HALL",
        summary: "Class in Hall",
      };
      fetchGoogleCalendarEvents.mockResolvedValue([event]);
      const result = await getNextClassEvent();
      expect(result.destinationCoordinates).toEqual({ latitude: 45.4960, longitude: -73.5760 });
    });

    it('should set destinationCoordinates to null if location does not match any building', async () => {
      const event = {
        start: { dateTime: "2025-04-04T10:00:00Z" },
        location: "UNKNOWN BUILDING",
        summary: "Class in Unknown",
      };
      fetchGoogleCalendarEvents.mockResolvedValue([event]);
      const result = await getNextClassEvent();
      expect(result.destinationCoordinates).toBeNull();
    });

    it('should catch errors and return null when fetchGoogleCalendarEvents throws', async () => {
      fetchGoogleCalendarEvents.mockRejectedValue(new Error("Network error"));
      const result = await getNextClassEvent();
      expect(result).toBeNull();
    });
  });

  describe('navigateToNextClass', () => {
    it('should call alert if getNextClassEvent returns null', async () => {
      fetchGoogleCalendarEvents.mockResolvedValue([]);
      await navigateToNextClass();
      expect(global.alert).toHaveBeenCalledWith("Login required – Please login with Google to access this feature.");
      expect(router.push).not.toHaveBeenCalled();
    });

    it('should call alert if destinationCoordinates is not available', async () => {
      // Return an event that does not match any building so destinationCoordinates remains null.
      const event = {
        start: { dateTime: "2025-04-04T10:00:00Z" },
        location: "UNKNOWN",
        summary: "Class in unknown",
      };
      fetchGoogleCalendarEvents.mockResolvedValue([event]);
      await navigateToNextClass();
      expect(global.alert).toHaveBeenCalledWith("Login required – Please login with Google to access this feature.");
      expect(router.push).not.toHaveBeenCalled();
    });

    it('should navigate to directions screen when a valid event is returned', async () => {
      // Return an event with valid destinationCoordinates already set.
      const event = {
        start: { dateTime: "2025-04-04T10:00:00Z" },
        location: "JMSB",
        summary: "Class at JMSB",
        destinationCoordinates: { latitude: 45.4945, longitude: -73.5780 },
      };
      fetchGoogleCalendarEvents.mockResolvedValue([event]);
      await navigateToNextClass();
      expect(router.push).toHaveBeenCalledWith({
        pathname: '/screens/directions',
        params: {
          destination: JSON.stringify({ latitude: 45.4945, longitude: -73.5780 }),
          buildingName: "JMSB",
        },
      });
      expect(global.alert).not.toHaveBeenCalled();
    });
  });
});