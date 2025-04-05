// components/directions/RouteHandler.js
import polyline from "@mapbox/polyline";

/**
 * Utility class for handling route calculations and updates
 */
const RouteHandler = {
  /**
   * Fetch route data from Google Directions API
   */
  async fetchRouteData(start, end, mode, apiKey) {
    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/directions/json?origin=${start.latitude},${start.longitude}&destination=${end.latitude},${end.longitude}&mode=${mode}&key=${apiKey}`
      );
      const data = await response.json();
      return data.routes?.length > 0 ? data : null;
    } catch (error) {
      console.error("Error fetching route data:", error);
      return null;
    }
  },

  /**
   * Update route information with segmented polylines
   */
  updateRouteInformation(data, start, end, customRouteInfo, setRouteSegments, setTransferMarkers, setRouteInfo, setDirections, mapRef) {
    const leg = data.routes[0].legs[0];
    
    // Build segments from each step in the leg
    const segments = leg.steps.map((step) => {
        const decoded = polyline.decode(step.polyline.points, 5).map(([lat, lng]) => ({
            latitude: lat,
            longitude: lng,
          }));          
      return {
        coordinates: decoded,
        travelMode: step.travel_mode,
        transit: step.transit_details || null,
        // Store the raw polyline string so we can use it as a stable key
        polylineStr: step.polyline.points,
      };
    });
    setRouteSegments(segments);

    // Determine transfer markers (white dots) at mode transitions or transit vehicle/line changes
    const markers = [];
    for (let i = 0; i < segments.length - 1; i++) {
      const current = segments[i];
      const next = segments[i + 1];
      let shouldAdd = false;
      
      if (current.travelMode !== next.travelMode) {
        shouldAdd = true;
      } else if (
        current.travelMode === "TRANSIT" &&
        current.transit &&
        next.transit
      ) {
        if (
          current.transit.line.vehicle.type !== next.transit.line.vehicle.type ||
          current.transit.line.short_name !== next.transit.line.short_name
        ) {
          shouldAdd = true;
        }
      }
      
      if (shouldAdd) {
        const lastCoord = current.coordinates[current.coordinates.length - 1];
        markers.push(lastCoord);
      }
    }
    setTransferMarkers(markers);

    // Update route summary info and directions list
    setRouteInfo(
      customRouteInfo || { 
        distance: `${leg.distance.text} -`, 
        duration: leg.duration.text 
      }
    );
    
    setDirections(
      leg.steps.map((step, index) => ({
        id: index,
        instruction: step.html_instructions.replace(/<\/?[^>]*>/g, ""),
        distance: step.distance.text,
        duration: step.duration.text,
      }))
    );

    if (mapRef.current) {
      // Fit the map to show start, end and all segment coordinates
      const allCoords = [start, end];
      segments.forEach((segment) => {
        allCoords.push(...segment.coordinates);
      });
      
      setTimeout(() => {
        mapRef.current.fitToCoordinates(allCoords, {
          edgePadding: { top: 50, right: 50, bottom: 50, left: 50 },
          animated: true,
        });
      }, 100);
    }
  }
};

export default RouteHandler;