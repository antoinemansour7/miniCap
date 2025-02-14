import React, { useState, useEffect, useRef } from "react";
import MapView, { Marker, Polyline, Circle } from "react-native-maps";
import * as Location from "expo-location";
import { View, Text, Alert, Platform, StyleSheet, TextInput, TouchableOpacity, Modal } from "react-native";
import { Dropdown } from 'react-native-element-dropdown';
import { useLocalSearchParams } from "expo-router";
import polyline from "@mapbox/polyline";
import { googleAPIKey } from "../../app/secrets";
import SGWBuildings from '../../components/SGWBuildings';
import LoyolaBuildings from '../../components/loyolaBuildings';
import GoogleSearchBar from "../../components/GoogleSearchBar";
import { Ionicons, Entypo, FontAwesome } from '@expo/vector-icons'; 

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
    const [customStart, setCustomStart] = useState('');
    const [customDest, setCustomDest] = useState('');
    const [showCustomStart, setShowCustomStart] = useState(false);
    const [showCustomDest, setShowCustomDest] = useState(false);
    const [isRouteCardVisible, setIsRouteCardVisible] = useState(true);
    const [travelMode, setTravelMode] = useState('WALKING'); 
    const [customStartName, setCustomStartName] = useState(''); 
    const [customLocationDetails, setCustomLocationDetails] = useState({
        name: '',
        coordinates: null
    });
    const [customSearchText, setCustomSearchText] = useState(''); 
    const [isSearchModalVisible, setIsSearchModalVisible] = useState(false);
    const [isStartSearchModalVisible, setIsStartSearchModalVisible] = useState(false);

    const predefinedLocations = {
        SGWCampus: { latitude: 45.495729, longitude: -73.578041 },
        LoyolaCampus: { latitude: 45.458424, longitude: -73.640259 }
    };

    const startLocationData = [
        { label: 'My Location', value: 'userLocation' },
        { label: 'SGW Campus', value: 'SGWCampus' },
        { label: 'Loyola Campus', value: 'LoyolaCampus' },
        { label: 'Custom Location', value: 'custom' },
    ];

    const destinationData = [
        { label:`${buildingName}`, value: 'current' },
        { label: 'SGW Campus', value: 'SGWCampus' },
        { label: 'Loyola Campus', value: 'LoyolaCampus' },
        { label: 'Custom Location', value: 'custom' },
    ];

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

    const handleStartLocationChange = async (item) => {
        setSelectedStart(item.value);
        if (item.value === 'custom') {
            setIsStartSearchModalVisible(true);
        } else {
            let newStartLocation;
            switch(item.value) {
                case 'userLocation':
                    if (userLocation) {
                        newStartLocation = userLocation;
                    } else {
                        try {
                            const currentLocation = await Location.getCurrentPositionAsync({
                                accuracy: Location.Accuracy.High
                            });
                            newStartLocation = {
                                latitude: currentLocation.coords.latitude,
                                longitude: currentLocation.coords.longitude,
                            };
                            setUserLocation(newStartLocation);
                        } catch (error) {
                            console.error("Error getting current location:", error);
                            setError("Could not get current location");
                            return;
                        }
                    }
                    break;
                case 'SGWCampus':
                case 'LoyolaCampus':
                    newStartLocation = predefinedLocations[item.value];
                    break;
                default:
                    return;
            }
            
            if (newStartLocation && destination) {
                setStartLocation(newStartLocation);
                updateRoute(newStartLocation, destination);
            }
        }
    };

    const handleDestinationChange = (item) => {
        setSelectedDest(item.value);
        if (item.value === 'custom') {
            setIsSearchModalVisible(true);
        } else {
            setShowCustomDest(item.value === 'custom');
        
            if (item.value !== 'custom') {
                let newDestination;
                let newDestinationName;
                switch(item.value) {
                    case 'current':
                        newDestination = parsedDestination;
                        newDestinationName = buildingName;
                        break;
                    case 'SGWCampus':
                        newDestination = predefinedLocations[item.value];
                        newDestinationName = 'SGW Campus';
                        break;
                    case 'LoyolaCampus':
                        newDestination = predefinedLocations[item.value];
                        newDestinationName = 'Loyola Campus';
                        break;
                    default:
                        return;
                }
                setDestination(newDestination);
                setDestinationName(newDestinationName);
                updateRoute(startLocation, newDestination);
            }
        }
    };

    const handleCustomStartSubmit = () => {
        if (customStart.trim()) {
            // Here you would implement geocoding to convert address to coordinates
            // For now, just showing how to handle the submit
            console.log("Custom start location:", customStart);
        }
    };

    const handleCustomDestSubmit = () => {
        if (customDest.trim()) {
            // Here you would implement geocoding to convert address to coordinates
            console.log("Custom destination:", customDest);
        }
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
    };

    const handleTravelModeChange = (mode) => {
        console.log(`Changing travel mode to: ${mode}`);
        console.log('Current start location:', startLocation);
        // Set the travel mode first
        setTravelMode(mode);
        
        // Use the current startLocation instead of letting it default to userLocation
        const currentStart = startLocation || userLocation;
        if (currentStart && destination) {
            updateRouteWithMode(currentStart, destination, mode);
        }
    };

    const handleCustomLocation = (location, description) => {
        const newStartLocation = {
            latitude: location.latitude,
            longitude: location.longitude
        };
        setStartLocation(newStartLocation);
        setCustomSearchText(description);
        setCustomLocationDetails({
            name: description,
            coordinates: newStartLocation
        });
        updateRoute(newStartLocation, destination);
    };

    const handleCloseModal = () => {
        setIsSearchModalVisible(false);
    };

    const handleCloseStartModal = () => {
        setIsStartSearchModalVisible(false);
    };

    return (
        <View style={styles.mainContainer}>
            <View style={styles.topCard}>
                <View style={styles.dropdownContainer}>
                    <View style={styles.rowContainer}>
                        {/* <Entypo name="circle" size={22} color="#E9D3D7" /> */}
                        <FontAwesome name="dot-circle-o" size={24} color="#E9D3D7" />
                        


                        <Dropdown
                            style={styles.dropdown}
                            placeholderStyle={styles.placeholderStyle}
                            selectedTextStyle={styles.selectedTextStyle}
                            data={startLocationData}
                            maxHeight={300}
                            labelField="label"
                            valueField="value"
                            placeholder="Select start"
                            value={selectedStart}
                            onChange={handleStartLocationChange}
                            testID="dropdown-start"
                        />
                    </View>
                    {showCustomStart && (
                        <View style={styles.customInputContainer}>
                            <GoogleSearchBar 
                                onLocationSelected={handleCustomLocation}
                                initialValue={customLocationDetails.name || customSearchText}
                                key={`search-${customLocationDetails.name || customSearchText}`}
                            />
                        </View>
                    )}
                </View>

                <View style={styles.dropdownContainer}>
                    <View style={styles.rowContainer}>
                    <Ionicons name="location-sharp" size={24} color="#E9D3D7" />
                        <Dropdown
                            style={styles.dropdown}
                            placeholderStyle={styles.placeholderStyle}
                            selectedTextStyle={styles.selectedTextStyle}
                            data={destinationData}
                            maxHeight={300}
                            labelField="label"
                            valueField="value"
                            placeholder="Select destination"
                            value={selectedDest}
                            onChange={handleDestinationChange}
                            testID="dropdown-dest"
                        />
                    </View>
                    {showCustomDest && (
                        <View style={styles.searchContainer}>
                            <TextInput
                                style={styles.input}
                                placeholder="Search for a building..."
                                value={customDest}
                                onChangeText={searchBuildings}
                            />
                            {isSearching && searchResults.length > 0 && (
                                <View style={styles.searchResults}>
                                    {searchResults.map((building) => (
                                        <TouchableOpacity
                                            key={building.id}
                                            style={styles.searchResult}
                                            onPress={() => selectBuilding(building)}
                                        >
                                            <Text style={styles.buildingName}>{building.name}</Text>
                                            <Text style={styles.buildingId}>({building.id})</Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            )}
                        </View>
                    )}
                </View>

                <View style={styles.travelModeContainer}>
                    <TouchableOpacity 
                        style={[styles.travelModeButton, travelMode === 'DRIVING' && styles.selectedTravelMode]}
                        onPress={() => handleTravelModeChange('DRIVING')}
                    >
                        <Ionicons name="car" size={20} color={travelMode === 'DRIVING' ? '#912338' : '#666'} />
                    </TouchableOpacity>
                    <TouchableOpacity 
                        style={[styles.travelModeButton, travelMode === 'WALKING' && styles.selectedTravelMode]}
                        onPress={() => handleTravelModeChange('WALKING')}
                    >
                        <Ionicons name="walk" size={20} color={travelMode === 'WALKING' ? '#912338' : '#666'} />
                    </TouchableOpacity>
                    <TouchableOpacity 
                        style={[styles.travelModeButton, travelMode === 'TRANSIT' && styles.selectedTravelMode]}
                        onPress={() => handleTravelModeChange('TRANSIT')}
                    >
                        <Ionicons name="bus" size={20} color={travelMode === 'TRANSIT' ? '#912338' : '#666'} />
                    </TouchableOpacity>
                </View>
            </View>

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

            <Modal
                visible={isSearchModalVisible}
                animationType="slide"
                transparent={true}
                onRequestClose={handleCloseModal}
            >
                <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        <TouchableOpacity 
                            style={styles.closeButton}
                            onPress={handleCloseModal}
                        >
                            <Ionicons name="close" size={24} color="#666" />
                        </TouchableOpacity>
                        <Text style={styles.modalTitle}>Search Destination</Text>
                        <GoogleSearchBar 
                            onLocationSelected={(location, description) => {
                                const newDestination = {
                                    latitude: location.latitude,
                                    longitude: location.longitude
                                };
                                setDestination(newDestination);
                                setDestinationName(description);
                                updateRoute(startLocation, newDestination);
                                setIsSearchModalVisible(false);
                            }}
                        />
                    </View>
                </View>
            </Modal>

            <Modal
                visible={isStartSearchModalVisible}
                animationType="slide"
                transparent={true}
                onRequestClose={handleCloseStartModal}
            >
                <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        <TouchableOpacity 
                            style={styles.closeButton}
                            onPress={handleCloseStartModal}
                        >
                            <Ionicons name="close" size={24} color="#666" />
                        </TouchableOpacity>
                        <Text style={styles.modalTitle}>Search Start Location</Text>
                        <GoogleSearchBar 
                            onLocationSelected={(location, description) => {
                                const newStartLocation = {
                                    latitude: location.latitude,
                                    longitude: location.longitude
                                };
                                setStartLocation(newStartLocation);
                                setCustomLocationDetails({
                                    name: description,
                                    coordinates: newStartLocation
                                });
                                updateRoute(newStartLocation, destination);
                                setIsStartSearchModalVisible(false);
                            }}
                        />
                    </View>
                </View>
            </Modal>
        </View>
    );
}



const styles = StyleSheet.create({
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
        paddingTop: 55,
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
        marginTop: 8,
        backgroundColor: '#fff',
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
    travelModeContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginVertical: 6,
        gap: 10,
    },
    travelModeButton: {
        padding: 10,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#ccc',
        backgroundColor: 'white',
        width: 50,
        height: 50,
        justifyContent: 'center',
        alignItems: 'center',
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
        marginTop: 8,
        gap: 8,
    },
    travelModeButton: {
        padding: 8,
        borderRadius: 6,
        borderWidth: 1,
        borderColor: '#ccc',
        backgroundColor: 'white',
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
    },
    selectedTravelMode: {
        borderColor: '#912338',
        backgroundColor: '#fff',
    },
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        padding: 20,
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
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 15,
        textAlign: 'center',
    },
    closeButton: {
        position: 'absolute',
        right: 10,
        top: 10,
        zIndex: 1,
        padding: 5,
    },
});