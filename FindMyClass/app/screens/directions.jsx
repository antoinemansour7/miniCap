import React, { useState, useEffect, useRef } from "react";
import MapView, { Marker, Polyline, Circle } from "react-native-maps";
import * as Location from "expo-location";
import { View, Text, StyleSheet, TouchableOpacity, Alert } from "react-native";
import { useLocalSearchParams } from "expo-router";
import polyline from "@mapbox/polyline";
import { googleAPIKey } from "../../app/secrets";
import LocationSelector from "../../components/directions/LocationSelector";
import ModalSearchBars from "../../components/directions/ModalSearchBars";
import { styles } from "../../styles/directionsStyles";
import SwipeUpModal from "../../components/directions/SwipeUpModal";
import { 
    isNearCampus, 
    getNextShuttleTime, 
    LOYOLA_COORDS, 
    SGW_COORDS,
            } from "../../utils/shuttleUtils";


export default function DirectionsScreen() {
  
       // Retrieve the destination from the params that were passed from the Map page
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
   
       // State management (should always be defined in the same order)
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
       const [selectedStart, setSelectedStart] = useState('userLocation');
       const [selectedDest, setSelectedDest] = useState('current');
       const [customDest, setCustomDest] = useState('');
       const [travelMode, setTravelMode] = useState('WALKING');
       const [customStartName, setCustomStartName] = useState('');
       const [customLocationDetails, setCustomLocationDetails] = useState({
           name: '',
           coordinates: null
       });
       const [customSearchText, setCustomSearchText] = useState('');
       const [isModalVisible, setIsModalVisible] = useState(false);
       const [searchType, setSearchType] = useState("START");
       const [isSwipeModalVisible, setIsSwipeModalVisible] = useState(false);
       const [directions, setDirections] = useState([]);
       const [isShuttleService, setIsShuttleService] = useState(false);
   
       // If there is an error, show the error message inside JSX
       if (errorMessage) {
           return <Text>{errorMessage}</Text>;
       }

    //  calculate circle radius based on zoom level
    const getCircleRadius = () => {
        const baseRadius = 20;
        // Adjust radius inversely to zoom level
        // As zoom increases, radius decreases
        return baseRadius * Math.pow(2, (15 - zoomLevel));
    };

    // calculate zoom level from region
    const calculateZoomLevel = (region) => {
        const LATITUDE_DELTA = region.latitudeDelta;
        // Convert latitude delta to zoom level
        const zoomLevel = Math.round(Math.log2(360 / LATITUDE_DELTA));
        return zoomLevel;
    };


    const updateRouteWithMode = async (start, end, mode) => {
        if (!start || !end) return;
    
        // SHUTTLE mode handling
        if (mode === 'SHUTTLE') {
            const isStartLoyola = isNearCampus(start, LOYOLA_COORDS);
            const isStartSGW = isNearCampus(start, SGW_COORDS);
            const isEndLoyola = isNearCampus(end, LOYOLA_COORDS);
            const isEndSGW = isNearCampus(end, SGW_COORDS);
    
            if ((isStartLoyola && isEndSGW) || (isStartSGW && isEndLoyola)) {
                const fromCampus = isStartLoyola ? 'loyola' : 'sgw';
                const nextTime = getNextShuttleTime(fromCampus);
                
                setDirections([{
                    id: 0,
                    instruction: `Next shuttle departing from ${fromCampus.toUpperCase()} Campus`,
                    distance: 'Shuttle Service',
                    duration: `${nextTime} - 25 min ride`
                }]);
    
                try {
                    const response = await fetch(
                        `https://maps.googleapis.com/maps/api/directions/json?origin=${start.latitude},${start.longitude}&destination=${end.latitude},${end.longitude}&mode=driving&key=${googleAPIKey}`
                    );
                    const data = await response.json();
    
                    if (data.routes && data.routes.length > 0) {
                        const encodedPolyline = data.routes[0].overview_polyline.points;
                        const decodedCoordinates = polyline.decode(encodedPolyline).map(([lat, lng]) => ({
                            latitude: lat,
                            longitude: lng
                        }));
                        setCoordinates([{ coordinates: decodedCoordinates, color: "#912338", width: 4 }]);
                        setRouteInfo({ distance: "Shuttle departing at:", duration: `${nextTime}` });
                    }
                } catch (err) {
                    console.error("Route update error:", err);
                    setError(err.message);
                }
                return;
            } else {
                Alert.alert(
                    "Shuttle Service",
                    "Shuttle service is only available between Loyola and SGW campuses.",
                    [{ text: "OK" }]
                );
                return;
            }
        }
    
        // Handle other modes (DRIVING, WALKING, TRANSIT)
        try {
            setIsLoading(true);
            const modeParam = mode.toLowerCase();
            console.log(`Requesting route with mode: ${modeParam}`);
    
            const response = await fetch(
                `https://maps.googleapis.com/maps/api/directions/json?origin=${start.latitude},${start.longitude}&destination=${end.latitude},${end.longitude}&mode=${modeParam}&key=${googleAPIKey}`
            );
            const data = await response.json();
    
            if (!data.routes || data.routes.length === 0) {
                throw new Error("No route found");
            }
    
            setCoordinates([]);
            const leg = data.routes[0].legs[0];
            setRouteInfo({ distance: `${leg.distance.text} -`, duration: leg.duration.text });
    
            // Extract and process segments from steps
            const extractedSegments = [];
            const extractedDirections = leg.steps.map((step, index) => {
                if (!step.polyline) return null; // Prevents undefined polyline errors
    
                const decodedStep = polyline.decode(step.polyline.points).map(([lat, lng]) => ({
                    latitude: lat,
                    longitude: lng
                }));
    
               // Determine the transport mode and assign properties
                    let segmentColor = "#007AFF"; // Default: Blue
                    let lineWidth = 3; // Default thickness
                    let isDashed = false; // Default: solid line

                    if (step.travel_mode === "WALKING") {
                        segmentColor = "#007AFF"; // Blue for walking
                        lineWidth = 2; // Thinner line
                        isDashed = true; // Dashed for walking
                    } else if (step.travel_mode === "DRIVING") {
                        segmentColor = "#007AFF"; // Blue for car
                        lineWidth = 4; // Thicker than walking
                        isDashed = false; // Solid line for driving
                    } else if (step.travel_mode === "TRANSIT" && step.transit_details) {
                        const { line } = step.transit_details;
                        if (line.vehicle.type === "BUS") {
                            segmentColor = "purple"; // Bus color
                        } else if (line.vehicle.type === "SUBWAY") {
                            if (line.name.includes("Verte")) segmentColor = "green";
                            else if (line.name.includes("Bleue")) segmentColor = "darkblue";
                            else if (line.name.includes("Jaune")) segmentColor = "yellow";
                            else if (line.name.includes("Orange")) segmentColor = "orange";
                        }
                        lineWidth = 6; // Thicker for transit
                        isDashed = false; // Transit lines should be solid
                    }

                    // Store each segment with its correct style
                    extractedSegments.push({
                        id: index,
                        coordinates: decodedStep,
                        color: segmentColor,
                        width: lineWidth,
                        isDashed: isDashed
                    });

    
                return {
                    id: index,
                    instruction: step.html_instructions.replace(/<\/?[^>]*>/g, ''), // Remove HTML tags
                    distance: `${step.distance.text}`,
                    duration: step.duration.text,
                };
            }).filter(Boolean); // Removes null values
    
            setDirections(extractedDirections);
            setCoordinates(extractedSegments);
    
            if (mapRef.current) {
                setTimeout(() => {
                    mapRef.current?.fitToCoordinates(
                        extractedSegments.flatMap(segment => segment.coordinates),
                        {
                            edgePadding: { top: 50, right: 50, bottom: 50, left: 50 },
                            animated: true,
                        }
                    );
                }, 100);
            }
        } catch (err) {
            console.error("Route update error:", err);
            setError(err.message);
        } finally {
            setTimeout(() => {
                setIsLoading(false);
            }, 0);
        }
    };
    

    const updateRoute = async (start, end) => {
        if (!start || !end) return;
    
        console.log("🚀 Ensuring correct mode in updateRoute.");
        setTimeout(() => {
            console.log("🛣 Using mode:", travelMode);
            updateRouteWithMode(start, end, travelMode); // Always uses latest mode
        }, 300); // Give React time to update state
    };

    useEffect(() => {
        console.log("🚀 Travel mode updated, calling updateRoute.");
        if (startLocation && destination) {
            updateRoute(startLocation, destination);
        }
    }, [travelMode]); // Runs only after travelMode updates
    
    useEffect(() => {
        let locationSubscriptionRef = null;
    
        const setupLocationAndRoute = async () => {
            try {
                setIsLoading(true);
    
                const { status } = await Location.requestForegroundPermissionsAsync();
                if (status !== "granted") {
                    throw new Error("Location permission denied");
                }
    
                const initialLocation = await Location.getCurrentPositionAsync({
                    accuracy: Location.Accuracy.High
                });
    
                const newLocation = {
                    latitude: initialLocation.coords.latitude,
                    longitude: initialLocation.coords.longitude,
                };
    
                console.log("📍 Initial user location:", newLocation);
                setUserLocation(newLocation);
    
                if (selectedStart === "userLocation") {
                    setStartLocation(newLocation);
                }
    
                if (locationSubscriptionRef) locationSubscriptionRef.remove();
    
                locationSubscriptionRef = await Location.watchPositionAsync(
                    { accuracy: Location.Accuracy.High, timeInterval: 5000, distanceInterval: 10 },
                    (location) => {
                        const updatedLocation = {
                            latitude: location.coords.latitude,
                            longitude: location.coords.longitude,
                        };
    
                        console.log("📍 Updated user location:", updatedLocation);
                        setUserLocation(updatedLocation);
    
                        if (selectedStart === "userLocation") {
                            setStartLocation(updatedLocation);
                        }
                    }
                );
    
            } catch (err) {
                console.error("🚨 Setup error:", err);
                setError(err.message);
            } finally {
                setIsLoading(false);
            }
        };
    
        setupLocationAndRoute();
    
        return () => {
            console.log("🔄 Cleanup: Removing location watcher...");
            if (locationSubscriptionRef) locationSubscriptionRef.remove();
        };
    }, [destination, selectedStart]); // Keeps selected travelMode
    
    


    const handleCloseModal = () => {
        setIsModalVisible(false);
    };

    const handleSwipeModalClose = () => {
        setIsSwipeModalVisible(false);
    };


    return (
        <View style={styles.mainContainer}>
        
            <View style={styles.container}>


                <View style={styles.mapContainer}>
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
                            <LocationSelector 
                    startLocation={startLocation}
                    setStartLocation={setStartLocation}
                    customStartName={customStartName }
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
                    style={styles.locationSelector}
                />
                           


                        {userLocation && 
                        // selectedStart === 'userLocation' ? 
                        (
                            <Circle
                                testID="user-location-circle"
                                center={userLocation}
                                radius={getCircleRadius()}
                                strokeColor="white"
                                fillColor="rgba(0, 122, 255, 0.7)"
                            />
                        ) 
                        // : null
                        }
                        {startLocation && selectedStart !== 'userLocation' && (
                            <Marker 
                                coordinate={startLocation}
                                title="Start"
                                pinColor="green"
                            />
                        )}
                        {destination && <Marker coordinate={destination} title="Destination" />}
                        {coordinates.length > 0 && coordinates.map((segment, index) => (
                            <Polyline 
                                key={index}
                                coordinates={segment.coordinates}
                                strokeWidth={segment.width}
                                strokeColor={segment.color}
                                lineDashPattern={segment.isDashed ? [5, 5] : undefined} // Dashed for walking only
                            />
                        ))}
                        
                    </MapView>
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
                {/* {routeInfo && (

                    <SwipeUpModal
                        distance={routeInfo.distance}
                        duration={routeInfo.duration}
                        directions={directions}
                    
                    /> 
                )} */}
            
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
                <SwipeUpModal
                    distance={routeInfo.distance}
                    duration={routeInfo.duration}
                    directions={directions}
                />
            )}
        </View>
    );
}

// Add these new styles at the bottom of your existing styles
const stylesModal = StyleSheet.create({
    modalContent: {
        flex: 1,
    },
    compactView: {
        height: 40,
        justifyContent: 'center',
    },
    expandedView: {
       // flex:  ,
        marginTop: 20,
        paddingTop: 20,
        borderTopWidth: 1,
        borderTopColor: '#EBEBEB',
    },
    mainText: {
        fontWeight: 'bold',
        fontSize: 16,
        marginBottom: 4,
    },
    subText: {
        fontSize: 14,
        color: '#666',
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 15,
    },
    modalText: {
        fontSize: 16,
        marginBottom: 10,
    },
    // ...existing styles...
    locationSelector: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 2,
    },
    mapContainer: {
        flex: 1,
        marginTop: 180, // Adjust based on LocationSelector height
    },
    loadingCard: {
        position: "absolute",
        bottom: 40,
        left: 20,
        right: 20,
        backgroundColor: 'white',
        padding: 10,
        borderRadius: 8,
        zIndex: 1,
    },
    errorCard: {
        position: 'absolute',
        top: 50,
        width: '100%',
        alignItems: 'center',
        zIndex: 1,
    },
});

