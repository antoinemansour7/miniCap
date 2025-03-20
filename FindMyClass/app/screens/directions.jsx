import React, { useState, useEffect, useRef } from "react";
import MapView, { Marker, Polyline, Circle, Overlay, Polygon } from "react-native-maps";
import * as Location from "expo-location";
import { View, Text, StyleSheet, Dimensions, Alert } from "react-native";
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
import  SGWBuildings  from "../../components/SGWBuildings";
import PF from "pathfinding";
import {
    floorGrid,
    getFloorPlanBounds,
    convertGridForPathfinding,
    gridToLatLong,
    geojsonData,
    getPolygonBounds,
    buildingCorners,
    overlayRotationAngle,
    getPolygonCenter,
    transformPath,
    startX,
    startY,
    endX,
    endY,
} from "../../utils/indoorUtils";



const floorPlans = {
  1: require('../../floorPlans/hall-1-rotated.png'),
  2: require('../../floorPlans/Hall-2.png'),
  8: require('../../floorPlans//Hall-8.png'),
  9: require('../../floorPlans/Hall-9.png')
};            



export default function DirectionsScreen() {



const hallBuilding = SGWBuildings.find(b => b.id === 'H');

const bounds = hallBuilding ? getFloorPlanBounds(hallBuilding) : null;




const walkableGrid = convertGridForPathfinding(floorGrid);
walkableGrid.setWalkableAt(endX, endY, true);

const finder = new PF.AStarFinder();
const path = finder.findPath( startX, startY, endX, endY, walkableGrid);
//const routeCoordinates = path.map(([x, y]) => gridToLatLong(x, y));


  // // ✅ Convert GeoJSON coordinates to React Native Maps format
  // const buildingPolygon = geojsonData.features[0].geometry.coordinates[0].map(coord => ({
  //   latitude: coord[1], // GeoJSON format is [long, lat], so we swap them
  //   longitude: coord[0]
  // }));


  const buildingPolygon = [
    { latitude: 45.4977197, longitude: -73.5790184 },
    { latitude: 45.4971663, longitude: -73.5795456 },
    { latitude: 45.4968262, longitude: -73.5788258 },
    { latitude: 45.4973655, longitude: -73.5782906 },
    { latitude: 45.4977197, longitude: -73.5790184 },
  ];

   // ✅ Compute new bounds using the manually drawn GeoJSON polygon
   const newBounds = getPolygonBounds(buildingPolygon);
   console.log("New Overlay Bounds:", newBounds);

   const polygonCenter = getPolygonCenter(buildingPolygon);
   //const rotationAngle = "-45deg"; // Adjust based on your building’s rotation


  const routeCoordinates = transformPath(path); 



// ***************************************************************************************************** //
  
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
       const [roomNumber, setRoomNumber] = useState('');
   
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
                // Set shuttle-specific information
                setDirections([{
                    id: 0,
                    instruction: `Next shuttle departing from ${fromCampus.toUpperCase()} Campus`,
                    distance: 'Shuttle Service',
                    duration: `${nextTime} - 25 min ride`
                }]);
                
                // Get driving route for map display but keep shuttle directions
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
                        setCoordinates(decodedCoordinates);
                        const leg = data.routes[0].legs[0];
                        setRouteInfo({ 
                            distance: "Shuttle departing at:", 
                            duration: `${nextTime}` 
                        });
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
            //console.log("Route response:", data);

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
            setRouteInfo({ distance: `${leg.distance.text} -`, duration: leg.duration.text });

            // Extract directions from steps
            
            const extractedDirections = leg.steps.map((step, index) => ({
                id: index,
                instruction: step.html_instructions.replace(/<\/?[^>]*>/g, ''), // NOSONAR
                distance: `${step.distance.text}`,
                duration: step.duration.text,
            }));
            setDirections(extractedDirections);
        
       

            if (mapRef.current) {
                const currentMapRef = mapRef.current; // store current reference
                setTimeout(() => {
                    if (currentMapRef) { // use stored reference instead of mapRef.current
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
                    <View 
                        style={{opacity: zoomLevel <= 13 ? 0.5 : 1 }}>
                          <Overlay 
                            bounds={[
                              [newBounds.south, newBounds.west],
                              [newBounds.north, newBounds.east]
                            ]}
                            image={floorPlans[8]}
                            zIndex={1}
                          />
                    </View>


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
                        {coordinates.length > 0 && (
                            <Polyline 
                                coordinates={coordinates}
                                strokeWidth={2}
                                strokeColor="#912338"
                                lineDashPattern={[0]}
                            />
                        )}

                            {/* {Array.from({ length: 20 }).map((_, x) =>
                                Array.from({ length: 20 }).map((_, y) => {
                                  const { latitude, longitude } = gridToLatLong(x, y);
                                  return (
                                    <Marker
                                      key={`${x}-${y}`}
                                      coordinate={{ latitude, longitude }}
                                      pinColor="blue" // Color grid points differently
                                    />
                                  );
                                })
                              )} */}
                     
                     {/* <Polygon
                          coordinates={buildingPolygon}
                          strokeColor="blue"
                          fillColor="rgba(0, 0, 255, 0.2)" // Transparent blue fill
                          strokeWidth={2}
                        /> */}
                          <Polyline
                            coordinates={routeCoordinates}
                            strokeWidth={4}
                            strokeColor="#912338"
                            //lineDashPattern={[0]}
                          />
                        


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
            setRoomNumber={setRoomNumber}
            
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

