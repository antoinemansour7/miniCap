import  SGWBuildings  from "../../components/SGWBuildings";

const vanierLibrary = SGWBuildings.find(building => building.id === "VL");
// Building configuration
const BUILDING_CONFIG = {
  buildingName: "Vanier Library",
  building: "VL",
  object: vanierLibrary,
};

const vanierLibraryFloors = {
  // VL-1
  1: {
    startLocation: {
      id: "H8-start",
      name: "8th Floor Entrance",
      location: { x: 10, y: 10 },
      type: "start"
    },
    rooms: [

        {
            id: "H-801",
            name: "H-801",
            location: { x: 17, y: 3 },
        },
        {
            id: "H-803",
            name: "H-803",
            location: { x: 17, y: 5 },
        },
        {
            id: "H-805",
            name: "H-805",
            location: { x: 17, y: 7 },
        },
        {
            id: "H-807",
            name: "H-807",
            location: { x: 17, y: 9 },
        },
        {
            id: "H-811",
            name: "H-811",
            location: { x: 17, y: 12 },
        },
        {
            id: "H-813",
            name: "H-813",
            location: { x: 17, y: 14 },
        },
        {
            id: "H-815",
            name: "H-815",
            location: { x: 17, y: 15 },
        },
        {
            id: "H-817",
            name: "H-817", 
            location:{ x: 17, y: 17 },
        },
        {
            id: "H-819",
            name: "H-819",  
            location: { x: 16, y: 17 },
        },
        {
            id: "H-821",
            name: "H-821",
            location: { x: 14, y: 17 },
        },
        {
            id: "H-822",
            name: "H-822",
            location: { x: 7, y: 15 },

        },
        {
            id: "H-823",
            name: "H-823",
            location: { x: 12, y: 17 },
        },
        {
            id: "H-825",
            name: "H-825",
            location: { x: 10, y: 17 },  
        },
        {
            id: "H-827",
            name: "H-827",
            location: { x: 8, y: 17 },  
        },
        {
            id: "H-829",
            name: "H-829",
            location: { x: 6, y: 17 },  
        },
        {
            id: "H-829.01",
            name: "H-829.01",
            location: { x: 4, y: 17 },  
        },
        {
            id: "H-831",
            name: "H-831",
            location: { x: 2, y: 17 },
        },
        {
            id: "H-832.01",
            name: "H-832.01",
            location: { x: 4, y: 14 },
        },
        {
            id: "H-832.02",
            name: "H-832.02",
            location: { x: 4, y: 13 },
        },
        {
            id: "H-832.03",
            name: "H-832.03",
            location: { x: 4, y: 11 },
        },
        {
            id: "H-832.04",
            name: "H-832.04",
            location: { x: 5, y: 11 },
        },
        {
            id: "H-832.05",
            name: "H-832.05",
            location: { x: 6, y: 11 },
        },
        {
            id: "H-833",
            name: "H-833",
            location: { x: 2, y: 16 }, 
        },
        {
            id: "H-835",
            name: "H-835",
            location: { x: 2, y: 14 },
        },
        {
            id: "H-837",
            name: "H-837",
            location: { x: 2, y: 12 },
        },
        {
            id: "H-838",
            name: "H-838",
            location: { x: 4, y: 9 },
        },
     
        {
            id: "H-841",
            name: "H-841",
            location: { x: 2, y: 9 },
        },
        {
            id: "H-842",
            name: "H-842",
            location: { x: 6, y: 7 },
        },
        {
            id: "H-843",
            name: "H-843",
            location: { x: 2, y: 7 },
        },
        {
            id: "H-845",
            name: "H-845",
            location: { x: 2, y: 5 },
        },
        {
            id: "H-847",
            name: "H-847",
            location: { x: 2, y: 3 },
        },
        {
            id: "H-849",
            name: "H-849",
            location: { x: 2, y: 1 },

        },
        {
            id: "H-851.01",
            name: "H-851.01",
            location: { x: 4, y: 2 },
        },
        {
            id: "H-851.02",
            name: "H-851.02",
            location: { x: 4, y: 1 },
        },
        {
            id: "H-851.03",
            name: "H-851.03",
            location: { x: 3, y: 1 },
        },
        {
            id: "H-852",
            name: "H-852",
            location: { x: 6, y: 4 },
        },
        {
            id: "H-853",
            name: "H-853",
            location: { x: 6, y: 2 },
        },
        {
            id: "H-854",
            name: "H-854",
            location: { x: 8, y: 4 },
        },
        {
            id: "H-855",
            name: "H-855",
            location: { x: 8, y: 2 },
        },
        {
            id: "H-857",
            name: "H-857",
            location: { x: 10, y: 2 },
        },
        {
            id: "H-859",
            name: "H-859",
            location: { x: 12, y: 2 },
        },
        {
            id: "H-861",
            name: "H-861",
            location: { x: 14, y: 2 },
        },
        {
            id: "H-863",
            name: "H-863",
            location: { x: 15, y: 2 },
        },
        {
            id: "H-863.01",
            name: "H-863.01",
            location: { x: 17, y:1 },
        },
        {
            id: "H-867",
            name: "H-867",
            location: { x: 18, y: 2 },
        },
        {
            id: "H-881", 
            name: "H-881",
            location: { x: 4, y: 6 },
        },
       
      
    ],
    bathrooms: [
        {
            id: "H-812",
            name: "bathroom-male",
            location: { x: 15, y: 12 },
        },
        {
            id: "H-802",
            name: "bathroom-female",
            location: { x: 15, y: 4 },
        },
        {
            id: "H-804",
            name: "bathroom-neutral",
            location: { x: 15, y: 7 },
        }

    ],
    stairs: [
        {
            id: "H-8-stairs-1",
            name: "Stairs 1",
            location: { x: 8, y: 8 },
        },
        {
            id: "H-8-stairs-2",
            name: "Stairs 2",
            location: { x: 4, y: 5 },
        },
        {
            id: "H-8-stairs-3",
            name: "Stairs 3",
            location: { x: 13, y: 5 },
        },
        {
            id: "H-8-stairs-4",
            name: "Stairs 4",
            location: { x: 15, y: 13 },
        },
        {
            id: "H-8-stairs-5",
            name: "Stairs 5",
            location: { x: 4, y: 15 },
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

  // 9th floor
  9: {
    startLocation: {
      id: "H9-start",
      name: "9th Floor Entrance",
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
        {
            id: "H-902",
            name: "bathroom-female",
            location: { x: 15, y: 5 },
        },
        {
            id: "H-910",
            name: "bathroom-male",
            location: { x: 15, y: 11 },
        }

    ],
    stairs: [
        {
            id: "H-9-stairs-1",
            name: "Stairs 1",
            location: { x: 8, y: 8 },
        },
        {
            id: "H-9-stairs-2",
            name: "Stairs 2",
            location: { x: 5, y: 4 },
        },
        {
            id: "H-9-stairs-3",
            name: "Stairs 3",
            location: { x: 13, y: 5 },
        },
        {
            id: "H-9-stairs-4",
            name: "Stairs 4",
            location: { x: 15, y: 14 },
        },
        {
            id: "H-9-stairs-5",
            name: "Stairs 5",
            location: { x: 15, y: 5 },
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
const getRoomsByFloorHall = (floorNumber) => {
  return hallBuildingFloors[floorNumber]?.rooms || [];
};

// Helper function to get start location for a floor
const getStartLocationHall = (floorNumber) => {
  return hallBuildingFloors[floorNumber]?.startLocation || null;
};

// Modified getAllRooms function to automatically add building info
const getAllRoomsHall = () => {
  return Object.values(hallBuildingFloors).flatMap(floor => {
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
  hallBuildingFloors,
  getRoomsByFloorHall,
  getStartLocationHall,
  getAllRoomsHall
};