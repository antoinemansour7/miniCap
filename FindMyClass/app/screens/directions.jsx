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
    const [destination] = useState(parsedDestination);
    const [userLocation, setUserLocation] = useState(null);
    const [startLocation, setStartLocation] = useState(null);
    const [coordinates, setCoordinates] = useState([]);
    const [routeInfo, setRouteInfo] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [zoomLevel, setZoomLevel] = useState(15); // Add this state

    // Add this function to calculate circle radius based on zoom level
    const getCircleRadius = () => {
        // Base radius at zoom level 15
        const baseRadius = 20;
        // Adjust radius inversely to zoom level
        // As zoom increases, radius decreases
        return baseRadius * Math.pow(2, (15 - zoomLevel));
    };

    // Add this function to calculate zoom level from region
    const calculateZoomLevel = (region) => {
        const LATITUDE_DELTA = region.latitudeDelta;
        // Convert latitude delta to zoom level
        const zoomLevel = Math.round(Math.log2(360 / LATITUDE_DELTA));
        return zoomLevel;
    };

    useEffect(() => {
        let locationSubscription;

        const setupLocationAndRoute = async () => {
            try {
                setIsLoading(true);
                console.log("Setting up location and route...");
                
                let { status } = await Location.requestForegroundPermissionsAsync();
                if (status !== "granted") {
                    throw new Error("Location permission denied");
                }

                const initialLocation = await Location.getCurrentPositionAsync({
                    accuracy: Location.Accuracy.High
                });
                
                const newLocation = {
                    latitude: initialLocation.coords.latitude,
                    longitude: initialLocation.coords.longitude,
                };
                
                console.log("Initial location:", newLocation);
                console.log("Destination:", destination);

                setUserLocation(newLocation);
                setStartLocation(newLocation);

                // Fetch and process route
                const response = await fetch(
                    `https://maps.googleapis.com/maps/api/directions/json?origin=${newLocation.latitude},${newLocation.longitude}&destination=${destination.latitude},${destination.longitude}&key=${googleAPIKey}`
                );
                const data = await response.json();
                console.log("API Response:", data);

                if (!data.routes || data.routes.length === 0) {
                    throw new Error("No route found");
                }

                const encodedPolyline = data.routes[0].overview_polyline.points;
                const decodedCoordinates = polyline.decode(encodedPolyline).map(([lat, lng]) => ({
                    latitude: lat,
                    longitude: lng
                }));

                console.log("Decoded coordinates:", decodedCoordinates);
                setCoordinates(decodedCoordinates);
                
                const leg = data.routes[0].legs[0];
                setRouteInfo({ distance: leg.distance.text, duration: leg.duration.text });

                // Adjust map view
                setTimeout(() => {
                    if (mapRef.current && decodedCoordinates.length > 0) {
                        const allCoords = [
                            newLocation,
                            destination,
                            ...decodedCoordinates
                        ];
                        
                        mapRef.current.fitToCoordinates(allCoords, {
                            edgePadding: { top: 50, right: 50, bottom: 50, left: 50 },
                            animated: true
                        });
                    }
                }, 1000);

                // Setup location watching
                locationSubscription = await Location.watchPositionAsync(
                    { accuracy: Location.Accuracy.High, timeInterval: 5000, distanceInterval: 10 },
                    (location) => {
                        setUserLocation({
                            latitude: location.coords.latitude,
                            longitude: location.coords.longitude,
                        });
                    }
                );
            } catch (err) {
                console.error("Setup error:", err);
                setError(err.message);
            } finally {
                setIsLoading(false);
            }
        };

        setupLocationAndRoute();
        return () => locationSubscription?.remove();
    }, [destination]);

    return (
        <View style={{ flex: 1 }}>
            <MapView
                ref={mapRef}
                style={{ flex: 1 }}
                initialRegion={{
                    latitude: destination.latitude,
                    longitude: destination.longitude,
                    latitudeDelta: 0.05,
                    longitudeDelta: 0.05,
                }}
                onRegionChangeComplete={(region) => {
                    const newZoomLevel = calculateZoomLevel(region);
                    setZoomLevel(newZoomLevel);
                }}
            >
                {userLocation && (
                    <Circle
                        center={userLocation}
                        radius={getCircleRadius()}
                        strokeColor="rgba(0, 122, 255, 0.9)"
                        fillColor="rgba(0, 122, 255, 0.7)"
                    />
                )}
                {destination && <Marker coordinate={destination} title="Destination" />}
                {coordinates.length > 0 && (
                    <Polyline 
                        coordinates={coordinates}
                        strokeWidth={2}
                        strokeColor="#912338"
                        lineDashPattern={[0]}
                    />
                )}
            </MapView>

            {isLoading && (
                <View style={{  
                    position: "absolute", bottom: 40, left: 20, right: 20,
                    backgroundColor: "white", padding: 10, borderRadius: 10,
                    shadowColor: "#000", shadowOpacity: 0.1, shadowRadius: 5 }}>
                    <Text 
                        style={{ fontWeight: "bold", fontSize: 16 }}
                    >
                        Loading route...</Text>
                </View>
            )}
            {error && (
                <View style={{ position: 'absolute', top: 50, width: '100%', alignItems: 'center' }}>
                    <Text style={{ color: 'red' }}>{error}</Text>
                </View>
            )}
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
