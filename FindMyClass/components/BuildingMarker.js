import React from 'react';
import { Marker, Callout, CalloutSubview, Polygon } from 'react-native-maps';
import { View, Text, StyleSheet } from 'react-native';

const BuildingMarker = ({ building, router, nearestBuilding, buildingColors, position }) => {
    if (!position) return null; // Ensure we don't render invalid markers

    return (
        <>
            <Marker
                coordinate={position}
                title={building.name}
                pinColor={nearestBuilding?.id === building.id ? 'red' : undefined}
            >
                <Callout>
                    <View style={styles.calloutContainer}>
                        <Text style={styles.calloutDescription}>{building.description}</Text>

                        {/* Perfectly Centered "Get Directions" Button */}
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
                            style={styles.buttonContainer}
                        >
                            <View style={styles.button}>
                                <Text style={styles.buttonText}>Get Directions</Text>
                            </View>
                        </CalloutSubview>
                    </View>
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
    calloutContainer: {
        width: 200,
        padding: 12,
        backgroundColor: '#fff',
        borderRadius: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 3,
        elevation: 4,
        alignItems: 'center', // Centers everything inside
    },
    calloutDescription: {
        fontSize: 14,
        color: '#333',
        textAlign: 'center',
        marginBottom: 10,
    },
    buttonContainer: {
        width: '100%', // Ensures the button is treated as a block element
        alignItems: 'center', // Centers the button horizontally
    },
    button: {
        backgroundColor: '#912338',
        paddingVertical: 10, // Adjusted for better vertical centering
        paddingHorizontal: 16,
        borderRadius: 8, // More rounded corners for a clean look
        justifyContent: 'center',
        alignItems: 'center',
        minWidth: 130, // Sets a reasonable button width
    },
    buttonText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: 'bold',
        textAlign: 'center',
    },
});

export default BuildingMarker;
