import React from 'react';
import BuildingMap from './BuildingMap';
import SGWBuildings from './SGWBuildings';
import { getAllRoomsHall } from './rooms/HallBuildingRooms';


// Compute centroid for SGW buildings (no additional adjustment)
const getSGWMarkerPosition = (building) => {
  const boundary = building.boundary?.outer || building.boundary;
  if (!boundary || boundary.length === 0) return null;

  const totalPoints = boundary.length;
  const sumLat = boundary.reduce((sum, point) => sum + point.latitude, 0);
  const sumLon = boundary.reduce((sum, point) => sum + point.longitude, 0);

  return {
    latitude: sumLat / totalPoints,
    longitude: sumLon / totalPoints,
  };
};

// For SGW search, use the building's provided latitude/longitude directly
const getSGWSearchCoordinates = (building) => {
  return { latitude: building.latitude, longitude: building.longitude };
};

const initialRegion = {
  latitude: 45.4965,
  longitude: -73.5780,
  latitudeDelta: 0.002,
  longitudeDelta: 0.002,
};

const buildingsRegion = { latitude: 45.4965, longitude: -73.5780 };
const recenterDeltaUser = { latitudeDelta: 0.001, longitudeDelta: 0.001 };
const recenterDeltaBuildings = { latitudeDelta: 0.002, longitudeDelta: 0.002 };

const SGWMap = () => {

  const hallBuildingRooms = getAllRoomsHall();
  const allBuildingsAndRooms = [...SGWBuildings,...hallBuildingRooms];
  return (
    <BuildingMap
      buildings={allBuildingsAndRooms}
      initialRegion={initialRegion}
      buildingsRegion={buildingsRegion}
      searchCoordinates={getSGWSearchCoordinates}
      recenterDeltaUser={recenterDeltaUser}
      recenterDeltaBuildings={recenterDeltaBuildings}
      getMarkerPosition={getSGWMarkerPosition}
    />
  );
};

export default SGWMap;
