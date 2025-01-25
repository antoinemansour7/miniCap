import React from 'react';
import { View, StyleSheet } from 'react-native';
import MapView, { Marker, Polygon } from 'react-native-maps';

const SGWMap = () => {
    const buildings = [
        {
            id: 'H',
            name: 'Hall Building',
            latitude: 45.4971807962744,
            longitude: -73.57881293261063,
            boundary: [
                { latitude: 45.4968261, longitude: -73.5788241 },
                { latitude: 45.4970373, longitude: -73.5786245 },
                { latitude: 45.4972544, longitude: -73.5784089 },
                { latitude: 45.4973714, longitude: -73.5782927 },
                { latitude: 45.4974227, longitude: -73.5783990 },
                { latitude: 45.4975092, longitude: -73.5785783 },
                { latitude: 45.4977164, longitude: -73.5790075 },
                { latitude: 45.4977130, longitude: -73.5790121 },
                { latitude: 45.4974475, longitude: -73.5792690 },
                { latitude: 45.4971739, longitude: -73.5795378 },
                { latitude: 45.4971671, longitude: -73.5795431 },
                { latitude: 45.4971280, longitude: -73.5794591 },
                { latitude: 45.4968261, longitude: -73.5788241 }
            ],
        },
        {
            id: 'MB',
            name: 'John Molson School of Business',
            latitude: 45.495607779093056,
            longitude: -73.57924680562708,
        },
        {
            id: 'MB-2',
            name: 'MB Concordia University - School of Business',
            latitude: 45.49539820008345,
            longitude: -73.57909794795503,
        },
        {
            id: 'FT',
            name: 'Faubourg Tower',
            latitude: 45.49473610149828,
            longitude: -73.57769709213537,
        },
        {
            id: 'WL',
            name: 'Webster Library, Concordia University',
            latitude: 45.49700208175132,
            longitude: -73.57808391911882,
        },
    ];

    return (
        <View style={styles.container}>
            <MapView
                style={styles.map}
                initialRegion={{
                    latitude: 45.4965, // Center point latitude
                    longitude: -73.5780, // Center point longitude
                    latitudeDelta: 0.002, // Zoom level
                    longitudeDelta: 0.002,
                }}
            >
                {buildings.map((building) => (
                    <React.Fragment key={building.id}>
                        {/* Marker for all buildings */}
                        <Marker
                            coordinate={{
                                latitude: building.latitude,
                                longitude: building.longitude,
                            }}
                            title={building.name}
                            description={`Building ID: ${building.id}`}
                        />

                        {/* Highlight only for Hall Building */}
                        {building.id === 'H' && building.boundary && (
                            <Polygon
                                coordinates={building.boundary}
                                strokeColor="rgba(255, 204, 0, 0.8)" // Yellow outline
                                fillColor="rgba(255, 204, 0, 0.4)" // Transparent yellow fill
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
