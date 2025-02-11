import { useState, useEffect } from 'react';
import * as Location from 'expo-location';

// Function to calculate distance between two points (Haversine formula)
const getDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Earth radius in km
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
        0.5 - 
        Math.cos(dLat) / 2 +
        Math.cos((lat1 * Math.PI) / 180) *
            Math.cos((lat2 * Math.PI) / 180) *
            (1 - Math.cos(dLon)) / 2;
    return R * 2 * Math.asin(Math.sqrt(a)); // Distance in km
};

const useLocationHandler = (buildings, getCentroid) => {
    const [userLocation, setUserLocation] = useState(null);
    const [nearestBuilding, setNearestBuilding] = useState(null);
    const [noNearbyBuilding, setNoNearbyBuilding] = useState(false);
    const [messageVisible, setMessageVisible] = useState(false);
    
    const updateLocation = (location) => {
        const { latitude, longitude } = location.coords;
        setUserLocation({ latitude, longitude });

        // Find closest building
        const closestBuilding = buildings.reduce((closest, building) => {
            const centroid = getCentroid ? getCentroid(building) : { latitude: building.latitude, longitude: building.longitude };
            if (!centroid) return closest;

            const distance = getDistance(latitude, longitude, centroid.latitude, centroid.longitude);
            if (!closest || distance < closest.distance) {
                return { building, distance };
            }
            return closest;
        }, null);

        const threshold = 0.5; // 0.5 km
        if (closestBuilding && closestBuilding.distance <= threshold) {
            setNearestBuilding(closestBuilding.building);
            setNoNearbyBuilding(false);
            setMessageVisible(false);
        } else {
            setNearestBuilding(null);
            setNoNearbyBuilding(true);
            setMessageVisible(true);
            setTimeout(() => setMessageVisible(false), 3000);
        }
    };

    const requestLocationPermission = async () => {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
            console.error('Permission to access location was denied');
            return;
        }
        const location = await Location.getCurrentPositionAsync({});
        updateLocation(location);
    };

    useEffect(() => {
        requestLocationPermission();
    }, []);

    return { userLocation, nearestBuilding, noNearbyBuilding, messageVisible };
};

export default useLocationHandler;
