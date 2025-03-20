import React, { useState, useEffect, useRef } from "react";
import MapView, { Marker, Polyline, Circle } from "react-native-maps";
import * as Location from "expo-location";
import { View, Text, StyleSheet, TouchableOpacity, Alert } from "react-native";
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
  SGW_COORDS,x
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
  const [coordinates, setCoordinates] = useState([]);
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

  //  calculate circle radius based on zoom level
  const getCircleRadius = () => {
    const baseRadius = 20;
    return baseRadius * Math.pow(2, 15 - zoomLevel);
  };

  const calculateZoomLevel = (region) => {
    const LATITUDE_DELTA = region.latitudeDelta;
    return Math.round(Math.log2(360 / LATITUDE_DELTA));
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
      
      updateRouteInformation(routeData, start, end,  { distance: "Shuttle departing at:", duration: `${nextTime}` });
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

  // Function to update route information
  const updateRouteInformation = (data, start, end, customRouteInfo = null) => {
    const encodedPolyline = data.routes[0].overview_polyline.points;
    const decodedCoordinates = polyline.decode(encodedPolyline).map(([lat, lng]) => ({ latitude: lat, longitude: lng }));
    
    setCoordinates(decodedCoordinates);
    const leg = data.routes[0].legs[0];
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
      setTimeout(() => {
        mapRef.current.fitToCoordinates([start, end, ...decodedCoordinates], {
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

        const initialLocation = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.High,
        });
        const newLocation = {
          latitude: initialLocation.coords.latitude,
          longitude: initialLocation.coords.longitude,
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
            setTimeout(() => {
              setUserLocation(updatedLocation);
              if (selectedStart === "userLocation") {
                setStartLocation(updatedLocation);
                updateRoute(updatedLocation, destination);
              }
            }, 0);
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
          // style={stylesB.locationSelector} // No absolute positioning
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
            {coordinates.length > 0 && (
              <Polyline coordinates={coordinates} strokeWidth={2} strokeColor="#912338" />
            )}
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
    // If you want a gap below the selector, you can add padding or margin here
    // paddingTop: 20,
  },
  mapContainer: {
    flex: 1,
    // marginTop: 10, // or some margin if you want to separate from the LocationSelector
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
});