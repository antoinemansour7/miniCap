import { 
  BUILDING_CONFIG,
  ccBuildingFloors,
  getRoomsByFloorCC,
  getStartLocationCC,
  getAllRoomsCC 
} from '../../../components/rooms/CCBuildingRooms';

describe('CCBuildingRooms', () => {
  describe('BUILDING_CONFIG', () => {
    it('should have correct building configuration', () => {
      expect(BUILDING_CONFIG).toEqual({
        buildingName: "CC Building",
        building: "CC",
        object: expect.any(Object)
      });
    });
  });

  describe('getRoomsByFloorCC', () => {
    it('should return rooms for valid floor', () => {
      const rooms = getRoomsByFloorCC(1);
      expect(rooms).toBeInstanceOf(Array);
      expect(rooms.length).toBeGreaterThan(0);
      expect(rooms[0]).toHaveProperty('id');
      expect(rooms[0]).toHaveProperty('name');
      expect(rooms[0]).toHaveProperty('location');
    });

    it('should return empty array for invalid floor', () => {
      const rooms = getRoomsByFloorCC(999);
      expect(rooms).toEqual([]);
    });
  });

  describe('getStartLocationCC', () => {
    it('should return start location for valid floor', () => {
      const startLocation = getStartLocationCC(1);
      expect(startLocation).toEqual({
        id: "CC1-start",
        name: "1st Floor Entrance",
        location: expect.any(Object),
        type: "start"
      });
    });

    it('should return null for invalid floor', () => {
      const startLocation = getStartLocationCC(999);
      expect(startLocation).toBeNull();
    });
  });

  describe('getAllRoomsCC', () => {
    it('should return all rooms with building info', () => {
      const allRooms = getAllRoomsCC();
      expect(allRooms).toBeInstanceOf(Array);
      expect(allRooms.length).toBeGreaterThan(0);
      
      allRooms.forEach(room => {
        expect(room).toMatchObject({
          id: expect.any(String),
          name: expect.any(String),
          location: expect.any(Object),
          building: BUILDING_CONFIG.building,
          buildingName: BUILDING_CONFIG.buildingName
        });
      });
    });
  });
});
