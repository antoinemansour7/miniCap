import React, { useState, useEffect, useRef } from "react";
import MapView, { Marker, Polyline, Circle, Overlay, Polygon } from "react-native-maps";
import * as Location from "expo-location";
import { View, Text, StyleSheet, Dimensions, Alert } from "react-native";
import { useLocalSearchParams } from "expo-router";
import polyline from "@mapbox/polyline";
import { googleAPIKey } from "../../app/secrets";
import LocationSelector from "../../components/directions/LocationSelector";
import ModalSearchBars from "../../components/directions/ModalSearchBars";
import SwipeUpModal from "../../components/directions/SwipeUpModal";
import { 
    isNearCampus, 
    getNextShuttleTime, 
    LOYOLA_COORDS, 
    SGW_COORDS,
            } from "../../utils/shuttleUtils";
import  SGWBuildings  from "../../components/SGWBuildings";
import PF from "pathfinding";
import {
  floorGrid,
  getFloorPlanBounds,
  convertGridForPathfinding,
  getPolygonBounds,
  gridLines,
  horizontallyFlippedGrid,
  verticallyFlippedGrid,
  rotatedGrid,
  gridMapping,
  getClassCoordinates,
  getFloorNumber
} from "../../utils/indoorUtils";
import { get } from "react-native/Libraries/TurboModule/TurboModuleRegistry";
import {
  hallBuilding,
  hallBuildingFloors,
  getStartLocationHall,
  getStairsHall,
  getElevatorsHall,
  floorGridsHall,
  transformFloorGridsHall, } from "../../components/rooms/HallBuildingRooms";

import {
  jmsbBuilding,
  jmsbBounds, 
  jmsbFlippedGrid, 
  getStairsMB,
  getElevatorsMB,
  floorGridsMB,
  getStartLocationJSMB,
  transformFloorGridsMB, } from "../../components/rooms/JMSBBuildingRooms";
import {
  vanierBuilding, 
  vanierBounds, 
  vanierFlippedGrid, 
  getStairsVL,
  getElevatorsVL,
  floorGridsVL, 
  getStartLocationVanier,
  transformFloorGridsVL, } from "../../components/rooms/VanierBuildingRooms";
import { 
  ccBuilding, 
  ccBounds, 
  ccFlippedGrid, 
  getStairsCC,
  getElevatorsCC,
  floorGridsCC,
  getStartLocationCC,
  transformFloorGridsCC } from "../../components/rooms/CCBuildingRooms";
import FloorPlans from "../../components/FloorPlans";
import FloorSelector from "../../components/FloorSelector";
import { use } from "react";

       

const floorGrids = { 
  H: floorGridsHall,
  MB: floorGridsMB,
  VL: floorGridsVL,
  CC: floorGridsCC
}

const transformFloors = {
  H: transformFloorGridsHall,
  MB: transformFloorGridsMB,
  VL: transformFloorGridsVL,
  CC: transformFloorGridsCC
}

const stairsGetter = {
  H: getStairsHall,
  MB: getStairsMB,
  VL: getStairsVL,
  CC: getStairsCC,
}

const elevatorsGetter = {
  H: getElevatorsHall,
  MB: getElevatorsMB,
  VL: getElevatorsVL,
  CC: getElevatorsCC,
}

const DEFAULT_FLOOR_NUMBERS = {
  H: 1,
  MB: 1,
  VL: 1,
}

export default function DirectionsScreen() {
  
// Retrieve the destination from the params that were passed from the Map page
  const params = useLocalSearchParams();

  let parsedDestination = null;
  let errorMessage = null;
  let parsedRoom = null;
  let parsedRoomCoordinates = null;

  if (!params || !params.destination) {
    console.error("Missing destination in navigation!");
    errorMessage = "Error: No destination provided.";
  } else {
    try {
      parsedDestination = JSON.parse(params.destination);

    } catch (error) {
      console.error("Error parsing destination:", error);
      errorMessage = "Error: Invalid destination format.";
    }

    if ( params.room ) {
      parsedRoom = JSON.parse(params.room);
      parsedRoomCoordinates = JSON.parse(params.roomCoordinates);

    }

    if (
      !parsedDestination ||
      !parsedDestination.latitude ||
      !parsedDestination.longitude
    ) {
      console.error("Invalid destination:", parsedDestination);
      errorMessage = "Error: Invalid destination coordinates.";
    }
  }

  

  const buildingName = params?.buildingName || "No Destination set";
  const roomParams = parsedRoom || null ;
  const roomLocation = parsedRoomCoordinates|| null;
  


  // State management
  const [destinationName, setDestinationName] = useState(buildingName);
  const mapRef = useRef(null);
  const [destination, setDestination] = useState(parsedDestination);
  const [userLocation, setUserLocation] = useState(null);
  const [startLocation, setStartLocation] = useState(null);
  const [routeSegments, setRouteSegments] = useState([]);
  const [transferMarkers, setTransferMarkers] = useState([]);
  const [routeInfo, setRouteInfo] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [zoomLevel, setZoomLevel] = useState(20);
  const [selectedStart, setSelectedStart] = useState("userLocation");
  const [selectedDest, setSelectedDest] = useState("current");
  const [customDest, setCustomDest] = useState("");
  const [travelMode, setTravelMode] = useState("WALKING");
  const [customStartName, setCustomStartName] = useState("");
  const [customLocationDetails, setCustomLocationDetails] = useState({
    name: "",
    coordinates: null,
  });
  const [customSearchText, setCustomSearchText] = useState("");
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [searchType, setSearchType] = useState("START");
  const [directions, setDirections] = useState([]);
  
  // ***************************************************************************************************** //
  // Indoor routing variables

  // are the buildings focused?
  const [hallBuildingFocused, setHallBuildingFocused] = useState(false);
  const [jmsbBuildingFocused, setJMSBBuildingFocused] = useState(false);
  const [vanierBuildingFocused, setVanierBuildingFocused] = useState(false);
  const [ccBuildingFocused, setCCBuildingFocused] = useState(false);




  const [renderTrigger, setRenderTrigger] = useState(false);
  const [showPoly, setShowPoly] = useState(true);
  // Classroom as detsination
  const [room, setRoom] = useState(roomParams);
  const [floorNumber, setFloorNumber] = useState(DEFAULT_FLOOR_NUMBERS);
  
  
  const [roomCoordinates, setRoomCoordinates] = useState(roomLocation);
  const [finalRoomCoordinates, setFinalRoomCoordinates] = useState(null);
  const [tempRoomCoordinates, setTempRoomCoordinates] = useState(null);
  
  const [indoorPath, setIndoorPath] = useState(null);
  const [finalIndoorPath, setFinalIndoorPath] = useState(null);
  const [tempindoorPath, setTempIndoorPath] = useState(null);
  
  const tempRoomFloor = 2;
  const [roomFloorStart, setRoomFloorStart] = useState(1);
  const [roomFloorFinal,  setRoomFloorFinal] = useState(1)
  const [roomFloorFinal2,  setRoomFloorFinal2] = useState(1)
  
  // Classroom as starting point
  const [startRoom, setStartRoom] = useState(null);
  const [startRoomCoordinates, setStartRoomCoordinates] = useState(null);
  const [startFinalRoomCoordinates, setStartFinalRoomCoordinates] = useState(null);
  const [startTempRoomCoordinates, setStartTempRoomCoordinates] = useState(null);

  const [startIndoorPath, setStartIndoorPath] = useState(null);
  const [startFinalIndoorPath, setStartFinalIndoorPath] = useState(null);
  const [startTempIndoorPath, setStartTempIndoorPath] = useState(null);

  const [startRoomFloor, setStartRoomFloor] = useState(2);


  const [customStartRoomName, setCustomStartRoomName] = useState("");



  const resetRoom = () => {
    setRoom(null);
    setRoomCoordinates(null);
    setFinalIndoorPath(null);
    setFinalRoomCoordinates(null);
    setTempIndoorPath(null);
    setTempRoomCoordinates(null);
    setIndoorPath(null);
    setFinalIndoorPath(null);
    setTempIndoorPath(null);
  }

  const resetStartRoom = () => {
    setStartRoom(null);
    setStartRoomCoordinates(null);
    setStartFinalIndoorPath(null);
    setStartFinalRoomCoordinates(null);
    setStartTempIndoorPath(null);
    setStartTempRoomCoordinates(null);
    setStartIndoorPath(null);
    setStartFinalIndoorPath(null);
    setStartTempIndoorPath(null);
  }





  const startLocationGetters = {
    H: getStartLocationHall, 
    MB: getStartLocationJSMB, 
    VL: getStartLocationVanier, 
    CC: getStartLocationCC,
  }
  
  useEffect(() => {

    setTimeout(() => {
        setRenderTrigger(prev => !prev);
    }, 100);

  }, [hallBuildingFocused, jmsbBuildingFocused, vanierBuildingFocused, ccBuildingFocused]);

  useEffect(() => {

    setShowPoly(false);
    setTimeout(() => {
      setShowPoly(true);
      }, 300);

  }, [renderTrigger]);

  useEffect(() => {

    updateIndoorRoute();
  },[startRoom,room]);



   const getStartLocation = (startGetter, floor) => {

    const item = startGetter(floor);
    console.log("Start location item:", item);
    return {
      locationItem: item,
      coords: {
        xcoord: item.location.x,
        ycoord: item.location.y,
      },
    };
  };
  
   const getEndLocation = (room) => ({
    xcoord: room.location.x,
    ycoord: room.location.y,
  });

   const prepareWalkableGrid = (grid, roomLocation, convertFn) => {
    const walkable = convertFn(grid);
    walkable.setWalkableAt(roomLocation.x, roomLocation.y, true);
    return walkable;
  };
   const prepareWalkableGrid2 = (grid, roomLocation, location, convertFn) => {
    const walkable = convertFn(grid);
    walkable.setWalkableAt(roomLocation.x, roomLocation.y, true);
    walkable.setWalkableAt(location.x, location.y, true);
    return walkable;
  };
  
  const findPath = (start, end, walkable) => {
    const finder = new PF.AStarFinder();
    return finder.findPath(start.xcoord, start.ycoord, end.xcoord, end.ycoord, walkable);
  };

  const convertPathToScreenCoordinates = (path, flippedGrid) =>
    path.map(([x, y]) => flippedGrid[y][x]);
  
  const handleMarkerTitle = () => {
    if (tempRoomCoordinates) {
      return  `Go to the 2nd floor`;
    }
    if (finalIndoorPath != null) {
      if (room.building === "MB") {

        return  `Go to the S${roomFloorFinal2} floor`
      }
      return  `Go to the ${roomFloorFinal}th floor`
    }
    return room.name;
  }

  const updateIndoorRoute = () => {
   
    if ( startRoom != null && room != null && (room?.building === startRoom?.building) ) {
      const floorRoom = parseInt(getFloorNumber(room.id));
      const floorStart = parseInt(getFloorNumber(startRoom.id));
      
      if ( floorRoom === floorStart ) {
        setRoomFloorFinal(floorRoom);
        setStartRoomFloor(floorRoom);
        const buildingGrid = floorGrids[startRoom.building];
        const gridTransformer = transformFloors[startRoom.building];
        const grid = buildingGrid[floorRoom];
       

        const endCoords = getEndLocation(room);
        const startCoords = getEndLocation(startRoom);
        const walkable = prepareWalkableGrid2(grid, room.location, startRoom.location, convertGridForPathfinding);
        const path = findPath(startCoords, endCoords, walkable);
        const flippedGrid = gridTransformer(grid);
        const screenPath = convertPathToScreenCoordinates(path, flippedGrid);
        const roomScreenCoords = getClassCoordinates(flippedGrid, startRoom.location.x, startRoom.location.y);
        const roomScreenCoordTemp = getClassCoordinates(flippedGrid, room.location.x, room.location.y);

        setStartIndoorPath(screenPath);
        setStartRoomCoordinates(roomScreenCoords);
        setStartTempRoomCoordinates(roomScreenCoordTemp);
        setFloorNumber(prev => ({
          ...prev,
          [startRoom.building]: floorRoom
        }));

        setIndoorPath(null);
        setRoomCoordinates(null);
        setFinalIndoorPath(null);
        setFinalRoomCoordinates(null);
        setTempIndoorPath(null);
        setStartFinalIndoorPath(null);
        setStartFinalRoomCoordinates(null);

      }
      else {
        setStartRoomFloor(floorStart);
        const buildingGrid = floorGrids[startRoom.building];
        const gridTransformer = transformFloors[startRoom.building];
        const grid = buildingGrid[floorStart]; 
        const { locationItem, coords: endCoords } = getStartLocation(
          startLocationGetters[startRoom.building],
          floorStart
        );
        const startCoords = getEndLocation(startRoom);
        const walkable = prepareWalkableGrid(grid, startRoom.location, convertGridForPathfinding);
        const path = findPath(startCoords, endCoords, walkable);
        const flippedGrid = gridTransformer(grid);
        const screenPath = convertPathToScreenCoordinates(path, flippedGrid);
        const roomScreenCoords = getClassCoordinates(flippedGrid, startRoom.location.x, startRoom.location.y);
        const roomScreenCoordTemp = getClassCoordinates(flippedGrid, endCoords.xcoord, endCoords.ycoord);
        setStartIndoorPath(screenPath);
        setStartRoomCoordinates(roomScreenCoords);
        setStartTempRoomCoordinates(roomScreenCoordTemp);
        setFloorNumber(prev => ({
          ...prev,
          [startRoom.building]: floorStart
        }));

          // destination floor 
          setRoomFloorFinal(floorRoom);
          const stairs = stairsGetter[startRoom.building](floorRoom)[0];
          const finalGrid = buildingGrid[floorRoom];

          const finalEndCoords = getEndLocation(room);
          const finalStartCoords = getEndLocation(stairs);
          const finalWalkable = prepareWalkableGrid2(finalGrid, stairs.location, room.location, convertGridForPathfinding);
          const finalPath = findPath(finalStartCoords, finalEndCoords, finalWalkable);
          const finalFlippedGrid = gridTransformer(finalGrid);
          const finalScreenPath = convertPathToScreenCoordinates(finalPath, finalFlippedGrid);
          const finalRoomScreenCoords = getClassCoordinates(finalFlippedGrid, room.location.x, room.location.y);
  
  
          setStartFinalIndoorPath(finalScreenPath);
          setStartFinalRoomCoordinates(finalRoomScreenCoords);

          setIndoorPath(null);
          setRoomCoordinates(null);
          setFinalIndoorPath(null);
          setFinalRoomCoordinates(null);
          setTempIndoorPath(null);
          setTempRoomCoordinates(null);
          
   
      }
  }
    else if (startRoom !== null) {
        const buildingGrid = floorGrids[startRoom.building];
        const gridTransformer = transformFloors[startRoom.building];
        const floor = parseInt(getFloorNumber(startRoom.id));
        console.log("StartFloor number:", floor);

        if (floor === 1 ) {
          setStartRoomFloor(1);
          
          const grid = buildingGrid[floor];
          const { locationItem, coords: endCoords } = getStartLocation(
            startLocationGetters[startRoom.building],
            floor
          );
          const startCoords = getEndLocation(startRoom);
          const walkable = prepareWalkableGrid(grid, startRoom.location, convertGridForPathfinding);
          const path = findPath(startCoords, endCoords, walkable);
          const flippedGrid = gridTransformer(grid);
          const screenPath = convertPathToScreenCoordinates(path, flippedGrid);
          const roomScreenCoords = getClassCoordinates(flippedGrid, startRoom.location.x, startRoom.location.y);

          setStartIndoorPath(screenPath);
          setStartRoomCoordinates(roomScreenCoords);
          setFloorNumber(prev => ({
            ...prev,
            [startRoom.building]: floor
          }));

        setStartTempRoomCoordinates(null);
        setStartFinalIndoorPath(null);
        setStartFinalRoomCoordinates(null);

        }
        else {
          setStartRoomFloor(floor);
          setRoomFloorFinal(1);
          const baseStairs = stairsGetter[startRoom.building](floor)[0];

          const grid = buildingGrid[floor];
          const { locationItem, coords: endCoords } = getStartLocation(
            startLocationGetters[startRoom.building],
            floor
          );
          const startCoords = getEndLocation(startRoom);
          const walkable = prepareWalkableGrid(grid, startRoom.location, convertGridForPathfinding);
          const path = findPath(startCoords, endCoords, walkable);
          console.log("Path:", path);
          const flippedGrid = gridTransformer(grid);
          const screenPath = convertPathToScreenCoordinates(path, flippedGrid);
          const roomScreenCoordsTemp = getClassCoordinates(flippedGrid, endCoords.xcoord, endCoords.ycoord);
          const roomScreenCoords = getClassCoordinates(flippedGrid, startRoom.location.x, startRoom.location.y);


    
          setStartIndoorPath(screenPath);
          setStartRoomCoordinates(roomScreenCoords);
          setStartTempRoomCoordinates(roomScreenCoordsTemp);
          setFloorNumber(prev => ({
            ...prev,
            [startRoom.building]: floor
          }));




          // destination floor 
        const stairs = stairsGetter[startRoom.building](1)[0];
        const finalGrid = buildingGrid[1];

        const { finalLocationItem, coords: finalEndCoords } = getStartLocation(
          startLocationGetters[startRoom.building],
          1
        );
        const finalStartCoords = getEndLocation(stairs);
        const finalWalkable = prepareWalkableGrid(finalGrid, stairs.location, convertGridForPathfinding);
        const finalPath = findPath(finalStartCoords, finalEndCoords, finalWalkable);
        const finalFlippedGrid = gridTransformer(finalGrid);
        const finalScreenPath = convertPathToScreenCoordinates(finalPath, finalFlippedGrid);
        const finalRoomScreenCoords = getClassCoordinates(finalFlippedGrid, finalEndCoords.xcoord, finalEndCoords.ycoord);


        setStartFinalIndoorPath(finalScreenPath);
        setStartFinalRoomCoordinates(finalRoomScreenCoords);


        }
    }
    else if (room !== null) {
      console.log("Room updateIndoorRouter:", room.id);
      const buildingGrid = floorGrids[room.building];
      const gridTransformer = transformFloors[room.building];

      const floor = parseInt(getFloorNumber(room.id));
      console.log("Floor number:", floor);
  

    
      if (floor === 1 ) {
        setRoomFloorStart(1);
        const grid = buildingGrid[floor];

        const { locationItem, coords: startCoords } = getStartLocation(
          startLocationGetters[room.building],
          floor
        );

        const endCoords = getEndLocation(room);
        const walkable = prepareWalkableGrid(grid, room.location, convertGridForPathfinding);
        const path = findPath(startCoords, endCoords, walkable);
        const flippedGrid = gridTransformer(grid);
        const screenPath = convertPathToScreenCoordinates(path, flippedGrid);
        const roomScreenCoords = getClassCoordinates(flippedGrid, room.location.x, room.location.y);

        setTempIndoorPath(null);
        setTempRoomCoordinates(null);

        setFinalIndoorPath(null);
        setFinalRoomCoordinates(null);

        setIndoorPath(screenPath);
        setRoomCoordinates(roomScreenCoords);

      } 
      else {
        const baseStairs = stairsGetter[room.building](1)[0];
        console.log("Base stairs:", baseStairs);
        const grid = buildingGrid[1];

        const { locationItem, coords: startCoords } = getStartLocation(
          startLocationGetters[room.building],
          1
        );

        console.log("startcoords:", startCoords);
        const endCoords = getEndLocation(baseStairs);
        console.log("endcoords:", endCoords);
        const walkable = prepareWalkableGrid(grid, baseStairs.location, convertGridForPathfinding);
        const path = findPath(startCoords, endCoords, walkable);
        const flippedGrid = gridTransformer(grid);
        const screenPath = convertPathToScreenCoordinates(path, flippedGrid);
        const roomScreenCoords = getClassCoordinates(flippedGrid, baseStairs.location.x, baseStairs.location.y);

    
        setIndoorPath(screenPath);
        setRoomCoordinates(roomScreenCoords);

        if (floor == 8 || floor == 9) {
          const tempStairs = stairsGetter[room.building](2)[0];
          const tempGrid = buildingGrid[2];

          const { locationItem, coords: tempStartCoords } = getStartLocation(
            startLocationGetters[room.building],
            2,
          );
          console.log("Temp startcoords:", tempStartCoords);
          const tempEndCoords = getEndLocation(tempStairs);
          console.log("Temp endcoords:", tempEndCoords);
          const tempWalkable = prepareWalkableGrid(tempGrid, tempStairs.location, convertGridForPathfinding);
          const tempPath = findPath(tempStartCoords, tempEndCoords, tempWalkable);
          const tempFlippedGrid = gridTransformer(tempGrid);
          const tempScreenPath = convertPathToScreenCoordinates(tempPath, tempFlippedGrid);
          const tempRoomScreenCoords = getClassCoordinates(tempFlippedGrid, tempStairs.location.x, tempStairs.location.y);
          setTempIndoorPath(tempScreenPath);
          setTempRoomCoordinates(tempRoomScreenCoords);

        }
        // destination floor 
        const finalGrid = buildingGrid[floor];

        const { finalLocationItem, coords: finalStartCoords } = getStartLocation(
          startLocationGetters[room.building],
          floor
        );
        console.log("Final startcoords:", finalStartCoords);
        const finalEndCoords = getEndLocation(room);
        console.log("Final endcoords:", finalEndCoords);
        const finalWalkable = prepareWalkableGrid(finalGrid, room.location, convertGridForPathfinding);
        const finalPath = findPath(finalStartCoords, finalEndCoords, finalWalkable);
        console.log("Final path:", finalPath);
        const finalFlippedGrid = gridTransformer(finalGrid);
        const finalScreenPath = convertPathToScreenCoordinates(finalPath, finalFlippedGrid);
        const finalRoomScreenCoords = getClassCoordinates(finalFlippedGrid, room.location.x, room.location.y);


        setFinalIndoorPath(finalScreenPath);
        setFinalRoomCoordinates(finalRoomScreenCoords);
        setRoomFloorFinal2(floor);

        if ( floor != 8 && floor != 9 ) {
          setTempIndoorPath(null);
          setTempRoomCoordinates(null);
        }
        
      }
    }


  }



      const onRegionChange = (region) => {
        // Calculate zoom level based on latitudeDelta
        const calculatedZoom = calculateZoomLevel(region);
        setZoomLevel( calculatedZoom );
        const minimumZoom = 17;
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
          const isHallFocused = distance < 0.0005 && calculatedZoom > minimumZoom;
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
          const isJMSBFocused = distance < 0.0006 && calculatedZoom > minimumZoom;
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
          const isVanierFocused = distance < 0.001 && calculatedZoom > minimumZoom;
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
          const isCCFocused = distance < 0.0005 && calculatedZoom > minimumZoom;
          setCCBuildingFocused(isCCFocused);
        }
    
      };

      const handleMarkerPress = (coordinate) => {
        mapRef.current?.animateToRegion({
          latitude: coordinate.latitude, 
          longitude: coordinate.longitude,
          latitudeDelta: 0.0009,
          longitudeDelta: 0.0009,
        },500)
      }

      // End of indoor
      // ***************************************************************************************************** //

  // A ref to always hold the latest selected travel mode
  const latestModeRef = useRef(travelMode);
  useEffect(() => {
    latestModeRef.current = travelMode;
  }, [travelMode]);

  if (errorMessage) {
    return <Text>{errorMessage}</Text>;
  }

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

  // Function to handle shuttle mode
  const handleShuttleMode = async (start, end) => {
    const isStartLoyola = isNearCampus(start, LOYOLA_COORDS);
    const isStartSGW = isNearCampus(start, SGW_COORDS);
    const isEndLoyola = isNearCampus(end, LOYOLA_COORDS);
    const isEndSGW = isNearCampus(end, SGW_COORDS);

    if (!((isStartLoyola && isEndSGW) || (isStartSGW && isEndLoyola))) {
      return Alert.alert(
        "Shuttle Service",
        "Shuttle service is only available between Loyola and SGW campuses.",
        [{ text: "OK" }]
      );
    }

    const fromCampus = isStartLoyola ? "loyola" : "sgw";
    const nextTime = getNextShuttleTime(fromCampus);
    setDirections([
      {
        id: 0,
        instruction: `Next shuttle departing from ${fromCampus.toUpperCase()} Campus`,
        distance: "Shuttle Service",
        duration: `${nextTime} - 25 min ride`,
      },
    ]);

    try {
      const routeData = await fetchRouteData(start, end, "driving");
      // Discard result if mode has changed since the request started
      if (latestModeRef.current !== "SHUTTLE") return;
      if (!routeData) return;

      updateRouteInformation(routeData, start, end, {
        distance: "Shuttle departing at:",
        duration: `${nextTime}`,
      });
    } catch (err) {
      handleError(err);
    }
  };

  // Function to handle other modes (WALKING, TRANSIT, DRIVING, etc.)
  const handleOtherModes = async (start, end, mode) => {
    try {
      setIsLoading(true);
      const routeData = await fetchRouteData(start, end, mode.toLowerCase());
      // If the mode has changed while fetching, ignore the outdated response.
      if (latestModeRef.current !== mode) return;
      if (!routeData) throw new Error("No route found");

      updateRouteInformation(routeData, start, end);
    } catch (err) {
      handleError(err);
    } finally {
      setTimeout(() => setIsLoading(false), 0);
    }
  };

  // Function to fetch route update
  const fetchRouteData = async (start, end, mode) => {
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/directions/json?origin=${start.latitude},${start.longitude}&destination=${end.latitude},${end.longitude}&mode=${mode}&key=${googleAPIKey}`
    );
    const data = await response.json();
    return data.routes?.length > 0 ? data : null;
  };

  // Updated function to update route information with segmented polylines
  const updateRouteInformation = (data, start, end, customRouteInfo = null) => {
    const leg = data.routes[0].legs[0];
    // Build segments from each step in the leg
    const segments = leg.steps.map((step) => {
      const decoded = polyline.decode(step.polyline.points).map(([lat, lng]) => ({
        latitude: lat,
        longitude: lng,
      }));
      return {
        coordinates: decoded,
        travelMode: step.travel_mode,
        transit: step.transit_details || null,
        // Store the raw polyline string so we can use it as a stable key
        polylineStr: step.polyline.points,
      };
    });
    setRouteSegments(segments);

    // Determine transfer markers (white dots) at mode transitions or transit vehicle/line changes
    const markers = [];
    for (let i = 0; i < segments.length - 1; i++) {
      const current = segments[i];
      const next = segments[i + 1];
      let shouldAdd = false;
      if (current.travelMode !== next.travelMode) {
        shouldAdd = true;
      } else if (
        current.travelMode === "TRANSIT" &&
        current.transit &&
        next.transit
      ) {
        if (
          current.transit.line.vehicle.type !== next.transit.line.vehicle.type ||
          current.transit.line.short_name !== next.transit.line.short_name
        ) {
          shouldAdd = true;
        }
      }
      if (shouldAdd) {
        const lastCoord = current.coordinates[current.coordinates.length - 1];
        markers.push(lastCoord);
      }
    }
    setTransferMarkers(markers);

    // Update route summary info and directions list
    setRouteInfo(
      customRouteInfo || { distance: `${leg.distance.text} -`, duration: leg.duration.text }
    );
    setDirections(
      leg.steps.map((step, index) => ({
        id: index,
        instruction: step.html_instructions.replace(/<\/?[^>]*>/g, ""),
        distance: step.distance.text,
        duration: step.duration.text,
      }))
    );

    if (mapRef.current) {
      // Fit the map to show start, end and all segment coordinates
      const allCoords = [start, end];
      segments.forEach((segment) => {
        allCoords.push(...segment.coordinates);
      });
      setTimeout(() => {
        mapRef.current.fitToCoordinates(allCoords, {
          edgePadding: { top: 250, right: 50, bottom: 200, left: 50 },
          animated: true,
        });
      }, 100);
    }
  };

  // Function to handle errors
  const handleError = (err) => {
    console.error("Route update error:", err);
    setError(err.message);
  };

  const updateRouteWithMode = async (start, end, mode) => {
    if (!start || !end) return;
    if (mode === "SHUTTLE") {
      return handleShuttleMode(start, end);
    }
    // Other modes
    return handleOtherModes(start, end, mode);
  };

    const updateRoute = (start, end) => {
      console.log("Update route:", start, end);
      setFloorNumber(DEFAULT_FLOOR_NUMBERS);
      console.log("StartRoom", startRoom);
      updateIndoorRoute();
      
      updateRouteWithMode(start, end, travelMode);
    };



  useEffect(() => {
    let locationSubscription;

    const setupLocationAndRoute = async () => {
      try {
        setIsLoading(true);
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") {
          throw new Error("Location permission denied");
        }

        // 1. Get the last known location for a fast response.
        const lastKnown = await Location.getLastKnownPositionAsync();
        if (lastKnown) {
          const quickLocation = {
            latitude: lastKnown.coords.latitude,
            longitude: lastKnown.coords.longitude,
          };
          setUserLocation(quickLocation);
          if (selectedStart === "userLocation") {
            setStartLocation(quickLocation);
            updateRoute(quickLocation, destination);
          }
        }

        // 2. Then, get the precise current position.
        const precise = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.High,
        });
        const newLocation = {
          latitude: precise.coords.latitude,
          longitude: precise.coords.longitude,
        };

        setUserLocation(newLocation);
        if (selectedStart === "userLocation") {
          setStartLocation(newLocation);
          updateRoute(newLocation, destination);
        }

        locationSubscription = await Location.watchPositionAsync(
          {
            accuracy: Location.Accuracy.High,
            timeInterval: 5000,
            distanceInterval: 10,
          },
          (location) => {
            const updatedLocation = {
              latitude: location.coords.latitude,
              longitude: location.coords.longitude,
            };
            setUserLocation(updatedLocation);
            if (selectedStart === "userLocation") {
              setStartLocation(updatedLocation);
              updateRoute(updatedLocation, destination);
            }
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [destination, selectedStart]);

  const handleCloseModal = () => {
    setIsModalVisible(false);
  };

  return (
    <View style={stylesB.mainContainer}  >

      <View style={stylesB.floatingContainer}> 
        {/* Place the LocationSelector ABOVE the MapView */}
        <LocationSelector
          startLocation={startLocation}
          setStartLocation={setStartLocation}
          customStartName={customStartName}
          selectedStart={selectedStart}
          setSelectedStart={setSelectedStart}
          userLocation={userLocation}
          setUserLocation={setUserLocation}
          buildingName={buildingName}
          destinationName={destinationName}
          destination={destination}
          parsedDestination={parsedDestination}
          selectedDest={selectedDest}
          setSelectedDest={setSelectedDest}
          setDestination={setDestination}
          setDestinationName={setDestinationName}
          travelMode={travelMode}
          setTravelMode={setTravelMode}
          setIsModalVisible={setIsModalVisible}
          setSearchType={setSearchType}
          updateRouteWithMode={updateRouteWithMode}
          updateRoute={updateRoute}
          setRoom={setRoom}
          resetRoom={resetRoom}
          resetStartRoom={resetStartRoom}
          customStartRoomName={customStartRoomName}
        />

      </View>
      <View style={stylesB.container}>

        {/* Now the map is below the selector */}
        <View style={stylesB.mapContainer}>
          <MapView
            ref={mapRef}
            style={{ flex: 1 }}
            initialRegion={{
              latitude: destination.latitude,
              longitude: destination.longitude,
              latitudeDelta: 0.05,
              longitudeDelta: 0.05,
            }}
            onRegionChange={onRegionChange}
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
            {startRoomCoordinates=== null && startLocation && selectedStart !== "userLocation" && (
              <Marker 
              coordinate={  startLocation} 
              title="Start" pinColor="green" 
              onPress={() => handleMarkerPress(  startLocation)}
              
              />
            )}


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
                <View style={stylesB.transferMarker} />
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
                    <View style={stylesB.busNumberContainer}>
                      <Text style={stylesB.busNumberText}>{busNumber}</Text>
                    </View>
                  </Marker>
                );
              }
              return null;
            })}

                 <FloorPlans
                    floorNumber={floorNumber}
                 />
                 
                    {destination && room == null && (
                      <Marker 
                      coordinate={destination} 
                      title="Destination" 
                      onPress={() => handleMarkerPress(destination)}
                      pinColor="#912338"
                      />)}


                    {/*  Indoor route */}
                        
                    {showPoly &&
                     Array.isArray(indoorPath) && indoorPath?.length > 0  && floorNumber[room?.building] === roomFloorStart &&
                          (<Polyline
                            coordinates={indoorPath}
                            strokeWidth={4}
                            strokeColor="#912338"
                            //lineDashPattern={[7]}
                            // key={renderTrigger ? 'line1' : 'line2'}
                          />)
                          }

                         { roomCoordinates != null && floorNumber[room?.building] === roomFloorStart &&
                          (<Marker 
                            coordinate={roomCoordinates}
                            title={ handleMarkerTitle()}
                            pinColor="#912338"
                            onPress={() => handleMarkerPress(roomCoordinates)}
                            // key={renderTrigger ? 'marker1' : 'marker2'}
                            />)
                          }

                        { showPoly &&
                        Array.isArray(finalIndoorPath) && finalIndoorPath?.length > 0 && floorNumber[room?.building] === roomFloorFinal2 &&
                          (<Polyline
                            coordinates={finalIndoorPath}
                            strokeWidth={4}
                            strokeColor="#912338"
                            //lineDashPattern={[7]}
                            // key={renderTrigger ? 'line3' : 'line4'}
                          />)
                          }

                         { finalRoomCoordinates != null && floorNumber[room?.building] === roomFloorFinal2 &&
                          (<Marker 
                            coordinate={finalRoomCoordinates}
                            title={room.name}
                            pinColor="#912338"
                            onPress={() => handleMarkerPress(finalRoomCoordinates)}
                            // key={renderTrigger ? 'marker3' : 'marker4'}
                            />)
                          }

                          { showPoly &&
                          Array.isArray(tempindoorPath) && tempindoorPath?.length > 0 && floorNumber[room?.building] === tempRoomFloor &&
                          (<Polyline
                            coordinates={tempindoorPath}
                            strokeWidth={4}
                            strokeColor="#912338"
                            //lineDashPattern={[7]}
                            // key={renderTrigger ? 'line5' : 'line6'}
                          />)
                          }

                          { tempRoomCoordinates != null && floorNumber[room?.building] === tempRoomFloor &&
                          (<Marker
                            coordinate={tempRoomCoordinates}
                            title={`Go to the ${roomFloorFinal}th floor`}
                            pinColor="#912338"
                            onPress={() => handleMarkerPress(tempRoomCoordinates)}
                            // key={renderTrigger ? 'marker5' : 'marker6'}
                            />)
                          }


                          {/* Classroom as starting point */}
                          {showPoly &&
                          Array.isArray(startIndoorPath) && startIndoorPath?.length > 0  && floorNumber[startRoom?.building] === startRoomFloor &&
                          (<Polyline
                            coordinates={startIndoorPath}
                            strokeWidth={4}
                            strokeColor="#912338"
                          />)
                          }
                          {showPoly &&
                          Array.isArray(startFinalIndoorPath) && startFinalIndoorPath?.length > 0  && floorNumber[startRoom?.building] === roomFloorFinal &&
                          (<Polyline
                            coordinates={startFinalIndoorPath}
                            strokeWidth={4}
                            strokeColor="#912338"
                          />)
                          }

                          { startRoomCoordinates != null && floorNumber[startRoom?.building] === startRoomFloor &&
                          (<Marker
                            coordinate={startRoomCoordinates}
                            title={"Start"}
                            pinColor="green"
                            onPress={() => handleMarkerPress(startRoomCoordinates)}
                            />)
                          }

                        { startFinalRoomCoordinates != null && floorNumber[startRoom?.building] === roomFloorFinal &&
                          (<Marker
                            coordinate={startFinalRoomCoordinates}
                            title={"Destination"}
                            pinColor="purple"
                            onPress={() => handleMarkerPress(startFinalRoomCoordinates)}
                            />)
                          }
                      
                        { startTempRoomCoordinates != null && floorNumber[startRoom?.building] === startRoomFloor &&
                          (<Marker
                            coordinate={startTempRoomCoordinates}
                            title={ 
                              room?.building != startRoom?.building ? 
                               "Go to 1st floor" : 
                               roomFloorFinal !==  startRoomFloor ?
                               `Go to floor  ${roomFloorFinal}` :
                               room.name }
                            pinColor="#912338"
                            onPress={() => handleMarkerPress(startTempRoomCoordinates)}
                            />)
                          }
                      

          </MapView>
          
        </View>



        {isLoading && (
          <View style={stylesB.loadingCard}>
            <Text style={stylesB.loadingText}>Loading route...</Text>
          </View>
        )}
        {error && (
          <View style={stylesB.errorCard}>
            <Text style={stylesB.errorText}>{error}</Text>
          </View>
        )}
      </View>

      {routeInfo && directions.length > 0 && (
        <SwipeUpModal distance={routeInfo.distance} duration={routeInfo.duration} directions={directions} />
      )}
      <View>
   
      <ModalSearchBars
        searchType={searchType}
        isModalVisible={isModalVisible}
        handleCloseModal={handleCloseModal}
        updateRoute={updateRoute}
        startLocation={startLocation}
        setStartLocation={setStartLocation}
        customSearchText={customSearchText}
        setCustomSearchText={setCustomSearchText}
        setCustomStartName={setCustomStartName}
        customLocationDetails={customLocationDetails}
        setCustomLocationDetails={setCustomLocationDetails}
        destination={destination}
        setDestination={setDestination}
        customDest={customDest}
        setCustomDest={setCustomDest}
        setDestinationName={setDestinationName}
        setRoom={setRoom}
        setStartRoom={setStartRoom}
        setCustomStartRoomName={setCustomStartRoomName}
        customStartRoomName={customStartRoomName}


      />
      {routeInfo && directions.length > 0 && (
        <SwipeUpModal distance={routeInfo.distance} duration={routeInfo.duration} directions={directions} />
      )}
    </View>
    <FloorSelector 
        hallBuildingFocused={hallBuildingFocused}
        jmsbBuildingFocused={jmsbBuildingFocused}
        vanierBuildingFocused={vanierBuildingFocused}
   
        setFloorNumber={setFloorNumber}
        floorNumber={floorNumber}
        setRenderTrigger={setRenderTrigger}

        
      />
    </View>
  );
}

const stylesB = StyleSheet.create({
  mainContainer: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  mapContainer: {
    flex: 1,
  },
  floatingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
  },
  loadingCard: {
    position: "absolute",
    bottom: 40,
    left: 20,
    right: 20,
    backgroundColor: "white",
    padding: 10,
    borderRadius: 8,
    zIndex: 1,
  },
  loadingText: {
    textAlign: "center",
    fontSize: 16,
  },
  errorCard: {
    position: "absolute",
    top: 50,
    width: "100%",
    alignItems: "center",
    zIndex: 1,
  },
  errorText: {
    backgroundColor: "white",
    padding: 8,
    borderRadius: 5,
    color: "red",
    fontWeight: "bold",
  },
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
