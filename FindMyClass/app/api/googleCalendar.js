import { useEffect, useState } from "react";
import { getAuth } from "firebase/auth";

const fetchGoogleCalendarEvents = async () => {
  const auth = getAuth();
  const user = auth.currentUser;
  if (!user) return;

  try {
    // Get the user’s Google access token
    const token = await user.getIdToken(true);

    const response = await fetch(
      `https://www.googleapis.com/calendar/v3/calendars/primary/events?maxResults=10&orderBy=startTime&singleEvents=true`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      }
    );

    const data = await response.json();
    return data.items || []; // Return events list
  } catch (error) {
    console.error("Error fetching calendar events:", error);
    return [];
  }
};