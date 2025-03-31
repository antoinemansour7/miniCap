import React from 'react';
import BuildingMap from './BuildingMap';
import LoyolaBuildings from './loyolaBuildings';
import { getAllRoomsVanier } from './rooms/VanierBuildingRooms';


// Compute centroid for Loyola buildings with an adjustment for building 'SP'
const getLoyolaMarkerPosition = (building) => {
  const boundary = building.boundary?.outer || building.boundary;
  if (!boundary || boundary.length === 0) return null;

  const totalPoints = boundary.length;
  const sumLat = boundary.reduce((sum, point) => sum + point.latitude, 0);
  const sumLon = boundary.reduce((sum, point) => sum + point.longitude, 0);

  let centroid = {
    latitude: sumLat / totalPoints,
    longitude: sumLon / totalPoints,
  };

  // Adjustment for building 'SP'
  if (building.id === 'SP') {
    centroid = {
      latitude: centroid.latitude - 0.00020,
      longitude: centroid.longitude - 0.0002,
    };
  }

  return centroid;
};

// For search, try using the centroid; if unavailable, fallback to building's own coordinates
const getLoyolaSearchCoordinates = (building) => {
  const coords = getLoyolaMarkerPosition(building);
  return coords ? coords : { latitude: building.latitude, longitude: building.longitude };
};

const initialRegion = {
  latitude: 45.4582,
  longitude: -73.6405,
  latitudeDelta: 0.005,
  longitudeDelta: 0.005,
};

const buildingsRegion = { latitude: 45.4582, longitude: -73.6405 };
const recenterDeltaUser = { latitudeDelta: 0.001, longitudeDelta: 0.001 };
const recenterDeltaBuildings = { latitudeDelta: 0.005, longitudeDelta: 0.005 };

const LoyolaMap = () => {

  const vanierBuildingRooms = getAllRoomsVanier();
  const allBuildingsAndRooms = [...LoyolaBuildings,...vanierBuildingRooms];

  return (
    <BuildingMap
      buildings={allBuildingsAndRooms}
      initialRegion={initialRegion}
      buildingsRegion={buildingsRegion}
      searchCoordinates={getLoyolaSearchCoordinates}
      recenterDeltaUser={recenterDeltaUser}
      recenterDeltaBuildings={recenterDeltaBuildings}
      getMarkerPosition={getLoyolaMarkerPosition}
    />
  );
};

export default LoyolaMap;
