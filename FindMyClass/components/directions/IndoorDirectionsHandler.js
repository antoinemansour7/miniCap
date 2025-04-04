// components/directions/IndoorDirectionsHandler.js
import PF from "pathfinding";
import { 
  floorGrid, 
  convertGridForPathfinding, 
  horizontallyFlippedGrid, 
  getFloorNumber, 
  getStartLocationHall 
} from "../../utils/indoorUtils";

/**
 * Utility class for handling indoor directions
 */
const IndoorDirectionsHandler = {
  /**
   * Set up indoor navigation for a room
   */
  setupIndoorNavigation(room, setFloorNumber, setFloorStartLocation, setFloorEndLocation) {
    // Find the floor number of the room
    const floor = getFloorNumber(room.id);
    setFloorNumber(floor);
    
    // Set start location based on floor
    const floorStartLocationItem = getStartLocationHall(floor);
    setFloorStartLocation({
      xcoord: floorStartLocationItem.location.x,
      ycoord: floorStartLocationItem.location.y
    });
    
    // Set end location based on room
    setFloorEndLocation({
      xcoord: room.location.x,
      ycoord: room.location.y
    });
  },

  /**
   * Calculate path coordinates for indoor navigation
   */
  calculatePathCoordinates(floorStartLocation, floorEndLocation) {
    // Create a grid for pathfinding
    const walkableGrid = convertGridForPathfinding(floorGrid);
    
    // Ensure endpoints are walkable
    walkableGrid.setWalkableAt(
      floorStartLocation.xcoord, 
      floorStartLocation.ycoord, 
      true
    );
    
    walkableGrid.setWalkableAt(
      floorEndLocation.xcoord, 
      floorEndLocation.ycoord, 
      true
    );
    
    // Find path using A* algorithm
    const finder = new PF.AStarFinder();
    const path = finder.findPath(
      floorStartLocation.xcoord,
      floorStartLocation.ycoord,
      floorEndLocation.xcoord, 
      floorEndLocation.ycoord, 
      walkableGrid
    );
    
    // Map grid coordinates to geographical coordinates
    return path.map(([x, y]) => horizontallyFlippedGrid[y][x]);
  }
};

export default IndoorDirectionsHandler;