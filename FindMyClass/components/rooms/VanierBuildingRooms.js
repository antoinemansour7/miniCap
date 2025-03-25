import  SGWBuildings  from "../../components/SGWBuildings";

const vanierLibrary = SGWBuildings.find(building => building.id === "VL");
// Building configuration
const BUILDING_CONFIG = {
  buildingName: "Vanier Library",
  building: "VL",
  object: vanierLibrary,
};

const vanierLibraryFloors = {
  // VL1 Floor

  VL1: {
    startLocation: {
      id: "VL1-start",
      name: "1st Floor Entrance",
      location: { x: 11, y: 16 },
      type: "start"
    },
    
    rooms: [

        {
            id: "VL1-103-1",
            name: "VL1-103-1",
            location: { x: 5, y: 13 },
        },

        {
            id: "VL1-197",
            name: "VL1-197",
            location: { x: 5, y: 15 },
        },

        {
            id: "VL1-101-1",
            name: "VL1-101-1",
            location: { x: 5, y: 11 },
        },

        {
            id: "VL1-101-2",
            name: "VL1-101-2",
            location: { x: 4, y: 11 },
        },

        {
            id: "VL1-101-7",
            name: "VL1-101-7",
            location: { x: 4, y: 1 },
        },

        {
            id: "VL1-101-6",
            name: "VL1-101-6",
            location: { x: 3, y: 1 },
        },

        {
            id: "VL1-102",
            name: "VL1-102",
            location: { x: 6, y: 1 },
        },



      
    ],
    bathrooms: [
        {
            id: "H-812",
            name: "bathroom-male",
            location: { x: 15, y: 12 },
        }

    ],
    stairs: [
        {
            id: "H-8-stairs-1",
            name: "Stairs 1",
            location: { x: 8, y: 8 },
        },

    ],
    elevators: [
        {
            id: "H-8-elevator-1",
            name: "Elevator 1",
            location: { x: 13, y: 6 },
        },
    ],
    exits: [
        {
            id: "H8-exit",
            name: "H8 Exit",
            location: { x: 8, y: 7 },
        },
    ]


  },

  // 2th floor

  VL2: {
    startLocation: {
      id: "VL2-start",
      name: "2nd Floor Entrance",
      location: { x: 8, y: 9 },
      type: "start"
    },

    rooms: [
        {
            id: "H-961.19",
            name: "H-961.19",
            location: { x: 1, y: 0 },
        },

    ],
    bathrooms: [
        {
            id: "H-992",
            name: "bathroom-neutral",
            location: { x: 13, y: 7 },
        },

    ],
    stairs: [
        {
            id: "H-9-stairs-1",
            name: "Stairs 1",
            location: { x: 8, y: 8 },
        },

    ],
    elevators: [
        {
            id: "H-9-elevator-1",
            name: "Elevator 1",
            location: { x: 13, y: 6 },
        },
    ],
    exits: [
        {
            id: "H-9-stairs-to-H8",
            name: "Stairs to H8",
            location: { x: 10, y: 8 },
        },
    ]

  },

};

// Helper function to get rooms by floor
const getRoomsByFloorVanier = (floorNumber) => {
  return vanierLibraryFloors[floorNumber]?.rooms || [];
};

// Helper function to get start location for a floor
const getStartLocationVanier = (floorNumber) => {
  return vanierLibraryFloors[floorNumber]?.startLocation || null;
};

// Modified getAllRooms function to automatically add building info
const getAllRoomsVanier = () => {
  return Object.values(vanierLibraryFloors).flatMap(floor => {
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
  vanierLibraryFloors,
  getRoomsByFloorVanier,
  getStartLocationVanier,
  getAllRoomsVanier
};