import fetchGoogleCalendarEvents from '../api/googleCalendar';
import { getAuth } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';

jest.mock('firebase/auth', () => ({
  getAuth: jest.fn(),
}));

jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
}));

global.fetch = jest.fn();

describe('fetchGoogleCalendarEvents', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns empty array if user is not logged in', async () => {
    getAuth.mockReturnValue({ currentUser: null });
    const events = await fetchGoogleCalendarEvents();
    expect(events).toEqual([]);
  });

  it('returns empty array if no Google access token is found', async () => {
    getAuth.mockReturnValue({ currentUser: {} });
    AsyncStorage.getItem.mockResolvedValue(null);
    const events = await fetchGoogleCalendarEvents();
    expect(AsyncStorage.getItem).toHaveBeenCalledWith("googleAccessToken");
    expect(events).toEqual([]);
  });

  it('returns events when fetch is successful', async () => {
    getAuth.mockReturnValue({ currentUser: {} });
    AsyncStorage.getItem.mockResolvedValue("fake-token");
    const fakeItems = [{ id: 1, summary: "Event1" }, { id: 2, summary: "Event2" }];
    const fakeResponse = {
      json: jest.fn().mockResolvedValue({ items: fakeItems }),
    };
    fetch.mockResolvedValue(fakeResponse);

    const events = await fetchGoogleCalendarEvents();
    expect(fetch).toHaveBeenCalled();
    expect(fakeResponse.json).toHaveBeenCalled();
    expect(events).toEqual(fakeItems);
  });

  it('returns empty array if API returns an error', async () => {
    getAuth.mockReturnValue({ currentUser: {} });
    AsyncStorage.getItem.mockResolvedValue("fake-token");
    const fakeResponse = {
      json: jest.fn().mockResolvedValue({ error: { message: "Some error" } }),
    };
    fetch.mockResolvedValue(fakeResponse);

    const events = await fetchGoogleCalendarEvents();
    expect(events).toEqual([]);
  });

  it('returns empty array if fetch throws an error', async () => {
    getAuth.mockReturnValue({ currentUser: {} });
    AsyncStorage.getItem.mockResolvedValue("fake-token");
    fetch.mockRejectedValue(new Error("Network error"));

    const events = await fetchGoogleCalendarEvents();
    expect(events).toEqual([]);
  });
});
