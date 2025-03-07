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


    const fetchRouteData = async (start, end, mode) => {
        try {
            const response = await fetch(
                `https://maps.googleapis.com/maps/api/directions/json?origin=${start.latitude},${start.longitude}&destination=${end.latitude},${end.longitude}&mode=${mode.toLowerCase()}&key=${googleAPIKey}`
            );
            const data = await response.json();
            if (!data.routes || data.routes.length === 0) throw new Error("No route found");
            return data;
        } catch (err) {
            console.error("Route fetch error:", err);
            throw err;
        }
    };
    
    const processShuttleMode = async (start, end) => {
        const isStartLoyola = isNearCampus(start, LOYOLA_COORDS);
        const isStartSGW = isNearCampus(start, SGW_COORDS);
        const isEndLoyola = isNearCampus(end, LOYOLA_COORDS);
        const isEndSGW = isNearCampus(end, SGW_COORDS);
    
        if (!(isStartLoyola && isEndSGW) && !(isStartSGW && isEndLoyola)) {
            Alert.alert("Shuttle Service", "Shuttle service is only available between Loyola and SGW campuses.", [{ text: "OK" }]);
            return;
        }
    
        const fromCampus = isStartLoyola ? "loyola" : "sgw";
        const nextTime = getNextShuttleTime(fromCampus);
    
        setDirections([
            {
                id: 0,
                instruction: `Next shuttle departing from ${fromCampus.toUpperCase()} Campus`,
                distance: "Shuttle Service",
                duration: `${nextTime} - 25 min ride`
            }
        ]);
    
        try {
            const data = await fetchRouteData(start, end, "driving");
            const encodedPolyline = data.routes[0].overview_polyline.points;
            const decodedCoordinates = polyline.decode(encodedPolyline).map(([lat, lng]) => ({
                latitude: lat,
                longitude: lng
            }));
    
            setCoordinates([{ coordinates: decodedCoordinates, color: "#912338", width: 4 }]);
            setRouteInfo({ distance: "Shuttle departing at:", duration: `${nextTime}` });
        } catch (err) {
            setError(err.message);
        }
    };
    
    const processRouteData = (data) => {
        setCoordinates([]);
        const leg = data.routes[0].legs[0];
        setRouteInfo({ distance: `${leg.distance.text} -`, duration: leg.duration.text });
    
        const extractedSegments = [];
        const extractedDirections = leg.steps.map((step, index) => {
            if (!step.polyline) return null;
    
            const decodedStep = polyline.decode(step.polyline.points).map(([lat, lng]) => ({
                latitude: lat,
                longitude: lng
            }));
    
            let segmentColor = "#912238";
            let lineWidth = 3;
            let isDashed = false;
            let transportType = step.travel_mode;
            let transferPoint = null;
            let transportLabel = null;
            let isBus = false;
            let isMetro = false;
    
            if (transportType === "WALKING") {
                segmentColor = "#912338";
                lineWidth = 2;
                isDashed = true;
            } else if (transportType === "TRANSIT" && step.transit_details) {
                const { line } = step.transit_details;
                transportLabel = line.short_name || line.name;
    
                if (line.vehicle.type === "BUS") {
                    segmentColor = "purple";
                    isBus = true;
                } else if (line.vehicle.type === "SUBWAY") {
                    segmentColor = getMetroLineColor(line.name);
                    isMetro = true;
                }
    
                lineWidth = 6;
                isDashed = false;
                transferPoint = detectTransferPoint(leg.steps, index, decodedStep, line);
            }
    
            if (transferPoint) {
                extractedSegments.push({
                    id: `transfer-${index}`,
                    coordinates: [transferPoint],
                    color: "black",
                    width: 6,
                    isDashed: false,
                    transportLabel: "Transfer Point"
                });
            }
    
            extractedSegments.push({
                id: index,
                coordinates: decodedStep,
                color: segmentColor,
                width: lineWidth,
                isDashed: isDashed,
                transportLabel: transportLabel,
                transferPoint: transferPoint,
                isBus: isBus,
                isMetro: isMetro
            });
    
            return {
                id: index,
                instruction: step.html_instructions.replace(/<\/?[a-z][a-z0-9]*\b[^>]*>/gi, ""),
                distance: `${step.distance.text}`,
                duration: step.duration.text
            };
        }).filter(Boolean);
    
        setDirections(extractedDirections);
        setCoordinates(extractedSegments);
    
        if (mapRef.current) {
            setTimeout(() => {
                mapRef.current?.fitToCoordinates(
                    extractedSegments.flatMap(segment => segment.coordinates),
                    { edgePadding: { top: 50, right: 50, bottom: 50, left: 50 }, animated: true }
                );
            }, 100);
        }
    };
    
    const getMetroLineColor = (lineName) => {
        if (lineName.includes("Verte")) return "green";
        if (lineName.includes("Bleue")) return "darkblue";
        if (lineName.includes("Jaune")) return "yellow";
        if (lineName.includes("Orange")) return "orange";
        return "#000"; // Default color
    };
    
    const detectTransferPoint = (steps, index, decodedStep, currentLine) => {
        if (index === 0) return null;
        const prevStep = steps[index - 1];
        const prevTransportType = prevStep.travel_mode;
        const prevLine = prevStep.transit_details?.line;
    
        if (prevTransportType === "WALKING" && currentLine) return decodedStep[0];
    
        if (prevTransportType === "TRANSIT" && prevLine && prevLine.vehicle.type !== currentLine.vehicle.type) {
            return prevStep.transit_details?.arrival_stop
                ? {
                    latitude: prevStep.transit_details.arrival_stop.location.lat,
                    longitude: prevStep.transit_details.arrival_stop.location.lng
                }
                : decodedStep[0];
        }
    
        if (prevTransportType === "TRANSIT" && prevLine?.vehicle.type === "SUBWAY" && prevLine.name !== currentLine.name) {
            return decodedStep[0];
        }
    
        return null;
    };
    
    const updateRouteWithMode = async (start, end, mode) => {
        if (!start || !end) return;
    
        try {
            setIsLoading(true);
    
            if (mode === "SHUTTLE") {
                await processShuttleMode(start, end);
                return;
            }
    
            console.log(`Requesting route with mode: ${mode}`);
            const data = await fetchRouteData(start, end, mode);
            processRouteData(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    }; 

    const updateRoute = async (start, end) => {
        if (!start || !end) return;
    
        console.log(" Ensuring correct mode in updateRoute.");
        setTimeout(() => {
            console.log("🛣 Using mode:", travelMode);
            updateRouteWithMode(start, end, travelMode); // Always uses latest mode
        }, 300); // Give React time to update state
    };

    useEffect(() => {
        console.log("Ensuring route is loaded on app start.");
        if (startLocation && destination) {
            updateRoute(startLocation, destination);
        }
    }, [startLocation, destination, travelMode]); 
    
    
    useEffect(() => {
        let locationSubscriptionRef = null;
    
        const setupLocationAndRoute = async () => {
            try {
                setIsLoading(true);
        
                const { status } = await Location.requestForegroundPermissionsAsync();
                if (status !== "granted") {
                    throw new Error("Location permission denied");
                }
        
                const lastKnownLocation = await Location.getLastKnownPositionAsync();
                if (lastKnownLocation) {
                    const newLocation = {
                        latitude: lastKnownLocation.coords.latitude,
                        longitude: lastKnownLocation.coords.longitude,
                    };
        
                    console.log("Using last known location:", newLocation);
                    setUserLocation(newLocation);
        
                    if (selectedStart === "userLocation") {
                        setStartLocation(newLocation);
                    }
                }
        
                // Request a more accurate update in the background
                const initialLocation = await Location.getCurrentPositionAsync({
                    accuracy: Location.Accuracy.Balanced, // Use Balanced for faster results
                    maximumAge: 5000, // Accept location data up to 5 seconds old
                });
        
                const updatedLocation = {
                    latitude: initialLocation.coords.latitude,
                    longitude: initialLocation.coords.longitude,
                };
        
                console.log("Updated user location:", updatedLocation);
                setUserLocation(updatedLocation);
        
                if (selectedStart === "userLocation") {
                    setStartLocation(updatedLocation);
                }
            } catch (err) {
                console.error("Setup error:", err);
                setError(err.message);
            } finally {
                setIsLoading(false);
            }
        };        
    
        setupLocationAndRoute();
    
        return () => {
            console.log("Cleanup: Removing location watcher...");
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
                            <React.Fragment key={index}>
                                <Polyline 
                                    coordinates={segment.coordinates}
                                    strokeWidth={segment.width}
                                    strokeColor={segment.color}
                                    lineDashPattern={segment.isDashed ? [5, 5] : undefined} // Dashed for walking
                                />

                                {/* 🏷 Show Bus Number at Midpoint, BUT NOT FOR METRO */}
                                {segment.isBus && segment.transportLabel && segment.coordinates.length > 0 && (
                                    <Marker 
                                        coordinate={segment.coordinates[Math.floor(segment.coordinates.length / 2)]}
                                    >
                                        <View style={{
                                            backgroundColor: "white", 
                                            paddingHorizontal: 8, 
                                            paddingVertical: 4, 
                                            borderRadius: 5,
                                            borderWidth: 1,
                                            borderColor: "black",
                                            alignItems: "center"
                                        }}>
                                            <Text style={{ color: "black", fontWeight: "bold" }}>
                                                {segment.transportLabel}
                                            </Text>
                                        </View>
                                    </Marker>
                                )}

                                {/* 🚏 Highlight Transfer Points (White Circle) */}
                                {segment.transferPoint && (
                                    <Marker coordinate={segment.transferPoint}>
                                        <View style={{
                                            backgroundColor: "white", 
                                            width: 14,
                                            height: 14,
                                            borderRadius: 7, // Make it a circle
                                            borderWidth: 2,
                                            borderColor: "black"
                                        }} />
                                    </Marker>
                                )}
                            </React.Fragment>
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

