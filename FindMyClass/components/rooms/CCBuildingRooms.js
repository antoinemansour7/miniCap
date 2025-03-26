import  loyolaBuildings  from "../../components/loyolaBuildings";

const ccBuilding = loyolaBuildings.find(building => building.id === "CC");
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
      location: { x: 19, y: 5 },
      type: "start"
    },
    rooms: [

        {
            id: "CC-101",
            name: "CC-101",
            location: { x: 15, y: 6 },
        },
        {
            id: "CC-107",
            name: "CC-107",
            location: { x: 13, y: 6 },
        },
        {
            id: "CC-111",
            name: "CC-111",
            location: { x: 12, y: 6 },
        },
        {
            id: "CC-112",
            name: "CC-112",
            location: { x: 12, y: 4 },
        },
        {
            id: "CC-106",
            name: "CC-106",
            location: { x: 9, y: 4 },
        },
        {
            id: "CC-116",
            name: "CC-116",
            location: { x: 9, y: 4 },
        },
        {
            id: "CC-115",
            name: "CC-115",
            location: { x: 9, y: 6 },
        },
        {
            id: "CC-120",
            name: "CC-120", 
            location:{ x: 5, y: 4 },
        },
        {
            id: "CC-122",
            name: "CC-122",  
            location: { x: 4, y: 4 },
        },
        {
            id: "CC-119",
            name: "CC-119",
            location: { x: 4, y: 6 },
        },
      
    ],
    bathrooms: [
        {
            id: "CC-124",
            name: "bathroom-neutral",
            location: { x: 3, y: 4 },
        },
        {
            id: "CC-104",
            name: "bathroom-neutral",
            location: { x: 16, y: 4 },
        },

    ],
    stairs: [
        {
            id: "CC-1-stairs-1",
            name: "Stairs 1",
            location: { x: 1, y: 5 },
        },
        {
            id: "CC-1-stairs-2",
            name: "Stairs 2",
            location: { x: 6, y: 4 },
        },
        {
            id: "CC-1-stairs-3",
            name: "Stairs 3",
            location: { x: 17, y: 6 },
        },
    ],

    exits: [
        {
            id: "CC1-exit",
            name: "CC Exit",
            location: { x: 19, y: 5 },
        },
    ]


  },

  

  }


// Helper function to get rooms by floor
const getRoomsByFloorCC = (floorNumber) => {
  return hallBuildingFloors[floorNumber]?.rooms || [];
};

// Helper function to get start location for a floor
const getStartLocationCC = (floorNumber) => {
  return hallBuildingFloors[floorNumber]?.startLocation || null;
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
  getAllRoomsCC
};