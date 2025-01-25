// app/component/ToggleCampusMap.js
import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Text } from 'react-native';
import SGWMap from './SGWMap';
import LoyolaMap from './LoyolaMap';

const ToggleCampusMap = () => {
    const [selectedCampus, setSelectedCampus] = useState('SGW'); // Default campus

    return (
        <View style={styles.container}>
            {/* Render the selected map */}
            {selectedCampus === 'SGW' ? <SGWMap /> : <LoyolaMap />}

            {/* Floating Toggle */}
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
    toggleContainer: {
        position: 'absolute', // Floating over the map
        bottom: 50, // Adjust to position higher than the very bottom
        alignSelf: 'center',
        flexDirection: 'row',
        backgroundColor: '#F8F8F8',
        borderRadius: 25,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 3,
        elevation: 5, // For Android shadow
    },
    toggleButton: {
        flex: 1,
        padding: 10,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#E0E0E0',
    },
    activeButton: {
        backgroundColor: '#800000', // Active button color
    },
    toggleText: {
        color: '#333',
        fontWeight: '600',
    },
    activeText: {
        color: '#FFF',
    },
});

export default ToggleCampusMap;
