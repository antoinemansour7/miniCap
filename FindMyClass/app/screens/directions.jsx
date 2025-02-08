import MapView, { Marker, Polyline } from "react-native-maps";
import * as Location from "expo-location";
import { useState, useEffect } from "react";
import { View, Alert } from "react-native";
import { Picker } from "@react-native-picker/picker";
import { useRoute } from "@react-navigation/native";
import { useLocalSearchParams } from "expo-router";
import { GOOGLE_MAPS_API_KEY } from "@env";

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

            let location = await Location.getCurrentPositionAsync({});
            setUserLocation({
                latitude: location.coords.latitude,
                longitude: location.coords.longitude,
            });
            setStartLocation({
                latitude: location.coords.latitude,
                longitude: location.coords.longitude,
            });
        })();
    }, []);

    useEffect(() => {
        if (startLocation && destination) {
            fetch(
                `https://maps.googleapis.com/maps/api/directions/json?origin=${startLocation.latitude},${startLocation.longitude}&destination=${destination.latitude},${destination.longitude}&key=${GOOGLE_MAPS_API_KEY}`
            )
                .then((res) => res.json())
                .then((data) => {
                    const points = data.routes[0]?.legs[0]?.steps.map((step) => ({
                        latitude: step.start_location.latitude,
                        longitude: step.start_location.longitude,
                    }));
                    setCoordinates(points || []);
                });
        }
    }, [startLocation, destination]);

    return (
        <View style={{ flex: 1, backgroundColor: "E9D3D7" }}>
            <MapView style={{ flex: 1 }} initialRegion={{
                
                latitude: userLocation?.latitude || destination?.latitude || 45.4961,
                   longitude: userLocation?.longitude || destination?.longitude || -73.5782,
                   latitudeDelta: 0.01, 
                   longitudeDelta: 0.01,}
                }>
                {startLocation && <Marker coordinate={startLocation} title="Start" />}
                {destination && <Marker coordinate={destination} title="Destination" />}
                {coordinates.length > 0 && <Polyline coordinates={coordinates} strokeWidth={5} strokeColor="blue" />}
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
