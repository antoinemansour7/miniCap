import  SGWBuildings  from "../../components/SGWBuildings";

const jmsbBuilding = SGWBuildings.find(building => building.id === "MB");
// Building configuration
const BUILDING_CONFIG = {
  buildingName: "JMSB Building",
  building: "MB",
  object: jmsbBuilding,
};

const jmsbBuildingFloors = {
    
    // 1st Floor

    1: {
      startLocation: {
        id: "MB1-start",
        name: "1st Floor Entrance",
        location: { x: 7, y: 15 },
        type: "start"
      },
      
        rooms: [
  
        {
            id: "MB1.115",
            name: "MB1.115",
            location: { x: 13, y: 16 },
        },

          {
            id: "MB1.294",
            name: "MB1.294",
            location: { x: 8, y: 0 },
        },

        {
            id: "MB1.347",
            name: "MB1.347",
            location: { x: 11, y: 7 },
        },

        {
            id: "MB1.210",
            name: "MB1.210",
            location: { x: 9, y: 8 },
        },

        {
            id: "MB1.338",
            name: "MB1.338",
            location: { x: 13, y: 8 },
        },

        {
            id: "MB1.309",
            name: "MB1.309",
            location: { x: 13, y: 11 },
        },

        {
            id: "MB1.335",
            name: "MB1.335",
            location: { x: 14, y: 9 },
        },

        {
            id: "MB1.424",
            name: "MB1.424",
            location: { x: 10, y: 12 },
        },

        {
            id: "MB1.130",
            name: "MB1.130",
            location: { x: 10, y: 14 },
        },

        {
            id: "MB1.132",
            name: "MB1.132",
            location: { x: 11, y: 14 },
        },

        {
            id: "MB1.115",
            name: "MB1.115",
            location: { x: 13, y: 16 },
        },

        {
            id: "MB1.115",
            name: "MB1.115",
            location: { x: 15, y: 13 },
        },

        {
            id: "MB1.494",
            name: "MB1.494",
            location: { x: 15, y: 15 },
        },


        ],

        bathrooms: [

            {
                id: "MB1-Bathroom",
                name: "MB1-bathroom",
                location: { x: 14, y: 14 },
            },

        ],

        stairs: [

            {
                id: "MB1-stairs-1",
                name: "MB1-Stairs 1",
                location: { x: 7, y: 13 },
            },

            {
                id: "MB1-stairs-2",
                name: "MB1-Stairs 2",
                location: { x: 5, y: 2 },
            },

            {
                id: "MB1-stairs-3",
                name: "MB1-Stairs 3",
                location: { x: 9, y: 1 },
            },

            {
                id: "MB1-stairs-4",
                name: "MB1-Stairs 4",
                location: { x: 14, y: 10 },
            },

            {
                id: "MB1-stairs-5",
                name: "MB1-Stairs 5",
                location: { x: 14, y: 15 },
            },

        ],

        elevators: [
            {
                id: "MB1-elevator",
                name: "MB1-Elevators",
                location: { x: 11, y: 10 },
            },
        ],

        exits: [
            {
                id: "MB1-exit",
                name: "MB1 Exit",
                location: { x: 7, y: 15 },
            },
        ]


    },

    //Floor S2

    s2:{

        startLocation: {
            id: "S2-start",
            name: "S2 Floor Entrance",
            location: { x: 8, y: 11 },
            type: "start"
          },
          
            rooms: [
                    
              {
                id: "S2.245",
                name: "Vinh's Cafe",
                location: { x: 8, y: 3 },
            },

                  
            {
                id: "S2.273",
                name: "S2.273",
                location: { x: 12, y: 2 },
            },

            {
                id: "S2.275",
                name: "S2.275",
                location: { x: 13, y: 2 },
            },

            {
                id: "S2.279",
                name: "S2.279",
                location: { x: 14, y: 2 },
            },

            {
                id: "S2.285",
                name: "S2.285",
                location: { x: 15, y: 3 },
            },

            {
                id: "S2.330",
                name: "S2.330",
                location: { x: 14, y: 2 },
            },
    
            {
                id: "S2.210",
                name: "S2.210",
                location: { x: 13, y: 2 },
            },

            {
                id: "S2.320",
                name: "S2.320",
                location: { x: 15, y: 10 },
            },

            {
                id: "S2.438",
                name: "S2.438",
                location: { x: 15, y: 12 },
            },

            {
                id: "S2.440",
                name: "S2.440",
                location: { x: 12, y: 13 },
            },
    
            {
                id: "S2.145",
                name: "S2.145",
                location: { x: 10, y: 12 },
            },

            {
                id: "S2.146",
                name: "S2.146",
                location: { x: 9, y: 12 },
            },

            {
                id: "S2.135",
                name: "S2.135",
                location: { x: 10, y: 14 },
            },
    
            {
                id: "S2.149",
                name: "S2.149",
                location: { x: 9, y: 14 },
            },
    
            {
                id: "S2.148",
                name: "S2.148",
                location: { x: 8, y: 14 },
            },
    
            {
                id: "S2.115",
                name: "S2.115",
                location: { x: 10, y: 16 },
            },

            {
                id: "S2.105",
                name: "S2.105",
                location: { x: 11, y: 18 },
            },

            {
                id: "S2.401",
                name: "S2.401",
                location: { x: 13, y: 16 },
            },
    
            {
                id: "S2.428",
                name: "S2.428",
                location: { x: 15, y: 14 },
            },

            {
                id: "S2.445",
                name: "S2.445",
                location: { x: 18, y: 15 },
            },

            {
                id: "S2.455",
                name: "S2.455",
                location: { x: 18, y: 17 },
            },
            
            {
                id: "S2.465",
                name: "S2.465",
                location: { x: 17, y: 18 },
            },

            {
                id: "S2.401",
                name: "S2.401",
                location: { x: 13, y: 16 },
            },

            {
                id: "S2.465",
                name: "S2.465",
                location: { x: 10, y: 16 },
            },
            
            
    
            ],
    
            bathrooms: [
    
                {
                    id: "S2-Bathroom",
                    name: "S2-bathroom-male",
                    location: { x: 14, y: 14 },
                },

                {
                    id: "S2-Bathroom",
                    name: "S2-bathroom-female",
                    location: { x: 12, y: 14 },
                },
    
            ],
    
            stairs: [
    
                {
                    id: "S2-stairs-1",
                    name: "S2-Stairs 1",
                    location: { x: 7, y: 6 },
                },

                {
                    id: "S2-stairs-2",
                    name: "S2-Stairs 2",
                    location: { x: 11, y: 3 },
                },

                {
                    id: "S2-stairs-3",
                    name: "S2-Stairs 3",
                    location: { x: 10, y: 11 },
                },

                {
                    id: "S2-stairs-4",
                    name: "S2-Stairs 4",
                    location: { x: 16, y: 12 },
                },

                {
                    id: "S2-stairs-1",
                    name: "S2-Stairs 1",
                    location: { x: 16, y: 16 },
                },
    
            ],
    
            elevators: [
                {
                    id: "S2-elevator",
                    name: "S2-Elevators",
                    location: { x: 13, y: 10 },
                },
            ],
    
            exits: [
                {
                    id: "S2-exit",
                    name: "S2-Exit",
                    location: { x: 8, y: 11 },
                },
            ]
    

    }


}

// Helper function to get rooms by floor
const getRoomsByFloorJSMB = (floorNumber) => {
    return JSMBBuildingFloors[floorNumber]?.rooms || [];
  };
  
  // Helper function to get start location for a floor
    const getStartLocationJSMB = (floorNumber) => {
    return JSMBBuildingFloors[floorNumber]?.startLocation || null;
  };
  
  // Modified getAllRooms function to automatically add building info
  const getAllRoomsJSMB = () => {
    return Object.values(JSMBBuildingFloors).flatMap(floor => {
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
    JSMBBuildingFloors,
    getRoomsByFloorJSMB,
    getStartLocationJSMB,
    getAllRoomsJSMB
  };
    