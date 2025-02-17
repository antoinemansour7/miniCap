import React, { useState, useEffect, useRef } from "react";
import MapView, { Marker, Polyline, Circle } from "react-native-maps";
import * as Location from "expo-location";
import { View, Text } from "react-native";
import { useLocalSearchParams } from "expo-router";
import polyline from "@mapbox/polyline";
import { googleAPIKey } from "../../app/secrets";
import LocationSelector from "../../components/directions/LocationSelector";
import ModalSearchBars from "../../components/directions/ModalSearchBars";
import { styles } from "../../styles/directionsStyles";
import {
    getNextShuttleTime,
    isNearCampus,
    LOYOLA_COORDS,
    SGW_COORDS
} from '../../utils/shuttleUtils';

export default function DirectionsScreen() {
  
    // Rertrive the destination from the params that were passed from the Map page
    const params = useLocalSearchParams();
    console.log("Received params: ", params);

    if (!params || !params.destination) {
        console.error("Missing destination in navigation!");
        return <Text>Error: No destination provided.</Text>;
    }

    let parsedDestination = null;
    try {
        parsedDestination = JSON.parse(params.destination);
        console.log("Parsed destination:", parsedDestination);
    } catch (error) {
        console.error("Error parsing destination:", error);
    }

    if (!parsedDestination || !parsedDestination.latitude || !parsedDestination.longitude) {
        console.error("Invalid destination:", parsedDestination);
        return <Text>Error: Invalid destination coordinates.</Text>;
    }
    const buildingName = params.buildingName || "No Destination set";
    const [destinationName, setDestinationName] = useState(buildingName);

    const mapRef = useRef(null);

    // State management
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
    const [shuttleInfo, setShuttleInfo] = useState(null);

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
        
        try {
            setIsLoading(true);
            const modeParam = mode.toLowerCase();
            console.log(`Requesting route with mode: ${modeParam}`);
    
            // Handle shuttle mode separately
            if (mode.toUpperCase() === 'SHUTTLE') {
                // Check if route is between campuses
                const isStartLoyola = isNearCampus(start, LOYOLA_COORDS);
                const isStartSGW = isNearCampus(start, SGW_COORDS);
                const isEndLoyola = isNearCampus(end, LOYOLA_COORDS);
                const isEndSGW = isNearCampus(end, SGW_COORDS);
    
                // Only provide shuttle route between campuses
                if ((isStartLoyola && isEndSGW) || (isStartSGW && isEndLoyola)) {
                    const fromCampus = isStartLoyola ? 'loyola' : 'sgw';
                    const nextShuttle = getNextShuttleTime(fromCampus);
    
                    if (!nextShuttle) {
                        throw new Error("No more shuttles available today");
                    }
    
                    // Create a simplified route for the shuttle
                    const shuttleRoute = [
                        LOYOLA_COORDS,
                        // You can add intermediate points here if you have them
                        { 
                            latitude: (LOYOLA_COORDS.latitude + SGW_COORDS.latitude) / 2,
                            longitude: (LOYOLA_COORDS.longitude + SGW_COORDS.longitude) / 2
                        },
                        SGW_COORDS
                    ];
    
                    setCoordinates(shuttleRoute);
                    setRouteInfo({
                        distance: "6.8 km (approx)",
                        duration: `${nextShuttle} (Next shuttle) + ~25 min ride`
                    });
    
                    // Fit map to show the route
                    if (mapRef.current) {
                        mapRef.current.fitToCoordinates(shuttleRoute, {
                            edgePadding: { top: 50, right: 50, bottom: 50, left: 50 },
                            animated: true
                        });
                    }
                } else {
                    throw new Error("Shuttle service is only available between Loyola and SGW campuses");
                }
            } else {
                // Handle other modes using Google Directions API
                const response = await fetch(
                    `https://maps.googleapis.com/maps/api/directions/json?origin=${start.latitude},${start.longitude}&destination=${end.latitude},${end.longitude}&mode=${modeParam}&key=${googleAPIKey}`
                );
                const data = await response.json();
                console.log("Route response:", data);
    
                if (!data.routes || data.routes.length === 0) {
                    throw new Error("No route found");
                }
    
                setCoordinates([]);
                
                const encodedPolyline = data.routes[0].overview_polyline.points;
                const decodedCoordinates = polyline.decode(encodedPolyline).map(([lat, lng]) => ({
                    latitude: lat,
                    longitude: lng
                }));
    
                setCoordinates(decodedCoordinates);
                const leg = data.routes[0].legs[0];
                setRouteInfo({ 
                    distance: leg.distance.text, 
                    duration: leg.duration.text 
                });
    
                if (mapRef.current) {
                    const currentMapRef = mapRef.current;
                    setTimeout(() => {
                        if (currentMapRef) {
                            currentMapRef.fitToCoordinates(
                                [start, end, ...decodedCoordinates],
                                {
                                    edgePadding: { top: 50, right: 50, bottom: 50, left: 50 },
                                    animated: true,
                                }
                            );
                        }
                    }, 100);
                }
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
                    accuracy: Location.Accuracy.High
                });
                
                const newLocation = {
                    latitude: initialLocation.coords.latitude,
                    longitude: initialLocation.coords.longitude,
                };

                setUserLocation(newLocation);
                if (selectedStart === 'userLocation') {
                    setStartLocation(newLocation);
                    updateRoute(newLocation, destination);
                }

                // Update location watcher
                locationSubscription = await Location.watchPositionAsync(
                    { 
                        accuracy: Location.Accuracy.High, 
                        timeInterval: 5000, 
                        distanceInterval: 10 
                    },
                    (location) => {
                        const updatedLocation = {
                            latitude: location.coords.latitude,
                            longitude: location.coords.longitude,
                        };
                        setTimeout(() => {
                            setUserLocation(updatedLocation);
                            if (selectedStart === 'userLocation') {
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
    }, [destination, selectedStart]); // Add selectedStart as dependency


    const handleCloseModal = () => {
        setIsModalVisible(false);
    };


    return (
        <View style={styles.mainContainer}>
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

          />

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
                        {userLocation && 
                        // selectedStart === 'userLocation' ? 
                        (
                            <Circle
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
                        {coordinates.length > 0 && (
                            <Polyline 
                                coordinates={coordinates}
                                strokeWidth={2}
                                strokeColor="#912338"
                                lineDashPattern={[0]}
                            />
                        )}
                    </MapView>
                </View>

                {isLoading && (
                    <View style={[styles.card, {  
                        position: "absolute", bottom: 40, left: 20, right: 20,
            }]}>
                        <Text 
                            style={{ fontWeight: "bold", fontSize: 16 }}
                        >
                            Loading route...</Text>
                    </View>
                )}
                {error && (
                    <View style={[styles.card, { 
                        position: 'absolute', 
                        top: 50, 
                        width: '100%', 
                        alignItems: 'center',
                        backgroundColor: '#ffebee'  // Light red background for errors
                    }]}>
                        <Text style={{ color: '#d32f2f' }}>{error}</Text>
                    </View>
                )}
                {routeInfo && (
                    <View style={[styles.card, {
                        position: "absolute", bottom: 40, left: 20, right: 20,
                    }]}>
                        <Text style={{ fontWeight: "bold", fontSize: 16 }}>
                            {travelMode === 'SHUTTLE' ? 'Next Shuttle: ' : 'Estimated Time: '}
                            {routeInfo.duration}
                        </Text>
                        <Text style={{ fontSize: 14 }}>
                            Destination: {destinationName}  {"\n"}
                            Distance: {routeInfo.distance}
                            {travelMode === 'SHUTTLE' && "\nNote: Shuttle schedule may vary"}
                        </Text>
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
            
        </View>
    );
}

