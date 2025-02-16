import React from "react";
import { View , TouchableOpacity} from "react-native";
import { Dropdown } from "react-native-element-dropdown";
import { styles } from "../../app/screens/directions";
import { Ionicons, FontAwesome, FontAwesome5 } from '@expo/vector-icons'; 
import { useRouter } from 'expo-router';




const LocationSelector = ({customStartName, buildingName, destinationName, selectedStart, selectedDest , handleStartLocationChange, handleDestinationChange, travelMode, handleTravelModeChange }) => {
    const router = useRouter();
    const startLocationData = [
        { label: 'My Location', value: 'userLocation' },
        { label: 'SGW Campus', value: 'SGWCampus' },
        { label: 'Loyola Campus', value: 'LoyolaCampus' },
        { label: customStartName == '' ? 'Custom Location' : customStartName, value: 'custom' },
    ];

    const destinationData = [
        { label:`${buildingName}`, value: 'current' },
        { label: 'SGW Campus', value: 'SGWCampus' },
        { label: 'Loyola Campus', value: 'LoyolaCampus' },
        { label: destinationName == buildingName ?  'Custom Location' : destinationName, value: 'custom' },
    ];

    return (
<>
    <View style={styles.topCard}>
                <TouchableOpacity 
                    style={styles.leftArrow} 
                    onPress={() => router.push("/screens/map")}
                >
                    <FontAwesome5 name="arrow-left" size={24} color="#E9D3D7" />
                </TouchableOpacity>
                <View style={styles.dropdownContainer}>
                    <View style={styles.rowContainer}>
                        {/* <Entypo name="circle" size={22} color="#E9D3D7" /> */}
                        <FontAwesome name="dot-circle-o" size={27} color="#E9D3D7" />

                        <Dropdown
                            style={styles.dropdown}
                            placeholderStyle={styles.placeholderStyle}
                            selectedTextStyle={styles.selectedTextStyle}
                            data={startLocationData}
                            maxHeight={300}
                            labelField="label"
                            valueField="value"
                            placeholder="Select start"
                            value={selectedStart}
                            onChange={handleStartLocationChange}
                            testID="dropdown-start"
                        />
                    </View>
                 
                </View>

                <View style={styles.dropdownContainer}>
                    <View style={styles.rowContainer}>
                    <Ionicons name="location-sharp" size={24} color="#E9D3D7" />
                        <Dropdown
                            style={styles.dropdown}
                            placeholderStyle={styles.placeholderStyle}
                            selectedTextStyle={styles.selectedTextStyle}
                            data={destinationData}
                            maxHeight={300}
                            labelField="label"
                            valueField="value"
                            placeholder="Select destination"
                            value={selectedDest}
                            onChange={handleDestinationChange}
                            testID="dropdown-dest"
                        />
                    </View>
                    
                </View>

                <View style={styles.travelModeContainer}>
                   { ['DRIVING', 'WALKING', 'TRANSIT'].map((mode) => (
                    
                    <TouchableOpacity
                        key={mode}
                        style={[styles.travelModeButton, travelMode === mode && styles.selectedTravelMode]}
                        onPress={() => 
                            handleTravelModeChange(mode)}
                    >
                        <Ionicons 
                            name={mode === 'DRIVING' ? 'car' : mode === 'WALKING' ? 'walk' : 'bus'}
                            size={25}
                            color={travelMode === mode ? '#912338' : '#666'}
                        />
                    </TouchableOpacity>
                   ))}

                </View>
            </View>



</>

    ); }

export default LocationSelector;
