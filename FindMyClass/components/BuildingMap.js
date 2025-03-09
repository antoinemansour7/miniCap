import React, { useRef, useEffect, useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';
import { useRouter } from 'expo-router';
import BuildingMarker from './BuildingMarker';
import SearchBar from './SearchBar';
import mapStyles from './mapStyles';
import useLocationHandler from '../hooks/useLocationHandler';

const BuildingMap = ({
  buildings,
  initialRegion,
  buildingsRegion,
  searchCoordinates, // function to get coordinates for search
  recenterDeltaUser, // region deltas when centering on user
  recenterDeltaBuildings, // region deltas when centering on buildings
  getMarkerPosition, // function to compute the marker's position for a building
}) => {
  const mapRef = useRef(null);
  const router = useRouter();
  const { userLocation, nearestBuilding } = useLocationHandler(buildings, getMarkerPosition);
  const [, setUserHeading] = useState(null);
  const [searchText, setSearchText] = useState('');
  const [showRecenterButton, setShowRecenterButton] = useState(false);
  const [mapCenteredOnBuildings, setMapCenteredOnBuildings] = useState(true);

  // Search for a building and move the map to it
  useEffect(() => {
    if (searchText) {
      const building = buildings.find((b) =>
        b.name.toLowerCase().includes(searchText.toLowerCase())
      );
      if (building && mapRef.current) {
        const coords = searchCoordinates(building);
        mapRef.current.animateToRegion({
          latitude: coords.latitude,
          longitude: coords.longitude,
          latitudeDelta: recenterDeltaUser.latitudeDelta,
          longitudeDelta: recenterDeltaUser.longitudeDelta,
        });
      }
    }
  }, [searchText]);

  // Request location and heading permissions
  useEffect(() => {
    (async () => {
      const { granted } = await Location.requestForegroundPermissionsAsync();
      if (!granted) return;
      Location.watchHeadingAsync((headingData) => {
        setUserHeading(headingData.trueHeading);
      });
    })();
  }, []);

  // Track user's position and show recenter button if far from buildings
  useEffect(() => {
    if (!userLocation || !mapRef.current) return;
    mapRef.current.getCamera().then((camera) => {
      const userDistance = Math.sqrt(
        Math.pow(userLocation.latitude - camera.center.latitude, 2) +
          Math.pow(userLocation.longitude - camera.center.longitude, 2)
      );
      const farFromBuildings =
        Math.sqrt(
          Math.pow(userLocation.latitude - buildingsRegion.latitude, 2) +
            Math.pow(userLocation.longitude - buildingsRegion.longitude, 2)
        ) > 0.002;
      setShowRecenterButton(farFromBuildings || userDistance > 0.0005);
    });
  }, [userLocation]);

  // Toggle between centering on user location and buildings region
  const recenterMap = () => {
    if (mapRef.current) {
      if (mapCenteredOnBuildings && userLocation) {
        mapRef.current.animateToRegion({
          latitude: userLocation.latitude,
          longitude: userLocation.longitude,
          ...recenterDeltaUser,
        });
      } else {
        mapRef.current.animateToRegion({
          latitude: buildingsRegion.latitude,
          longitude: buildingsRegion.longitude,
          ...recenterDeltaBuildings,
        });
      }
      setMapCenteredOnBuildings(!mapCenteredOnBuildings);
    }
  };

  return (
    <View style={mapStyles.container}>
      <SearchBar value={searchText} onChangeText={setSearchText} data={buildings} />
      <MapView
        ref={mapRef}
        style={mapStyles.map}
        initialRegion={initialRegion}
        showsUserLocation={false}
      >
        {userLocation && (
          <Marker coordinate={userLocation} anchor={{ x: 0.5, y: 0.5 }}>
            <View style={mapStyles.userMarker}>
              <View style={mapStyles.whiteOutline}>
                <View style={mapStyles.userDot} />
              </View>
            </View>
          </Marker>
        )}

        {buildings.map((building) => (
          <BuildingMarker
            key={building.id}
            building={building}
            router={router}
            position={getMarkerPosition(building)}
            nearestBuilding={nearestBuilding}
          />
        ))}
      </MapView>
      {showRecenterButton && (
        <TouchableOpacity style={mapStyles.recenterButton} onPress={recenterMap}>
          <Text style={mapStyles.recenterText}>📍</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

export default BuildingMap;
