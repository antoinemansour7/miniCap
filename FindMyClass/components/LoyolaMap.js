import React, { useRef, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import MapView, { Marker, Polygon } from 'react-native-maps';
import LoyolaBuildings from './loyolaBuildings';

// Function to calculate the centroid of a building's outer boundary
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

    // Manual correction for SP (Richard J Renaud Science Complex)
    if (building.id === 'SP') {
        centroid = {
            latitude: centroid.latitude - 0.00020, // Move slightly south
            longitude: centroid.longitude - 0.0002, // Move slightly west
        };
    }

    return centroid;
};

const LoyolaMap = ({ searchText }) => {
    const mapRef = useRef(null);

    useEffect(() => {
        if (searchText) {
            const building = LoyolaBuildings.find((b) =>
                b.name.toLowerCase().includes(searchText.toLowerCase())
            );
            if (building && mapRef.current) {
                mapRef.current.animateToRegion({
                    latitude: getCentroid(building)?.latitude || building.latitude,
                    longitude: getCentroid(building)?.longitude || building.longitude,
                    latitudeDelta: 0.001, // Zoom in
                    longitudeDelta: 0.001,
                });
            }
        }
    }, [searchText]);

    const buildingColors = {
        AD: { stroke: 'rgba(255, 204, 0, 0.8)', fill: 'rgba(255, 204, 0, 0.4)' },
        SP: { stroke: 'rgba(0, 204, 255, 0.8)', fill: 'rgba(0, 204, 255, 0.4)' },
        CC: { stroke: 'rgba(255, 102, 0, 0.8)', fill: 'rgba(255, 102, 0, 0.4)' },
        CJ: { stroke: 'rgba(102, 204, 0, 0.8)', fill: 'rgba(102, 204, 0, 0.4)' },
        FC: { stroke: 'rgba(204, 0, 204, 0.8)', fill: 'rgba(204, 0, 204, 0.4)' },
        GE: { stroke: 'rgba(153, 51, 255, 0.8)', fill: 'rgba(153, 51, 255, 0.4)' },
        PY: { stroke: 'rgba(0, 102, 204, 0.8)', fill: 'rgba(0, 102, 204, 0.4)' },
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
                {LoyolaBuildings.map((building) => {
                    const centroid = getCentroid(building);

                    return (
                        <React.Fragment key={building.id}>
                            {/* Marker at centroid (adjusted for SP if needed) */}
                            {centroid && (
                                <Marker
                                    coordinate={centroid}
                                    title={building.name}
                                    description={`Building ID: ${building.id}`}
                                />
                            )}

                            {/* Polygon with outer and inner boundaries */}
                            {building.boundary && (
                                <Polygon
                                    coordinates={building.boundary.outer || building.boundary}
                                    holes={building.boundary.inner ? [building.boundary.inner] : undefined}
                                    strokeColor={buildingColors[building.id]?.stroke || 'rgba(0, 0, 0, 0.8)'}
                                    fillColor={buildingColors[building.id]?.fill || 'rgba(0, 0, 0, 0.4)'}
                                    strokeWidth={2}
                                />
                            )}
                        </React.Fragment>
                    );
                })}
            </MapView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    map: {
        flex: 1,
    },
});

export default LoyolaMap;
