import React, { useRef, useEffect } from 'react';
import { View, StyleSheet, Text } from 'react-native';
import MapView from 'react-native-maps';
import SGWBuildings from './SGWBuildings';
import useLocationHandler from '../hooks/useLocationHandler';
import { useRouter } from 'expo-router';
import BuildingMarker from './BuildingMarker';

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

const SGWMap = ({ searchText }) => {
    const mapRef = useRef(null);
    const router = useRouter();
    const { userLocation, nearestBuilding, noNearbyBuilding, messageVisible } = useLocationHandler(
        SGWBuildings,
        getCentroid
    );

    useEffect(() => {
        if (searchText) {
            const building = SGWBuildings.find((b) =>
                b.name.toLowerCase().includes(searchText.toLowerCase())
            );
            if (building && mapRef.current) {
                const centroid = getCentroid(building) || {
                    latitude: building.latitude,
                    longitude: building.longitude,
                };

                mapRef.current.animateToRegion({
                    latitude: centroid.latitude,
                    longitude: centroid.longitude,
                    latitudeDelta: 0.001,
                    longitudeDelta: 0.001,
                });
            }
        }
    }, [searchText]);

    const buildingColors = {
        H: { stroke: 'rgba(255, 204, 0, 0.8)', fill: 'rgba(255, 204, 0, 0.4)' },
        MB: { stroke: 'rgba(0, 204, 255, 0.8)', fill: 'rgba(0, 204, 255, 0.4)' },
        FT: { stroke: 'rgba(255, 102, 0, 0.8)', fill: 'rgba(255, 102, 0, 0.4)' },
        WL: { stroke: 'rgba(102, 204, 0, 0.8)', fill: 'rgba(102, 204, 0, 0.4)' },
        CL: { stroke: 'rgba(204, 0, 204, 0.8)', fill: 'rgba(204, 0, 204, 0.4)' },
        FG: { stroke: 'rgba(153, 51, 255, 0.8)', fill: 'rgba(153, 51, 255, 0.4)' },
        EV: { stroke: 'rgba(0, 102, 204, 0.8)', fill: 'rgba(0, 102, 204, 0.4)' },
    };

    return (
        <View style={styles.container}>
            <MapView
                ref={mapRef}
                style={styles.map}
                initialRegion={{
                    latitude: 45.4965,
                    longitude: -73.5780,
                    latitudeDelta: 0.002,
                    longitudeDelta: 0.002,
                }}
            >
                {SGWBuildings.map((building) => {
                    const centroid = getCentroid(building) || {
                        latitude: building.latitude,
                        longitude: building.longitude,
                    };

                    return (
                        <BuildingMarker
                            key={building.id}
                            building={building}
                            router={router}
                            nearestBuilding={nearestBuilding}
                            buildingColors={buildingColors}
                            position={centroid}
                        />
                    );
                })}
            </MapView>

            {messageVisible && noNearbyBuilding && (
                <View style={styles.messageContainer}>
                    <Text style={styles.messageText}>You are not near any of the buildings.</Text>
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1 },
    map: { flex: 1 },
    messageContainer: {
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: [{ translateX: -150 }, { translateY: -30 }],
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        padding: 15,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
        width: '80%',
    },
    messageText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
        textAlign: 'center',
    },
});

export default SGWMap;
