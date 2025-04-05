// shuttleUtils.js
export const LOYOLA_COORDS = {
    latitude: 45.458,
    longitude: -73.638,
  };
  
  export const SGW_COORDS = {
    latitude: 45.497,
    longitude: -73.578,
  };
  
  // Shuttle stop locations
  const LOYOLA_SHUTTLE_STOP = {
    latitude: 45.458825,
    longitude: -73.637708,
    name: "Loyola Shuttle Stop",
  };
  
  const SGW_SHUTTLE_STOP = {
    latitude: 45.497245,
    longitude: -73.577997,
    name: "SGW Shuttle Stop",
  };
  
  // Function to get shuttle stops
  export function getLoyolaShuttleStop() {
    return LOYOLA_SHUTTLE_STOP;
  }
  
  export function getSGWShuttleStop() {
    return SGW_SHUTTLE_STOP;
  }
  
  // Function to check if location is near a campus
  export function isNearCampus(location, campusCoords, radius = 1.5) {
    if (!location || !campusCoords) return false;
  
    const distance = calculateDistance(
      location.latitude,
      location.longitude,
      campusCoords.latitude,
      campusCoords.longitude
    );
  
    return distance <= radius; // km radius
  }
  
  // Calculate distance between two points using Haversine formula
  function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Earth's radius in km
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRad(lat1)) *
        Math.cos(toRad(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }
  
  function toRad(value) {
    return (value * Math.PI) / 180;
  }
  
  // Mock schedule for demo purposes - replace with actual schedule API
  const SHUTTLE_SCHEDULE = {
    loyola: [
      "07:30", "07:45", "08:00", "08:20", "08:40", "09:00", "09:20", "09:40",
      "10:00", "10:20", "10:40", "11:00", "11:20", "11:40", "12:00", "12:20",
      "12:40", "13:00", "13:20", "13:40", "14:00", "14:20", "14:40", "15:00",
      "15:20", "15:40", "16:00", "16:20", "16:40", "17:00", "17:20", "17:40",
      "18:00", "18:30", "19:00", "19:30", "20:00", "20:30", "21:00", "21:30",
      "22:00", "22:30", "23:00"
    ],
    sgw: [
      "07:45", "08:00", "08:15", "08:35", "08:55", "09:15", "09:35", "09:55",
      "10:15", "10:35", "10:55", "11:15", "11:35", "11:55", "12:15", "12:35",
      "12:55", "13:15", "13:35", "13:55", "14:15", "14:35", "14:55", "15:15",
      "15:35", "15:55", "16:15", "16:35", "16:55", "17:15", "17:35", "17:55",
      "18:15", "18:45", "19:15", "19:45", "20:15", "20:45", "21:15", "21:45",
      "22:15", "22:45", "23:15"
    ]
  };
  
  // Get the next shuttle time from the schedule
  export function getNextShuttleTime(campus = "loyola") {
    const schedule = SHUTTLE_SCHEDULE[campus.toLowerCase()];
    if (!schedule) return "No schedule available";
  
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    const currentTime = `${currentHour.toString().padStart(2, "0")}:${currentMinute.toString().padStart(2, "0")}`;
  
    // Find the next departure time
    const nextTime = schedule.find(time => time > currentTime);
    
    // If no more shuttles today, return the first shuttle of tomorrow
    return nextTime || schedule[0];
  }
  
  // Get the next three shuttle times
  export function getNextThreeShuttleTimes(campus = "loyola") {
    const schedule = SHUTTLE_SCHEDULE[campus.toLowerCase()];
    if (!schedule) return ["No schedule available"];
  
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    const currentTime = `${currentHour.toString().padStart(2, "0")}:${currentMinute.toString().padStart(2, "0")}`;
  
    // Find the next departure times
    const nextTimes = [];
    let foundIndex = schedule.findIndex(time => time > currentTime);
    
    // If no more shuttles today, start from the beginning of tomorrow
    if (foundIndex === -1) foundIndex = 0;
    
    // Get the next three times
    for (let i = 0; i < 3; i++) {
      if (foundIndex + i < schedule.length) {
        nextTimes.push(schedule[foundIndex + i]);
      } else {
        // Wrap around to the beginning of the schedule
        nextTimes.push(schedule[(foundIndex + i) % schedule.length]);
      }
    }
    
    return nextTimes;
  }