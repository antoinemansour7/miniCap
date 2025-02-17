const WEEKDAY_SCHEDULE = {
    loyola: [
        '09:15', '09:30', '09:45', '10:00', '10:15', '10:30', '10:45', '11:00',
        '11:15', '11:30', '11:45', '12:15', '12:30', '12:45', '13:00', '13:15',
        '13:30', '13:45', '14:00', '14:15', '14:30', '14:45', '15:00', '15:15',
        '15:30', '15:45', '16:00', '16:15', '16:30', '16:45', '17:00', '17:15',
        '17:30', '17:45', '18:00', '18:15', '18:30'
    ],
    sgw: [
        '09:30', '09:45', '10:00', '10:15', '10:30', '10:45', '11:00', '11:15',
        '11:30', '12:15', '12:30', '12:45', '13:00', '13:15', '13:30', '13:45',
        '14:00', '14:15', '14:30', '14:45', '15:00', '15:15', '15:30', '16:00',
        '16:15', '16:45', '17:00', '17:15', '17:30', '17:45', '18:00', '18:15',
        '18:30'
    ]
};

const FRIDAY_SCHEDULE = {
    loyola: [
        '09:15', '09:30', '09:45', '10:15', '10:45', '11:00', '11:15', '12:00',
        '12:15', '12:45', '13:00', '13:15', '13:45', '14:15', '14:30', '15:00',
        '15:15', '15:45', '16:00', '16:45', '17:15', '17:45', '18:15'
    ],
    sgw: [
        '09:45', '10:00', '10:15', '10:45', '11:15', '11:30', '12:15', '12:30',
        '12:45', '13:15', '13:45', '14:00', '14:15', '14:45', '15:00', '15:15',
        '15:45', '16:00', '16:45', '17:15', '17:45', '18:15'
    ]
};

// Get next available shuttle time
const getNextShuttleTime = (fromCampus) => {
    const now = new Date();
    const day = now.getDay();
    
    // No busses on weekends
    if (day === 0 || day === 6) return null;
    
    const schedule = day === 5 ? FRIDAY_SCHEDULE : WEEKDAY_SCHEDULE;
    const times = schedule[fromCampus.toLowerCase()];
    
    const currentTime = now.getHours().toString().padStart(2, '0') + ':' + 
                       now.getMinutes().toString().padStart(2, '0');
    
    const nextTime = times.find(time => time > currentTime);
    return nextTime || null;
};

// Check if a location is near a campus
const isNearCampus = (location, campusLocation) => {
    const R = 6371e3; // Earth's radius in meters
    const φ1 = location.latitude * Math.PI / 180;
    const φ2 = campusLocation.latitude * Math.PI / 180;
    const Δφ = (campusLocation.latitude - location.latitude) * Math.PI / 180;
    const Δλ = (campusLocation.longitude - location.longitude) * Math.PI / 180;

    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ/2) * Math.sin(Δλ/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const distance = R * c;

    return distance < 500; // Within 500 meters of campus
};

const LOYOLA_COORDS = { latitude: 45.458424, longitude: -73.640259 };
const SGW_COORDS = { latitude: 45.495729, longitude: -73.578041 };

export {
    getNextShuttleTime,
    isNearCampus,
    LOYOLA_COORDS,
    SGW_COORDS,
    WEEKDAY_SCHEDULE,
    FRIDAY_SCHEDULE
};