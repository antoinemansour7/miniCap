import React, { useState } from "react";
import { View, TouchableOpacity, Modal, Text, TextInput } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { styles } from "../../styles/directionsStyles";
import GoogleSearchBar from "../GoogleSearchBar";
import SGWBuildings from '../../components/SGWBuildings';
import LoyolaBuildings from '../../components/loyolaBuildings';
import {getAllRoomsHall} from "../rooms/HallBuildingRooms";
import {getAllRoomsJSMB} from "../rooms/JMSBBuildingRooms";
import {getAllRoomsVanier} from "../rooms/VanierBuildingRooms";
import {getAllRoomsCC} from "../rooms/CCBuildingRooms";
import SearchBar from "../SearchBar";


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

    setRoom,
    

}) => {
    const isStartSearch = searchType === 'START'; // The modal will display a specific searh bar based on the searchType
    const hallBuildingRooms = getAllRoomsHall();
    const jmsbBuildingRooms = getAllRoomsJSMB();
    const vanierBuildingRooms = getAllRoomsVanier();
    const ccBuildingRooms = getAllRoomsCC();
    const allBuildings = 
        [...SGWBuildings, 
        ...LoyolaBuildings,
        ...hallBuildingRooms,
        ...jmsbBuildingRooms,
        ...vanierBuildingRooms,
        ...ccBuildingRooms];
    const buildingsOnly = [...SGWBuildings, ...LoyolaBuildings];
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
            selectBuilding(buildingsOnly.find(b => b.id === location.building ));
            setRoom(location);
            setCustomDest(location.name);
            setDestinationName(location.name);
    }
        else {
            setRoom(null);
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
                            <View> 
                                <SearchBar
                                    value={customDest}
                                    onChangeText={searchBuildings}
                                    data={allBuildings}
                                    placeholder="Search for a building..."
                                    onSelectItem={selectBuilding}
                                 />
                            </View>
                        )}
                    </View>
                </View>
            </View>
        </Modal>
    );
}

export default ModalSearchBars;