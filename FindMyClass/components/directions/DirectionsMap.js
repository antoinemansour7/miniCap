// components/directions/DirectionsMap.js
import React from "react";
import { View, Text, StyleSheet } from "react-native";
import MapView, { Marker, Polyline, Circle, Overlay } from "react-native-maps";
import { getPolygonBounds } from "../../utils/indoorUtils";
import { getExactCoordinates } from "../../utils/indoorUtils";

// Floor plans import
const floorPlans = {
  1: require('../../floorPlans/hall-1-rotated.png'),
  2: require('../../floorPlans/Hall-2.png'),
  8: require('../../floorPlans//Hall-8.png'),
  9: require('../../floorPlans/Hall-9.png')
};

const buildingPolygon = [
  { latitude: 45.4977197, longitude: -73.5790184 },
  { latitude: 45.4971663, longitude: -73.5795456 },
  { latitude: 45.4968262, longitude: -73.5788258 },
  { latitude: 45.4973655, longitude: -73.5782906 },
  { latitude: 45.4977197, longitude: -73.5790184 },
];

const newBounds = getPolygonBounds(buildingPolygon);

export default function DirectionsMap({
  mapRef,
  destination,
  userLocation,
  startLocation,
  selectedStart,
  routeSegments,
  transferMarkers,
  setZoomLevel,
  zoomLevel,
  room,
  floorNumber,
  pathCoordinates
}) {
  // Calculate circle radius based on zoom level
  const getCircleRadius = () => {
    const baseRadius = 20;
    return baseRadius * Math.pow(2, 15 - zoomLevel);
  };

  const calculateZoomLevel = (region) => {
    const LATITUDE_DELTA = region.latitudeDelta;
    return Math.round(Math.log2(360 / LATITUDE_DELTA));
  };

  // Helper: determine the polyline style based on travel mode and transit details
  const getPolylineStyle = (segment) => {
    // Default color is #912338
    let color = "#912338";
    let lineDashPattern; // no need to initialize to undefined

    if (segment.travelMode === "WALKING") {
      // color is already #912338 by default
      lineDashPattern = [1, 4];
    } else if (segment.travelMode === "TRANSIT" && segment.transit) {
      const vehicleType = segment.transit.line.vehicle.type;
      if (vehicleType === "BUS") {
        color = "purple";
      } else if (vehicleType === "METRO" || vehicleType === "SUBWAY") {
        const lineName = segment.transit.line.name;
        if (lineName.includes("Verte")) color = "green";
        else if (lineName.includes("Jaune")) color = "yellow";
        else if (lineName.includes("Orange")) color = "orange";
        else if (lineName.includes("Bleue")) color = "darkblue";
        else color = "grey"; // default metro color
      } else if (vehicleType === "TRAIN") {
        color = "lightgrey";
      }
      // else, leave it at #912338
    }
    // If driving, it's also #912338 by default

    return { color, lineDashPattern };
  };

  return (
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
      testID="map-view"
    >
      {userLocation && (
        <Circle
          testID="user-location-circle"
          center={userLocation}
          radius={getCircleRadius()}
          strokeColor="white"
          fillColor="rgba(0, 122, 255, 0.7)"
        />
      )}
      
      {startLocation && selectedStart !== "userLocation" && (
        <Marker coordinate={startLocation} title="Start" pinColor="green" />
      )}
      
      {destination && !room && <Marker coordinate={destination} title="Destination" />}

      {/* Render each route segment with its own style */}
      {routeSegments.map((segment) => {
        const style = getPolylineStyle(segment);
        return (
          <Polyline
            key={segment.polylineStr} // Use the raw polyline as a stable key
            coordinates={segment.coordinates}
            strokeWidth={2}
            strokeColor={style.color}
            lineDashPattern={style.lineDashPattern}
          />
        );
      })}

      {/* Render white circle markers at transfers */}
      {transferMarkers.map((marker) => (
        <Marker
          key={`transfer-${marker.latitude}-${marker.longitude}`}
          coordinate={marker}
        >
          <View style={styles.transferMarker} />
        </Marker>
      ))}

      {/* Render bus number markers at midpoint of bus transit segments */}
      {routeSegments.map((segment) => {
        if (
          segment.travelMode === "TRANSIT" &&
          segment.transit &&
          segment.transit.line.vehicle.type === "BUS"
        ) {
          const busNumber = segment.transit.line.short_name;
          const midIndex = Math.floor(segment.coordinates.length / 2);
          const midCoord = segment.coordinates[midIndex];

          return (
            <Marker
              key={`bus-${segment.polylineStr}`} // Another stable key
              coordinate={midCoord}
              anchor={{ x: 0.5, y: 0.5 }}
            >
              <View style={styles.busNumberContainer}>
                <Text style={styles.busNumberText}>{busNumber}</Text>
              </View>
            </Marker>
          );
        }
        return null;
      })}

      {/* Floor plan overlay for indoor navigation */}
      <View style={{opacity: zoomLevel <= 13 ? 0.5 : 1 }}>
        <Overlay 
          bounds={[
            [newBounds.south, newBounds.west],
            [newBounds.north, newBounds.east]
          ]}
          image={floorPlans[floorNumber || 8]}
          zIndex={1}
        />
      </View>
      
      {/* Indoor route */}
      {room !== null && (
        <Polyline
          coordinates={pathCoordinates}
          strokeWidth={4}
          strokeColor="#912338"
        />
      )}

      {room !== null && (
        <Marker 
          coordinate={getExactCoordinates(
            room.location.x, 
            room.location.y
          )}
          title={room.name}
          pinColor="#912338"
        />
      )}
    </MapView>
  );
}

const styles = StyleSheet.create({
  transferMarker: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "white",
    borderColor: "black",
    borderWidth: 1,
  },
  busNumberContainer: {
    backgroundColor: "white",
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: "black",
  },
  busNumberText: {
    fontSize: 12,
    fontWeight: "bold",
    color: "black",
  },
});