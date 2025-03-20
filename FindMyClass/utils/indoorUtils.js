import PF from "pathfinding";

const floorGrid = [
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,2,2,2,0,0,0,0,0,0,0,0,0,0,0,0,2,0,0],
    [0,0,1,1,2,0,2,0,2,0,2,0,2,0,2,2,1,1,2,0],
    [0,0,2,1,1,1,1,1,1,1,1,1,1,1,1,1,1,2,0,0],
    [0,0,0,1,0,0,2,0,2,0,0,0,1,3,3,3,1,0,0,0],
    [0,0,2,1,4,0,0,0,0,0,0,0,1,4,0,0,1,2,0,0],
    [0,0,0,1,2,2,0,0,0,0,0,0,1,5,0,0,1,0,0,0],
    [0,0,2,1,1,1,2,0,0,0,0,0,1,0,0,3,1,2,0,0],
    [0,0,0,1,0,0,0,4,4,4,4,0,1,0,0,0,1,0,0,0],
    [0,0,2,1,2,0,1,1,1,1,1,1,1,0,0,0,1,2,0,0],
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
    [0,0,0,1,2,2,2,0,0,0,0,0,0,0,0,0,1,0,0,0],
    [0,0,2,1,0,0,0,0,0,0,0,0,0,0,0,3,1,2,0,0],
    [0,0,0,1,2,0,0,0,0,0,0,0,0,0,0,4,1,0,0,0],
    [0,0,2,1,2,0,0,0,0,0,0,0,0,0,0,0,1,2,0,0],
    [0,0,0,1,4,0,0,2,0,0,0,0,0,0,0,0,1,2,0,0],
    [0,0,2,1,1,1,1,1,1,1,1,1,1,1,1,1,1,2,0,0],
    [0,0,2,1,2,0,2,0,2,0,2,0,2,0,2,0,2,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
   ];
  
  const gridHeight = floorGrid.length;
  const gridWidth = floorGrid[0].length;



  const getFloorPlanBounds = (hallBuilding) => {
    if (!hallBuilding || !hallBuilding.boundary || hallBuilding.boundary.length === 0) {
      return null;
    }
    
    // Calculate bounds based on the polygon coordinates
    const lats = hallBuilding.boundary.map(coord => coord.latitude);
    const lngs = hallBuilding.boundary.map(coord => coord.longitude);
    
    const minLat = Math.min(...lats);
    const maxLat = Math.max(...lats);
    const minLng = Math.min(...lngs);
    const maxLng = Math.max(...lngs);
    
    return {
      north: maxLat,
      south: minLat,
      east: maxLng,
      west: minLng
    };
  };
  
  
  const convertGridForPathfinding = (originalGrid) => {
  
    const grid = new PF.Grid(
      gridWidth, 
      gridHeight,
      originalGrid.map(row => row.map(cell => cell === 1 ? 0 : 1))
    );
    
    return grid;
  };
  
  
  const geojsonData = {
    "type": "FeatureCollection",
    "features": [
      {
        "type": "Feature",
        "properties": {},
        "geometry": {
          "coordinates": [
            [
              [-73.5790184018779, 45.497719731999865],
              [-73.57954564222209, 45.497166369044606],
              [-73.57882583640877, 45.49682620347588],
              [-73.5782906512137, 45.49736555248697],
              [-73.5790184018779, 45.497719731999865]
            ]
          ],
          "type": "Polygon"
        }
      }
    ]
  };
  
  const buildingCorners = [
    { latitude: 45.497719731999865, longitude: -73.5790184018779 }, // Top-left
    { latitude: 45.497166369044606, longitude: -73.57954564222209 }, // Top-right
    { latitude: 45.49682620347588, longitude: -73.57882583640877 }, // Bottom-left
    { latitude: 45.49736555248697, longitude: -73.5782906512137 }  // Bottom-right
  ];
  
  const overlayRotationAngle = 45; // Change this based on your map overlay angle
  
  const gridToLatLong = (y, x) => {
    const gridSizeX = floorGrid[0].length - 1; // Grid width
    const gridSizeY = floorGrid.length - 1;    // Grid height
  
    // Normalize (x, y) between 0 and 1
    const normX = x / gridSizeX;
    const normY = y / gridSizeY;
  
    // Perspective transformation using the 4 building corners
    const lat = (1 - normY) * ((1 - normX) * buildingCorners[0].latitude + normX * buildingCorners[1].latitude) +
                normY * ((1 - normX) * buildingCorners[2].latitude + normX * buildingCorners[3].latitude);
  
    const long = (1 - normY) * ((1 - normX) * buildingCorners[0].longitude + normX * buildingCorners[1].longitude) +
                normY * ((1 - normX) * buildingCorners[2].longitude + normX * buildingCorners[3].longitude);
  
    return { latitude: lat, longitude: long };
  };
  
  //const grid = new PF.Grid(walkableGrid);
  //const grid = new PF.Grid(walkableGrid.map(row => [...row]));
  
  //console.log("Walkable Grid:");
  //walkableGrid.forEach((row, index) => console.log(`Row ${index}:`, row.join(" ")));
  
  
//   console.log("Path:", path);
//   //const routeCoordinates = path;
  
  
//   //console.log("Route coordinates:", routeCoordinates);
//   console.log("Bounds: ", bounds);
//   console.log("width in longitute: ", bounds.east - bounds.west);
//   console.log("height in latitude: ", bounds.north - bounds.south);
  
const getPolygonBounds = (polygon) => {
    const lats = polygon.map(point => point.latitude);
    const longs = polygon.map(point => point.longitude);
  
    return {
      south: Math.min(...lats),
      north: Math.max(...lats),
      west: Math.min(...longs),
      east: Math.max(...longs),
    };
  };
  
  const getPolygonCenter = (polygon) => {
    const lats = polygon.map(p => p.latitude);
    const longs = polygon.map(p => p.longitude);
  
    return {
      latitude: (Math.min(...lats) + Math.max(...lats)) / 2,
      longitude: (Math.min(...longs) + Math.max(...longs)) / 2,
    };
  };
  
  // ✅ Compute the center of the polygon
  
  // ✅ Define the rotation angle (manually adjust if needed)
  
  

  export {
    floorGrid,
    gridHeight,
    gridWidth,
    getFloorPlanBounds,
    convertGridForPathfinding,
    geojsonData,
    buildingCorners,
    overlayRotationAngle,
    gridToLatLong,
    getPolygonBounds,
    getPolygonCenter,
  }