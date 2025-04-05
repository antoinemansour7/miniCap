import  loyolaBuildings  from "../../components/loyolaBuildings";
import { precomputeTransformedGrid, flipHorizontally, getPolygonBounds, drawDebugGrid } from "../../utils/indoorUtils";


const ccBuilding = loyolaBuildings.find(building => building.id === "CC");

const ccBuildingCorners = [
  { latitude: 45.45856705947929, longitude: -73.64079466144375 }, // North
  { latitude: 45.45830788625432, longitude:  -73.64100794688723}, // West
  { latitude: 45.45788087046398, longitude: -73.63992974408042 }, // South
  { latitude: 45.45813615699811, longitude: -73.63971922216355 } // East
];

const floorGridCC = [
  [0,0,0,0,0,0,0,0,0,4,0,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0,0,4,0,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,1,1,1,1,4,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0,0,1,1,3,0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0,0,1,1,2,0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0,2,1,1,2,0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0,2,1,1,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0,0,1,1,1,4,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0,2,1,1,2,0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0,0,1,1,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0,2,1,1,2,0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0,0,1,1,2,0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0,2,1,1,1,4,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0,2,1,1,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0,0,1,1,2,0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0,2,1,1,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0,0,1,1,3,0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0,4,1,1,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0,0,1,1,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0,0,1,1,0,0,0,0,0,0,0,0,0],
]

const floorGridsCC = {
  1: floorGridCC,
}

const gridMapping = precomputeTransformedGrid(floorGridCC, ccBuildingCorners);
const gridCC = drawDebugGrid(gridMapping);
const ccFlippedGrid = flipHorizontally(gridMapping);  
const ccBounds = getPolygonBounds(ccBuildingCorners);

const transformFloorGridsCC = (floorGrid) => {
  const transformedGrid = precomputeTransformedGrid(floorGrid, ccBuildingCorners);
  return flipHorizontally(transformedGrid);
}

// Building configuration
const BUILDING_CONFIG = {
  buildingName: "CC Building",
  building: "CC",
  object: ccBuilding,
};

const ccBuildingFloors = {
  // 1st floor
  1: {
    startLocation: {
      id: "CC-start",
      name: "1st Floor Entrance",
      location: { x: 6, y: 2 },
      type: "start"
    },
    rooms: [

        {
            id: "CC-101",
            name: "CC-101",
            location: { x: 8, y: 15 },
        },
        {
            id: "CC-107",
            name: "CC-107",
            location: { x: 8 , y: 13 },
        },
        {
          id: "CC-109",
          name: "CC-109",
          location: { x: 8, y: 12 },
      },
        {
            id: "CC-111",
            name: "CC-111",
            location: { x: 8, y: 10 },
        },
        {
            id: "CC-112",
            name: "CC-112",
            location: { x: 11, y: 10 },
        },
        {
            id: "CC-106",
            name: "CC-106",
            location: { x: 11, y: 14 },
        },
        {
            id: "CC-116",
            name: "CC-116",
            location: { x: 11, y: 8 },
        },
        {
            id: "CC-115",
            name: "CC-115",
            location: { x: 8, y: 8 },
        },
        {
            id: "CC-120",
            name: "CC-120", 
            location:{ x: 11, y: 5 },
        },
        {
            id: "CC-122",
            name: "CC-122",  
            location: { x: 11, y: 4 },
        },
        {
            id: "CC-119",
            name: "CC-119",
            location: { x: 8, y: 5 },
        },
      
    ],
    bathrooms: [
        {
            id: "CC-124",
            name: "bathroom-neutral-124",
            location: { x: 11, y: 3 },
        },
        {
            id: "CC-104",
            name: "bathroom-neutral-104",
            location: { x: 11, y: 16 },
        },

    ],
    stairs: [
        {
            id: "CC-1-stairs-1",
            name: "Stairs 1",
            location: { x: 9, y: 2 },
        },
        {
            id: "CC-1-stairs-2",
            name: "Stairs 2",
            location: { x: 12, y: 7 },
        },
        {
            id: "CC-1-stairs-3",
            name: "Stairs 3",
            location: { x: 12, y: 12 },
        },
        {
          id: "CC-1-stairs-4",
          name: "Stairs 4",
          location: { x: 8, y: 17 },
      },
    ],

    exits: [
        {
            id: "CC1-exit",
            name: "CC Exit",
            location: { x: 9, y: 18 },
        },
    ]


  }, 

  }


// Helper function to get rooms by floor
const getRoomsByFloorCC = (floorNumber) => {
  return ccBuildingFloors[floorNumber]?.rooms || [];
};

// Helper function to get start location for a floor
const getStartLocationCC = (floorNumber) => {
  return ccBuildingFloors[floorNumber]?.startLocation || null;
};

// Modified getAllRooms function to automatically add building info
const getAllRoomsCC = () => {
  return Object.values(ccBuildingFloors).flatMap(floor => {
    const rooms = floor.rooms || [];
    // Add building information to each room
    return rooms.map(room => ({
      ...room,
      building: BUILDING_CONFIG.building,
      buildingName: BUILDING_CONFIG.buildingName,
      object: BUILDING_CONFIG.object,
    }));
  });
};

export {
  BUILDING_CONFIG,
  ccBuildingFloors,
  getRoomsByFloorCC,
  getStartLocationCC,
  getAllRoomsCC,
  ccFlippedGrid,
  ccBounds,
  gridCC,
  ccBuilding,
  floorGridsCC,
  transformFloorGridsCC,
};