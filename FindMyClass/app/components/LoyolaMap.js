// app/component/LoyolaMap.js
import React from 'react';
import { View, StyleSheet } from 'react-native';
import MapView, { Marker, Polygon } from 'react-native-maps';

//dummy data for now
const loyolaBuildings = [
    {
        id: 'AD',
        name: 'Administration Building',
        latitude: 45.4582,
        longitude: -73.6405,
        boundary: [
            { latitude: 45.4580, longitude: -73.6403 },
            { latitude: 45.4583, longitude: -73.6404 },
            { latitude: 45.4584, longitude: -73.6406 },
            { latitude: 45.4581, longitude: -73.6407 },
            { latitude: 45.4580, longitude: -73.6403 },
        ],
    },
];

const LoyolaMap = () => {
    return (
        
        // dummy data
        <View style={styles.container}>
            <MapView
                style={styles.map}
                initialRegion={{
                    latitude: 45.4582,
                    longitude: -73.6405,
                    latitudeDelta: 0.005,
                    longitudeDelta: 0.005,
                }}
            >
                {loyolaBuildings.map((building) => (
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
                                strokeColor="rgba(0, 102, 204, 0.8)" // Blue outline
                                fillColor="rgba(0, 102, 204, 0.4)" // Transparent blue
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

export default LoyolaMap;
