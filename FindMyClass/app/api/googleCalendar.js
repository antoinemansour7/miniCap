import { getAuth } from "firebase/auth";
import AsyncStorage from '@react-native-async-storage/async-storage'; // ✅ Retrieve stored access token

const fetchGoogleCalendarEvents = async () => {
  try {
    // ✅ Get the stored Google access token
    const googleAccessToken = await AsyncStorage.getItem("googleAccessToken");

    if (!googleAccessToken) {
      console.error("No Google OAuth access token found. Please sign in again.");
      return [];
    }

    // ✅ Make the request with the correct OAuth access token
    const response = await fetch(
      `https://www.googleapis.com/calendar/v3/calendars/primary/events?maxResults=10&orderBy=startTime&singleEvents=true`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${googleAccessToken}`, // ✅ Correct Google OAuth token
          Accept: "application/json",
        },
      }
    );

    const data = await response.json();
    if (data.error) {
      console.error("Google API Error:", data.error);
      return [];
    }

    console.log("Google Calendar Events:", data.items);
    return data.items || []; // ✅ Return events list
  } catch (error) {
    console.error("Error fetching calendar events:", error);
    return [];
  }
};

export default fetchGoogleCalendarEvents;