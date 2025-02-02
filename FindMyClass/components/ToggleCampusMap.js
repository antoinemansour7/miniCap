import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Text } from 'react-native';
import SGWMap from './SGWMap';
import LoyolaMap from './LoyolaMap';

const ToggleCampusMap = ({ searchText }) => {
    const [selectedCampus, setSelectedCampus] = useState('SGW');

    return (
        <View style={styles.container}>
            {/* Campus Map */}
            <View style={styles.mapContainer}>
                {selectedCampus === 'SGW' ? (
                    <SGWMap searchText={searchText} />
                ) : (
                    <LoyolaMap searchText={searchText} />
                )}
            </View>

            {/* Toggle Button */}
            <View style={styles.toggleContainer}>
                <TouchableOpacity
                    style={[
                        styles.toggleButton,
                        selectedCampus === 'Loyola' && styles.activeButton,
                    ]}
                    onPress={() => setSelectedCampus('Loyola')}
                >
                    <Text
                        style={[
                            styles.toggleText,
                            selectedCampus === 'Loyola' && styles.activeText,
                        ]}
                    >
                        Loyola Campus
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[
                        styles.toggleButton,
                        selectedCampus === 'SGW' && styles.activeButton,
                    ]}
                    onPress={() => setSelectedCampus('SGW')}
                >
                    <Text
                        style={[
                            styles.toggleText,
                            selectedCampus === 'SGW' && styles.activeText,
                        ]}
                    >
                        SGW Campus
                    </Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    mapContainer: {
        flex: 1,
    },
    toggleContainer: {
        position: 'absolute',
        bottom: 50,
        alignSelf: 'center',
        flexDirection: 'row',
        backgroundColor: '#F8F8F8',
        borderRadius: 25,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 3,
        elevation: 5,
    },
    toggleButton: {
        flex: 1,
        paddingVertical: 12,
        paddingHorizontal: 20,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#D3D3D3',
    },
    activeButton: {
        backgroundColor: '#800000', // Dark Red for active button
    },
    toggleText: {
        color: '#333',
        fontWeight: '600',
        fontSize: 16,
    },
    activeText: {
        color: '#FFF',
        fontWeight: '700',
    },
});

export default ToggleCampusMap;
