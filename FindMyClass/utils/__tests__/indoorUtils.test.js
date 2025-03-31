import { 
  getFloorNumber,
  getExactCoordinates,
  getPolygonBounds,
  getClassCoordinates 
} from '../indoorUtils';

describe('indoorUtils', () => {
  describe('getFloorNumber', () => {
    it('should extract floor number from room id', () => {
      expect(getFloorNumber('H-820')).toBe(8);
      expect(getFloorNumber('MB1.210')).toBe(1);
      expect(getFloorNumber('VL-2-101')).toBe(2);
    });

    it('should return 1 for invalid room id', () => {
      expect(getFloorNumber('invalid')).toBe(1);
    });
  });

  describe('getExactCoordinates', () => {
    it('should calculate coordinates based on x,y position', () => {
      const coords = getExactCoordinates(5, 10);
      expect(coords).toHaveProperty('latitude');
      expect(coords).toHaveProperty('longitude');
    });
  });

  describe('getPolygonBounds', () => {
    it('should calculate bounds from polygon coordinates', () => {
      const polygon = [
        { latitude: 45.0, longitude: -73.0 },
        { latitude: 45.1, longitude: -73.1 },
        { latitude: 45.2, longitude: -73.2 }
      ];
      
      const bounds = getPolygonBounds(polygon);
      expect(bounds).toHaveProperty('minLat');
      expect(bounds).toHaveProperty('maxLat');
      expect(bounds).toHaveProperty('minLng');
      expect(bounds).toHaveProperty('maxLng');
    });
  });

  describe('getClassCoordinates', () => {
    it('should transform grid coordinates to map coordinates', () => {
      const grid = [
        [0, 1, 0],
        [1, 1, 1],
        [0, 1, 0]
      ];
      
      const coords = getClassCoordinates(grid, 1, 1);
      expect(coords).toHaveProperty('latitude');
      expect(coords).toHaveProperty('longitude');
    });
  });
});