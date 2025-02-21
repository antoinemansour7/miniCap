const fetchShuttleBusLocations = async () => {
    try {
      // first, we get session cookies
      await fetch('https://shuttle.concordia.ca/concordiabusmap/Map.aspx', {
        method: 'GET',
        headers: {
          'Host': 'shuttle.concordia.ca'
        }
      });
      
      // then we make the POST request to get bus locations
      const response = await fetch('https://shuttle.concordia.ca/concordiabusmap/WebService/GService.asmx/GetGoogleObject', {
        method: 'POST',
        headers: {
          'Host': 'shuttle.concordia.ca',
          'Content-Length': '0',
          'Content-Type': 'application/json; charset=UTF-8'
        }
      });
      
      const data = await response.json();
      
      // extract bus points from the response
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
  
  export { fetchShuttleBusLocations };