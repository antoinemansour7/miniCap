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
        id: "H-822",
        name: "H-822",
        location: { x: 7, y: 15 },
        type: "room"
      },
      // Add more 8th floor rooms here
    ]
  },

  // 9th floor
  9: {
    startLocation: {
      id: "H9-start",
      name: "9th Floor Entrance",
      location: { x: 10, y: 10 },
      type: "start"
    },
    rooms: [
      // Add 9th floor rooms here
    ]
  },

  // 10th floor
  10: {
    startLocation: {
      id: "H10-start",
      name: "10th Floor Entrance",
      location: { x: 10, y: 10 },
      type: "start"
    },
    rooms: [
      // Add 10th floor rooms here
    ]
  },

  // 11th floor
  11: {
    startLocation: {
      id: "H11-start",
      name: "11th Floor Entrance",
      location: { x: 10, y: 10 },
      type: "start"
    },
    rooms: [
      // Add 11th floor rooms here
    ]
  }
};

// Helper function to get rooms by floor
const getRoomsByFloor = (floorNumber) => {
  return hallBuildingFloors[floorNumber]?.rooms || [];
};

// Helper function to get start location for a floor
const getStartLocation = (floorNumber) => {
  return hallBuildingFloors[floorNumber]?.startLocation || null;
};

// Helper function to get all rooms across all floors
const getAllRooms = () => {
  return Object.values(hallBuildingFloors).flatMap(floor => floor.rooms);
};

export {
  hallBuildingFloors,
  getRoomsByFloor,
  getStartLocation,
  getAllRooms
};