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
    [0,0,2,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0],
    [0,0,2,1,2,0,2,0,2,0,2,0,2,0,2,0,2,2,0,0],
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
    { latitude: 45.49768679480641, longitude: -73.5790354969782 }, // North
    { latitude: 45.49721791026846, longitude:  -73.57950555999666}, // West
    { latitude: 45.49685885190155, longitude: -73.57879845665272 }, // South
    { latitude: 45.49731647491001, longitude: -73.57833642889916 } // East
  ];
  
  
  const gridToLatLong = (x, y) => {
    const gridSizeX = floorGrid[0].length - 1; // Grid width
    const gridSizeY = floorGrid.length - 1;    // Grid height
  
    // Normalize grid coordinates (0 to 1)
    const normX = 1 - (x / gridSizeX); // 🔄 Flip only X-axis (Longitude stays flipped)
    const normY = y / gridSizeY; // ✅ Keep Y-axis as is
  
    // ✅ Map X and Y into lat/lng
    const lat = buildingCorners[0].latitude + normY * (buildingCorners[2].latitude - buildingCorners[0].latitude);
    const long = buildingCorners[0].longitude + normX * (buildingCorners[1].longitude - buildingCorners[0].longitude);
  
    return { latitude: lat, longitude: long };
  };
  
  
const startX = 10, startY = 9; 
const endX = 17, endY = 17;


const startLatLng = gridToLatLong(startX, startY) ;
const endLatLng = gridToLatLong(endX, endY);



  
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

  startLatLng.latitude += 0.00003;
  startLatLng.longitude += 0.00009;
  
const precomputeTransformedGrid = (floorGrid, buildingCorners) => {
  const gridMapping = [];
  const gridSizeX = floorGrid[0].length - 1;
  const gridSizeY = floorGrid.length - 1;

  for (let y = 0; y <= gridSizeY; y++) {
    gridMapping[y] = [];
    for (let x = 0; x <= gridSizeX; x++) {
      // Calculate the position as a percentage of the grid
      const normX = x / gridSizeX;
      const normY = y / gridSizeY;

      // Bilinear interpolation between the four corners
      const topLat = (1 - normX) * buildingCorners[0].latitude + normX * buildingCorners[1].latitude;
      const bottomLat = (1 - normX) * buildingCorners[3].latitude + normX * buildingCorners[2].latitude;
      const latitude = (1 - normY) * topLat + normY * bottomLat;

      const topLng = (1 - normX) * buildingCorners[0].longitude + normX * buildingCorners[1].longitude;
      const bottomLng = (1 - normX) * buildingCorners[3].longitude + normX * buildingCorners[2].longitude;
      const longitude = (1 - normY) * topLng + normY * bottomLng;

      gridMapping[y][x] = { latitude, longitude };
    }
  }

  return gridMapping;
};

// ✅ Generate the perfectly aligned grid
const gridMapping = precomputeTransformedGrid(floorGrid, buildingCorners);

  
  
  const drawDebugGrid = (gridMapping) => {
    let gridLines = [];
  
    const gridHeight = gridMapping.length;
    const gridWidth = gridMapping[0].length;
  
    // ✅ Draw horizontal grid lines
    for (let y = 0; y < gridHeight; y++) {
      gridLines.push(gridMapping[y]); // Row of lat/lng points
    }
  
    // ✅ Draw vertical grid lines
    for (let x = 0; x < gridWidth; x++) {
      let column = [];
      for (let y = 0; y < gridHeight; y++) {
        column.push(gridMapping[y][x]); // Column of lat/lng points
      }
      gridLines.push(column);
    }
  
    return gridLines;
  };
  
  // ✅ Generate the debug grid lines
  const gridLines = drawDebugGrid(gridMapping);
  

const flipHorizontally = (gridMapping) => {
  const gridHeight = gridMapping.length;
  const gridWidth = gridMapping[0].length;
  let flippedGrid = [];

  for (let y = 0; y < gridHeight; y++) {
    flippedGrid[y] = [];
    for (let x = 0; x < gridWidth; x++) {
      // Flip horizontally by mirroring longitude values around the center
      const originalPoint = gridMapping[y][gridWidth - 1 - x];
      flippedGrid[y][x] = {
        latitude: originalPoint.latitude,
        longitude: originalPoint.longitude
      };
    }
  }
  return flippedGrid;
};

const flipVertically = (gridMapping) => {
  const gridHeight = gridMapping.length;
  const gridWidth = gridMapping[0].length;
  let flippedGrid = [];

  for (let y = 0; y < gridHeight; y++) {
    flippedGrid[y] = [];
    for (let x = 0; x < gridWidth; x++) {
      // Flip vertically by mirroring latitude values around the center
      const originalPoint = gridMapping[gridHeight - 1 - y][x];
      flippedGrid[y][x] = {
        latitude: originalPoint.latitude,
        longitude: originalPoint.longitude
      };
    }
  }
  return flippedGrid;
};

const rotate180 = (gridMapping) => {
  const gridHeight = gridMapping.length;
  const gridWidth = gridMapping[0].length;
  let rotatedGrid = [];

  for (let y = 0; y < gridHeight; y++) {
    rotatedGrid[y] = [];
    for (let x = 0; x < gridWidth; x++) {
      // Rotate 180 by flipping both horizontally and vertically
      const originalPoint = gridMapping[gridHeight - 1 - y][gridWidth - 1 - x];
      rotatedGrid[y][x] = {
        latitude: originalPoint.latitude,
        longitude: originalPoint.longitude
      };
    }
  }
  return rotatedGrid;
};

const rotatedGrid = rotate180(gridMapping);
const horizontallyFlippedGrid = flipHorizontally(gridMapping);
const verticallyFlippedGrid = flipVertically(gridMapping);

const flipGridMapping = (gridMapping) => {
    const gridHeight = gridMapping.length;
    const gridWidth = gridMapping[0].length;
    let mirroredGrid = [];
  
    for (let y = 0; y < gridHeight; y++) {
      mirroredGrid[y] = [];
      for (let x = 0; x < gridWidth; x++) {
        mirroredGrid[y][x] = gridMapping[gridWidth - 1 - x][gridHeight - 1 - y]; // ✅ Correct reflection
      }
    }
  
    return mirroredGrid;
  };
  

  const correctedGridMapping = flipGridMapping(gridMapping);

const getExactCoordinates = (x, y) => {
  // Ensure we have valid grid coordinates
  const boundedX = Math.min(Math.max(x, 0), gridWidth - 1);
  const boundedY = Math.min(Math.max(y, 0), gridHeight - 1);

  // Use the horizontally flipped grid to get the coordinates
  return horizontallyFlippedGrid[boundedY][boundedX];
};

  

  
  
  
const getFloorNumber = (roomNumber) => {
    const floor = parseInt(roomNumber.match(/\d/)?.[0]);
    return floor;
  };
  

  

  export {
    floorGrid,
    getFloorPlanBounds,
    convertGridForPathfinding,
    getPolygonBounds,
    startX,
    startY,
    endX,
    endY,
    gridLines,
    horizontallyFlippedGrid,
    verticallyFlippedGrid,
    rotatedGrid,
    gridMapping,
    getExactCoordinates,
    getFloorNumber,
  }