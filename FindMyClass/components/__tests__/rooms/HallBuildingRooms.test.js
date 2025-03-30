import { 
    BUILDING_CONFIG,
    hallBuildingFloors,
    getRoomsByFloorHall,
    getStartLocationHall,
    getAllRoomsHall 
  } from '../../../components/rooms/HallBuildingRooms';
  
  describe('HallBuildingRooms', () => {
    describe('BUILDING_CONFIG', () => {
      it('should have correct building configuration', () => {
        expect(BUILDING_CONFIG).toEqual({
          buildingName: "Hall Building",
          building: "H",
          object: expect.any(Object)
        });
      });
    });
  
    describe('getRoomsByFloorHall', () => {
      it('should return rooms for valid floor', () => {
        const rooms = getRoomsByFloorHall(8);
        expect(rooms).toBeInstanceOf(Array);
        expect(rooms.length).toBeGreaterThan(0);
        expect(rooms[0]).toHaveProperty('id');
        expect(rooms[0]).toHaveProperty('name');
        expect(rooms[0]).toHaveProperty('location');
      });
  
      it('should return empty array for invalid floor', () => {
        const rooms = getRoomsByFloorHall(999);
        expect(rooms).toEqual([]);
      });
    });
  
    describe('getStartLocationHall', () => {
      it('should return start location for valid floor', () => {
        const startLocation = getStartLocationHall(8);
        expect(startLocation).toEqual({
          id: "H8-start",
          name: "8th Floor Entrance",
          location: expect.any(Object),
          type: "start"
        });
      });
  
      it('should return null for invalid floor', () => {
        const startLocation = getStartLocationHall(999);
        expect(startLocation).toBeNull();
      });
    });
  
    describe('getAllRoomsHall', () => {
      it('should return all rooms with building info', () => {
        const allRooms = getAllRoomsHall();
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