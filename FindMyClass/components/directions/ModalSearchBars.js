import React from "react";
import { View, TouchableOpacity, Modal, Text, TextInput } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { styles } from "../../app/screens/directions";
import GoogleSearchBar from "../GoogleSearchBar";

const ModalSearchBars = ({ 
    searchType,  
    isModalVisible, 
    handleCloseModal, 
    handleCustomLocation,
    customLocationDetails,
    customSearchText,
    searchBuildings,
    searchResults,
    isSearching,
    selectBuilding,
    customDest,
    handleClearSearch
}) => {
    const isStartSearch = searchType === 'START'; // The modal will display a specific searh bar based on the searchType
    
    
    return (
        <Modal
            visible={isModalVisible} 
            animationType="none"
            transparent={true}
            onRequestClose={handleCloseModal}
        >
            <View style={styles.modalOverlay}>
                <View style={styles.searchModalContent}>
                    <TouchableOpacity 
                        style={styles.closeButton}
                        onPress={handleCloseModal}
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