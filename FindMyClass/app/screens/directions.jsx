import React, { useState, useEffect, useRef } from "react";
import MapView, { Marker, Polyline, Circle } from "react-native-maps";
import * as Location from "expo-location";
import { View, Text, StyleSheet, Alert } from "react-native";
import { useLocalSearchParams } from "expo-router";
import polyline from "@mapbox/polyline";
import { googleAPIKey } from "../../app/secrets";
import LocationSelector from "../../components/directions/LocationSelector";
import ModalSearchBars from "../../components/directions/ModalSearchBars";
import SwipeUpModal from "../../components/directions/SwipeUpModal";
import { 
  isNearCampus, 
  getNextShuttleTime, 
  LOYOLA_COORDS, 
  SGW_COORDS,
} from "../../utils/shuttleUtils";

export default function DirectionsScreen() {
  // Retrieve the destination from the params
  const params = useLocalSearchParams();

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

    if (!parsedDestination || !parsedDestination.latitude || !parsedDestination.longitude) {
      console.error("Invalid destination:", parsedDestination);
      errorMessage = "Error: Invalid destination coordinates.";
    }
  }

  const buildingName = params?.buildingName || "No Destination set";

  // State management
  const [destinationName, setDestinationName] = useState(buildingName);
  const mapRef = useRef(null);
  const [destination, setDestination] = useState(parsedDestination);
  const [userLocation, setUserLocation] = useState(null);
  const [startLocation, setStartLocation] = useState(null);
  const [routeSegments, setRouteSegments] = useState([]); // each segment has its own coordinates and mode info
  const [transferMarkers, setTransferMarkers] = useState([]); // white dot markers for mode changes
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

  if (errorMessage) {
    return <Text>{errorMessage}</Text>;
  }

  // Calculate circle radius based on zoom level
  const getCircleRadius = () => {
    const baseRadius = 20;
    return baseRadius * Math.pow(2, 15 - zoomLevel);
  };

  const calculateZoomLevel = (region) => {
    const LATITUDE_DELTA = region.latitudeDelta;
    return Math.round(Math.log2(360 / LATITUDE_DELTA));
  };

  // Helper: determine the polyline style based on travel mode and transit details
  const getPolylineStyle = (segment) => {
    let color = "#912338"; // default
    let lineDashPattern = undefined;
    if (segment.travelMode === "WALKING") {
      // Use same color as CAR/SHUTTLE and maintain dotted pattern
      color = "#912338";
      lineDashPattern = [1, 4];
    } else if (segment.travelMode === "TRANSIT" && segment.transit) {
      const vehicleType = segment.transit.line.vehicle.type;
      if (vehicleType === "BUS") {
        color = "purple";
      } else if (vehicleType === "METRO" || vehicleType === "SUBWAY") {
        // Choose color based on line short name
        const lineName = segment.transit.line.name;
        if (lineName.includes("Verte")) color = "green";
        else if (lineName.includes("Jaune")) color = "yellow";
        else if (lineName.includes("Orange")) color = "orange";
        else if (lineName.includes("Bleue")) color = "darkblue";
        else color = "grey"; // default metro color
      } else if (vehicleType === "TRAIN") {
        color = "lightgrey";
      } else {
        color = "#912338";
      }
    } else if (segment.travelMode === "DRIVING") {
      color = "#912338";
    }
    return { color, lineDashPattern };
  };

  // Function to handle shuttle mode
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
    const nextTime = getNextShuttleTime(fromCampus);
    setDirections([
      {
        id: 0,
        instruction: `Next shuttle departing from ${fromCampus.toUpperCase()} Campus`,
        distance: "Shuttle Service",
        duration: `${nextTime} - 25 min ride`,
      },
    ]);
  
    try {
      const routeData = await fetchRouteData(start, end, "driving");
      if (!routeData) return;
      
      updateRouteInformation(routeData, start, end, { distance: "Shuttle departing at:", duration: `${nextTime}` });
    } catch (err) {
      handleError(err);
    }
  };

  // Function to handle other modes
  const handleOtherModes = async (start, end, mode) => {
    try {
      setIsLoading(true);
      const routeData = await fetchRouteData(start, end, mode.toLowerCase());
      if (!routeData) throw new Error("No route found");
  
      updateRouteInformation(routeData, start, end);
    } catch (err) {
      handleError(err);
    } finally {
      setTimeout(() => setIsLoading(false), 0);
    }
  };

  // Function to fetch route update
  const fetchRouteData = async (start, end, mode) => {
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/directions/json?origin=${start.latitude},${start.longitude}&destination=${end.latitude},${end.longitude}&mode=${mode}&key=${googleAPIKey}`
    );
    const data = await response.json();
    return data.routes?.length > 0 ? data : null;
  };

  // Updated function to update route information with segmented polylines
  const updateRouteInformation = (data, start, end, customRouteInfo = null) => {
    const leg = data.routes[0].legs[0];
    // Build segments from each step in the leg
    const segments = leg.steps.map((step, index) => {
      const decoded = polyline.decode(step.polyline.points).map(([lat, lng]) => ({
        latitude: lat,
        longitude: lng,
      }));
      return {
        coordinates: decoded,
        travelMode: step.travel_mode, // e.g., "WALKING", "TRANSIT", "DRIVING"
        transit: step.transit_details || null,
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
    setRouteInfo(customRouteInfo || { distance: `${leg.distance.text} -`, duration: leg.duration.text });
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
      segments.forEach(segment => {
        allCoords.push(...segment.coordinates);
      });
      setTimeout(() => {
        mapRef.current.fitToCoordinates(allCoords, {
          edgePadding: { top: 50, right: 50, bottom: 50, left: 50 },
          animated: true,
        });
      }, 100);
    }
  };

  // Function to handle errors
  const handleError = (err) => {
    console.error("Route update error:", err);
    setError(err.message);
  };

  const updateRouteWithMode = async (start, end, mode) => {
    if (!start || !end) return;

    if (mode === "SHUTTLE") {
      return handleShuttleMode(start, end);
    }
    // Other modes
    return handleOtherModes(start, end, mode);
  };

  const updateRoute = (start, end) => {
    updateRouteWithMode(start, end, travelMode);
  };

  useEffect(() => {
    let locationSubscription;

    const setupLocationAndRoute = async () => {
      try {
        setIsLoading(true);
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") {
          throw new Error("Location permission denied");
        }

        // 1. First, get the last known location for a fast response.
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

        // 2. Then, get the precise current position.
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

        locationSubscription = await Location.watchPositionAsync(
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
      } catch (err) {
        console.error("Setup error:", err);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    setupLocationAndRoute();
    return () => locationSubscription?.remove();
  }, [destination, selectedStart]);

  const handleCloseModal = () => {
    setIsModalVisible(false);
  };

  return (
    <View style={stylesB.mainContainer}>
      <View style={stylesB.container}>
        {/* Place the LocationSelector ABOVE the MapView */}
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
        />

        {/* Now the map is below the selector */}
        <View style={stylesB.mapContainer}>
          <MapView
            ref={mapRef}
            style={{ flex: 1 }}
            initialRegion={{
              latitude: destination.latitude,
              longitude: destination.longitude,
              latitudeDelta: 0.05,
              longitudeDelta: 0.05,
            }}
            onRegionChangeComplete={(region) => {
              const newZoomLevel = calculateZoomLevel(region);
              setZoomLevel(newZoomLevel);
            }}
            testID="map-view"
          >
            {userLocation && (
              <Circle
                testID="user-location-circle"
                center={userLocation}
                radius={getCircleRadius()}
                strokeColor="white"
                fillColor="rgba(0, 122, 255, 0.7)"
              />
            )}
            {startLocation && selectedStart !== "userLocation" && (
              <Marker coordinate={startLocation} title="Start" pinColor="green" />
            )}
            {destination && <Marker coordinate={destination} title="Destination" />}
            {/* Render each route segment with its own style */}
            {routeSegments.map((segment, index) => {
              const style = getPolylineStyle(segment);
              return (
                <Polyline
                  key={`segment-${index}`}
                  coordinates={segment.coordinates}
                  strokeWidth={2}
                  strokeColor={style.color}
                  lineDashPattern={style.lineDashPattern}
                />
              );
            })}
            {/* Render white circle markers at transfers */}
            {transferMarkers.map((marker, index) => (
              <Marker key={`transfer-${index}`} coordinate={marker}>
                <View style={stylesB.transferMarker} />
              </Marker>
            ))}
            {/* Render bus number markers at midpoint of bus transit segments */}
            {routeSegments.map((segment, index) => {
              if (
                segment.travelMode === "TRANSIT" &&
                segment.transit &&
                segment.transit.line.vehicle.type === "BUS"
              ) {
                // Extract bus number from the transit line's short_name.
                // (Here we simply use the short_name; adjust extraction if needed.)
                const busNumber = segment.transit.line.short_name;
                // Calculate midpoint of the segment coordinates.
                const midIndex = Math.floor(segment.coordinates.length / 2);
                const midCoord = segment.coordinates[midIndex];
                return (
                  <Marker
                    key={`bus-${index}`}
                    coordinate={midCoord}
                    anchor={{ x: 0.5, y: 0.5 }}
                  >
                    <View style={stylesB.busNumberContainer}>
                      <Text style={stylesB.busNumberText}>{busNumber}</Text>
                    </View>
                  </Marker>
                );
              }
              return null;
            })}
          </MapView>
        </View>

        {isLoading && (
          <View style={stylesB.loadingCard}>
            <Text style={stylesB.loadingText}>Loading route...</Text>
          </View>
        )}
        {error && (
          <View style={stylesB.errorCard}>
            <Text style={stylesB.errorText}>{error}</Text>
          </View>
        )}
      </View>

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
      />
      {routeInfo && directions.length > 0 && (
        <SwipeUpModal distance={routeInfo.distance} duration={routeInfo.duration} directions={directions} />
      )}
    </View>
  );
}

const stylesB = StyleSheet.create({
  mainContainer: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  mapContainer: {
    flex: 1,
  },
  loadingCard: {
    position: "absolute",
    bottom: 40,
    left: 20,
    right: 20,
    backgroundColor: "white",
    padding: 10,
    borderRadius: 8,
    zIndex: 1,
  },
  loadingText: {
    textAlign: "center",
    fontSize: 16,
  },
  errorCard: {
    position: "absolute",
    top: 50,
    width: "100%",
    alignItems: "center",
    zIndex: 1,
  },
  errorText: {
    backgroundColor: "white",
    padding: 8,
    borderRadius: 5,
    color: "red",
    fontWeight: "bold",
  },
  transferMarker: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "white",
    borderColor: "black",
    borderWidth: 1,
  },
  busNumberContainer: {
    backgroundColor: "white",
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: "black",
  },
  busNumberText: {
    fontSize: 12,
    fontWeight: "bold",
    color: "black",
  },
});
