import React, { useRef, useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import MapView, { Marker, Polygon, Overlay } from 'react-native-maps';
import * as Location from 'expo-location';
import { useRouter } from 'expo-router';
import BuildingMarker from './BuildingMarker';
import SearchBar from './SearchBar';
import mapStyles from './mapStyles';
import useLocationHandler from '../hooks/useLocationHandler';
import { get } from 'react-native/Libraries/TurboModule/TurboModuleRegistry';
import { getExactCoordinates, getFloorNumber } from '../utils/indoorUtils';




// Define paths to floor plan images/SVGs
const floorPlans = {
  1: require('../floorPlans/hall-1-rotated.png'),
  2: require('../floorPlans/Hall-2.png'),
  8: require('../floorPlans//Hall-8.png'),
  9: require('../floorPlans/Hall-9.png')
};

const BuildingMap = ({
  buildings,
  initialRegion,
  buildingsRegion,
  searchCoordinates,
  recenterDeltaUser,
  recenterDeltaBuildings,
  getMarkerPosition,
}) => {
  const mapRef = useRef(null);
  const router = useRouter();
  const { userLocation, nearestBuilding } = useLocationHandler(buildings, getMarkerPosition);
  const [userHeading, setUserHeading] = useState(null);
  const [searchText, setSearchText] = useState('');
  const [showRecenterButton, setShowRecenterButton] = useState(false);
  const [mapCenteredOnBuildings, setMapCenteredOnBuildings] = useState(true);
  
  // Floor plan state variables
  const [zoomLevel, setZoomLevel] = useState(0);
  const [selectedFloor, setSelectedFloor] = useState(1);
  const [hallBuildingFocused, setHallBuildingFocused] = useState(false);
  
  // Get the Hall Building reference
  const hallBuilding = buildings.find(b => b.id === 'H');
  const websterLibrary = buildings.find(b => b.id === 'WL');
  const [showPolygons, setShowPolygons] = useState(false);
  const [forceKey, setForceKey] = useState(0);
  const [classroomLocation, setClassroomLocation] = useState({
    xcoord: 0,
    ycoord: 0
  });
  const [clasroomCoordinates, setClassroomCoordinates] = useState(null); 
  const [room, setRoom] = useState(null);

  useEffect(() => {
    const timer = setTimeout(() =>{ 
      //setShowPolygons(true);
      setForceKey((prev) => prev + 1);
    }, 239);
    return () => clearTimeout(timer);
  }, [])
  
  // Handle region change (zoom/pan)
  const onRegionChange = (region) => {
    // Calculate zoom level based on latitudeDelta
    const calculatedZoom = Math.log2(360 / region.latitudeDelta);
    setZoomLevel(calculatedZoom);
    
    // Check if we're zoomed in on the Hall Building
    if (hallBuilding) {
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
  };

  // Search for a building and move the map to it
  useEffect(() => {
    if (searchText) {
      
      const building =  buildings.find((b) =>
        b.name.toLowerCase().includes(searchText.toLowerCase())
      );
      if (building){ 
        if (building.building) {
          console.log("Room searched: ",building);
          setClassroomLocation({
            xcoord: building.location.x,
            ycoord: building.location.y
          });
          setClassroomCoordinates(getExactCoordinates(building.location.x, building.location.y));
          console.log("Classroom coordinates: ", getExactCoordinates(building.location.x, building.location.y));
          setSelectedFloor(getFloorNumber(building.id));
          console.log("Selected floor: ", getFloorNumber(building.id));
          setRoom(building);
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
      <SearchBar value={searchText} onChangeText={setSearchText} data={buildings} />
      <MapView
        ref={mapRef}
        style={mapStyles.map}
        initialRegion={initialRegion}
        showsUserLocation={false}
        onRegionChange={onRegionChange}
      >
        {/* Floor Plan Overlay - Should be rendered first with lowest zIndex */}
        {hallBuilding && bounds &&   (
          <View 
            style={{opacity: zoomLevel <= 18 ? 0.5 : 1 }}
          >

            <Overlay 
              bounds={[
                [bounds.south, bounds.west],
                [bounds.north, bounds.east]
              ]}
              image={floorPlans[selectedFloor]}
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

        { room != null &&
            (<Marker 
              coordinate={clasroomCoordinates}
              title={room.name}
              pinColor="#912338"
              />)
                          }
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
      
      {showRecenterButton && (
        <TouchableOpacity style={mapStyles.recenterButton} onPress={recenterMap}>
          <Text style={mapStyles.recenterText}>📍</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
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

export default BuildingMap;