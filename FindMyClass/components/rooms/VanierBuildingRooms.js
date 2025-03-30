import  SGWBuildings  from "../../components/SGWBuildings";
import { precomputeTransformedGrid, flipHorizontally, getPolygonBounds } from "../../utils/indoorUtils";

const vanierBuilding = SGWBuildings.find(building => building.id === "VL");
// Building configuration
const BUILDING_CONFIG = {
  buildingName: "Vanier Library",
  building: "VL",
  object: vanierBuilding,
};

const floorGrid = [
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,1,1,1,1,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,1,1,1,1,0,0,0,0,0,0,0,0,0],
    [4,4,1,0,0,2,1,1,1,1,1,1,2,0,2,0,0,0,0,0],
    [0,0,1,0,0,0,1,2,0,0,0,0,0,1,1,4,0,0,0,0],
    [0,2,1,0,3,3,1,2,0,0,0,0,0,2,1,1,0,0,0,0],
    [0,0,1,0,3,3,1,2,2,2,0,0,0,1,1,1,0,0,0,0],
    [0,2,1,0,0,0,1,1,1,1,1,1,1,1,1,1,0,0,0,0],
    [0,0,1,0,4,4,1,1,1,1,1,1,1,1,1,1,0,0,0,0],
    [0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0,0],
    [0,2,1,0,0,0,0,1,1,1,1,1,1,1,1,1,0,0,0,0],
    [0,0,1,2,0,0,0,1,1,1,1,1,1,1,1,1,0,0,0,0],
    [0,2,1,0,0,0,0,1,1,1,1,1,1,1,1,1,0,0,0,0],
    [0,0,1,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,0],
    [0,2,1,1,1,2,0,1,2,1,1,1,1,1,1,1,1,1,1,0],
    [0,0,1,2,0,0,0,0,4,4,5,1,1,1,1,1,1,1,1,0],
    [0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,0],
    [0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,4,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,2,0,0,0],
]

const vanierBuildingCorners = [
    { latitude: 45.45946362707318, longitude: -73.63865674781006 }, // North
    { latitude: 45.45888476384681, longitude:  -73.63913682555628}, // West
    { latitude: 45.45855604385656, longitude: -73.63830469079636 }, // South
    { latitude: 45.45913009995638, longitude: -73.63784061564175 } // East
]

const gridMapping = precomputeTransformedGrid(floorGrid, vanierBuildingCorners);
const vanierFlippedGrid = flipHorizontally(gridMapping);  
const vanierBounds = getPolygonBounds(vanierBuildingCorners);

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
            id: "VL-101-6",
            name: "VL-101-6",
            location: { x: 3, y: 1 },
        },
        
        {
            id: "VL-101-7",
            name: "VL-101-7",
            location: { x: 4, y: 1 },
        },

        {
            id: "VL-102",
            name: "VL-102",
            location: { x: 6, y: 1 },
        },

        {
            id: "VL-122-1",
            name: "VL-122-1",
            location: { x: 10, y: 4 },
        },

        {
            id: "VL-124",
            name: "VL-124",
            location: { x: 11, y: 4 },
        },
        
        {
            id: "VL-128",
            name: "VL-128",
            location: { x: 12, y: 6 },
        },

        {
            id: "VL-127-4",
            name: "VL-127-4",
            location: { x: 16, y: 6 },
        },

        {
            id: "VL-127-5",
            name: "VL-127-5",
            location: { x: 16, y: 7 },
        },

        {
            id: "VL-126",
            name: "VL-126",
            location: { x: 12, y: 8 },
        },

        {
            id: "VL-101-1",
            name: "VL-101-1",
            location: { x: 5, y: 11 },
        },

        {
            id: "VL-101-2",
            name: "VL-101-2",
            location: { x: 4, y: 11 },
        },

        {
            id: "VL-103-1",
            name: "VL-103-1",
            location: { x: 5, y: 13 },
        },

        {
            id: "VL-106-1",
            name: "VL-106-1",
            location: { x: 10, y: 13 },
        },

        {
            id: "VL-106-2",
            name: "VL-106-2",
            location: { x: 11, y: 13 },
        },

        {
            id: "VL-116",
            name: "VL-116",
            location: { x: 12, y: 13 },
        },

        {
            id: "VL-121-3",
            name: "VL-121-3",
            location: { x: 16, y: 13 },
        },

        {
            id: "VL-197",
            name: "VL-197",
            location: { x: 5, y: 15 },
        },

    ],

    bathrooms: [
        {
            id: "VL-118",
            name: "bathroom-neutral",
            location: { x: 13, y: 12 },
        },  
     ],
    stairs: [
        {
            id: "VL-1-stairs-1",
            name: "Stairs 1",
            location: { x: 1, y: 1 },
        },
        {
            id: "VL-1-stairs-2",
            name: "Stairs 2",
            location: { x: 7, y: 15 },
        },
        {
            id: "VL-1-stairs-3",
            name: "Stairs 3",
            location: { x: 13, y: 10 },
        },
    ],
    elevators: [
        {
            id: "VL-1-elevator-1",
            name: "Elevator 1",
            location: { x: 9, y: 3 },
        }, 
    ],
    exits: [
        {
            id: "VL-1-exit",
            name: "VL-1 Exit",
            location: { x: 8, y: 17 },
        },
    ]
  },


  // VL-2
  2: {
    startLocation: {
      id: "VL2-start",
      name: "2nd Floor Entrance",
      location: { x: 9, y: 4 },
      type: "start"
    },
    rooms: [
        {
            id: "VL-202",
            name: "VL-202",
            location: { x: 3, y: 1 },
        }, 
        {
            id: "VL-202.30",
            name: "VL-202.30",
            location: { x: 11, y: 4 },
        },
        {
            id: "VL-230",
            name: "VL-230",
            location: { x: 16, y: 4 },
        }, 
        {
            id: "VL-228",
            name: "VL-228",
            location: { x: 14, y: 5 },
        }, 
        {
            id: "VL-229",
            name: "VL-229",
            location: { x: 17, y: 5 },
        }, 
        {
            id: "VL-227",
            name: "VL-227",
            location: { x: 17, y: 7 },
        }, 
        {
            id: "VL-225",
            name: "VL-225",
            location: { x: 17, y: 8 },
        }, 
        {
            id: "VL-203-1",
            name: "VL-201-1",
            location: { x: 10, y: 11 },
        },
        {
            id: "VL-203-2",
            name: "VL-203-2",
            location: { x: 11, y: 11 },
        },
        {
            id: "VL-223",
            name: "VL-223",
            location: { x: 17, y: 11 },
        },
        {
            id: "VL-201",
            name: "VL-201",
            location: { x: 6, y: 12 },
        },
        {
            id: "VL-203",
            name: "VL-203",
            location: { x: 11, y: 12 },
        },
        {
            id: "VL-204",
            name: "VL-204",
            location: { x: 11, y: 13 },
        },
        {
            id: "VL-221",
            name: "VL-221",
            location: { x: 17, y: 13 },
        },
        {
            id: "VL-240",
            name: "VL-240",
            location: { x: 5, y: 14 },
        },
        {
            id: "VL-297",
            name: "VL-297",
            location: { x: 7, y: 14 },
        },
        {
            id: "VL-205",
            name: "VL-205",
            location: { x: 13, y: 14 },
        },
    ],
    bathrooms: [
        {
            id: "VE-216",
            name: "bathroom-female-1",
            location: { x: 13, y: 13 },
        },  
        {
            id: "VE-210",
            name: "bathroom-female-2",
            location: { x: 12, y: 13 },
        },   
        {
            id: "VE-218",
            name: "bathroom-male-1",
            location: { x: 13, y: 15 },
        },  
        {
            id: "VE-212",
            name: "bathroom-male-2",
            location: { x: 12, y: 15 },
        },    
     ],
    stairs: [
        {
            id: "VL-2-stairs-1",
            name: "Stairs 1",
            location: { x: 1, y: 1 },
        },
        {
            id: "VL-2-stairs-2",
            name: "Stairs 2",
            location: { x: 4, y: 13 },
        },
        {
            id: "VL-2-stairs-3",
            name: "Stairs 3",
            location: { x: 10, y: 3 },
        },
        {
            id: "VL-2-stairs-4",
            name: "Stairs 4",
            location: { x: 13, y: 10 },
        },
        {
            id: "VL-2-stairs-5",
            name: "Stairs 5",
            location: { x: 17, y: 14 },
        },
    ],
    elevators: [
        {
            id: "VL-2-elevator-1",
            name: "Elevator 1",
            location: { x: 9, y: 3 },
        }, 
    ],
    exits: [
        {
            id: "VL-2-stairs-to-VL-1",
            name: "Stairs to VL 1",
            location: { x: 14, y: 10 },
        },
    ]

  }
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
  getAllRoomsVanier,
  vanierBounds,
  vanierFlippedGrid,
};