import AsyncStorage from '@react-native-async-storage/async-storage';

const fetchGoogleCalendars = async () => {
  try {
    // Retrieve the Google access token stored during login
    const googleAccessToken = await AsyncStorage.getItem("googleAccessToken");
    if (!googleAccessToken) {
      console.error("No Google access token found. Please sign in with Google.");
      return [];
    }

    // Define the endpoint for retrieving the user's calendar list
    const url = "https://www.googleapis.com/calendar/v3/users/me/calendarList";

    // Fetch the calendars using the access token
    const response = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${googleAccessToken}`,
        Accept: "application/json",
      },
    });

    const data = await response.json();
    if (data.error) {
      console.error("Google Calendar API Error:", data.error);
      return [];
    }

    console.log("Retrieved Calendars:", data.items);
    return data.items || [];
  } catch (error) {
    console.error("Error fetching Google Calendars:", error);
    return [];
  }
};

export default fetchGoogleCalendars;