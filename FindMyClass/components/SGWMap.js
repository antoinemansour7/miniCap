import React, { useRef, useEffect } from 'react';
import { View, StyleSheet, Text, ScrollView, TouchableOpacity } from 'react-native';
import MapView, { Marker, Callout, Polygon } from 'react-native-maps';
import SGWBuildings from './SGWBuildings';
import useLocationHandler from '../hooks/useLocationHandler';

const SGWMap = ({ searchText }) => {
    const mapRef = useRef(null);

    const { userLocation, nearestBuilding, noNearbyBuilding, messageVisible } = useLocationHandler(SGWBuildings);

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
                {SGWBuildings.map((building) => (
                    <React.Fragment key={building.id}>
                        <Marker
                            coordinate={{
                                latitude: building.latitude,
                                longitude: building.longitude,
                            }}
                            title={building.name}
                            description={`Building ID: ${building.id}`}
                            pinColor={nearestBuilding?.id === building.id ? 'red' : undefined}
                        >
                            <Callout>
                                <ScrollView style={styles.calloutContainer}>
                                    <Text style={styles.calloutTitle}>{building.name}</Text>
                                    <Text style={styles.calloutDescription}>{building.description}</Text>
                                    <Text style={styles.calloutText}>
                                        <Text style={styles.boldText}>Purpose:</Text> {building.purpose}
                                    </Text>
                                    <Text style={styles.calloutText}>
                                        <Text style={styles.boldText}>Facilities:</Text> {building.facilities}
                                    </Text>
                                    <Text style={styles.calloutText}>
                                        <Text style={styles.boldText}>Address:</Text> {building.address}
                                    </Text>
                                    <Text style={styles.calloutText}>
                                        <Text style={styles.boldText}>Contact:</Text> {building.contact}
                                    </Text>
                                    <TouchableOpacity style={styles.button} onPress={() => { /* some action */ }}>
                                        <Text style={styles.buttonText}>Get Directions</Text>
                                    </TouchableOpacity>
                                </ScrollView>
                            </Callout>
                        </Marker>
                        {building.boundary && (
                            <Polygon
                                coordinates={building.boundary}
                                strokeColor={buildingColors[building.id]?.stroke || 'rgba(0, 0, 0, 0.8)'}
                                fillColor={buildingColors[building.id]?.fill || 'rgba(0, 0, 0, 0.4)'}
                                strokeWidth={2}
                            />
                        )}
                    </React.Fragment>
                ))}
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
    container: {
        flex: 1,
    },
    map: {
        flex: 1,
    },
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
    calloutContainer: {
        width: 250,
        padding: 12,
        borderRadius: 10,
        backgroundColor: '#fff',
        shadowColor: '#000',
        shadowOpacity: 0.3,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 2 },
    },
    calloutTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 8,
    },
    calloutDescription: {
        fontSize: 14,
        color: '#666',
        marginBottom: 12,
    },
    calloutText: {
        fontSize: 12,
        color: '#444',
        marginBottom: 6,
    },
    boldText: {
        fontWeight: 'bold',
        color: '#333',
    },
    button: {
        backgroundColor: '#007BFF',
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 5,
        marginTop: 15,
    },
    buttonText: {
        color: '#fff',
        fontWeight: 'bold',
        textAlign: 'center',
    },
});

export default SGWMap;
