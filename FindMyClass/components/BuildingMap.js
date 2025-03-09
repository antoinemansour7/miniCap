import React, { useRef, useEffect, useState, useMemo, useCallback } from 'react';
import { View, Text, TouchableOpacity, ScrollView, FlatList } from 'react-native';
import MapView, { Marker, Polygon } from 'react-native-maps';
import { useRouter } from 'expo-router';
import BottomSheet, { BottomSheetView } from '@gorhom/bottom-sheet';
import mapStyles from './mapStyles';
import SearchBar from './SearchBar';
import BuildingMarker from './BuildingMarker';
import useLocationHandler from '../hooks/useLocationHandler';
import { googleAPIKey } from "../app/secrets";

const categories = [
  { label: 'Restaurant', icon: '🍽️' },
  { label: 'Café', icon: '☕' },
  { label: 'Bakery', icon: '🥐' },
  { label: 'Library', icon: '📚' },
  { label: 'Hospital', icon: '🏥' },
];

export default function BuildingMap({
  buildings,
  initialRegion,
  buildingsRegion,
  searchCoordinates,
  recenterDeltaUser,
  recenterDeltaBuildings,
  getMarkerPosition,
}) {
  const mapRef = useRef(null);
  const bottomSheetRef = useRef(null);
  const router = useRouter();

  const { userLocation, nearestBuilding } = useLocationHandler(buildings, getMarkerPosition);

  const [searchText, setSearchText] = useState('');
  const [showRecenterButton, setShowRecenterButton] = useState(false);
  const [mapCenteredOnBuildings, setMapCenteredOnBuildings] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [places, setPlaces] = useState([]);

  const snapPoints = useMemo(() => ['25%', '50%', '80%'], []);

  const handleSheetChanges = useCallback(() => {}, []);

  // Show recenter button if user is far from buildings or camera center
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

  // Recenter map between user and buildings region
  const recenterMap = () => {
    if (!mapRef.current) return;

    const targetRegion = mapCenteredOnBuildings && userLocation
      ? {
          latitude: userLocation.latitude,
          longitude: userLocation.longitude,
          ...recenterDeltaUser,
        }
      : {
          latitude: buildingsRegion.latitude,
          longitude: buildingsRegion.longitude,
          ...recenterDeltaBuildings,
        };

    mapRef.current.animateToRegion(targetRegion);
    setMapCenteredOnBuildings(!mapCenteredOnBuildings);
  };

  // Calculate distance between two coordinates in km
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const toRad = (v) => (v * Math.PI) / 180;
    const R = 6371;
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return (R * c).toFixed(2);
  };

  // Fetch places by category around user location
  const fetchPlaces = async (categoryLabel) => {
    if (!userLocation) return;

    const categoryMap = {
      Restaurant: 'restaurant',
      Café: 'cafe',
      Bakery: 'bakery',
      Library: 'library',
      Hospital: 'hospital',
    };

    const placeType = categoryMap[categoryLabel] || categoryLabel.toLowerCase();
    const keyword = placeType;

    const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${userLocation.latitude},${userLocation.longitude}&rankby=distance&type=${placeType}&keyword=${keyword}&key=${googleAPIKey}`;

    try {
      const res = await fetch(url);
      const data = await res.json();

      const filteredResults = data.results.filter((place) =>
        place.types.includes(placeType) || place.name.toLowerCase().includes(keyword)
      );

      const placesWithDistance = filteredResults.map((place) => ({
        ...place,
        distance: calculateDistance(
          userLocation.latitude,
          userLocation.longitude,
          place.geometry.location.lat,
          place.geometry.location.lng
        ),
      }));

      placesWithDistance.sort((a, b) => a.distance - b.distance);
      setPlaces(placesWithDistance);

      bottomSheetRef.current?.snapToIndex(1);

      // Center map on user after fetching places
      mapRef.current?.animateToRegion({
        latitude: userLocation.latitude,
        longitude: userLocation.longitude,
        latitudeDelta: 0.03,
        longitudeDelta: 0.03,
      });

    } catch (err) {
      console.error('Error fetching places:', err);
    }
  };

  const handleCategorySelect = (categoryLabel) => {
    setSelectedCategory(categoryLabel);
    fetchPlaces(categoryLabel);
  };

  const zoomToPlace = (place) => {
    mapRef.current?.animateToRegion({
      latitude: place.geometry.location.lat,
      longitude: place.geometry.location.lng,
      latitudeDelta: 0.01,
      longitudeDelta: 0.01,
    });
  };

  const renderPlaceItem = ({ item }) => (
    <TouchableOpacity
      style={mapStyles.placeItemContainer}
      onPress={() => zoomToPlace(item)}
    >
      <View style={mapStyles.placeInfo}>
        <Text style={mapStyles.placeName}>{item.name}</Text>
        <Text style={mapStyles.placeVicinity}>{item.vicinity || 'No address available'}</Text>
        <Text style={mapStyles.placeDistance}>{item.distance} km away</Text>
      </View>
      <TouchableOpacity
        style={mapStyles.directionsButton}
        onPress={() => {
          router.push({
            pathname: '/screens/directions',
            params: {
              destination: JSON.stringify({
                latitude: item.geometry.location.lat,
                longitude: item.geometry.location.lng,
              }),
              buildingName: item.name,
            },
          });
        }}
      >
        <Text style={mapStyles.directionsButtonText}>Get Directions</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );

  // Search and zoom into building by searchText
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

  return (
    <View style={mapStyles.container}>
      <SearchBar value={searchText} onChangeText={setSearchText} data={buildings} />

      {/* Category chips */}
      <View style={mapStyles.categoryChipsContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {categories.map((category) => (
            <TouchableOpacity
              key={category.label}
              style={[
                mapStyles.chip,
                selectedCategory == category.label && mapStyles.chipSelected,
              ]}
              onPress={() => handleCategorySelect(category.label)}
            >
              <Text style={[
                mapStyles.chipText,
                selectedCategory == category.label && mapStyles.chipTextSelected,
              ]}>
                {category.icon} {category.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <MapView
        ref={mapRef}
        style={mapStyles.map}
        initialRegion={initialRegion}
        showsUserLocation={false}
      >
        {/* User marker */}
        {userLocation && (
          <Marker coordinate={userLocation}>
            <View style={mapStyles.userMarker}>
              <View style={mapStyles.whiteOutline}>
                <View style={mapStyles.userDot} />
              </View>
            </View>
          </Marker>
        )}

        {/* Building polygons */}
        {buildings.map((building) => {
          const boundary = building.boundary?.outer || building.boundary;
          if (!boundary?.length) return null;

          const coordinates = boundary.map((point) => ({
            latitude: point.latitude,
            longitude: point.longitude,
          }));

          return (
            <Polygon
              key={building.id}
              coordinates={coordinates}
              strokeColor="#912338"
              fillColor="rgba(145, 35, 56, 0.3)"
              strokeWidth={2}
            />
          );
        })}

        {/* Building markers */}
        {buildings.map((building) => (
          <BuildingMarker
            key={building.id}
            building={building}
            router={router}
            position={getMarkerPosition(building)}
            nearestBuilding={nearestBuilding}
          />
        ))}

        {/* Places markers */}
        {places.map((place) => (
          <Marker
            key={place.place_id}
            coordinate={{
              latitude: place.geometry.location.lat,
              longitude: place.geometry.location.lng,
            }}
            title={place.name}
          />
        ))}
      </MapView>

      {/* Recenter button */}
      {showRecenterButton && (
        <TouchableOpacity style={mapStyles.recenterButton} onPress={recenterMap}>
          <Text style={mapStyles.recenterText}>📍</Text>
        </TouchableOpacity>
      )}

      {/* Bottom sheet showing places */}
      <BottomSheet
        ref={bottomSheetRef}
        index={-1}
        snapPoints={snapPoints}
        onChange={handleSheetChanges}
        enablePanDownToClose
        handleIndicatorStyle={{ backgroundColor: '#912338' }}
      >
        <BottomSheetView style={[mapStyles.bottomSheetContent, { flex: 1 }]}>
          <Text style={mapStyles.bottomSheetHeader}>
            {selectedCategory ? `${selectedCategory} Nearby` : 'Places Nearby'}
          </Text>

          <FlatList
            data={places}
            keyExtractor={(item) => item.place_id}
            renderItem={renderPlaceItem}
            contentContainerStyle={{ paddingBottom: 80 }}
            ListEmptyComponent={<Text style={{ padding: 16 }}>No results found.</Text>}
          />
        </BottomSheetView>
      </BottomSheet>
    </View>
  );
}
