import React, { useState, useEffect, useRef } from "react";
import MapView, { Marker, Polyline, Circle } from "react-native-maps";
import * as Location from "expo-location";
import { View, Text, Alert, Platform } from "react-native";
import { useLocalSearchParams } from "expo-router";
import polyline from "@mapbox/polyline";
import { googleAPIKey } from "../secrets";

export default function DirectionsScreen() {
    const params = useLocalSearchParams();
    console.log("Received params: ", params);

    if (!params || !params.destination) {
        console.error("Missing destination in navigation!");
        return <Text>Error: No destination provided.</Text>;
    }

    let parsedDestination = null;
    try {
        parsedDestination = JSON.parse(params.destination);
        console.log("Parsed destination:", parsedDestination);
    } catch (error) {
        console.error("Error parsing destination:", error);
    }

    if (!parsedDestination || !parsedDestination.latitude || !parsedDestination.longitude) {
        console.error("Invalid destination:", parsedDestination);
        return <Text>Error: Invalid destination coordinates.</Text>;
    }

    const mapRef = useRef(null);

    const [userLocation, setUserLocation] = useState(null);
    const [startLocation, setStartLocation] = useState(null);
    const [destination, setDestination] = useState(null); // <-- This was missing before
    const [coordinates, setCoordinates] = useState([]);
    const [routeInfo, setRouteInfo] = useState(null); // Holds distance & time

    // 🔹 **Automatically set destination from params**
    useEffect(() => {
        if (parsedDestination && !destination) {
            setDestination(parsedDestination);
        }
    }, [parsedDestination]); // Runs once when parsedDestination is set

    // 🔹 **Get user location**
    useEffect(() => {
        (async () => {
            let { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== "granted") {
                Alert.alert("Permission denied", "Allow location access to get directions.");
                return;
            }

            const subscription = await Location.watchPositionAsync(
                { accuracy: Location.Accuracy.High, timeInterval: 5000, distanceInterval: 10 },
                (location) => {
                    const newLocation = {
                        latitude: location.coords.latitude,
                        longitude: location.coords.longitude,
                    };

                    setUserLocation(newLocation);
                    setStartLocation(newLocation);

                    // 🔹 **Animate camera to user location**
                    if (mapRef.current) {
                        mapRef.current.animateToRegion({
                            latitude: newLocation.latitude,
                            longitude: newLocation.longitude,
                            latitudeDelta: 0.01,
                            longitudeDelta: 0.01,
                        }, 1000);
                    }
                }
            );

            return () => subscription.remove();
        })();
    }, []);

    // 🔹 **Fetch Directions when user moves or destination changes**
    useEffect(() => {

        if ( !startLocation || !destination ) {
            console.log("Missing start location");
            return;
        }

        if (startLocation && destination) {
            console.log("Fetching directions from", startLocation, "to", destination);

            fetch(
             
                `https://maps.googleapis.com/maps/api/directions/json?origin=${startLocation.latitude},${startLocation.longitude}&destination=${destination.latitude},${destination.longitude}&key=${googleAPIKey}`

            )
                .then((res) => res.json())
                .then((data) => {
                    if ( !data.routes || data.routes.length === 0 ) 
                    {
                        console.error("No routes found");
                        console.log("Fetched directions:", data);
                        return;
                    }

                    if (data.routes.length) {
                        const encodedPolyline = data.routes[0].overview_polyline.points;
                        const decodedCoordinates = polyline.decode(encodedPolyline).map(([lat, lng]) => ({
                            latitude: lat,
                            longitude: lng
                        }));

                        setCoordinates(decodedCoordinates);
                        
                        // 🔹 **Set estimated route info (distance & time)**
                        const leg = data.routes[0].legs[0];
                        setRouteInfo({ distance: leg.distance.text, duration: leg.duration.text });
                    }
                })
                .catch((error) => console.error("Error fetching directions:", error));
        }
    }, [startLocation, destination]); // Runs when start or destination changes

    return (
        <View style={{ flex: 1 }}>
            {/* Google Maps */}
            <MapView
                ref={mapRef}
                
                style={{ flex: 1 }}
                initialRegion={{
                    latitude: userLocation?.latitude || 45.4961,
                    longitude: userLocation?.longitude || -73.5782,
                    latitudeDelta: 0.01,
                    longitudeDelta: 0.01,
                }}
            >
                {/* 🔹 **Blue Circle for User Location** */}
                {userLocation && (
                    <Circle
                        center={userLocation}
                        radius={23}
                        strokeColor="rgba(0, 122, 255, 0.9)"
                        fillColor="rgba(0, 122, 255, 0.6)"
                    />
                )}

                {/* 🔹 **Destination Marker** */}
                {destination && <Marker coordinate={destination} title="Destination" />}

                {/* 🔹 **Route Polyline** */}
                {coordinates.length > 0 && <Polyline coordinates={coordinates} strokeWidth={5} strokeColor="blue" />}
            </MapView>

            {/* 🔹 **Route Info Box** */}
            {routeInfo && (
                <View style={{
                    position: "absolute", bottom: 40, left: 20, right: 20,
                    backgroundColor: "white", padding: 10, borderRadius: 10,
                    shadowColor: "#000", shadowOpacity: 0.1, shadowRadius: 5
                }}>
                    <Text style={{ fontWeight: "bold", fontSize: 16 }}>Estimated Time: {routeInfo.duration}</Text>
                    <Text style={{ fontSize: 14 }}>Distance: {routeInfo.distance}</Text>
                </View>
            )}
        </View>
    );
}
