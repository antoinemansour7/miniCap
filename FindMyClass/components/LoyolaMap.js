import React, { useRef, useEffect } from 'react';
import { View, StyleSheet, Text } from 'react-native';
import MapView from 'react-native-maps';
import LoyolaBuildings from './loyolaBuildings';
import useLocationHandler from '../hooks/useLocationHandler';
import { useRouter } from 'expo-router';
import BuildingMarker from './BuildingMarker';

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

const LoyolaMap = ({ searchText }) => {
    const mapRef = useRef(null);
    const router = useRouter();
    const { userLocation, nearestBuilding, noNearbyBuilding, messageVisible } = useLocationHandler(
        LoyolaBuildings,
        getCentroid
    );

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

    return (
        <View style={styles.container}>
            <MapView
                ref={mapRef}
                style={styles.map}
                initialRegion={{
                    latitude: 45.4582,
                    longitude: -73.6405,
                    latitudeDelta: 0.005,
                    longitudeDelta: 0.005,
                }}
            >
                {/* {LoyolaBuildings.map((building) => (
                    <BuildingMarker
                        key={building.id}
                        building={building}
                        router={router}
                        nearestBuilding={nearestBuilding}
                        // getCentroid={getCentroid}
                        buildingColors={buildingColors}
                    />
                ))} */}
                {LoyolaBuildings.map((building) => {
    const position = getCentroid(building);
    if (!position) return null; // Avoid rendering markers with no valid position

    return (
        <BuildingMarker
            key={building.id}
            building={building}
            router={router}
            nearestBuilding={nearestBuilding}
            buildingColors={buildingColors}
            position={position} // Pass the computed position
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

export default LoyolaMap;
