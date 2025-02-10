import React, { useState, useEffect, useRef } from "react";
import MapView, { Marker, Polyline, Circle } from "react-native-maps";
import * as Location from "expo-location";
import { View, Text, Alert, Platform, StyleSheet, TextInput, TouchableOpacity } from "react-native";
import { Dropdown } from 'react-native-element-dropdown';
import { useLocalSearchParams } from "expo-router";
import polyline from "@mapbox/polyline";
import { googleAPIKey } from "../secrets";
import SGWBuildings from '../../components/SGWBuildings';
import LoyolaBuildings from '../../components/loyolaBuildings';
import GoogleSearchBar from "../../components/GoogleSearchBar";

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
    const [zoomLevel, setZoomLevel] = useState(20); // Add this state

    const [selectedStart, setSelectedStart] = useState('userLocation');
    const [selectedDest, setSelectedDest] = useState('current');
    const [customStart, setCustomStart] = useState('');
    const [customDest, setCustomDest] = useState('');
    const [showCustomStart, setShowCustomStart] = useState(false);
    const [showCustomDest, setShowCustomDest] = useState(false);
    const [isRouteCardVisible, setIsRouteCardVisible] = useState(true);

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
        setShowCustomStart(item.value === 'custom');
        
        if (item.value !== 'custom') {
            let newStartLocation;
            switch(item.value) {
                case 'userLocation':
                    newStartLocation = userLocation;
                    break;
                case 'SGWCampus':
                case 'LoyolaCampus':
                    newStartLocation = predefinedLocations[item.value];
                    break;
                default:
                    return;
            }
            setStartLocation(newStartLocation);
            updateRoute(newStartLocation, destination);
        }
    };

    const handleDestinationChange = (item) => {
        setSelectedDest(item.value);
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

    const updateRoute = async (start, end) => {
        if (!start || !end) return;
        
        try {
            setIsLoading(true);
            const response = await fetch(
                `https://maps.googleapis.com/maps/api/directions/json?origin=${start.latitude},${start.longitude}&destination=${end.latitude},${end.longitude}&key=${googleAPIKey}`
            );
            const data = await response.json();

            if (!data.routes || data.routes.length === 0) {
                throw new Error("No route found");
            }

            const encodedPolyline = data.routes[0].overview_polyline.points;
            const decodedCoordinates = polyline.decode(encodedPolyline).map(([lat, lng]) => ({
                latitude: lat,
                longitude: lng
            }));

            setCoordinates(decodedCoordinates);
            const leg = data.routes[0].legs[0];
            setRouteInfo({ distance: leg.distance.text, duration: leg.duration.text });

            // Adjust map view
            if (mapRef.current) {
                mapRef.current.fitToCoordinates([start, end, ...decodedCoordinates], {
                    edgePadding: { top: 50, right: 50, bottom: 50, left: 50 },
                    animated: true
                });
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        let locationSubscription;

        const setupLocationAndRoute = async () => {
            try {
                setIsLoading(true);
                console.log("Setting up location and route...");
                
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
                
                console.log("Initial location:", newLocation);
                console.log("Destination:", destination);

                setUserLocation(newLocation);
                setStartLocation(newLocation);

                // Fetch and process route
                const response = await fetch(
                    `https://maps.googleapis.com/maps/api/directions/json?origin=${newLocation.latitude},${newLocation.longitude}&destination=${destination.latitude},${destination.longitude}&key=${googleAPIKey}`
                );
                const data = await response.json();
                console.log("API Response:", data);

                if (!data.routes || data.routes.length === 0) {
                    throw new Error("No route found");
                }

                const encodedPolyline = data.routes[0].overview_polyline.points;
                const decodedCoordinates = polyline.decode(encodedPolyline).map(([lat, lng]) => ({
                    latitude: lat,
                    longitude: lng
                }));

                console.log("Decoded coordinates:", decodedCoordinates);
                setCoordinates(decodedCoordinates);
                
                const leg = data.routes[0].legs[0];
                setRouteInfo({ distance: leg.distance.text, duration: leg.duration.text });

                // Adjust map view
                setTimeout(() => {
                    if (mapRef.current && decodedCoordinates.length > 0) {
                        const allCoords = [
                            newLocation,
                            destination,
                            ...decodedCoordinates
                        ];
                        
                        mapRef.current.fitToCoordinates(allCoords, {
                            edgePadding: { top: 50, right: 50, bottom: 50, left: 50 },
                            animated: true
                        });
                    }
                }, 1000);

                // Setup location watching
                locationSubscription = await Location.watchPositionAsync(
                    { accuracy: Location.Accuracy.High, timeInterval: 5000, distanceInterval: 10 },
                    (location) => {
                        setUserLocation({
                            latitude: location.coords.latitude,
                            longitude: location.coords.longitude,
                        });
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
    }, [destination]);

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

    return (
        <View style={{ flex: 1 }}>
            {isRouteCardVisible ? (
                <View style={[styles.card, styles.topCard]}>
                    <View style={styles.dropdownContainer}>
                        <Text style={styles.label}>Start Location</Text>
                        <Dropdown
                            style={styles.dropdown}
                            placeholderStyle={styles.placeholderStyle}
                            selectedTextStyle={styles.selectedTextStyle}
                            data={startLocationData}
                            maxHeight={300}
                            labelField="label"
                            valueField="value"
                            placeholder="Select start location"
                            value={selectedStart}
                            onChange={handleStartLocationChange}
                        />
                        {showCustomStart && (
                            <View style={styles.customInputContainer}>
                                <GoogleSearchBar 
                                    onLocationSelected={(location) => {
                                        const newStartLocation = {
                                            latitude: location.latitude,
                                            longitude: location.longitude
                                        };
                                        setStartLocation(newStartLocation);
                                        updateRoute(newStartLocation, destination);
                                    }} 
                                />
                            </View>
                        )}
                    </View>

                    <View style={styles.dropdownContainer}>
                        <Text style={styles.label}>Destination</Text>
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
                        />
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
                    <TouchableOpacity 
                        style={styles.doneButton}
                        onPress={() => setIsRouteCardVisible(false)}
                    >
                        <Text style={styles.buttonText}>Done</Text>
                    </TouchableOpacity>
                </View>
            ) : (
                <TouchableOpacity 
                    style={styles.changeRouteButton}
                    onPress={() => setIsRouteCardVisible(true)}
                >
                    <Text style={styles.buttonText}>Change Route</Text>
                </TouchableOpacity>
            )}
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
            >
                {userLocation && (
                    <Circle
                        center={userLocation}
                        radius={getCircleRadius()}
                        strokeColor="white"
                        fillColor="rgba(0, 122, 255, 0.7)"
                    />
                )}
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
    );
}


const styles = StyleSheet.create({
card: {

backgroundColor: "white", padding: 10, borderRadius: 10,
shadowColor: "#000", shadowOpacity: 0.1, shadowRadius: 5,
},
topCard: {
    position: 'absolute',
    top: 40,
    left: 10,
    right: 10,
    zIndex: 1,
},
dropdownContainer: {
    marginVertical: 8,
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
topCard: {
    position: 'absolute',
    top: 50,
    left: 10,
    right: 10,
    zIndex: 1,
    elevation: 1, // Required for Android
},
dropdownContainer: {
    marginVertical: 8,
    zIndex: 2,
},
label: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
    color: '#333',
},
customInputContainer: {
    marginTop: 8,
    zIndex: 1,
},
input: {
    height: 45,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingHorizontal: 12,
    backgroundColor: '#fff',
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
}) ;