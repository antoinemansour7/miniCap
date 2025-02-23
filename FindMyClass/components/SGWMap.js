import React, { useRef, useEffect, useState } from 'react';
import { View, StyleSheet, Text, TextInput, TouchableOpacity } from 'react-native';
import MapView, { Marker, Polygon, Circle } from 'react-native-maps';
import * as Location from 'expo-location';
import SGWBuildings from './SGWBuildings';
import useLocationHandler from '../hooks/useLocationHandler';
import { useRouter } from 'expo-router';
import BuildingMarker from './BuildingMarker';
import SearchBar from './SearchBar';
import mapStyles from './mapStyles';

// Compute centroid for buildings
const getCentroid = (building) => {
    const boundary = building.boundary?.outer || building.boundary;
    if (!boundary || boundary.length === 0) return null;
    
    const totalPoints = boundary.length;
    const sumLat = boundary.reduce((sum, point) => sum + point.latitude, 0);
    const sumLon = boundary.reduce((sum, point) => sum + point.longitude, 0);
    
    return {
        latitude: sumLat / totalPoints,
        longitude: sumLon / totalPoints,
    };
};


const SGWMap = () => {
    const mapRef = useRef(null);
    const router = useRouter();
    const { userLocation, nearestBuilding } = useLocationHandler(SGWBuildings, getCentroid);
    const [userHeading, setUserHeading] = useState(null);
    const [searchText, setSearchText] = useState('');
    const [showRecenterButton, setShowRecenterButton] = useState(false);
    const [mapCenteredOnBuildings, setMapCenteredOnBuildings] = useState(true);

    // Search for a building and move the map to it
    useEffect(() => {
        if (searchText) {
            const building = SGWBuildings.find((b) =>
                b.name.toLowerCase().includes(searchText.toLowerCase())
            );
            if (building && mapRef.current) {
                mapRef.current.animateToRegion({
                    latitude: building.latitude,
                    longitude: building.longitude,
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
            latitude: 45.4965,
            longitude: -73.5780,
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
                    latitude: 45.4965,
                    longitude: -73.5780,
                    latitudeDelta: 0.002,
                    longitudeDelta: 0.002,
                });
            }
            setMapCenteredOnBuildings(!mapCenteredOnBuildings);
        }
    };

    return (
        <View style={mapStyles.container}>
            <SearchBar value={searchText} onChangeText={setSearchText} data={SGWBuildings}  />
            <MapView
                ref={mapRef}
                style={mapStyles.map}
                initialRegion={{
                    latitude: 45.4965,
                    longitude: -73.5780,
                    latitudeDelta: 0.002,
                    longitudeDelta: 0.002,
                }}
                showsUserLocation={false}
            >
                {userLocation && (
                    <>
                        {/* User Location Marker */}
                        <Marker coordinate={userLocation} anchor={{ x: 0.5, y: 0.5 }}>
                            <View style={mapStyles.userMarker}>
                                <View style={mapStyles.whiteOutline}>
                                    <View style={mapStyles.userDot} />
                                </View>
                            </View>
                        </Marker>

                    </>
                )}

                {/* Building Markers */}
                {SGWBuildings.map((building) => (
                    <BuildingMarker
                        key={building.id}
                        building={building}
                        router={router}
                        position={getCentroid(building)}
                    />
                ))}
            </MapView>

            {showRecenterButton && (
                <TouchableOpacity style={mapStyles.recenterButton} onPress={recenterMap}>
                    <Text style={mapStyles.recenterText}>📍</Text>
                </TouchableOpacity>
            )}
        </View>
    );
};

export default SGWMap;