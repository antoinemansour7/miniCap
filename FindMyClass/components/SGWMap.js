import React, { useRef, useState } from 'react';
import { View, StyleSheet, Text, TextInput, TouchableOpacity } from 'react-native';
import MapView, { Marker, Polygon } from 'react-native-maps';
import SGWBuildings from './SGWBuildings';
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

    return {
        latitude: sumLat / totalPoints,
        longitude: sumLon / totalPoints,
    };
};

// Define building colors
const buildingColors = {
    H: { stroke: 'rgba(155, 27, 48, 0.8)', fill: 'rgba(155, 27, 48, 0.4)' },
    MB: { stroke: 'rgba(155, 27, 48, 0.8)', fill: 'rgba(155, 27, 48, 0.4)' },
    FT: { stroke: 'rgba(155, 27, 48, 0.8)', fill: 'rgba(155, 27, 48, 0.4)' },
    WL: { stroke: 'rgba(155, 27, 48, 0.8)', fill: 'rgba(155, 27, 48, 0.4)' },
    CL: { stroke: 'rgba(155, 27, 48, 0.8)', fill: 'rgba(155, 27, 48, 0.4)' },
    FG: { stroke: 'rgba(155, 27, 48, 0.8)', fill: 'rgba(155, 27, 48, 0.4)' },
    EV: { stroke: 'rgba(155, 27, 48, 0.8)', fill: 'rgba(155, 27, 48, 0.4)' },
};

const SGWMap = () => {
    const mapRef = useRef(null);
    const router = useRouter();
    const [searchText, setSearchText] = useState('');

    // 🔥 Mock user location near Hall Building (H)
    const userLocation = { latitude: 45.4971, longitude: -73.5785 };

    // 🔥 Mock nearest building as Hall (H)
    const nearestBuilding = SGWBuildings.find((b) => b.id === 'H');

    // Search for a building and move the map to it
    const searchBuilding = () => {
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
                    onSubmitEditing={searchBuilding}
                    testID="search-input"
                />
            </View>
            <MapView
                ref={mapRef}
                style={styles.map}
                initialRegion={{
                    latitude: 45.4965,
                    longitude: -73.5780,
                    latitudeDelta: 0.002,
                    longitudeDelta: 0.002,
                }}
                showsUserLocation={false}
            >
                {/* Mock User Location Marker */}
                <Marker coordinate={userLocation} anchor={{ x: 0.5, y: 0.5 }}>
                    <View style={styles.userMarker}>
                        <View style={styles.whiteOutline}>
                            <View style={styles.userDot} />
                        </View>
                    </View>
                </Marker>

                {/* Building Markers with Mocked Nearest */}
                {SGWBuildings.map((building) => (
                    <BuildingMarker
                        key={building.id}
                        building={building}
                        router={router}
                        position={getCentroid(building)}
                        buildingColors={buildingColors}
                        nearestBuilding={nearestBuilding} // 🔥 Forces Hall as nearest
                    />
                ))}
            </MapView>
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
    whiteOutline: {
        width: 16,
        height: 16,
        borderRadius: 8,
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
    },
    userDot: { width: 12, height: 12, borderRadius: 6, backgroundColor: '#9B1B30' },
});

export default SGWMap;
