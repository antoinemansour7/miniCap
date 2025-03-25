import  SGWBuildings  from "../../components/SGWBuildings";

const hallBuilding = SGWBuildings.find(building => building.id === "H");
// Building configuration
const BUILDING_CONFIG = {
  buildingName: "Hall Building",
  building: "H",
  object: hallBuilding,
};

const hallBuildingFloors = {
  // 8th floor
  8: {
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
            id: "H-802",
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
            location: { x: 6, y: 13 },
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
      location: { x: 8, y: 8 },
      type: "start"
    },
    rooms: [
        {
            id: "H-961.19",
            name: "H-961.19",
            location: { x: 0, y: 1 },
        },
        {
            id: "H-961.17",
            name: "H-961.17",
            location: { x: 0, y: 2 },
        },
        {
            id: "H-961.15",
            name: "H-961.15",
            location: { x: 0, y: 3 },
        },
        {
            id: "H-961.13",
            name: "H-961.13",
            location: { x: 0, y: 4 },
        },
        {
            id: "H-961.11",
            name: "H-961.11",
            location: { x: 0, y: 5 },
        },
        {
            id: "H-961.09",
            name: "H-961.09",
            location: { x: 0, y: 6 },
        },
        {
            id: "H-961.07",
            name: "H-961.07",
            location: { x: 0, y: 7 },
        },
        {
            id: "H-961.03",
            name: "H-961.03",
            location: { x: 0, y: 8 },
        },
        {
            id: "H-961.01",
            name: "H-961.01",
            location: { x: 0, y: 9 },
        },
        {
            id: "H-961.21",
            name: "H-961.21",
            location: { x: 1, y: 0 },
        },
        {
            id: "H-961.23",
            name: "H-961.23",
            location: { x: 2, y: 0 },
        },
        {
            id: "H-961.14",
            name: "H-961.14",
            location: { x: 2, y: 3 },
        },
        {
            id: "H-961.10",
            name: "H-961.10",
            location: { x: 2, y: 5 },
        },
        {
            id: "H-961.06",
            name: "H-961.06",
            location: { x: 2, y: 8 },
        },
        {
            id: "H-961.04",
            name: "H-961.04",
            location: { x: 2, y: 9 },
        },
        {
            id: "H-961.02",
            name: "H-961.02",
            location: { x: 2, y: 10 },
        },
        {
            id: "H-963",
            name: "H-963",
            location: { x: 2, y: 12 },
        },
        {
            id: "H-965.02",
            name: "H-965.02",
            location: { x: 2, y: 14 },
        },
        {
            id: "H-967",
            name: "H-967",
            location: { x: 2, y: 16 },
        },
        {
            id: "H-961.25",
            name: "H-961.25",
            location: { x: 3, y: 0 },
        },
        {
            id: "H-961.26",
            name: "H-961.26",
            location: { x: 3, y: 2 },
        },
        {
            id: "H-961.08",
            name: "H-961.08",
            location: { x: 3, y: 5 },
        },
        {
            id: "H-901",
            name: "H-901",
            location: { x: 3, y: 17 },
        },
        {
            id: "H-961.27",
            name: "H-961.27",
            location: { x: 4, y: 0 },
        },
        {
            id: "H-961.28",
            name: "H-961.28",
            location: { x: 4, y: 2 },
        },
        {
            id: "H-968",
            name: "H-968",
            location: { x: 4, y: 7 },
        },
        {
            id: "H-961.29",
            name: "H-961.29",
            location: { x: 5, y: 0 },
        },
        {
            id: "H-961.30",
            name: "H-961.30",
            location: { x: 5, y: 2 },
        },
        {
            id: "H-977",
            name: "H-977",
            location: { x: 5, y: 5 },
        },
        {
            id: "H-964",
            name: "H-964",
            location: { x: 5, y: 11 },
        },
        {
            id: "H-903",
            name: "H-903",
            location: { x: 5, y: 17 },
        },
        {
            id: "H-961.31",
            name: "H-961.31",
            location: { x: 6, y: 0 },
        },
        {
            id: "H-943",
            name: "H-943",
            location: { x: 6, y: 2 },
        },
        {
            id: "H-945",
            name: "H-945",
            location: { x: 6, y: 3 },
        },
        {
            id: "H-981",
            name: "H-981",
            location: { x: 6, y: 5 },
        },
        {
            id: "H-966",
            name: "H-966",
            location: { x: 6, y: 7 },
        },
        {
            id: "H-961.33",
            name: "H-961.33",
            location: { x: 7, y: 0 },
        },
        {
            id: "H-962",
            name: "H-962",
            location: { x: 7, y: 11 },
        },
        {
            id: "H-983",
            name: "H-983",
            location: { x: 8, y: 1 },
        },
        {
            id: "H-966.01",
            name: "H-966.01",
            location: { x: 8, y: 7 },
        },
        {
            id: "H-960",
            name: "H-960",
            location: { x: 8, y: 11 },
        },
        {
            id: "H-908",
            name: "H-908",
            location: { x: 9, y: 14 },
        },
        {
            id: "H-906",
            name: "H-906",
            location: { x: 9, y: 15 },
        },
        {
            id: "H-907",
            name: "H-907",
            location: { x: 9, y: 17 },
        },
        {
            id: "H-937",
            name: "H-937",
            location: { x: 10, y: 5 },
        },
        {
            id: "H-909",
            name: "H-909",
            location: { x: 10, y: 17 },
        },
        {
            id: "H-980",
            name: "H-980",
            location: { x: 11, y: 14 },
        },
        {
            id: "H-911",
            name: "H-911",
            location: { x: 12, y: 17 },
        },
        {
            id: "H-933",
            name: "H-933",
            location: { x: 14, y: 1 },
        },
        {
            id: "H-932",
            name: "H-932",
            location: { x: 14, y: 3 },
        },
        {
            id: "H-913",
            name: "H-913",
            location: { x: 14, y: 17 },
        },
        {
            id: "H-928",
            name: "H-928",
            location: { x: 15, y: 4 },
        },
        {
            id: "H-920",
            name: "H-920",
            location: { x: 15, y: 10 },
        },
        {
            id: "H-918",
            name: "H-918",
            location: { x: 15, y: 13 },
        },
        {
            id: "H-986",
            name: "H-986",
            location: { x: 15, y: 14 },
        },
        {
            id: "H-915",
            name: "H-915",
            location: { x: 16, y: 17 },
        },
        {
            id: "H-931",
            name: "H-931",
            location: { x: 17, y: 2 },
        },
        {
            id: "H-929",
            name: "H-929",
            location: { x: 17, y: 3 },
        },
        {
            id: "H-927",
            name: "H-927",
            location: { x: 17, y: 5 },
        },
        {
            id: "H-927.01",
            name: "H-927.01",
            location: { x: 17, y: 7 },
        },
        {
            id: "H-927.04",
            name: "H-927.04",
            location: { x: 17, y: 8 },
        },
        {
            id: "H-925.01",
            name: "H-925.01",
            location: { x: 17, y: 9 },
        },
        {
            id: "H-925",
            name: "H-925",
            location: { x: 17, y: 11 },
        },
        {
            id: "H-923",
            name: "H-923",
            location: { x: 17, y: 13 },
        },
        {
            id: "H-919",
            name: "H-919",
            location: { x: 17, y: 15 },
        },
        {
            id: "H-917",
            name: "H-917",
            location: { x: 17, y: 17 },
        },
        {
            id: "H-925.02",
            name: "H-925.02",
            location: { x: 18, y: 17 },
        },

    ],
    bathrooms: [
        {
            id: "H-992",
            name: "bathroom-neutral",
            location: { x: 7, y: 13 },
        },
        {
            id: "H-902",
            name: "bathroom-female",
            location: { x: 5, y: 15 },
        },
        {
            id: "H-910",
            name: "bathroom-male",
            location: { x: 11, y: 15 },
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
            location: { x: 4, y: 5 },
        },
        {
            id: "H-9-stairs-3",
            name: "Stairs 3",
            location: { x: 15, y: 4 },
        },
        {
            id: "H-9-stairs-4",
            name: "Stairs 4",
            location: { x: 14, y: 15 },
        },
        {
            id: "H-9-stairs-5",
            name: "Stairs 5",
            location: { x: 5, y: 13 },
        },
    ],
    elevators: [
        {
            id: "H-9-elevator-1",
            name: "Elevator 1",
            location: { x: 6, y: 13 },
        },
    ],
    exits: [
        {
            id: "H-9-stairs-to-H8",
            name: "Stairs to H8",
            location: { x: 8, y: 10 },
        },
    ]

  },

  // 1st floor
  1: {
    startLocation: {
      id: "H1-start",
      name: "1st Floor Entrance",
      location: { x: 17, y: 7 },
      type: "start"
    },
    rooms: [
        {
            id: "H-0023",
            name: "H-0023",
            location: { x: 2, y: 6 },
        },
        {
            id: "H-131",
            name: "H-131",
            location: { x: 2, y: 11 },
        },
        {
            id: "H-133",
            name: "H-133",
            location: { x: 2, y: 13 },
        },
        {
            id: "H-135",
            name: "H-135",
            location: { x: 2, y: 14 },
        },
        {
            id: "H-135.1",
            name: "H-135.1",
            location: { x: 2, y: 15 },
        },
        {
            id: "H-137",
            name: "H-137",
            location: { x: 2, y: 16 },
        },
        {
            id: "H-139",
            name: "H-139",
            location: { x: 2, y: 17 },
        },
        {
            id: "H-141",
            name: "H-141",
            location: { x: 2, y: 18 },
        },
        {
            id: "H-030-1",
            name: "H-030-1",
            location: { x: 4, y: 6 },
        },
        {
            id: "H-120",
            name: "H-120",
            location: { x: 8, y: 10 },
        },
        {
            id: "H-125",
            name: "H-125",
            location: { x: 8, y: 0 },
        },
        {
            id: "H-109",
            name: "H-109",
            location: { x: 10, y: 1 },
        },
        {
            id: "H-115",
            name: "H-115",
            location: { x: 10, y: 11 },
        },
        {
            id: "H-118",
            name: "H-118",
            location: { x: 12, y: 17 },
        },
        {
            id: "H-110",
            name: "H-110",
            location: { x: 13, y: 5 },
        },

    ],
    bathrooms: [
        {
            id: "H-112",
            name: "bathroom-male",
            location: { x: 12, y: 9 },
        },
        {
            id: "H-114",
            name: "bathroom-female",
            location: { x: 10, y: 9 },
        }, 
    ],
    stairs: [
        {
            id: "H-1-stairs-1",
            name: "Stairs 1",
            location: { x: 15, y: 12 },
        },
    ],
    elevators: [
        {
            id: "H-1-elevator-1",
            name: "Elevator 1",
            location: { x: 15, y: 15 },
        },
    ],
    exits: [
        { 
        id: "H1-exit",
        name: "1st Floor Exit",
        location: { x: 17, y: 4 },
        type: "exit" 
        },
    ]

  },

  // 2nd floor
  2: {
    startLocation: {
      id: "H2-start",
      name: "2nd Floor Entrance",
      location: { x: 13, y: 15 },
      type: "start"
    },
    rooms: [
        {
            id: "H-231",
            name: "Reggie's",
            location: { x: 5, y: 5 },
        }, 
        {
            id: "H-239",
            name: "Hive Café",
            location: { x: 5, y: 10 },
        },
    ],
    bathrooms: [
        // add bathrooms here
    ],
    stairs: [
        {
            id: "H-2-stairs-1",
            name: "Stairs 1",
            location: { x: 8, y: 10 },
        },
        {
            id: "H-2-stairs-2",
            name: "Stairs 2",
            location: { x: 5, y: 4 },
        },
        {
            id: "H-2-stairs-3",
            name: "Stairs 3",
            location: { x: 8, y: 4 },
        },
        {
            id: "H-2-stairs-4",
            name: "Stairs 4",
            location: { x: 11, y: 18 },
        },
        {
            id: "H-2-stairs-5",
            name: "Stairs 5",
            location: { x: 5, y: 19 },
        },
    ],
    elevators: [
        {
            id: "H-2-elevator-1",
            name: "Elevator 1",
            location: { x: 14, y: 14 },
        }, 
    ],
    exits: [
        {
            id: "H-2-stairs-to-H1-1",
            name: "Stairs to H1 1",
            location: { x: 14, y: 11 },
        },
        {
            id: "H-2-stairs-to-H1-2",
            name: "Stairs to H1 2",
            location: { x: 14, y: 16 },
        },
    ]

  }
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