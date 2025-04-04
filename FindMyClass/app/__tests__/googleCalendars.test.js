import fetchGoogleCalendars from '../api/googleCalendars';
import AsyncStorage from '@react-native-async-storage/async-storage';

describe('fetchGoogleCalendars', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns empty array if no token is found', async () => {
    AsyncStorage.getItem = jest.fn(() => Promise.resolve(null));
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    const result = await fetchGoogleCalendars();
    expect(result).toEqual([]);
    expect(consoleErrorSpy).toHaveBeenCalledWith("No Google access token found. Please sign in with Google.");
    consoleErrorSpy.mockRestore();
  });

  it('returns empty array if API response contains an error', async () => {
    AsyncStorage.getItem = jest.fn(() => Promise.resolve("dummyToken"));
    global.fetch = jest.fn(() => Promise.resolve({
      json: () => Promise.resolve({ error: "API Error" })
    }));
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    const result = await fetchGoogleCalendars();
    expect(result).toEqual([]);
    expect(consoleErrorSpy).toHaveBeenCalledWith("Google Calendar API Error:", "API Error");
    consoleErrorSpy.mockRestore();
  });

  it('returns calendars on successful API response', async () => {
    AsyncStorage.getItem = jest.fn(() => Promise.resolve("dummyToken"));
    const calendars = [{ id: '1', summary: 'Calendar 1' }];
    global.fetch = jest.fn(() => Promise.resolve({
      json: () => Promise.resolve({ items: calendars })
    }));
    const result = await fetchGoogleCalendars();
    expect(result).toEqual(calendars);
  });

  it('returns empty array if fetch throws an error', async () => {
    AsyncStorage.getItem = jest.fn(() => Promise.resolve("dummyToken"));
    global.fetch = jest.fn(() => Promise.reject(new Error("Network error")));
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    const result = await fetchGoogleCalendars();
    expect(result).toEqual([]);
    expect(consoleErrorSpy).toHaveBeenCalledWith("Error fetching Google Calendars:", expect.any(Error));
    consoleErrorSpy.mockRestore();
  });
});
