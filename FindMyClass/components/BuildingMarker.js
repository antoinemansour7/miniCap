import React, { memo, useCallback, useRef } from 'react';
import { Marker, Callout, CalloutSubview, Polygon } from 'react-native-maps';
import { View, Text, StyleSheet, Alert } from 'react-native';

// Memoized Callout to prevent unnecessary re-renders
const CalloutContent = memo(({ building, router, position, openAlert, markerRef }) => (
    <View style={styles.calloutContainer}>
        <Text style={styles.calloutTitle}>{building.name}</Text>
        <View style={styles.buttonRow}>
            <CalloutSubview
                onPress={() => {
                    markerRef?.current?.hideCallout(); // Close Callout before navigating
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
                    <Text style={styles.buttonText}>Directions</Text>
                </View>
            </CalloutSubview>

            <CalloutSubview
                onPress={() => {
                    markerRef?.current?.hideCallout(); // Close Callout before opening the alert
                    openAlert();
                }}
                style={styles.buttonContainer}
            >
                <View style={styles.button}>
                    <Text style={styles.buttonText}>More Info</Text>
                </View>
            </CalloutSubview>
        </View>
    </View>
), (prevProps, nextProps) => prevProps.building.id === nextProps.building.id);

const BuildingMarker = ({ building, router, nearestBuilding, position }) => {
    const markerRef = useRef(null);

    const openAlert = useCallback(() => {
        let message = "";
        if (building.purpose) {
            message += `🏢 Purpose: ${building.purpose}\n`;
        }
        if (building.facilities) {
            message += `🛠 Facilities: ${building.facilities}\n`;
        }
        if (building.address) {
            message += `📍 Address: ${building.address}\n`;
        }
        if (building.contact) {
            message += `☎ Contact: ${building.contact}\n`;
        }
        if (building.description) {
            message += `ℹ Description: ${building.description}`;
        }
        Alert.alert(building.name, message, [{ text: 'Close', style: 'cancel' }]);
    }, [building]);

    if (!position) return null;

    return (
        <>
            <Marker
                ref={markerRef}
                coordinate={position}
                title={building.name}
                pinColor={nearestBuilding?.id === building.id ? 'red' : undefined}
            >
                <Callout>
                    <CalloutContent
                        building={building}
                        router={router}
                        position={position}
                        openAlert={openAlert}
                        markerRef={markerRef}
                    />
                </Callout>
            </Marker>

            {building.boundary && (
                <Polygon
                    coordinates={building.boundary.outer || building.boundary}
                    holes={building.boundary.inner ? [building.boundary.inner] : undefined}
                    strokeColor={'rgba(155, 27, 48, 0.8)'}
                    fillColor={'rgba(155, 27, 48, 0.4)'}
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
        alignItems: 'center',
    },
    calloutTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 12,
        textAlign: 'center',
    },
    buttonRow: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 6,
    },
    buttonContainer: {
        alignItems: 'center',
    },
    button: {
        backgroundColor: '#912338',
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 6,
        justifyContent: 'center',
        alignItems: 'center',
        minWidth: 80,
    },
    buttonText: {
        color: '#fff',
        fontSize: 13,
        fontWeight: 'bold',
        textAlign: 'center',
    },
});

export default BuildingMarker;
