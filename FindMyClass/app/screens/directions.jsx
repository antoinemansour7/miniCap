// DirectionsScreen.js
import React, { useState, useEffect, useRef } from "react";
import { View, Text, StyleSheet, Alert } from "react-native";
import { useLocalSearchParams } from "expo-router";
import * as Location from "expo-location";
import { googleAPIKey } from "../../app/secrets";
import { 
  isNearCampus, 
  getNextShuttleTime, 
  getNextThreeShuttleTimes,
  LOYOLA_COORDS, 
  SGW_COORDS,
  getLoyolaShuttleStop,
  getSGWShuttleStop
} from "../../utils/shuttleUtils";
import LocationSelector from "../../components/directions/LocationSelector";
import ModalSearchBars from "../../components/directions/ModalSearchBars";
import SwipeUpModal from "../../components/directions/SwipeUpModal";
import DirectionsMap from "../../components/directions/DirectionsMap";
import RouteHandler from "../../components/directions/RouteHandler";
import IndoorDirectionsHandler from "../../components/directions/IndoorDirectionsHandler";

export default function DirectionsScreen() {
  // Parse destination from params
  const params = useLocalSearchParams();
  const [errorMessage, parsedDestination, buildingName] = parseDestinationParams(params);

  // State management
  const [destinationName, setDestinationName] = useState(buildingName);
  const [destination, setDestination] = useState(parsedDestination);
  const [userLocation, setUserLocation] = useState(null);
  const [startLocation, setStartLocation] = useState(null);
  const [routeSegments, setRouteSegments] = useState([]);
  const [transferMarkers, setTransferMarkers] = useState([]);
  const [routeInfo, setRouteInfo] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [zoomLevel, setZoomLevel] = useState(20);
  const [selectedStart, setSelectedStart] = useState("userLocation");
  const [selectedDest, setSelectedDest] = useState("current");
  const [customDest, setCustomDest] = useState("");
  const [travelMode, setTravelMode] = useState("WALKING");
  const [customStartName, setCustomStartName] = useState("");
  const [customLocationDetails, setCustomLocationDetails] = useState({
    name: "",
    coordinates: null,
  });
  const [customSearchText, setCustomSearchText] = useState("");
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [searchType, setSearchType] = useState("START");
  const [directions, setDirections] = useState([]);
  const [room, setRoom] = useState(null);
  const [nextShuttles, setNextShuttles] = useState([]);
  const [shuttleStopLocation, setShuttleStopLocation] = useState(null);
  
  // Indoor navigation states
  const [floorNumber, setFloorNumber] = useState(0);
  const [floorStartLocation, setFloorStartLocation] = useState({
    xcoord: 0,
    ycoord: 0
  });
  const [floorEndLocation, setFloorEndLocation] = useState({
    xcoord: 0,
    ycoord: 0
  });

  const mapRef = useRef(null);
  const latestModeRef = useRef(travelMode);
  const errorTimeoutRef = useRef(null);
  
  // Update the latestModeRef when travelMode changes
  useEffect(() => {
    latestModeRef.current = travelMode;
  }, [travelMode]);

  // Handle location setup and route initialization
  useEffect(() => {
    let locationSubscription;

    const setupLocationAndRoute = async () => {
      try {
        setIsLoading(true);
        await setupUserLocation(
          setUserLocation,
          setStartLocation,
          selectedStart,
          updateRoute,
          destination
        );
        
        // Set up location watching
        locationSubscription = await watchUserLocation(
          setUserLocation,
          setStartLocation,
          selectedStart,
          updateRoute,
          destination
        );
      } catch (err) {
        console.error("Setup error:", err);
        handleError(err);
      } finally {
        setIsLoading(false);
      }
    };

    setupLocationAndRoute();
    return () => {
      locationSubscription?.remove();
      if (errorTimeoutRef.current) {
        clearTimeout(errorTimeoutRef.current);
      }
    };
  }, [destination, selectedStart]);

  // Route updating function
  const updateRoute = (start, end) => {
    if (room) {
      // Handle indoor navigation setup
      IndoorDirectionsHandler.setupIndoorNavigation(
        room,
        setFloorNumber,
        setFloorStartLocation,
        setFloorEndLocation
      );
    }  
    updateRouteWithMode(start, end, travelMode);
  };

  // Route updating with mode
  const updateRouteWithMode = async (start, end, mode) => {
    if (!start || !end) return;
    
    if (mode === "SHUTTLE") {
      handleShuttleMode(start, end);
    } else {
      handleOtherModes(start, end, mode);
    }
  };

  // Check if user is within 15 minutes of a campus
  const isWithin15MinOfCampus = async (location, campusCoords) => {
    try {
      const routeData = await RouteHandler.fetchRouteData(location, campusCoords, "walking", googleAPIKey);
      if (!routeData || !routeData.routes || !routeData.routes[0] || !routeData.routes[0].legs) {
        return false;
      }
      
      const durationInMinutes = routeData.routes[0].legs[0].duration.value / 60;
      return durationInMinutes <= 15;
    } catch (err) {
      console.error("Error checking proximity to campus:", err);
      return false;
    }
  };

  // Get shuttle stop based on campus
  const getShuttleStopForCampus = (campusType) => {
    return campusType === "loyola" ? getLoyolaShuttleStop() : getSGWShuttleStop();
  };

  // Handle shuttle mode
  const handleShuttleMode = async (start, end) => {
    const isStartLoyola = isNearCampus(start, LOYOLA_COORDS);
    const isStartSGW = isNearCampus(start, SGW_COORDS);
    const isEndLoyola = isNearCampus(end, LOYOLA_COORDS);
    const isEndSGW = isNearCampus(end, SGW_COORDS);

    if (!((isStartLoyola && isEndSGW) || (isStartSGW && isEndLoyola))) {
      return Alert.alert(
        "Shuttle Service",
        "Shuttle service is only available between Loyola and SGW campuses.",
        [{ text: "OK" }]
      );
    }

    const fromCampus = isStartLoyola ? "loyola" : "sgw";
    const shuttleTimes = getNextThreeShuttleTimes(fromCampus);
    setNextShuttles(shuttleTimes);
    
    // Get shuttle stop coordinates based on departure campus
    const shuttleStop = getShuttleStopForCampus(fromCampus);
    setShuttleStopLocation(shuttleStop);
    
    // Check if user is within 15 minutes of departure campus
    const isNearDeparture = await isWithin15MinOfCampus(start, fromCampus === "loyola" ? LOYOLA_COORDS : SGW_COORDS);
    
    if (isNearDeparture) {
      // If within 15 minutes, show walking directions to shuttle stop
      try {
        setIsLoading(true);
        
        // Get walking directions to the shuttle stop
        const walkingRouteData = await RouteHandler.fetchRouteData(start, shuttleStop, "walking", googleAPIKey);
        if (latestModeRef.current !== "SHUTTLE") return;
        
        if (!walkingRouteData) {
          throw new Error("Could not find walking directions to shuttle stop");
        }
        
        // Format the shuttle times for display
        const shuttleDirections = shuttleTimes.map((time, index) => ({
          id: index,
          instruction: `Shuttle ${index === 0 ? 'departing' : 'departs'} ${fromCampus.toUpperCase()} Campus`,
          distance: index === 0 ? "Next shuttle" : `Shuttle #${index + 1}`,
          duration: `${time} - 25 min ride`,
        }));
        
        // Add walking directions to the shuttle stop
        RouteHandler.updateRouteInformation(
          walkingRouteData,
          start,
          shuttleStop,
          {
              distance: `Next shuttle: ${shuttleTimes[0]},`,
              duration: "25 min ride",
          },
          setRouteSegments,
          setTransferMarkers,
          setRouteInfo,
          (walkingSteps) => {
            // Append shuttle information to walking directions
            setDirections([...walkingSteps, ...shuttleDirections]);
          },
          mapRef
        );
      } catch (err) {
        handleError(err);
      } finally {
        setIsLoading(false);
      }
    } else {
      // If not within 15 minutes, show the full route including driving to campus
      const shuttleTimeInfo = shuttleTimes[0];
      
      setDirections([
        {
          id: 0,
          instruction: `Next shuttle departing from ${fromCampus.toUpperCase()} Campus`,
          distance: "Shuttle Service",
          duration: `${shuttleTimeInfo} - 25 min ride`,
        },
      ]);

      try {
        const routeData = await RouteHandler.fetchRouteData(start, end, "driving", googleAPIKey);
        if (latestModeRef.current !== "SHUTTLE") return;
        if (!routeData) return;

        RouteHandler.updateRouteInformation(
          routeData,
          start,
          end,
          {
            distance: "Shuttle departing at:",
            duration: shuttleTimeInfo,
          },
          setRouteSegments,
          setTransferMarkers,
          setRouteInfo,
          (drivingSteps) => {
            // Create a merged list of directions with shuttle information
            const shuttleDirections = shuttleTimes.map((time, index) => ({
              id: drivingSteps.length + index,
              instruction: `Shuttle ${index === 0 ? 'departing' : 'departs'} ${fromCampus.toUpperCase()} Campus`,
              distance: index === 0 ? "Next shuttle" : `Shuttle #${index + 1}`,
              duration: `${time} - 25 min ride`,
            }));
            
            setDirections([...drivingSteps, ...shuttleDirections]);
          },
          mapRef
        );
      } catch (err) {
        handleError(err);
      }
    }
  };

  // Handle other travel modes
  const handleOtherModes = async (start, end, mode) => {
    try {
      setIsLoading(true);
      const routeData = await RouteHandler.fetchRouteData(start, end, mode.toLowerCase(), googleAPIKey);
      if (latestModeRef.current !== mode) return;
      if (!routeData) throw new Error("No route found");

      RouteHandler.updateRouteInformation(
        routeData,
        start,
        end,
        null,
        setRouteSegments,
        setTransferMarkers,
        setRouteInfo,
        setDirections,
        mapRef
      );
    } catch (err) {
      handleError(err);
    } finally {
      setTimeout(() => setIsLoading(false), 0);
    }
  };

  // Handle errors with timeout to prevent multiple alerts
  const handleError = (err) => {
    console.error("Route update error:", err);
    
    // Clear any existing error timeout
    if (errorTimeoutRef.current) {
      clearTimeout(errorTimeoutRef.current);
    }
    
    setError(err.message);
    
    // Auto-clear error after 5 seconds
    errorTimeoutRef.current = setTimeout(() => {
      setError(null);
    }, 5000);
  };

  const handleCloseModal = () => {
    setIsModalVisible(false);
  };

  if (errorMessage) {
    return (
      <View style={styles.errorFullScreen}>
        <Text style={styles.errorFullScreenText}>{errorMessage}</Text>
      </View>
    );
  }

  return (
    <View style={styles.mainContainer}>
      <View style={styles.floatingContainer}>
        <LocationSelector
          startLocation={startLocation}
          setStartLocation={setStartLocation}
          customStartName={customStartName}
          selectedStart={selectedStart}
          setSelectedStart={setSelectedStart}
          userLocation={userLocation}
          setUserLocation={setUserLocation}
          buildingName={buildingName}
          destinationName={destinationName}
          destination={destination}
          parsedDestination={parsedDestination}
          selectedDest={selectedDest}
          setSelectedDest={setSelectedDest}
          setDestination={setDestination}
          setDestinationName={setDestinationName}
          travelMode={travelMode}
          setTravelMode={setTravelMode}
          setIsModalVisible={setIsModalVisible}
          setSearchType={setSearchType}
          updateRouteWithMode={updateRouteWithMode}
          updateRoute={updateRoute}
          setRoom={setRoom}
        />
      </View>
      
      <View style={styles.container}>
        <View style={styles.mapContainer}>
          <DirectionsMap
            mapRef={mapRef}
            destination={destination}
            userLocation={userLocation}
            startLocation={startLocation}
            selectedStart={selectedStart}
            routeSegments={routeSegments}
            transferMarkers={transferMarkers}
            setZoomLevel={setZoomLevel}
            zoomLevel={zoomLevel}
            room={room}
            floorNumber={floorNumber}
            pathCoordinates={
              room ? IndoorDirectionsHandler.calculatePathCoordinates(
                floorStartLocation, 
                floorEndLocation
              ) : []
            }
            shuttleStopLocation={travelMode === "SHUTTLE" ? shuttleStopLocation : null}
          />
        </View>

        {isLoading && (
          <View style={styles.loadingCard}>
            <Text style={styles.loadingText}>Loading route...</Text>
          </View>
        )}
        
        {error && (
          <View style={styles.errorCard}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}
      </View>

      {routeInfo && directions.length > 0 && (
        <SwipeUpModal 
          distance={routeInfo.distance} 
          duration={routeInfo.duration} 
          directions={directions}
          nextShuttles={travelMode === "SHUTTLE" ? nextShuttles : null}
        />
      )}
      
      <ModalSearchBars
        searchType={searchType}
        isModalVisible={isModalVisible}
        handleCloseModal={handleCloseModal}
        updateRoute={updateRoute}
        startLocation={startLocation}
        setStartLocation={setStartLocation}
        customSearchText={customSearchText}
        setCustomSearchText={setCustomSearchText}
        setCustomStartName={setCustomStartName}
        customLocationDetails={customLocationDetails}
        setCustomLocationDetails={setCustomLocationDetails}
        destination={destination}
        setDestination={setDestination}
        customDest={customDest}
        setCustomDest={setCustomDest}
        setDestinationName={setDestinationName}
        setRoom={setRoom}
      />
    </View>
  );
}

// Helper function to parse destination params
function parseDestinationParams(params) {
  let parsedDestination = null;
  let errorMessage = null;

  if (!params || !params.destination) {
    console.error("Missing destination in navigation!");
    errorMessage = "Error: No destination provided.";
  } else {
    try {
      parsedDestination = JSON.parse(params.destination);
    } catch (error) {
      console.error("Error parsing destination:", error);
      errorMessage = "Error: Invalid destination format.";
    }

    if (
      !parsedDestination ||
      !parsedDestination.latitude ||
      !parsedDestination.longitude
    ) {
      console.error("Invalid destination:", parsedDestination);
      errorMessage = "Error: Invalid destination coordinates.";
    }
  }

  const buildingName = params?.buildingName || "No Destination set";
  return [errorMessage, parsedDestination, buildingName];
}

// Helper function to set up user location
async function setupUserLocation(
  setUserLocation, 
  setStartLocation, 
  selectedStart, 
  updateRoute, 
  destination
) {
  let { status } = await Location.requestForegroundPermissionsAsync();
  if (status !== "granted") {
    throw new Error("Location permission denied");
  }

  // 1. Get the last known location for a fast response
  const lastKnown = await Location.getLastKnownPositionAsync();
  if (lastKnown) {
    const quickLocation = {
      latitude: lastKnown.coords.latitude,
      longitude: lastKnown.coords.longitude,
    };
    setUserLocation(quickLocation);
    if (selectedStart === "userLocation") {
      setStartLocation(quickLocation);
      updateRoute(quickLocation, destination);
    }
  }

  // 2. Then, get the precise current position
  const precise = await Location.getCurrentPositionAsync({
    accuracy: Location.Accuracy.High,
  });
  const newLocation = {
    latitude: precise.coords.latitude,
    longitude: precise.coords.longitude,
  };

  setUserLocation(newLocation);
  if (selectedStart === "userLocation") {
    setStartLocation(newLocation);
    updateRoute(newLocation, destination);
  }
  
  return newLocation;
}

// Helper function to watch user location
async function watchUserLocation(
  setUserLocation, 
  setStartLocation, 
  selectedStart, 
  updateRoute, 
  destination
) {
  return await Location.watchPositionAsync(
    {
      accuracy: Location.Accuracy.High,
      timeInterval: 5000,
      distanceInterval: 10,
    },
    (location) => {
      const updatedLocation = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      };
      setUserLocation(updatedLocation);
      if (selectedStart === "userLocation") {
        setStartLocation(updatedLocation);
        updateRoute(updatedLocation, destination);
      }
    }
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  mapContainer: {
    flex: 1,
  },
  floatingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
  },
  loadingCard: {
    position: "absolute",
    bottom: 40,
    left: 20,
    right: 20,
    backgroundColor: "white",
    padding: 15,
    borderRadius: 12,
    zIndex: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  loadingText: {
    textAlign: "center",
    fontSize: 16,
    fontWeight: "500",
  },
  errorCard: {
    position: "absolute",
    top: 50,
    left: 20,
    right: 20,
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    padding: 12,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: "#ff3b30",
    zIndex: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 3,
  },
  errorText: {
    color: "#ff3b30",
    fontWeight: "500",
    fontSize: 14,
  },
  errorFullScreen: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f8f8f8",
    padding: 20,
  },
  errorFullScreenText: {
    color: "#ff3b30",
    fontSize: 16,
    fontWeight: "500",
    textAlign: "center",
  },
});