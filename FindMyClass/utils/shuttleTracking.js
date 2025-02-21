import { LOYOLA_COORDS, SGW_COORDS } from './shuttleUtils';

const fetchShuttleBusLocations = async () => {
  try {
    // First, get session cookies
    await fetch('https://shuttle.concordia.ca/concordiabusmap/Map.aspx', {
      method: 'GET',
      headers: {
        'Host': 'shuttle.concordia.ca'
      }
    });
    
    // Then make the POST request to get bus locations
    const response = await fetch('https://shuttle.concordia.ca/concordiabusmap/WebService/GService.asmx/GetGoogleObject', {
      method: 'POST',
      headers: {
        'Host': 'shuttle.concordia.ca',
        'Content-Length': '0',
        'Content-Type': 'application/json; charset=UTF-8'
      }
    });
    
    const data = await response.json();
    
    // Extract bus points from the response
    const busPoints = data.d.Points.filter(point => point.ID.startsWith('BUS'));
    
    return busPoints.map(bus => ({
      id: bus.ID,
      latitude: bus.Latitude,
      longitude: bus.Longitude
    }));
    
  } catch (error) {
    console.error('Error fetching shuttle locations:', error);
    return [];
  }
};

// Helper function to estimate next bus arrival based on real-time locations
const estimateNextArrival = (busLocations, startCampus) => {
  // No buses available
  if (!busLocations || busLocations.length === 0) {
    return null;
  }
  
  const campusCoords = startCampus.toLowerCase() === 'loyola' ? LOYOLA_COORDS : SGW_COORDS;
  
  // Find closest bus that's heading toward our start campus
  let closestBus = null;
  let shortestDistance = Infinity;
  
  busLocations.forEach(bus => {
    const distance = calculateDistance(
      { latitude: bus.latitude, longitude: bus.longitude },
      campusCoords
    );
    
    if (distance < shortestDistance) {
      shortestDistance = distance;
      closestBus = bus;
    }
  });
  
  // Calculate estimated arrival time based on distance
  // 20 km/h = to around 333 meters per minute
  const estimatedMinutes = Math.ceil(shortestDistance / 333);
  
  return {
    busId: closestBus.id,
    distance: shortestDistance,
    estimatedMinutes: Math.min(estimatedMinutes, 30) // Cap at 30 mins
  };
};

// Helper function to calculate distance between coordinates
const calculateDistance = (point1, point2) => {
  const R = 6371e3; // Earth's radius in meters
  const φ1 = point1.latitude * Math.PI / 180;
  const φ2 = point2.latitude * Math.PI / 180;
  const Δφ = (point2.latitude - point1.latitude) * Math.PI / 180;
  const Δλ = (point2.longitude - point1.longitude) * Math.PI / 180;

  const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
          Math.cos(φ1) * Math.cos(φ2) *
          Math.sin(Δλ/2) * Math.sin(Δλ/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  
  return R * c; // Distance in meters
};

export { fetchShuttleBusLocations, estimateNextArrival, calculateDistance };