import React, { useRef, useEffect, useState } from 'react';
import { View, StyleSheet, Text, TextInput, TouchableOpacity } from 'react-native';
import MapView, { Marker, Polygon } from 'react-native-maps';
import * as Location from 'expo-location';
import LoyolaBuildings from './loyolaBuildings';
import useLocationHandler from '../hooks/useLocationHandler';
import { useRouter } from 'expo-router';
import BuildingMarker from './BuildingMarker';
import { Ionicons } from '@expo/vector-icons';

// Compute centroid for buildings
const getCentroid = (building) => {
    const boundary = building.boundary?.outer || building.boundary;
    if (!boundary || boundary.length === 0) return null;

    const totalPoints = boundary.length;
    const sumLat = boundary.reduce((sum, point) => sum + point.latitude, 0);
    const sumLon = boundary.reduce((sum, point) => sum + point.longitude, 0);

    let centroid = {
        latitude: sumLat / totalPoints,
        longitude: sumLon / totalPoints,
    };

    if (building.id === 'SP') {
        centroid = {
            latitude: centroid.latitude - 0.00020,
            longitude: centroid.longitude - 0.0002,
        };
    }

    return centroid;
};

// Define building colors
const buildingColors = {
    SP: { stroke: 'rgba(0, 204, 255, 0.8)', fill: 'rgba(0, 204, 255, 0.4)' },
    GE: { stroke: 'rgba(153, 51, 255, 0.8)', fill: 'rgba(153, 51, 255, 0.4)' },
    RF: { stroke: 'rgba(255, 165, 0, 0.8)', fill: 'rgba(255, 165, 0, 0.4)' },
    CJ: { stroke: 'rgba(102, 204, 0, 0.8)', fill: 'rgba(102, 204, 0, 0.4)' },
    CC: { stroke: 'rgba(255, 102, 0, 0.8)', fill: 'rgba(255, 102, 0, 0.4)' },
    AD: { stroke: 'rgba(255, 204, 0, 0.8)', fill: 'rgba(255, 204, 0, 0.4)' },
    PY: { stroke: 'rgba(0, 102, 204, 0.8)', fill: 'rgba(0, 102, 204, 0.4)' },
    FC: { stroke: 'rgba(204, 0, 204, 0.8)', fill: 'rgba(204, 0, 204, 0.4)' },
    VL: { stroke: 'rgba(0, 153, 76, 0.8)', fill: 'rgba(0, 153, 76, 0.4)' },
};

const LoyolaMap = () => {
    const mapRef = useRef(null);
    const router = useRouter();
    const { userLocation, nearestBuilding } = useLocationHandler(LoyolaBuildings, getCentroid);
    const [userHeading, setUserHeading] = useState(null);
    const [searchText, setSearchText] = useState('');
    const [showRecenterButton, setShowRecenterButton] = useState(false);
    const [mapCenteredOnBuildings, setMapCenteredOnBuildings] = useState(true);

    // Search for a building and move the map to it
    useEffect(() => {
        if (searchText) {
            const building = LoyolaBuildings.find((b) =>
                b.name.toLowerCase().includes(searchText.toLowerCase())
            );
            if (building && mapRef.current) {
                mapRef.current.animateToRegion({
                    latitude: getCentroid(building)?.latitude || building.latitude,
                    longitude: getCentroid(building)?.longitude || building.longitude,
                    latitudeDelta: 0.001,
                    longitudeDelta: 0.001,
                });
            }
        }
    }, [searchText]);

    // Request location and heading permissions
    useEffect(() => {
        (async () => {
            const { granted } = await Location.requestForegroundPermissionsAsync();
            if (!granted) return;

            Location.watchHeadingAsync((headingData) => {
                setUserHeading(headingData.trueHeading);
            });
        })();
    }, []);

    // Track user's position and show recenter button if far from buildings
    useEffect(() => {
        if (!userLocation || !mapRef.current) return;

        const buildingsRegion = {
            latitude: 45.4582,
            longitude: -73.6405,
        };

        mapRef.current.getCamera().then((camera) => {
            const userDistance = Math.sqrt(
                Math.pow(userLocation.latitude - camera.center.latitude, 2) +
                Math.pow(userLocation.longitude - camera.center.longitude, 2)
            );

            const farFromBuildings =
                Math.sqrt(
                    Math.pow(userLocation.latitude - buildingsRegion.latitude, 2) +
                    Math.pow(userLocation.longitude - buildingsRegion.longitude, 2)
                ) > 0.002;

            setShowRecenterButton(farFromBuildings || userDistance > 0.0005);
        });
    }, [userLocation]);

    // Move map between user location and buildings
    const recenterMap = () => {
        if (mapRef.current) {
            if (mapCenteredOnBuildings && userLocation) {
                mapRef.current.animateToRegion({
                    latitude: userLocation.latitude,
                    longitude: userLocation.longitude,
                    latitudeDelta: 0.001,
                    longitudeDelta: 0.001,
                });
            } else {
                mapRef.current.animateToRegion({
                    latitude: 45.4582,
                    longitude: -73.6405,
                    latitudeDelta: 0.005,
                    longitudeDelta: 0.005,
                });
            }
            setMapCenteredOnBuildings(!mapCenteredOnBuildings);
        }
    };

    return (
       <View style={styles.container}>
            <View style={styles.searchContainer}>
                <Ionicons name="search" size={20} color="#A0A0A0" style={styles.searchIcon} />
                <TextInput
                    style={styles.searchInput}
                    placeholder="Search for buildings, locations..."
                    placeholderTextColor="#A0A0A0"
                    value={searchText}
                    onChangeText={setSearchText}
                    testID="search-input"
                />
            </View>
            <MapView ref={mapRef} style={styles.map} initialRegion={{ latitude: 45.4582, longitude: -73.6405, latitudeDelta: 0.005, longitudeDelta: 0.005 }}>
                {userLocation && (
                    <>
                        <Marker coordinate={userLocation} anchor={{ x: 0.5, y: 0.5 }}>
                            <View style={styles.userMarker}>
                                <View style={styles.whiteOutline}>
                                    <View style={styles.userDot} />
                                </View>
                            </View>
                        </Marker>

                        {/* {userHeading !== null && (
                            <Polygon
                                coordinates={[
                                    userLocation,
                                    {
                                        latitude: userLocation.latitude + 0.00015 * Math.cos((userHeading - 30) * (Math.PI / 180)),
                                        longitude: userLocation.longitude + 0.00015 * Math.sin((userHeading - 30) * (Math.PI / 180)),
                                    },
                                    {
                                        latitude: userLocation.latitude + 0.0003 * Math.cos(userHeading * (Math.PI / 180)),
                                        longitude: userLocation.longitude + 0.0003 * Math.sin(userHeading * (Math.PI / 180)),
                                    },
                                ]}
                                fillColor="rgba(0, 122, 255, 0.3)"
                                strokeColor="rgba(0, 122, 255, 0.6)"
                                strokeWidth={1}
                            />
                        )} */}
                    </>
                )}

                {LoyolaBuildings.map((building) => (
                    <BuildingMarker
                        key={building.id}
                        building={building}
                        router={router}
                        position={getCentroid(building)}
                        buildingColors={buildingColors}
                    />
                ))}
            </MapView>

            {showRecenterButton && (
                <TouchableOpacity style={styles.recenterButton} onPress={recenterMap}>
                    <Text style={styles.recenterText}>📍</Text>
                </TouchableOpacity>
            )}
        </View>
    );
};


const styles = StyleSheet.create({
    container: { flex: 1 },
    map: { flex: 1 },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFF',
        borderRadius: 8,
        paddingHorizontal: 10,
        margin: 10,
        borderWidth: 1,
        borderColor: '#ccc',
    },
    searchIcon: { marginRight: 8 },
    searchInput: { flex: 1, fontSize: 16, paddingVertical: 5 },
    userMarker: { alignItems: 'center', justifyContent: 'center' },
    whiteOutline: { width: 16, height: 16, borderRadius: 8, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center' },
    userDot: { width: 12, height: 12, borderRadius: 6, backgroundColor: '#9B1B30' },
    recenterButton: {
        position: 'absolute',
        top: 65, // Adjust to be below the search bar
        right: 20, // Keep it near the right edge
        backgroundColor: '#9B1B30',
        padding: 12,
        borderRadius: 25,
        elevation: 5, // Android shadow
        shadowColor: '#000', // iOS shadow
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 3,
    },    
    recenterText: { fontSize: 20, color: '#fff', textAlign: 'center' },
});


export default LoyolaMap;
