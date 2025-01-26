import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Text, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import SGWMap from './SGWMap';
import LoyolaMap from './LoyolaMap';

const ToggleCampusMap = () => {
    const [selectedCampus, setSelectedCampus] = useState('SGW');
    const [searchText, setSearchText] = useState('');

    return (
        <View style={styles.container}>
            <View style={styles.searchContainer}>
                <Ionicons name="search" size={20} color="#A0A0A0" style={styles.searchIcon} />
                <TextInput
                    style={styles.searchInput}
                    placeholder="Search for buildings, locations..."
                    placeholderTextColor="#A0A0A0"
                    value={searchText}
                    onChangeText={(text) => setSearchText(text)}
                />
            </View>

            <View style={styles.mapContainer}>
                {selectedCampus === 'SGW' ? (
                    <SGWMap searchText={searchText} />
                ) : (
                    <LoyolaMap />
                )}
            </View>

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
    searchContainer: {
        position: 'absolute',
        top: 10,
        width: '90%',
        alignSelf: 'center',
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFF',
        borderRadius: 8,
        paddingHorizontal: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 2,
        elevation: 3,
        zIndex: 1,
    },
    searchIcon: {
        marginRight: 8,
    },
    searchInput: {
        flex: 1,
        fontSize: 16,
        paddingVertical: 8,
        backgroundColor: '#F5F5F5',
        borderRadius: 5,
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
        padding: 10,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#E0E0E0',
    },
    activeButton: {
        backgroundColor: '#800000',
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
