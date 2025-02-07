import SGWBuildings from '../SGWBuildings';

describe('SGWBuildings Data', () => {
    it('should be an array', () => {
        expect(Array.isArray(SGWBuildings)).toBe(true);
    });

    it('should contain buildings with required properties', () => {
        SGWBuildings.forEach(building => {
            expect(building).toHaveProperty('id');
            expect(typeof building.id).toBe('string');

            expect(building).toHaveProperty('name');
            expect(typeof building.name).toBe('string');

            expect(building).toHaveProperty('latitude');
            expect(typeof building.latitude).toBe('number');

            expect(building).toHaveProperty('longitude');
            expect(typeof building.longitude).toBe('number');

            expect(building).toHaveProperty('boundary');
            expect(Array.isArray(building.boundary)).toBe(true);
            expect(building.boundary.length).toBeGreaterThan(0);
        });
    });

    it('should have valid latitude and longitude ranges', () => {
        SGWBuildings.forEach(building => {
            expect(building.latitude).toBeGreaterThan(45);
            expect(building.latitude).toBeLessThan(46);

            expect(building.longitude).toBeGreaterThan(-74);
            expect(building.longitude).toBeLessThan(-73);
        });
    });

    it('should have valid boundary coordinates', () => {
        SGWBuildings.forEach(building => {
            building.boundary.forEach(point => {
                expect(point).toHaveProperty('latitude');
                expect(typeof point.latitude).toBe('number');

                expect(point).toHaveProperty('longitude');
                expect(typeof point.longitude).toBe('number');

                expect(point.latitude).toBeGreaterThan(45);
                expect(point.latitude).toBeLessThan(46);

                expect(point.longitude).toBeGreaterThan(-74);
                expect(point.longitude).toBeLessThan(-73);
            });
        });
    });
});