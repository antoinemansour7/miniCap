import { 
    BUILDING_CONFIG,
    vanierBuildingFloors,
    getRoomsByFloorVanier,
    getStartLocationVanier,
    getAllRoomsVanier 
  } from '../../../components/rooms/VanierBuildingRooms';
  
  describe('VanierBuildingRooms', () => {
    describe('BUILDING_CONFIG', () => {
      it('should have correct building configuration', () => {
        expect(BUILDING_CONFIG).toEqual({
          buildingName: "Vanier Library",
          building: "VL",
          object: expect.any(Object)
        });
      });
    });
  
    describe('getRoomsByFloorVanier', () => {
      it('should return rooms for valid floor', () => {
        const rooms = getRoomsByFloorVanier(2);
        expect(rooms).toBeInstanceOf(Array);
        expect(rooms.length).toBeGreaterThan(0);
        expect(rooms[0]).toHaveProperty('id');
        expect(rooms[0]).toHaveProperty('name');
        expect(rooms[0]).toHaveProperty('location');
      });
  
      it('should return empty array for invalid floor', () => {
        const rooms = getRoomsByFloorVanier(999);
        expect(rooms).toEqual([]);
      });
    });
  
    describe('getStartLocationVanier', () => {
      it('should return start location for valid floor', () => {
        const startLocation = getStartLocationVanier(2);
        expect(startLocation).toEqual({
          id: "VL2-start",
          name: "2nd Floor Entrance",
          location: expect.any(Object),
          type: "start"
        });
      });
  
      it('should return null for invalid floor', () => {
        const startLocation = getStartLocationVanier(999);
        expect(startLocation).toBeNull();
      });
    });
  
    describe('getAllRoomsVanier', () => {
      it('should return all rooms with building info', () => {
        const allRooms = getAllRoomsVanier();
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