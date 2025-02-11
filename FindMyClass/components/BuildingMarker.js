import React from 'react';
import { Marker, Callout, CalloutSubview, Polygon } from 'react-native-maps';
import { View, Text, ScrollView, StyleSheet } from 'react-native';

const BuildingMarker = ({ building, router, nearestBuilding, buildingColors, position }) => {
    if (!position) return null; // Ensure we don't render invalid markers

    return (
        <>
            <Marker
                coordinate={position}
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

                        <CalloutSubview
                            onPress={() => {
                                console.log("Navigation to directions:", building.name);
                                router.push({
                                    pathname: "/screens/directions",
                                    params: {
                                        destination: JSON.stringify(position),
                                        buildingName: building.name,
                                    },
                                });
                            }}
                            style={styles.button}
                        >
                            <Text style={styles.buttonText}>Get Directions</Text>
                        </CalloutSubview>
                    </ScrollView>
                </Callout>
            </Marker>

            {/* Polygon for building boundaries */}
            {building.boundary && (
                <Polygon
                    coordinates={building.boundary.outer || building.boundary}
                    holes={building.boundary.inner ? [building.boundary.inner] : undefined}
                    strokeColor={buildingColors[building.id]?.stroke || 'rgba(0, 0, 0, 0.8)'}
                    fillColor={buildingColors[building.id]?.fill || 'rgba(0, 0, 0, 0.4)'}
                    strokeWidth={2}
                />
            )}
        </>
    );
};

const styles = StyleSheet.create({
    calloutContainer: { width: 250, padding: 12, backgroundColor: '#fff' },
    calloutTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 8 },
    calloutDescription: { fontSize: 14, marginBottom: 12 },
    calloutText: { fontSize: 12, marginBottom: 6 },
    boldText: { fontWeight: 'bold' },
    button: { backgroundColor: '#912338', padding: 8, borderRadius: 5, marginTop: 15 },
    buttonText: { color: '#fff', fontWeight: 'bold', textAlign: 'center' },
});

export default BuildingMarker;
