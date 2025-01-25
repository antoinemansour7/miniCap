// app/component/SGWMap.js
import React from 'react';
import { View, StyleSheet } from 'react-native';
import MapView, { Marker, Polygon } from 'react-native-maps';
import buildings from './SGWBuildings'; // Import the building data

const SGWMap = () => {
    return (
        <View style={styles.container}>
            <MapView
                style={styles.map}
                initialRegion={{
                    latitude: 45.4965,
                    longitude: -73.5780,
                    latitudeDelta: 0.002,
                    longitudeDelta: 0.002,
                }}
            >
                {buildings.map((building) => (
                    <React.Fragment key={building.id}>
                        {/* Marker */}
                        <Marker
                            coordinate={{
                                latitude: building.latitude,
                                longitude: building.longitude,
                            }}
                            title={building.name}
                            description={`Building ID: ${building.id}`}
                        />

                        {/* Polygon */}
                        {building.boundary && (
                            <Polygon
                                coordinates={building.boundary}
                                strokeColor={
                                    building.id === 'H'
                                        ? 'rgba(255, 204, 0, 0.8)' // Yellow for Hall
                                        : building.id === 'MB'
                                        ? 'rgba(0, 204, 255, 0.8)' // Blue for MB
                                        : 'rgba(255, 102, 0, 0.8)' // Orange for Faubourg Tower
                                }
                                fillColor={
                                    building.id === 'H'
                                        ? 'rgba(255, 204, 0, 0.4)' // Transparent yellow
                                        : building.id === 'MB'
                                        ? 'rgba(0, 204, 255, 0.4)' // Transparent blue
                                        : 'rgba(255, 102, 0, 0.4)' // Transparent orange
                                }
                                strokeWidth={2}
                            />
                        )}
                    </React.Fragment>
                ))}
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

export default SGWMap;
