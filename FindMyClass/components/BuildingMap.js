import React, { useRef, useEffect, useState, useMemo, useCallback } from 'react';
import { View, Text, TouchableOpacity, ScrollView, FlatList, Modal, StyleSheet, Image } from 'react-native';
import MapView, { Marker, Polygon, Overlay,Polyline } from 'react-native-maps';
import { useRouter } from 'expo-router';
import BottomSheet, { BottomSheetView } from '@gorhom/bottom-sheet';
import mapStyles from './mapStyles';
import SearchBar from './SearchBar';
import BuildingMarker from './BuildingMarker';
import useLocationHandler from '../hooks/useLocationHandler';
import { get } from 'react-native/Libraries/TurboModule/TurboModuleRegistry';
import { getExactCoordinates, getFloorNumber, getPolygonBounds, getClassCoordinates } from '../utils/indoorUtils';
import {jmsbBounds, jmsbFlippedGrid } from "./rooms/JMSBBuildingRooms";
import {vanierBounds, vanierFlippedGrid, gridVanier } from "./rooms/VanierBuildingRooms";
import {ccBounds, ccFlippedGrid, gridCC } from "./rooms/CCBuildingRooms";
import { googleAPIKey } from '../app/secrets';
import RoomMarker from './RoomMarker';




// Define paths to floor plan images/SVGs
const floorPlans = {
  1: require('../floorPlans/Hall-1.png'),
  2: require('../floorPlans/Hall-2.png'),
  8: require('../floorPlans/Hall-8.png'),
  9: require('../floorPlans/Hall-9.png')
};

const jmsbFloorPlans = {
  1: require('../floorPlans/MB-1.png'),
  2: require('../floorPlans/MB-S2-1.png'),
}

const vanierFloorPlans = {
  1: require('../floorPlans/VL-1.png'),
  2: require('../floorPlans/VL-2-1.png')
}

const ccFloorPlan = require('../floorPlans/CC.png');
 

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
  const debounceTimeout = useRef(null);
  const router = useRouter();

  const { userLocation, nearestBuilding } = useLocationHandler(buildings, getMarkerPosition);

  const [searchText, setSearchText] = useState('');
  const [showRecenterButton, setShowRecenterButton] = useState(false);
  const [mapCenteredOnBuildings, setMapCenteredOnBuildings] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [places, setPlaces] = useState([]);
  const [errorVisible, setErrorVisible] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [zoomLevel, setZoomLevel] = useState(0);

  const snapPoints = useMemo(() => ['25%', '50%', '80%'], []);
  
  // Floor plan state variables
  const [selectedFloor, setSelectedFloor] = useState(1);
  const [jmsbSelectedFloor, setJMSBSelectedFloor] = useState(1);
  const [vanierSelectedFloor, setVanierSelectedFloor] = useState(1);

  // are the buildings focused?
  const [hallBuildingFocused, setHallBuildingFocused] = useState(false);
  const [jmsbBuildingFocused, setJMSBBuildingFocused] = useState(false);
  const [vanierBuildingFocused, setVanierBuildingFocused] = useState(false);
  const [ccBuildingFocused, setCCBuildingFocused] = useState(false);
  
  // Get the Hall Building reference
  const hallBuilding = buildings.find(b => b.id === 'H');
  const jmsbBuilding = buildings.find(b => b.id === 'MB');
  const vanierBuilding = buildings.find(b => b.id === 'VL');
  const ccBuilding = buildings.find(b => b.id === 'CC');

  const [clasroomCoordinates, setClassroomCoordinates] = useState(null); 
  const [room, setRoom] = useState(null);

  
  // Handle region change (zoom/pan)
  const onRegionChange = (region) => {
    // Calculate zoom level based on latitudeDelta
    const calculatedZoom = Math.log2(360 / region.latitudeDelta);
    setZoomLevel(calculatedZoom);
    
    // Check if we're zoomed in on the Hall Building
    if (hallBuilding ) {
      const hallLatLng = {
        latitude: hallBuilding.latitude,
        longitude: hallBuilding.longitude,
      };
      
      // Calculate distance between map center and Hall Building
      const distance = Math.sqrt(
        Math.pow(region.latitude - hallLatLng.latitude, 2) +
        Math.pow(region.longitude - hallLatLng.longitude, 2)
      );
      
      // Determine if we're focused on Hall Building (centered and zoomed in)
      const isHallFocused = distance < 0.0005 && calculatedZoom > 18;
      setHallBuildingFocused(isHallFocused);
    }
    if (jmsbBuilding) {
      const jmsbLatLng = {
        latitude: jmsbBuilding.latitude,
        longitude: jmsbBuilding.longitude,
      };
      
      // Calculate distance between map center and Hall Building
      const distance = Math.sqrt(
        Math.pow(region.latitude - jmsbLatLng.latitude, 2) +
        Math.pow(region.longitude - jmsbLatLng.longitude, 2)
      );
      
      // Determine if we're focused on Hall Building (centered and zoomed in)
      const isJMSBFocused = distance < 0.0006 && calculatedZoom > 18;
      setJMSBBuildingFocused(isJMSBFocused);
    }

    if (vanierBuilding) {
      const vanierLatLng = {
        latitude: vanierBuilding.latitude,
        longitude: vanierBuilding.longitude,
      };
      
      // Calculate distance between map center and Hall Building
      const distance = Math.sqrt(
        Math.pow(region.latitude - vanierLatLng.latitude, 2) +
        Math.pow(region.longitude - vanierLatLng.longitude, 2)
      );
      
      // Determine if we're focused on Hall Building (centered and zoomed in)
      const isVanierFocused = distance < 0.001 && calculatedZoom > 18;
      setVanierBuildingFocused(isVanierFocused);
    }

    if (ccBuilding) {
      const ccLatLng = {
        latitude: ccBuilding.latitude,
        longitude: ccBuilding.longitude,
      };
      
      // Calculate distance between map center and Hall Building
      const distance = Math.sqrt(
        Math.pow(region.latitude - ccLatLng.latitude, 2) +
        Math.pow(region.longitude - ccLatLng.longitude, 2)
      );
      
      // Determine if we're focused on Hall Building (centered and zoomed in)
      const isCCFocused = distance < 0.0005 && calculatedZoom > 18;
      setCCBuildingFocused(isCCFocused);
    }

  };

  // Search for a building and move the map to it
  useEffect(() => {
    if (searchText) {
      
      const building =  buildings.find((b) =>
        b.name?.toLowerCase().includes(searchText.toLowerCase())
      );
      // console.log("Building searched: ",building);
      if (building){ 
        if (building.building) {
           console.log("Room searched: ",building.building);
          setRoom(building);
          console.log("room name: ", building.name);
          let coordinates;
          if (building.object.id === 'H') {

            coordinates = getExactCoordinates(building.location.x, building.location.y);
            setClassroomCoordinates(coordinates);
            console.log("Classroom coordinates: ", coordinates);
            setSelectedFloor(getFloorNumber(building.id));
            console.log("Selected floor: ", getFloorNumber(building.id));
          }
          else if ( building.object.id === 'MB') {
             coordinates = getClassCoordinates(jmsbFlippedGrid, ( building.location.x ), ( building.location.y));
                setClassroomCoordinates(coordinates);
                console.log("Classroom coordinates: ", coordinates);
                setSelectedFloor(getFloorNumber(building.id));
                setJMSBSelectedFloor(getFloorNumber(building.id));
                console.log("Selected floor: ", getFloorNumber(building.id));
          }
          else if ( building.object.id === 'VL') {
            coordinates = getClassCoordinates(vanierFlippedGrid, ( building.location.x ), ( building.location.y));
            setClassroomCoordinates(coordinates);
            console.log("Classroom coordinates: ", coordinates);
            setSelectedFloor(getFloorNumber(building.id));
            setVanierSelectedFloor(getFloorNumber(building.id));
            console.log("Selected floor: ", getFloorNumber(building.id));
          }
          else if ( building.object.id === 'CC') {
            coordinates = getClassCoordinates(ccFlippedGrid, ( building.location.x ), ( building.location.y));
            setClassroomCoordinates(coordinates);
            console.log("Classroom coordinates: ", coordinates);
            setSelectedFloor(getFloorNumber(building.id));
            console.log("Selected floor: ", getFloorNumber(building.id));
          }

          focusOnBuilding(building.object);
        }
        else {
          setRoom(null);
          focusOnBuilding(building);

      }}
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

  const recenterMap = () => {
    if (!mapRef.current) return;

    const targetRegion = mapCenteredOnBuildings && userLocation
      ? { latitude: userLocation.latitude, longitude: userLocation.longitude, ...recenterDeltaUser }
      : { latitude: buildingsRegion.latitude, longitude: buildingsRegion.longitude, ...recenterDeltaBuildings };

    mapRef.current.animateToRegion(targetRegion);
    setMapCenteredOnBuildings(!mapCenteredOnBuildings);
  };

  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const toRad = (v) => (v * Math.PI) / 180;
    const R = 6371;
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return (R * c).toFixed(2);
  };

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

      if (!data?.results || data.results.length == 0) throw new Error('No places found nearby.');

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
      mapRef.current?.animateToRegion({
        latitude: userLocation.latitude,
        longitude: userLocation.longitude,
        latitudeDelta: 0.03,
        longitudeDelta: 0.03,
      });
    } catch (err) {
      console.error('Error fetching places:', err);
      setErrorMessage('Failed to load nearby places. Please try again later.');
      setErrorVisible(true);
    }
  };

  const handleCategorySelect = useCallback((categoryLabel) => {
    if (debounceTimeout.current) clearTimeout(debounceTimeout.current);

    debounceTimeout.current = setTimeout(() => {
      setSelectedCategory(categoryLabel);
      fetchPlaces(categoryLabel);
    }, 350);
  }, [fetchPlaces]);

  const zoomToPlace = (place) => {
    mapRef.current?.animateToRegion({
      latitude: place.geometry.location.lat,
      longitude: place.geometry.location.lng,
      latitudeDelta: 0.01,
      longitudeDelta: 0.01,
    });
  };

  const renderPlaceItem = ({ item }) => (
    <TouchableOpacity style={mapStyles.placeItemContainer} onPress={() => zoomToPlace(item)}>
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

  const getPlaceIcon = (types) => {
    if (types.includes('restaurant')) return '🍽️';
    if (types.includes('cafe')) return '☕';
    if (types.includes('bakery')) return '🥐';
    if (types.includes('library')) return '📚';
    if (types.includes('hospital')) return '🏥';
    return '📍';
  };
  
  
  const focusOnBuilding = (building) => {
    if (mapRef.current && building) {
      const coord = getMarkerPosition(building);
      mapRef.current.animateToRegion({
        latitude: coord.latitude,
        longitude: coord.longitude,
        latitudeDelta: 0.001,
        longitudeDelta: 0.001,
      });
    }
  };

  // Calculate bounds for the floor plan overlay (using Hall Building boundary)
  const getFloorPlanBounds = () => {
    if (!hallBuilding || !hallBuilding.boundary || hallBuilding.boundary.length === 0) {
      return null;
    }
    
    // Calculate bounds based on the polygon coordinates
    const lats = hallBuilding.boundary.map(coord => coord.latitude);
    const lngs = hallBuilding.boundary.map(coord => coord.longitude);
    
    const minLat = Math.min(...lats);
    const maxLat = Math.max(...lats);
    const minLng = Math.min(...lngs);
    const maxLng = Math.max(...lngs);
    
    return {
      north: maxLat,
      south: minLat,
      east: maxLng,
      west: minLng
    };
  };

  const bounds = hallBuilding ? getFloorPlanBounds() : null;

  return (
    <View style={mapStyles.container}>
      {/* Floating SearchBar and Chips */}
      <View style={overlayStyles.floatingContainer}>
        <SearchBar value={searchText} onChangeText={setSearchText} data={buildings} />
        <View style={overlayStyles.chipsContainer}>
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
                <Text
                  style={[
                    mapStyles.chipText,
                    selectedCategory == category.label && mapStyles.chipTextSelected,
                  ]}
                >
                  {category.icon} {category.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </View>

      {/* Map */}
      <MapView
        ref={mapRef}
        style={mapStyles.map}
        initialRegion={initialRegion}
        showsUserLocation={false}
        onRegionChangeComplete={(region) => {
          const calculatedZoom = Math.round(Math.log(360 / region.longitudeDelta) / Math.LN2);
          setZoomLevel(calculatedZoom);
        }}
        onRegionChange={onRegionChange}
      >
        {/* Update the Floor Plan Overlay rendering */}
          {hallBuilding && bounds && floorPlans[selectedFloor] && hallBuildingFocused && (
          <View 
            style={{opacity: zoomLevel <= 17.3 ? 0.5 : 1 }}
          >

            <Overlay 
              bounds={[
                [bounds.south, bounds.west],
                [bounds.north, bounds.east]
              ]}
              image={floorPlans[selectedFloor]}
              zIndex={1}
            />
          </View> )}

          {jmsbBuilding && jmsbBounds && jmsbFloorPlans[jmsbSelectedFloor] && jmsbBuildingFocused && (
          <View 
            style={{opacity: zoomLevel <= 17.3 ? 0.5 : 1 }}
          >

            <Overlay 
              bounds={[
                [jmsbBounds.south, jmsbBounds.west],
                [jmsbBounds.north, jmsbBounds.east]
              ]}
              image={jmsbFloorPlans[jmsbSelectedFloor]}
              zIndex={1}
            />
          </View> )}

          {vanierBuilding &&  vanierBounds && vanierFloorPlans[vanierSelectedFloor] && vanierBuildingFocused && (
            <View
              style={{opacity: zoomLevel <= 17.3 ? 0.5 : 1 }}
            >

              <Overlay
                bounds={[
                  [vanierBounds.south, vanierBounds.west],
                  [vanierBounds.north, vanierBounds.east]
                ]}
                image={vanierFloorPlans[vanierSelectedFloor]}
                zIndex={1}
              />
            </View>
          )}

          {ccBuilding && ccBounds && ccFloorPlan && ccBuildingFocused && (
            <View
              style={{opacity: zoomLevel <= 17.3 ? 0.5 : 1 }}
                >
              <Overlay
                bounds={[
                  [ccBounds.south, ccBounds.west],
                  [ccBounds.north, ccBounds.east]
                ]}
                image={ccFloorPlan}
                zIndex={1} 
                />
                </View>
          )}

          

        {buildings.map((building) => {
   
            return (
              <BuildingMarker
                key={building.id}
                building={building}
                router={router}
                position={getMarkerPosition(building)}
                nearestBuilding={nearestBuilding}
                zIndex={3}  
                zoomLevel={zoomLevel}
                focusOnBuilding={focusOnBuilding}
              />
            );
          
        })}

        {userLocation && (
          <Marker 
            coordinate={userLocation} 
            anchor={{ x: 0.5, y: 0.5 }}
            zIndex={4} 
          >
            <View style={mapStyles.userMarker}>
              <View style={mapStyles.whiteOutline}>
                <View style={mapStyles.userDot} />
              </View>
            </View>
          </Marker>
        )}

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

        {buildings.map((building) => (
          <BuildingMarker
            key={building.id}
            building={building}
            router={router}
            position={getMarkerPosition(building)}
            nearestBuilding={nearestBuilding}
            focusOnBuilding={focusOnBuilding}
          />
        ))}

        {places.map((place) => (
          <Marker
            key={place.place_id}
            coordinate={{
              latitude: place.geometry.location.lat,
              longitude: place.geometry.location.lng,
            }}
            onPress={() => zoomToPlace(place)}
          >
            <View style={customMarkerStyles.markerCapsule}>
              <Text style={customMarkerStyles.icon}>{getPlaceIcon(place.types)}</Text>
              {place.rating && (
                <Text style={customMarkerStyles.ratingText}>
                  {place.rating.toFixed(1)}
                </Text>
              )}
              {zoomLevel >= 16 && (
                <Text style={customMarkerStyles.poiName}>
                  {place.name.length > 20 ? `${place.name.slice(0, 20)}...` : place.name}
                </Text>
              )}
            </View>
          </Marker>
        ))}

            {/* { room != null &&
            (<Marker 
              coordinate={clasroomCoordinates}
              title={room.name}
              pinColor="#912338"
              />)
                } */}
                {/* Room Marker */}

                <RoomMarker
                classroomCoordinates={clasroomCoordinates}
                room={room}
                router={router}
                />

             
      </MapView>
      
      {/* Floor Selector - Only visible when zoomed in on Hall Building */}
      {hallBuildingFocused && (
        <View style={styles.floorSelectorContainer}>
          {[1, 2, 8, 9].map((floor) => (
            <TouchableOpacity
              key={floor}
              style={[
                styles.floorButton,
                selectedFloor === floor && styles.selectedFloorButton,
              ]}
              onPress={() => setSelectedFloor(floor)}
            >
              <Text 
                style={[
                  styles.floorButtonText,
                  selectedFloor === floor && styles.selectedFloorButtonText
                ]}
              >
                {floor}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {jmsbBuildingFocused && (
              <View style={styles.floorSelectorContainer}>
                {[1, 2].map((floor) => (
                  <TouchableOpacity
                    key={floor}
                    style={[
                      styles.floorButton,
                      jmsbSelectedFloor === floor && styles.selectedFloorButton,
                    ]}
                    onPress={() => setJMSBSelectedFloor(floor)}
                  >
                    <Text 
                      style={[
                        styles.floorButtonText,
                        jmsbSelectedFloor === floor && styles.selectedFloorButtonText
                      ]}
                    >
                      {floor}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}

      { vanierBuildingFocused && (
        <View style={styles.floorSelectorContainer}>
          {[1, 2].map((floor) => (
            <TouchableOpacity
              key={floor}
              style={[
                styles.floorButton,
                vanierSelectedFloor === floor && styles.selectedFloorButton,
              ]}
              onPress={() => setVanierSelectedFloor(floor)}
            >
              <Text 
                style={[
                  styles.floorButtonText,
                  vanierSelectedFloor === floor && styles.selectedFloorButtonText
                ]}
              >
                {floor}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
      

      {/* Recenter Button */}
      {showRecenterButton && (
        <TouchableOpacity style={mapStyles.recenterButton} onPress={recenterMap}>
          <Text style={mapStyles.recenterText}>📍</Text>
        </TouchableOpacity>
      )}

      {/* Bottom Sheet */}
      <BottomSheet
        ref={bottomSheetRef}
        index={-1}
        snapPoints={snapPoints}
        onChange={() => {}}
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

      {/* Error Modal */}
      <Modal visible={errorVisible} transparent animationType="fade" onRequestClose={() => setErrorVisible(false)}>
        <View style={errorStyles.overlay}>
          <View style={errorStyles.modalContainer}>
            <Text style={errorStyles.title}>Oops!</Text>
            <Text style={errorStyles.message}>{errorMessage}</Text>
            <TouchableOpacity style={errorStyles.button} onPress={() => setErrorVisible(false)}>
              <Text style={errorStyles.buttonText}>Got it</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const overlayStyles = StyleSheet.create({
  floatingContainer: {
    position: 'absolute',
    top: 5,
    left: 10,
    right: 10,
    zIndex: 10,
  },
  chipsContainer: {
    marginTop: 8,
  },
});

const errorStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '80%',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#912338',
    marginBottom: 10,
  },
  message: {
    fontSize: 16,
    color: '#333',
    marginBottom: 20,
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#912338',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

const customMarkerStyles = StyleSheet.create({
  markerCapsule: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#912338',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#fff',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    minWidth: 50,
  },
  icon: {
    fontSize: 12,
    color: '#fff',
    marginRight: 4,
  },
  ratingText: {
    fontSize: 12,
    color: '#fff',
    fontWeight: '600',
  },
  poiName: {
    fontSize: 10,
    color: '#fff',
    marginLeft: 4,
    fontWeight: '500',
    maxWidth: 100,
  },
});
export const styles = StyleSheet.create({
  floorSelectorContainer: {
    position: 'absolute',
    right: 20,
    top: '50%',
    transform: [{ translateY: -100 }],
    backgroundColor: 'white',
    borderRadius: 10,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    padding: 5,
  },
  floorButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 5,
  },
  selectedFloorButton: {
    backgroundColor: '#9B1B30', // Match the accent color from mapStyles
  },
  floorButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#555',
  },
  selectedFloorButtonText: {
    color: 'white',
  }
});