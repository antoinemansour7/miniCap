import { 
    BUILDING_CONFIG,
    jmsbBuildingFloors,
    getRoomsByFloorJMSB,
    getStartLocationJMSB,
    getAllRoomsJMSB 
  } from '../../../components/rooms/JMSBBuildingRooms';
  
  describe('JMSBBuildingRooms', () => {
    describe('BUILDING_CONFIG', () => {
      it('should have correct building configuration', () => {
        expect(BUILDING_CONFIG).toEqual({
          buildingName: "John Molson Building",
          building: "MB",
          object: expect.any(Object)
        });
      });
  
      it('should have valid building object structure', () => {
        expect(BUILDING_CONFIG.object).toHaveProperty('id');
        expect(BUILDING_CONFIG.object).toHaveProperty('name');
        expect(BUILDING_CONFIG.object).toHaveProperty('latitude');
        expect(BUILDING_CONFIG.object).toHaveProperty('longitude');
      });
    });
  
    describe('jmsbBuildingFloors', () => {
      it('should contain valid floor numbers', () => {
        expect(jmsbBuildingFloors).toBeInstanceOf(Array);
        expect(jmsbBuildingFloors.length).toBeGreaterThan(0);
        jmsbBuildingFloors.forEach(floor => {
          expect(typeof floor).toBe('number');
        });
      });
    });
  
    describe('getRoomsByFloorJMSB', () => {
      it('should return rooms for ground floor (S1)', () => {
        const rooms = getRoomsByFloorJMSB('S1');
        expect(rooms).toBeInstanceOf(Array);
        expect(rooms.length).toBeGreaterThan(0);
        rooms.forEach(room => {
          expect(room).toHaveProperty('id');
          expect(room.id.startsWith('MB-S1')).toBe(true);
        });
      });
  
      it('should return rooms for first floor', () => {
        const rooms = getRoomsByFloorJMSB(1);
        expect(rooms).toBeInstanceOf(Array);
        expect(rooms.length).toBeGreaterThan(0);
        rooms.forEach(room => {
          expect(room).toMatchObject({
            id: expect.any(String),
            name: expect.any(String),
            location: expect.any(Object)
          });
        });
      });
  
      it('should return empty array for invalid floor', () => {
        const rooms = getRoomsByFloorJMSB(999);
        expect(rooms).toEqual([]);
      });
  
      it('should handle different floor number formats', () => {
        const numericFloor = getRoomsByFloorJMSB(1);
        const stringFloor = getRoomsByFloorJMSB('1');
        expect(numericFloor).toEqual(stringFloor);
      });
    });
  
    describe('getStartLocationJMSB', () => {
      it('should return start location for first floor', () => {
        const startLocation = getStartLocationJMSB(1);
        expect(startLocation).toEqual({
          id: "MB1-start",
          name: "1st Floor Entrance",
          location: expect.any(Object),
          type: "start"
        });
      });
  
      it('should return start location for ground floor', () => {
        const startLocation = getStartLocationJMSB('S1');
        expect(startLocation).toEqual({
          id: "MB-S1-start",
          name: "Ground Floor Entrance",
          location: expect.any(Object),
          type: "start"
        });
      });
  
      it('should return null for invalid floor', () => {
        const startLocation = getStartLocationJMSB(999);
        expect(startLocation).toBeNull();
      });
  
      it('should have valid location coordinates', () => {
        const startLocation = getStartLocationJMSB(1);
        expect(startLocation.location).toHaveProperty('x');
        expect(startLocation.location).toHaveProperty('y');
        expect(typeof startLocation.location.x).toBe('number');
        expect(typeof startLocation.location.y).toBe('number');
      });
    });
  
    describe('getAllRoomsJMSB', () => {
      it('should return all rooms with building info', () => {
        const allRooms = getAllRoomsJMSB();
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
  
      it('should include rooms from all floors', () => {
        const allRooms = getAllRoomsJMSB();
        const floorSet = new Set(allRooms.map(room => room.id.split('-')[1]));
        jmsbBuildingFloors.forEach(floor => {
          expect(floorSet.has(floor.toString())).toBe(true);
        });
      });
  
      it('should have valid room structure', () => {
        const allRooms = getAllRoomsJMSB();
        allRooms.forEach(room => {
          expect(room.location).toHaveProperty('x');
          expect(room.location).toHaveProperty('y');
          expect(room.id).toMatch(/^MB[-\d]/);
          expect(typeof room.name).toBe('string');
        });
      });
    });
  });