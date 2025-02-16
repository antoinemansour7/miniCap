import React, { useState, useEffect, useRef } from "react";
import MapView, { Marker, Polyline, Circle } from "react-native-maps";
import * as Location from "expo-location";
import { View, Text, Alert, Platform, StyleSheet, TextInput, TouchableOpacity, Modal } from "react-native";
import { useLocalSearchParams } from "expo-router";
import polyline from "@mapbox/polyline";
import { googleAPIKey } from "../../app/secrets";
import SGWBuildings from '../../components/SGWBuildings';
import LoyolaBuildings from '../../components/loyolaBuildings';
import LocationSelector from "../../components/directions/LocationSelector";
import ModalSearchBars from "../../components/directions/ModalSearchBars";


export default function DirectionsScreen() {
  
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
            setRouteInfo({ distance: leg.distance.text, duration: leg.duration.text });

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

    const [searchResults, setSearchResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);

    const allBuildings = [...SGWBuildings, ...LoyolaBuildings];

    const searchBuildings = (searchText) => {
        setCustomDest(searchText);
        if (searchText.trim().length > 0) {
            const filtered = allBuildings.filter(building => 
                building.name.toLowerCase().includes(searchText.toLowerCase()) ||
                building.id.toLowerCase().includes(searchText.toLowerCase())
            );
            setSearchResults(filtered);
            setIsSearching(true);
        } else {
            setSearchResults([]);
            setIsSearching(false);
        }
    };

    const selectBuilding = (building) => {
        setCustomDest(building.name);
        setSearchResults([]);
        setIsSearching(false);
        
        const newDestination = {
            latitude: building.latitude,
            longitude: building.longitude
        };
        setDestination(newDestination);
        setDestinationName(building.name);
        updateRoute(startLocation, newDestination);
        handleCloseModal();
    };

 

    const parseStreetName = (description) => {
        // Matches everything before first comma or before Montreal/QC/postal code
        const streetRegex = /^(.*?)(?:,|(?=\s+(?:Montreal|QC|Quebec|H\d[A-Z]\s*\d[A-Z]\d)))/i;
        const match = description.match(streetRegex);
        return match ? match[1].trim() : description;
    };

    const handleCustomLocation = (location, description) => {
        const newStartLocation = {
            latitude: location.latitude,
            longitude: location.longitude
        };
        const streetName = parseStreetName(description);
        setStartLocation(newStartLocation);
        setCustomSearchText(streetName);
        setCustomStartName(streetName);
        setCustomLocationDetails({
            name: streetName,
            coordinates: newStartLocation
        });
        updateRoute(newStartLocation, destination);
        handleCloseModal();
    };

    const handleClearSearch = () => {
        setCustomDest('');
        setSearchResults([]);
        setIsSearching(false);
    };

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
                    <View style={[styles.card, { position: 'absolute', top: 50, width: '100%', alignItems: 'center' }]}>
                        <Text style={{ color: 'red' }}>{error}</Text>
                    </View>
                )}
                {routeInfo && (
                    <View style={[styles.card, {
                        position: "absolute", bottom: 40, left: 20, right: 20,
                    }]}>
                        <Text style={{ fontWeight: "bold", fontSize: 16 }}>Estimated Time: {routeInfo.duration}</Text>
                        <Text style={{ fontSize: 14 }}>
                            Destination: {destinationName}  {"\n"}
                            Distance: {routeInfo.distance}</Text>
                    </View>
                )}
            
            </View>

            <ModalSearchBars
                searchType={searchType}
                isModalVisible={isModalVisible}
                handleCloseModal={handleCloseModal}
                handleCustomLocation={handleCustomLocation}
                customLocationDetails={customLocationDetails}
                customSearchText={customSearchText}
                searchBuildings={searchBuildings}
                searchResults={searchResults}
                isSearching={isSearching}   
                selectBuilding={selectBuilding}
                customDest={customDest}
                handleClearSearch={handleClearSearch}
            />
            
        </View>
    );
}



export const styles = StyleSheet.create({
    mainContainer: {
        flex: 1,
        paddingTop: 0, // Add padding to account for status bar
        paddingBottom: 0,
        // backgroundColor: "#912338",
    },  
    container: {
        flex: 1,
        paddingTop: 0, // Add padding to account for status bar
        paddingBottom: 0,

    },
    topCard: {
        width: '100%',
        backgroundColor: "#912338",
        padding: 12,
        paddingTop: 45,
        paddingBottom: 6,
        borderRadius: 20,
        
       // shadowColor: "#000",
        // shadowOffset: {
        //     width: 0,
        //     height: 2,
        // },
        // shadowOpacity: 0.25,
        // shadowRadius: 3.84,
        // elevation: 5,
        // zIndex: 1,
    },
    mapContainer: {
        flex: 1, // This will make it take up remaining space
        
    },
    card: {
        backgroundColor: "white", padding: 10, borderRadius: 10,
        shadowColor: "#000", shadowOpacity: 0.1, shadowRadius: 5,
    },
    dropdownContainer: {
        marginVertical: 4,
    },
    picker: {
        height: 45,
        width: '100%',
        backgroundColor: 'transparent',
    },
    input: {
        height: 45,
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingRight: 35, // Increase right padding to prevent text from going under the button
        backgroundColor: '#fff',
        width: '100%', // Ensure input takes full width
    },
    label: {
        fontSize: 16,
        fontWeight: '500',
        marginBottom: 5,
    },
    pickerContainer: {
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 8,
        backgroundColor: '#fff',
        overflow: 'hidden',
    },
    dropdown: {
        height: 50,
        borderWidth: 1,
        borderRadius: 8,
        paddingHorizontal: 12,
        borderColor: '#ccc',
        backgroundColor: 'white',
    },
    placeholderStyle: {
        fontSize: 16,
        color: '#666',
    },
    selectedTextStyle: {
        fontSize: 16,
        color: '#333',
    },
    customInputContainer: {
        marginTop: 8,
        zIndex: 1,
    },
    doneButton: {
        backgroundColor: '#912338',
        padding: 12,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 10,
    },
    changeRouteButton: {
        position: 'absolute',
        top: 50,
        right: 10,
        backgroundColor: '#912338',
        padding: 12,
        borderRadius: 8,
        zIndex: 1,
        elevation: 1,
    },
    buttonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '500',
    },
    searchContainer: {
        position: 'relative',
        zIndex: 3,
    },
    searchResults: {
        position: 'absolute',
        top: '100%',
        left: 0,
        right: 0,
        backgroundColor: 'white',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#ccc',
        maxHeight: 200,
        overflow: 'scroll',
        zIndex: 4,
    },
    searchResult: {
        padding: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    buildingName: {
        fontSize: 14,
        flex: 1,
    },
    buildingId: {
        fontSize: 12,
        color: '#666',
        marginLeft: 8,
    },
   
    selectedTravelMode: {
        borderColor: '#912338',
        backgroundColor: '#fff',
    },
    rowContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    label: {
        fontSize: 14,
        fontWeight: '500',
        color: '#333',
        width: 45,
    },
    dropdown: {
        flex: 1,
        height: 40,
        borderWidth: 1,
        borderRadius: 8,
        paddingHorizontal: 8,
        borderColor: '#ccc',
        backgroundColor: 'white',
    },
    travelModeContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 5,
        marginBottom: 2,
        gap: 14,
    },
    travelModeButton: {
        padding: 0,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#ccc',
        backgroundColor: 'white',
        width: 60,
        height: 30,
        justifyContent: 'center',
        alignItems: 'center',
    },
    selectedTravelMode: {
        borderColor: '#912338',
        backgroundColor: '#fff',
    },
    modalContainer: {
        flex: 1,
        justifyContent: 'flex-start', // Changed from 'center' to 'flex-start'
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        paddingTop: 60, // Add padding at the top
        paddingHorizontal: 20,
        zIndex: 1000, 
    },
    modalContent: {
        backgroundColor: 'white',
        borderRadius: 10,
        padding: 20,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
        maxHeight: '80%', // Limit height to ensure visibility
        overflow: 'visible', // Allow content to overflow
        zIndex: 1000, // Ensure high z-index
    },
    closeButton: {
        position: 'absolute',
        right: 10,
        top: 10,
        zIndex: 1001, // Higher than modalContent
        padding: 5,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 15,
        marginTop: 10,
        textAlign: 'center',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    searchModalContent: {
        backgroundColor: 'white',
        marginTop: 50,
        marginHorizontal: 20,
        borderRadius: 10,
        padding: 20,
        minHeight: 200,
        maxHeight: '80%',
    },
    searchBarContainer: {
        position: 'relative',
        zIndex: 1001,
    },
    textInputContainer: {
        position: 'relative',
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 8, // Add this to maintain consistent spacing
    },
    clearButton: {
        position: 'absolute',
        right: 0,
        top: '40%', // Center vertically
        transform: [{ translateY: -10 }], // Adjust based on icon size to perfectly center
        padding: 5,
        zIndex: 5,
        justifyContent: 'center',
        alignItems: 'center',
    },
    leftArrow: {
        marginBottom: 8, 
    },
});