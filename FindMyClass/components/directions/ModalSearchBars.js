import React, { useState } from "react";
import { View, TouchableOpacity, Modal, Text, TextInput } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { styles } from "../../styles/directionsStyles";
import GoogleSearchBar from "../GoogleSearchBar";
import SGWBuildings from '../../components/SGWBuildings';
import LoyolaBuildings from '../../components/loyolaBuildings';
import {getAllRooms} from "../rooms/HallBuildingRooms";


const ModalSearchBars = ({ 
    searchType,  
    isModalVisible, 
    handleCloseModal, 
    updateRoute,

    startLocation,
    setStartLocation,
    customSearchText,
    setCustomSearchText,
    setCustomStartName,
    customLocationDetails,
    setCustomLocationDetails,
    
    destination,
    setDestination,
    customDest,
    setCustomDest,
    setDestinationName, 
    setRoomNumber,
    

}) => {
    const isStartSearch = searchType === 'START'; // The modal will display a specific searh bar based on the searchType
    const hallBuildingRooms = getAllRooms();
    const allBuildings = [...SGWBuildings, ...LoyolaBuildings,...hallBuildingRooms];
    const [searchResults, setSearchResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);

    const searchBuildings = (searchText) => {
        setCustomDest(searchText);
        if (searchText.trim().length > 0) {
            const filtered = allBuildings.filter(building => 
                building.name.toLowerCase().includes(searchText.toLowerCase()) ||
                building.id.toLowerCase().includes(searchText.toLowerCase())
            );
            setSearchResults(filtered);
            setIsSearching(true);
        } else {
            setSearchResults([]);
            setIsSearching(false);
        }
    };
    const selectBuilding = (location) => {
        if ( location.building ) {
            selectBuilding(SGWBuildings.find(b => b.id === location.building ));
            setRoomNumber(location.id);
        }
        else {
            
            setCustomDest(location.name);
            setSearchResults([]);
            setIsSearching(false);
            
            const newDestination = {
                latitude: location.latitude,
                longitude: location.longitude
            };
            setDestination(newDestination);
            setDestinationName(location.name);
            updateRoute(startLocation, newDestination);
            handleCloseModal();

        }
    };

    const parseStreetName = (description) => {
        // Matches everything before first comma or before Montreal/QC/postal code
        const streetRegex = /^[^,]*(?=\s*(?:,|Montreal|QC|Quebec|H\d[A-Z]\s*\d[A-Z]\d))/i; // NOSONAR
        const match = description.match(streetRegex);
        return match ? match[0].trim() : description;
    };

    const handleCustomLocation = (location, description) => {
        const newStartLocation = {
            latitude: location.latitude,
            longitude: location.longitude
        };
        const streetName = parseStreetName(description);
        setStartLocation(newStartLocation);
        setCustomSearchText(streetName);
        setCustomStartName(streetName);
        setCustomLocationDetails({
            name: streetName,
            coordinates: newStartLocation
        });
        updateRoute(newStartLocation, destination);
        handleCloseModal();
    };


    const handleClearSearch = () => {
        setCustomDest('');
        setSearchResults([]);
        setIsSearching(false);
    };


    
    
    return (
        <Modal
            visible={isModalVisible} 
            animationType="none"
            transparent={true}
            onRequestClose={handleCloseModal}
        >
            <View style={styles.modalOverlay} testID="modal-overlay">
                <View style={styles.searchModalContent}>
                    <TouchableOpacity 
                        style={styles.closeButton}
                        onPress={handleCloseModal}
                        testID="close-button"
                    >
                        <Ionicons name="close" size={24} color="#666" />
                    </TouchableOpacity>
                    
                    <Text style={styles.modalTitle}>
                        {isStartSearch ? 'Search Start Location' : 'Search Destination'}
                    </Text>

                    <View style={styles.searchContainer}>
                        {isStartSearch ? ( // google search bar for the start location
                            <GoogleSearchBar 
                                onLocationSelected={handleCustomLocation}
                                initialValue={customLocationDetails.name || customSearchText}
                                key={`search-${customLocationDetails.name || customSearchText}`}
                            />
                        ) : ( // custom search bar for the destination
                            <> 
                                <View style={styles.textInputContainer}> 
                                    <TextInput
                                        style={[styles.input, { flex: 1, paddingRight: 30 }]}
                                        placeholder="Search for a building..."
                                        value={customDest}
                                        onChangeText={searchBuildings}
                                    />
                                    {customDest.length > 0 && (
                                        <TouchableOpacity 
                                            style={styles.clearButton}
                                            onPress={handleClearSearch}
                                            testID="clear-button"
                                        >
                                            <Ionicons name="close-circle" size={20} color="#D3D3D3" />
                                        </TouchableOpacity>
                                    )}
                                </View>
                                {isSearching && searchResults.length > 0 && (
                                    <View style={styles.searchResults}>
                                        {searchResults.map((building) => (
                                            <TouchableOpacity
                                                key={building.id}
                                                style={styles.searchResult}
                                                onPress={() => selectBuilding(building)}
                                            >
                                                <Text style={styles.buildingName}>{building.name}</Text>
                                                <Text style={styles.buildingId}>({building.id})</Text>
                                            </TouchableOpacity>
                                        ))}
                                    </View>
                                )}
                            </>
                        )}
                    </View>
                </View>
            </View>
        </Modal>
    );
}

export default ModalSearchBars;