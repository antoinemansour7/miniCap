import LoyolaBuildings from '../loyolaBuildings';

describe('LoyolaBuildings Data', () => {
  it('should be an array', () => {
    expect(Array.isArray(LoyolaBuildings)).toBe(true);
  });

  it('should contain objects with required properties', () => {
    LoyolaBuildings.forEach(building => {
      expect(building).toHaveProperty('id');
      expect(typeof building.id).toBe('string');
      
      expect(building).toHaveProperty('name');
      expect(typeof building.name).toBe('string');
      
      expect(building).toHaveProperty('latitude');
      expect(typeof building.latitude).toBe('number');
      
      expect(building).toHaveProperty('longitude');
      expect(typeof building.longitude).toBe('number');
      
      expect(building).toHaveProperty('boundary');
      expect(typeof building.boundary).toBe('object');
      
      if (Array.isArray(building.boundary)) {
        building.boundary.forEach(point => {
          expect(point).toHaveProperty('latitude');
          expect(typeof point.latitude).toBe('number');
          
          expect(point).toHaveProperty('longitude');
          expect(typeof point.longitude).toBe('number');
        });
      } else if (typeof building.boundary === 'object') {
        expect(building.boundary).toHaveProperty('outer');
        expect(Array.isArray(building.boundary.outer)).toBe(true);
        expect(building.boundary).toHaveProperty('inner');
        expect(Array.isArray(building.boundary.inner)).toBe(true);
      }
    });
  });

  it('should have unique IDs', () => {
    const ids = LoyolaBuildings.map(building => building.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(ids.length);
  });
});