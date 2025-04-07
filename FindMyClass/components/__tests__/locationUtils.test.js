import { calculateDistance, isBuildingFocused } from '../locationUtils';

describe('calculateDistance', () => {
  it('returns 0 when both points are the same', () => {
    expect(calculateDistance(45.0, -73.0, 45.0, -73.0)).toBe(0);
  });

  it('returns a positive value when points differ', () => {
    const distance = calculateDistance(45.0, -73.0, 45.1, -73.1);
    expect(distance).toBeGreaterThan(0);
  });
});

describe('isBuildingFocused', () => {
  const region = { latitude: 45.5, longitude: -73.6 };
  const building = { latitude: 45.5, longitude: -73.6 };
  const farBuilding = { latitude: 46.0, longitude: -74.0 };
  
  it('returns false if building is null', () => {
    expect(isBuildingFocused(region, null, 10, 0.1, 5)).toBe(false);
  });

  it('returns true if the distance is less than threshold and zoom is above minZoom', () => {
    expect(isBuildingFocused(region, building, 10, 0.1, 5)).toBe(true);
  });

  it('returns false if the distance is greater than or equal to threshold', () => {
    // Use a very low distanceThreshold.
    expect(isBuildingFocused(region, farBuilding, 10, 0.1, 5)).toBe(false);
  });

  it('returns false if the calculatedZoom is not above minZoom', () => {
    // Even if the distance is small but zoom is too low.
    expect(isBuildingFocused(region, building, 4, 0.1, 5)).toBe(false);
  });
});
