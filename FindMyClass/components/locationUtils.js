// locationUtils.js

/**
 * Calculate the distance between two points (lat1, lon1) and (lat2, lon2)
 */
export const calculateDistance = (lat1, lon1, lat2, lon2) => {
    return Math.sqrt(
      Math.pow(lat1 - lat2, 2) + Math.pow(lon1 - lon2, 2)
    );
  };
  
  /**
   * Determine if the map is focused on a building based on a distance threshold and minimum zoom.
   * @param {object} region - The current region from the map.
   * @param {object} building - The building object containing latitude and longitude.
   * @param {number} calculatedZoom - The zoom level calculated from the region.
   * @param {number} distanceThreshold - Maximum allowed distance to consider the building focused.
   * @param {number} minZoom - The minimum zoom level required.
   * @returns {boolean} True if focused, false otherwise.
   */
  export const isBuildingFocused = (region, building, calculatedZoom, distanceThreshold, minZoom) => {
    if (!building) return false;
    
    const distance = calculateDistance(
      region.latitude,
      region.longitude,
      building.latitude,
      building.longitude
    );
  
    return distance < distanceThreshold && calculatedZoom > minZoom;
  };