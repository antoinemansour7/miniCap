import React, { useState, memo, useCallback, useRef } from 'react';
import { Marker, Callout, CalloutSubview, Polygon } from 'react-native-maps';
import { View, Text, StyleSheet, Modal, ScrollView, TouchableOpacity } from 'react-native';

// Memoized modal content with improved styling
const ModalContent = memo(({ building, onClose }) => (
    <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
            <ScrollView contentContainerStyle={styles.modalScroll}>
                <Text style={styles.modalTitle}>{building.name}</Text>
                {building.purpose && <Text style={styles.modalText}>🏢 Purpose: {building.purpose}</Text>}
                {building.facilities && <Text style={styles.modalText}>🛠 Facilities: {building.facilities}</Text>}
                {building.address && <Text style={styles.modalText}>📍 Address: {building.address}</Text>}
                {building.contact && <Text style={styles.modalText}>☎ Contact: {building.contact}</Text>}
                {building.description && <Text style={styles.modalText}>ℹ Description: {building.description}</Text>}
            </ScrollView>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                <Text style={styles.closeButtonText}>✖ Close</Text>
            </TouchableOpacity>
        </View>
    </View>
), (prevProps, nextProps) => prevProps.building.id === nextProps.building.id);

// Memoized Callout to prevent unnecessary re-renders
const CalloutContent = memo(({ building, router, position, openModal, markerRef }) => (
    <View style={styles.calloutContainer}>
        <Text style={styles.calloutTitle}>{building.name}</Text>
        <View style={styles.buttonRow}>
            <CalloutSubview
                onPress={() => {
                    markerRef?.current?.hideCallout(); // ✅ Close Callout before navigating
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
                    markerRef?.current?.hideCallout(); // ✅ Close Callout before opening the modal
                    openModal();
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
    const [modalVisible, setModalVisible] = useState(false);
    const markerRef = useRef(null); // ✅ Ref to control the marker

    const openModal = useCallback(() => {
        setTimeout(() => setModalVisible(true), 100);
    }, []);

    const closeModal = useCallback(() => {
        setModalVisible(false);
    }, []);

    if (!position) return null;

    return (
        <>
            <Marker
                ref={markerRef} // ✅ Attach the ref to the marker
                coordinate={position}
                title={building.name}
                pinColor={nearestBuilding?.id === building.id ? 'red' : undefined}
            >
                <Callout>
                    <CalloutContent
                        building={building}
                        router={router}
                        position={position}
                        openModal={openModal}
                        markerRef={markerRef} // ✅ Pass the ref to CalloutContent
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

            <Modal
                visible={modalVisible}
                animationType="fade"
                transparent={true}
                onRequestClose={closeModal}
            >
                <ModalContent building={building} onClose={closeModal} />
            </Modal>
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
        gap: 8,
    },
    buttonContainer: {
        alignItems: 'center',
    },
    button: {
        backgroundColor: '#912338',
        paddingVertical: 10,
        paddingHorizontal: 16,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
        minWidth: 90,
    },
    buttonText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: 'bold',
        textAlign: 'center',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.3)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    modalContainer: {
        width: '70%',
        height: '50%',
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 20,
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 5,
        alignItems: 'center',
    },
    modalScroll: {
        alignItems: 'center',
        paddingBottom: 20,
    },
    modalTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        marginBottom: 12,
        textAlign: 'center',
        color: '#333',
    },
    modalText: {
        fontSize: 16,
        marginBottom: 10,
        color: '#555',
        textAlign: 'center',
        lineHeight: 22,
    },
    closeButton: {
        marginTop: 12,
        backgroundColor: '#d32f2f',
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 20,
        minWidth: 100,
        alignItems: 'center',
    },
    closeButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
});

export default BuildingMarker;
