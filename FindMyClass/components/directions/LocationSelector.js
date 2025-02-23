import React from "react";
import { View , TouchableOpacity} from "react-native";
import { Dropdown } from "react-native-element-dropdown";
import { styles } from "../../styles/directionsStyles";
import { Ionicons, FontAwesome, FontAwesome5 } from '@expo/vector-icons'; 
import { useRouter } from 'expo-router';
import * as Location from "expo-location";

const LocationSelector = ({
    startLocation,
    setStartLocation,
    customStartName, 
    selectedStart, 
    setSelectedStart,
    userLocation,   
    setUserLocation,
    buildingName, 
    destinationName, 
    destination,
    parsedDestination,
    selectedDest, 
    setSelectedDest,
    setDestination,
    setDestinationName,
    travelMode, 
    setTravelMode,
    setIsModalVisible,
    setSearchType,
    updateRouteWithMode,
    updateRoute,
    style, // Add style to props
}) => {

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

    const predefinedLocations = {
        SGWCampus: { latitude: 45.495729, longitude: -73.578041 },
        LoyolaCampus: { latitude: 45.458424, longitude: -73.640259 }
    };

    const handleStartLocationChange =  async (item) => {
            setSelectedStart(item.value);
            if (item.value === 'custom') {  
                setSearchType("START");
                setIsModalVisible(true);
            } else {
                let newStartLocation;
                switch(item.value) {
                    case 'userLocation':
                        if (userLocation) {
                            newStartLocation = userLocation;
                        } else {
                            try {
                                const currentLocation = await Location.getCurrentPositionAsync({
                                    accuracy: Location.Accuracy.High
                                });
                                newStartLocation = {
                                    latitude: currentLocation.coords.latitude,
                                    longitude: currentLocation.coords.longitude,
                                };
                                setUserLocation(newStartLocation);
                            } catch (error) {
                                console.error("Error getting current location:", error);
                                setError("Could not get current location");
                                return;
                            }
                            
                        }
                        break;
                    case 'SGWCampus':
                    case 'LoyolaCampus':
                        newStartLocation = predefinedLocations[item.value];
                        break;
                    default:
                        return;
                }
                console.log('New start location:', newStartLocation);
                
                if (newStartLocation && destination) {
                    setStartLocation(newStartLocation);
                    updateRoute(newStartLocation, destination);
                }
            }
        };

    const handleDestinationChange = (item) => {
                setSelectedDest(item.value);
                if (item.value === 'custom') {
                    setSearchType("DESTINATION");
                    setIsModalVisible(true);
                } else {
                    if (item.value !== 'custom') {
                        let newDestination;
                        let newDestinationName;
                        switch(item.value) {
                            case 'current':
                                newDestination = parsedDestination;
                                newDestinationName = buildingName;
                                setDestinationName(newDestinationName);
                                break;
                            case 'SGWCampus':
                                newDestination = predefinedLocations[item.value];
                                newDestinationName = 'SGW Campus';
                                break;
                            case 'LoyolaCampus':
                                newDestination = predefinedLocations[item.value];
                                newDestinationName = 'Loyola Campus';
                                break;
                            default:
                                return;
                        }
                        setDestination(newDestination);
                        updateRoute(startLocation, newDestination);
                    }
                }
            };

    const handleTravelModeChange = (mode) => {
                console.log(`Changing travel mode to: ${mode}`);
                console.log('Current start location:', startLocation);
                // Set the travel mode first
                setTravelMode(mode);
                
                // Use the current startLocation instead of letting it default to userLocation
                const currentStart = startLocation || userLocation;
                if (currentStart && destination) {
                    updateRouteWithMode(currentStart, destination, mode);
                }
            };

    return (
        <View style={[styles.topCard, style]}>  {/* Use style from props */}
            <TouchableOpacity 
                style={styles.leftArrow} 
                onPress={() => router.push("/screens/map")}
            >
                <FontAwesome5 name="arrow-left" size={24} color="#E9D3D7" />
            </TouchableOpacity>
            <View style={styles.dropdownContainer}>
                <View style={styles.rowContainer}>
                    <FontAwesome name="dot-circle-o" size={27} color="#E9D3D7" />
                    <Dropdown
                        style={[styles.dropdown, { zIndex: 3000 }]}
                        containerStyle={{ zIndex: 3000 }}
                        placeholderStyle={styles.placeholderStyle}
                        selectedTextStyle={styles.selectedTextStyle}
                        data={startLocationData}
                        maxHeight={300}
                        labelField="label"
                        valueField="value"
                        placeholder="Select start"
                        value={selectedStart}
                        onChange={(item) =>  handleStartLocationChange(item)}
                        testID="dropdown-start"
                    />
                </View>
            </View>

            <View style={styles.dropdownContainer}>
                <View style={styles.rowContainer}>
                    <Ionicons name="location-sharp" size={24} color="#E9D3D7" />
                    <Dropdown
                        style={[styles.dropdown, { zIndex: 2000 }]}
                        containerStyle={{ zIndex: 2000 }}
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
                {['DRIVING', 'WALKING', 'TRANSIT'].map((mode) => (
                    <TouchableOpacity
                        key={mode}
                        style={[styles.travelModeButton, travelMode === mode && styles.selectedTravelMode]}
                        onPress={() => handleTravelModeChange(mode)}
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
    );
}

export default LocationSelector;
