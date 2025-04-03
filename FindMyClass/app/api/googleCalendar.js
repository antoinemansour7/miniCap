import { getAuth } from "firebase/auth";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { googleCalendarConfig } from '../secrets';

//This file is only called from Chatbot, since the schedule is using a refined version, this is hardcoded into schedule.js

const fetchGoogleCalendarEvents = async () => {
  try {
    const auth = getAuth();
    if (!auth.currentUser) {
      console.error("User not logged in. Please sign in with Google.");
      return [];
    }
    
    const googleAccessToken = await AsyncStorage.getItem("googleAccessToken");
    if (!googleAccessToken) {
      console.error("No Google OAuth access token found. Please sign in again.");
      return [];
    }

    // Create URL with parameters
    const params = new URLSearchParams(googleCalendarConfig.params);
    const url = `${googleCalendarConfig.baseUrl}?${params}`;

    const response = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${googleAccessToken}`,
        Accept: "application/json",
      },
    });

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