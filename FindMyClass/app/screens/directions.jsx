import MapView, { Marker, Polyline } from "react-native-maps";
import * as Location from "expo-location";
import { useState, useEffect } from "react";
import { View, Alert } from "react-native";
import { Picker } from "@react-native-picker/picker";
import { useRoute } from "@react-navigation/native";
import { useLocalSearchParams } from "expo-router";
//import { GOOGLE_MAPS_API_KEY } from "@env";
import polyline from "@mapbox/polyline";
import { googleAPIKey } from "../secrets";

export default function DirectionsScreen() {
    const { latitude, longitude } = useLocalSearchParams();
    const route = useRoute();
    const [userLocation, setUserLocation] = useState(null);
    const [startLocation, setStartLocation] = useState(null);
    const [destination, setDestination] = useState(
        latitude && longitude ? { latitude: parseFloat(latitude), longitude: parseFloat(longitude) } : null );
        // route.params?.destination || null
        // {
        //     latitude: 45.4585, 
        //     longitude: -73.6395 
        // }
        // );
    const [coordinates, setCoordinates] = useState([]);

    useEffect(() => {
        (async () => {
            let { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== "granted") {
                Alert.alert("Permission denied", "Allow location access to get directions.");
                return;
            }
    
            // Start watching location updates
            const subscription = await Location.watchPositionAsync(
                {
                    accuracy: Location.Accuracy.High,
                    timeInterval: 5000, // Update every 5 seconds
                    distanceInterval: 10, // Update if moved by 10 meters
                },
                (location) => {
                    setUserLocation({
                        latitude: location.coords.latitude,
                        longitude: location.coords.longitude,
                    });
                    setStartLocation({
                        latitude: location.coords.latitude,
                        longitude: location.coords.longitude,
                    });
                }
            );
    
            return () => subscription.remove(); // Clean up the listener
        })();
    }, []);
    

    useEffect(() => {
        if (startLocation && destination) {
            fetch(
                `https://maps.googleapis.com/maps/api/directions/json?origin=${startLocation.latitude},${startLocation.longitude}&destination=${destination.latitude},${destination.longitude}&key${googleAPIKey}`
            )
                .then((res) => res.json())
                .then((data) => {
                    if (data.routes.length) {
                        // Extract encoded polyline from Google API response
                        const encodedPolyline = data.routes[0].overview_polyline.points;
                        
                        // Decode the polyline into an array of coordinate objects
                        const decodedCoordinates = polyline.decode(encodedPolyline).map(([lat, lng]) => ({
                            latitude: lat,
                            longitude: lng
                        }));
    
                        setCoordinates(decodedCoordinates);
                    }
                })
                .catch((error) => console.error("Error fetching directions:", error));
        }
    }, [startLocation, destination]);

    return (
        <View style={{ flex: 1, backgroundColor: "Black" }}>
            <MapView style={{ flex: 1 }} initialRegion={{
                
                latitude: userLocation?.latitude || destination?.latitude || 45.4961,
                   longitude: userLocation?.longitude || destination?.longitude || -73.5782,
                   latitudeDelta: 0.01, 
                   longitudeDelta: 0.01,}
                }>
                {startLocation && <Marker coordinate={startLocation} title="Start" />}
                {destination && <Marker coordinate={destination} title="Destination" />}
                {coordinates.length > 0 && (<Polyline coordinates={coordinates} strokeWidth={5} strokeColor="blue" />)}
                
            </MapView>

            {/* Dropdown for Start & Destination Selection */}
            <Picker
                selectedValue={JSON.stringify(startLocation)}
                onValueChange={(itemValue) => setStartLocation(JSON.parse(itemValue))}
            >
                <Picker.Item label="Your Location" value={JSON.stringify(userLocation)} />
                <Picker.Item label="SGW Campus" value={JSON.stringify({ latitude: 45.4961, longitude: -73.5782 })} />
                <Picker.Item label="Loyola Campus" value={JSON.stringify({ latitude: 45.4585, longitude: -73.6395 })} />
            </Picker>

            <Picker
                selectedValue={JSON.stringify(destination)}
                onValueChange={(itemValue) => setDestination(JSON.parse(itemValue))}
            >
                <Picker.Item label="SGW Campus" value={JSON.stringify({ latitude: 45.4961, longitude: -73.5782 })} />
                <Picker.Item label="Loyola Campus" value={JSON.stringify({ latitude: 45.4585, longitude: -73.6395 })} />
            </Picker>

        </View>
    );
}
