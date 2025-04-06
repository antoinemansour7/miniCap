// api/smartPlannerService.js
import axios from 'axios';

// Gemini API key
const GEMINI_API_KEY = 'AIzaSyANmR7UVeXscWsvnIWmEG7MxnUVeiOnLGw';

/**
 * Calculates the Euclidean distance between two geographic coordinates
 * @param {Object} point1 - First point with latitude and longitude
 * @param {Object} point2 - Second point with latitude and longitude
 * @returns {number} Distance in meters
 */
const calculateDistance = (point1, point2) => {
  // Earth radius in meters
  const R = 6371000;
  
  // Convert latitude and longitude from degrees to radians
  const lat1 = point1.latitude * Math.PI / 180;
  const lon1 = point1.longitude * Math.PI / 180;
  const lat2 = point2.latitude * Math.PI / 180;
  const lon2 = point2.longitude * Math.PI / 180;
  
  // Haversine formula
  const dLat = lat2 - lat1;
  const dLon = lon2 - lon1;
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
          Math.cos(lat1) * Math.cos(lat2) *
          Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  
  return distance;
};

/**
 * Calculate a distance matrix between points
 * @param {Array} points - Array of points with latitude and longitude
 * @returns {Array} 2D matrix of distances
 */
const createDistanceMatrix = (points) => {
  const matrix = [];
  
  for (let i = 0; i < points.length; i++) {
    matrix[i] = [];
    for (let j = 0; j < points.length; j++) {
      matrix[i][j] = calculateDistance(points[i], points[j]);
    }
  }
  
  return matrix;
};

/**
 * Solve the Traveling Salesman Problem using Nearest Neighbor algorithm
 * @param {Array} distanceMatrix - 2D matrix of distances between points
 * @param {number} startIndex - Index of the starting point (current location)
 * @returns {Array} Ordered array of indices representing the optimal path
 */
const solveTSPNearestNeighbor = (distanceMatrix, startIndex = 0) => {
  const numPoints = distanceMatrix.length;
  const visited = new Array(numPoints).fill(false);
  const path = [startIndex];
  
  visited[startIndex] = true;
  
  // Find nearest unvisited neighbor until all points are visited
  while (path.length < numPoints) {
    let currentPoint = path[path.length - 1];
    let minDistance = Infinity;
    let nextPoint = -1;
    
    for (let i = 0; i < numPoints; i++) {
      if (!visited[i] && distanceMatrix[currentPoint][i] < minDistance) {
        minDistance = distanceMatrix[currentPoint][i];
        nextPoint = i;
      }
    }
    
    if (nextPoint !== -1) {
      path.push(nextPoint);
      visited[nextPoint] = true;
    } else {
      break; // No more unvisited points accessible
    }
  }
  
  return path;
};

/**
 * Enhanced version of TSP using a 2-opt improvement algorithm
 * @param {Array} distanceMatrix - 2D matrix of distances between points
 * @param {Array} initialPath - Initial path to improve
 * @returns {Array} Improved path
 */
const improveTSPWith2Opt = (distanceMatrix, initialPath) => {
  let path = [...initialPath];
  let improved = true;
  
  while (improved) {
    improved = false;
    
    for (let i = 0; i < path.length - 2; i++) {
      for (let j = i + 2; j < path.length; j++) {
        // Skip adjacent edges
        if (j === i + 1) continue;
        
        // Calculate current distance
        const currentDistance = 
          distanceMatrix[path[i]][path[i+1]] + 
          distanceMatrix[path[j]][path[(j+1) % path.length]];
        
        // Calculate distance if we swap
        const newDistance = 
          distanceMatrix[path[i]][path[j]] + 
          distanceMatrix[path[i+1]][path[(j+1) % path.length]];
        
        // If swapping would give shorter distance
        if (newDistance < currentDistance) {
          // Reverse the segment between i+1 and j
          const newPath = [...path];
          let left = i + 1;
          let right = j;
          
          while (left < right) {
            [newPath[left], newPath[right]] = [newPath[right], newPath[left]];
            left++;
            right--;
          }
          
          path = newPath;
          improved = true;
        }
      }
    }
  }
  
  return path;
};

/**
 * Creates a map of indoor connections between buildings
 * @param {Array} allBuildings - All buildings data
 * @returns {Object} Map of indoor connections
 */
const mapIndoorConnections = (allBuildings) => {
  const connections = {};
  
  // For this example, we'll just make a simple assumption that buildings
  // with the same purpose or buildings that are very close might have indoor connections
  allBuildings.forEach(building => {
    if (!connections[building.id]) {
      connections[building.id] = [];
    }
    
    // Check for potential indoor connections with other buildings
    allBuildings.forEach(otherBuilding => {
      if (building.id !== otherBuilding.id) {
        // Check if buildings are close enough for potential indoor connection
        const distance = calculateDistance(building, otherBuilding);
        
        // Assume buildings less than 50 meters apart might have indoor connections
        // This is a simplification - in a real app, you'd want actual data on tunnels/indoor paths
        if (distance < 50) {
          connections[building.id].push(otherBuilding.id);
        }
      }
    });
  });
  
  return connections;
};

/**
 * Finds the nearest building to a location
 * @param {Object} location - Location coordinates
 * @param {Array} allBuildings - All buildings data
 * @returns {Object|null} Nearest building or null if none found
 */
const findNearestBuilding = (location, allBuildings) => {
  if (!location || !location.latitude) return null;
  
  let minDistance = Infinity;
  let nearestBuilding = null;
  
  allBuildings.forEach(building => {
    const distance = calculateDistance(location, building);
    if (distance < minDistance) {
      minDistance = distance;
      nearestBuilding = building;
    }
  });
  
  return nearestBuilding;
};

/**
 * Estimates the percentage of an indoor path between two points
 * @param {Object} from - Starting point
 * @param {Object} to - Ending point
 * @param {Array} allBuildings - All buildings data
 * @param {Object} weatherData - Weather conditions
 * @returns {number} Estimated percentage of indoor path
 */
const estimateIndoorPercentage = (from, to, allBuildings, weatherData) => {
  // Find the buildings for the from and to locations
  const fromBuilding = findNearestBuilding(from, allBuildings);
  const toBuilding = findNearestBuilding(to, allBuildings);
  
  // If both points are associated with the same building, assume 100% indoor
  if (fromBuilding && toBuilding && fromBuilding.id === toBuilding.id) {
    return 100;
  }
  
  // Check for indoor connections
  const indoorConnections = mapIndoorConnections(allBuildings);
  
  if (fromBuilding && toBuilding && indoorConnections[fromBuilding.id]?.includes(toBuilding.id)) {
    // They have an indoor connection
    return 90; // Assume 90% indoor (some walking might still be needed)
  }
  
  // Default indoor percentage based on campus and weather
  // In bad weather, we assume people use shortcuts and tunnels more
  let baseIndoorPercentage = 20; // Default
  
  if (weatherData.precipitation) {
    baseIndoorPercentage = 35; // More indoors in bad weather
  }
  
  if (weatherData.temperature < 5) {
    baseIndoorPercentage += 10; // Even more indoor paths in cold weather
  }
  
  return baseIndoorPercentage;
};

/**
 * Adjusts distances in the matrix to prefer indoor paths in bad weather
 * @param {Array} distanceMatrix - Original distance matrix
 * @param {Array} locations - Array of location points
 * @param {Array} allBuildings - All buildings data with indoor connections
 * @returns {Array} Adjusted distance matrix
 */
const adjustDistancesForWeather = (distanceMatrix, locations, allBuildings) => {
  const adjustedMatrix = [...distanceMatrix.map(row => [...row])];
  
  // Create a map of indoor connections between buildings
  const indoorConnections = mapIndoorConnections(allBuildings);
  
  // Penalty factor for outdoor routes in bad weather
  const outdoorPenalty = 1.5; // 50% penalty
  
  for (let i = 0; i < locations.length; i++) {
    for (let j = 0; j < locations.length; j++) {
      if (i !== j) {
        // Check if there is an indoor connection between buildings
        const locationI = locations[i];
        const locationJ = locations[j];
        
        // Find buildings for these locations
        const buildingI = findNearestBuilding(locationI, allBuildings);
        const buildingJ = findNearestBuilding(locationJ, allBuildings);
        
        // If we have buildings and they're connected indoors, reduce the distance
        if (buildingI && buildingJ && indoorConnections[buildingI.id]?.includes(buildingJ.id)) {
          // No adjustment needed for indoor routes
        } else {
          // Apply penalty for outdoor routes
          adjustedMatrix[i][j] *= outdoorPenalty;
        }
      }
    }
  }
  
  return adjustedMatrix;
};

/**
 * Solves the TSP for campus navigation, considering weather conditions
 * @param {Array} taskLocations - Array of location points to visit
 * @param {Object} currentLocation - Starting point coordinates
 * @param {Object} weatherData - Weather conditions
 * @param {Array} allBuildings - All buildings data with indoor connections
 * @returns {Object} Route information with optimal path
 */
const solveTSP = (taskLocations, currentLocation, weatherData, allBuildings) => {
  // Create an array of all locations including the current location
  const allLocations = [currentLocation, ...taskLocations];
  
  // Create a distance matrix
  let distanceMatrix = createDistanceMatrix(allLocations);
  
  // Adjust distance matrix based on weather conditions and indoor connections
  if (weatherData.precipitation || weatherData.temperature < 5) {
    distanceMatrix = adjustDistancesForWeather(distanceMatrix, allLocations, allBuildings);
  }
  
  // Solve the TSP, starting from the current location (index 0)
  const initialPath = solveTSPNearestNeighbor(distanceMatrix, 0);
  
  // Improve the solution using 2-opt algorithm
  const optimizedPath = improveTSPWith2Opt(distanceMatrix, initialPath);
  
  // Calculate total distance and estimated time
  let totalDistance = 0;
  let totalIndoorPercentage = 0;
  
  const segments = [];
  for (let i = 0; i < optimizedPath.length - 1; i++) {
    const fromIndex = optimizedPath[i];
    const toIndex = optimizedPath[i + 1];
    
    // Calculate direct distance
    const distance = distanceMatrix[fromIndex][toIndex];
    totalDistance += distance;
    
    // Estimate indoor percentage based on buildings
    const indoorPercentage = estimateIndoorPercentage(
      allLocations[fromIndex],
      allLocations[toIndex],
      allBuildings,
      weatherData
    );
    
    totalIndoorPercentage += indoorPercentage;
    
    // Create a segment object
    segments.push({
      from: fromIndex === 0 ? 'Current Location' : allLocations[fromIndex].name,
      to: allLocations[toIndex].name,
      distance: Math.round(distance),
      indoorPercentage: indoorPercentage,
      timeEstimate: Math.round(distance / (1.4 * (indoorPercentage/100 + 0.5))) // Roughly 1.4 m/s walking speed, adjusted for indoor/outdoor
    });
  }
  
  // Calculate average indoor percentage
  const avgIndoorPercentage = Math.round(totalIndoorPercentage / (optimizedPath.length - 1));
  
  // Convert path indices back to actual locations
  const orderedLocations = optimizedPath.map(index => allLocations[index]);
  
  return {
    path: orderedLocations,
    segments: segments,
    totalDistance: Math.round(totalDistance),
    totalIndoorPercentage: avgIndoorPercentage,
    totalTimeMinutes: Math.round(segments.reduce((total, segment) => total + segment.timeEstimate, 0) / 60)
  };
};

/**
 * Generate an optimized plan using TSP algorithm and Gemini API for navigation details
 */
export const generateSmartPlan = async (tasks, currentLocation, allBuildings, weatherData, campus) => {
  try {
    console.log("Generating smart plan with TSP optimization...");
    
    // Map tasks to buildings
    const mappedTasks = tasks.map(task => {
      const buildingInfo = mapTaskToBuilding(task, allBuildings);
      return {
        ...task,
        building: buildingInfo
      };
    });
    
    // Filter out tasks without buildings
    const tasksWithBuildings = mappedTasks.filter(task => task.building);
    
    if (tasksWithBuildings.length === 0) {
      throw new Error('Could not map any tasks to campus buildings. Please provide more specific task descriptions.');
    }
    
    // Prepare location points for TSP
    const taskLocations = tasksWithBuildings.map(task => ({
      ...task.building,
      name: task.building.name,
      taskDescription: task.description
    }));
    
    // Solve the Traveling Salesman Problem
    const tspResult = solveTSP(taskLocations, currentLocation, weatherData, allBuildings);
    
    // Reorder tasks based on TSP solution
    const optimizedPath = tspResult.path;
    const optimizedTasks = [];
    const orderedTaskLocations = [];
    
    // Skip the first point (current location) when creating the task order
    for (let i = 1; i < optimizedPath.length; i++) {
      const location = optimizedPath[i];
      
      // Find the task associated with this location
      const task = tasksWithBuildings.find(t => 
        t.building.latitude === location.latitude && 
        t.building.longitude === location.longitude
      );
      
      if (task) {
        optimizedTasks.push(task);
        orderedTaskLocations.push({
          ...location,
          task: task.description
        });
      }
    }
    
    // Generate detailed navigation instructions using Gemini
    const prompt = constructPrompt(optimizedTasks, currentLocation, allBuildings, weatherData, campus, tspResult);
    
    console.log("Sending request to Gemini API for detailed route instructions...");
    
    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        contents: [
          {
            parts: [
              {
                text: `You are a campus route planning assistant that creates visually optimized paths between buildings to minimize walking time and outdoor exposure based on weather conditions. Provide detailed, clearly formatted instructions with visual indicators and estimated times. Return your response in a structured format that can be easily parsed and displayed in an attractive, modern mobile interface.\n\n${prompt}`
              }
            ]
          }
        ],
        generationConfig: {
          temperature: 0.4,
          topK: 32,
          topP: 1,
          maxOutputTokens: 1500
        }
      },
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
    
    console.log("Gemini API response received:", response.status);
    
    let planText;
    if (response.data?.candidates?.[0]?.content?.parts?.[0]?.text) {
      planText = response.data.candidates[0].content.parts[0].text;
    } else {
      throw new Error('Invalid response from Gemini API');
    }
    
    // Parse the LLM response
    const parsedResponse = parseResponse(planText, allBuildings);
    
    // Combine TSP results with navigation details
    return {
      ...parsedResponse,
      tspOptimized: true,
      totalTimeMinutes: tspResult.totalTimeMinutes,
      totalDistance: tspResult.totalDistance,
      totalIndoorPercentage: tspResult.totalIndoorPercentage,
      optimizedTaskOrder: optimizedTasks.map(task => task.description).join('\n'),
      // Add the calculated segments from TSP
      segments: tspResult.segments.map((segment, index) => {
        // Find the corresponding parsed segment if available
        const parsedSegment = parsedResponse.segments[index] || {};
        
        return {
          ...segment,
          ...parsedSegment,
          // Ensure we have the building references
          fromBuilding: index === 0 ? null : orderedTaskLocations[index - 1],
          toBuilding: index < orderedTaskLocations.length ? orderedTaskLocations[index] : null,
        };
      })
    };
  } catch (error) {
    console.error('Error generating smart plan:', error);
    throw new Error(`Failed to generate plan: ${error.message}`);
  }
};

/**
 * Construct an updated prompt for the LLM, using TSP results
 */
const constructPrompt = (optimizedTasks, currentLocation, allBuildings, weatherData, campus, tspResult) => {
  // Format building data
  const simplifiedBuildings = allBuildings.map(building => ({
    id: building.id,
    name: building.name,
    latitude: building.latitude,
    longitude: building.longitude,
    purpose: building.purpose,
    facilities: building.facilities
  }));
  
  // Construct the prompt using the optimized path from TSP
  return `
I need to complete the following tasks at Concordia University's ${campus} campus in this specific optimized order:
${optimizedTasks.map((task, index) => `${index + 1}. ${task.description} (at ${task.building.name})`).join('\n')}

My current location is: Latitude ${currentLocation.latitude}, Longitude ${currentLocation.longitude}

Current weather conditions: 
- Temperature: ${weatherData.temperature}°C
- Conditions: ${weatherData.conditions}
- Precipitation: ${weatherData.precipitation ? 'Yes' : 'No'}

The route has already been optimized using a Traveling Salesman algorithm with these metrics:
- Total estimated time: ${tspResult.totalTimeMinutes} minutes
- Total distance: ${tspResult.totalDistance} meters
- Indoor path percentage: ${tspResult.totalIndoorPercentage}%

Detailed segments of the journey:
${tspResult.segments.map((segment, index) => 
  `Segment ${index + 1}: From ${segment.from} to ${segment.to} - ${segment.distance}m (${segment.indoorPercentage}% indoor)`
).join('\n')}

Campus buildings data:
${JSON.stringify(simplifiedBuildings, null, 2)}

Please create detailed turn-by-turn navigation instructions that:
1. Follow the EXACT order of tasks already provided (this order is optimized)
2. Reduce exposure to outdoor weather (especially important in poor weather)
3. Accounts for indoor connections between buildings where available
4. Provides clear visual navigation cues

Format your response with these REQUIRED distinct sections, clearly labeled with these exact section titles:

===ROUTE SUMMARY===
A brief overview (2-3 sentences) of the optimized route with total time and distance.

===WEATHER ADVISORY===
Brief, actionable tips about weather considerations, indoor pathways, etc. Only include if precipitation is present or temperature is extreme.

===JOURNEY SEGMENTS===
For each segment, use this exact format (include all these fields for each segment):
- FROM: [origin building name] (Building ID)
- TO: [destination building name] (Building ID)
- DISTANCE: [distance] meters (use the exact distance from the TSP result)
- TIME: [time] minutes (use the time from the TSP result)
- INDOOR PERCENTAGE: [percentage]% indoor (use the percentage from the TSP result)
- NAVIGATION: Clear, concise turn-by-turn directions focusing on landmarks and visual cues. Keep this section brief and visually descriptive.

===OPTIMIZED TASK ORDER===
A numbered list of tasks in the exact order provided (this has already been optimized by the TSP algorithm).

===TOTAL METRICS===
- TOTAL TIME: ${tspResult.totalTimeMinutes} minutes
- TOTAL DISTANCE: ${tspResult.totalDistance} meters
- INDOOR PERCENTAGE: ${tspResult.totalIndoorPercentage}%

This format is critical for proper display in our modern, visually-focused mobile interface.
`;
};

const mapTaskToBuilding = (task, allBuildings) => {
  const description = task.description.toLowerCase();

  // Direct building name keywords
  const buildingKeywords = {
    'hall': 'H',
    'hall building': 'H',
    'jmsb': 'MB',
    'john molson': 'MB',
    'john molson school of business': 'MB',
    'molson': 'MB',
    'webster': 'WL',
    'library': 'WL',
    'webster library': 'WL',
    'cl': 'CL',
    'cl building': 'CL',
    'ev': 'EV',
    'engineering': 'EV',
    'faubourg': 'FT',
    'faubourg tower': 'FT',
    'fg': 'FG',
    'le faubourg': 'FG',
    'vanier': 'VL',
    'vanier library': 'VL',
    'psychology': 'PY',
    'psychology building': 'PY',
    'rf': 'RF',
    'jesuit hall': 'RF',
    'renaud': 'SP',
    'science complex': 'SP',
    'science building': 'SP',
    'communication': 'CJ',
    'journalism': 'CJ',
    'genomics': 'GE',
    'central': 'CC',
    'central building': 'CC',
    'admin': 'AD',
    'administration': 'AD',
    'fc smith': 'FC',
    'fc': 'FC'
  };

  // Keyword → buildings map with priority
  const taskTypeKeywords = {
    'book': {
      buildings: allBuildings.filter(b => b.name.toLowerCase().includes('library')),
      priority: 1
    },
    'library': {
      buildings: allBuildings.filter(b => b.name.toLowerCase().includes('library')),
      priority: 1
    },
    'study': {
      buildings: allBuildings.filter(b =>
        b.name.toLowerCase().includes('library') ||
        b.facilities?.toLowerCase().includes('study')
      ),
      priority: 2
    },
    'research': {
      buildings: allBuildings.filter(b =>
        b.facilities?.toLowerCase().includes('research')
      ),
      priority: 3
    },
    'class': {
      buildings: allBuildings.filter(b =>
        b.facilities?.toLowerCase().includes('classroom')
      ),
      priority: 4
    },
    'lecture': {
      buildings: allBuildings.filter(b =>
        b.facilities?.toLowerCase().includes('lecture')
      ),
      priority: 4
    },
    'coffee': {
      buildings: allBuildings.filter(b =>
        b.type === 'Coffee Shop' || b.cuisineType?.includes('Coffee')
      ),
      priority: 5
    },
    'cafe': {
      buildings: allBuildings.filter(b => b.type === 'Cafe'),
      priority: 5
    },
    'burger': {
      buildings: allBuildings.filter(b =>
        b.cuisineType?.includes('Burgers')
      ),
      priority: 6
    },
    'food': {
      buildings: allBuildings.filter(b =>
        b.type === 'Fast Food' ||
        b.type === 'Restaurant' ||
        b.cuisineType?.some(type =>
          ['Burgers', 'Middle Eastern', 'Chicken'].includes(type)
        )
      ),
      priority: 6
    },
    'lunch': {
      buildings: allBuildings.filter(b =>
        b.type === 'Fast Food' ||
        b.type === 'Restaurant' ||
        b.cuisineType?.length > 0
      ),
      priority: 6
    },
    'snack': {
      buildings: allBuildings.filter(b =>
        b.name.toLowerCase().includes('pharmaprix') ||
        b.name.toLowerCase().includes('dollarama') ||
        b.cuisineType?.includes('Snacks')
      ),
      priority: 2
    },
    'medicine': {
      buildings: allBuildings.filter(b =>
        b.name.toLowerCase().includes('pharmaprix')
      ),
      priority: 8
    },
    'pharmacy': {
      buildings: allBuildings.filter(b =>
        b.name.toLowerCase().includes('pharmaprix')
      ),
      priority: 8
    },
    'convenience': {
      buildings: allBuildings.filter(b =>
        b.type === 'Convenience Store'
      ),
      priority: 9
    }
  };

  // Direct building keyword match
  for (const [keyword, id] of Object.entries(buildingKeywords)) {
    if (description.includes(keyword)) {
      const building = allBuildings.find(b => b.id === id);
      if (building) return building;
    }
  }

  // Match using task type keywords based on best priority
  let bestMatch = null;
  let bestPriority = Infinity;

  for (const [keyword, entry] of Object.entries(taskTypeKeywords)) {
    if (description.includes(keyword)) {
      for (const b of entry.buildings) {
        if (entry.priority < bestPriority) {
          bestMatch = b;
          bestPriority = entry.priority;
        }
      }
    }
  }

  if (bestMatch) return bestMatch;

  // Heuristic fallback for food-related keywords
  const foodVerbs = ['eat', 'grab', 'buy', 'purchase', 'get'];
  const foodNouns = ['food', 'lunch', 'dinner', 'snack', 'meal', 'burger', 'pizza', 'sandwich'];

  const isFoodTask = foodVerbs.some(v => description.includes(v)) &&
                     foodNouns.some(n => description.includes(n));

  if (isFoodTask) {
    const candidates = allBuildings.filter(b =>
      b.type === 'Fast Food' ||
      b.type === 'Restaurant' ||
      (b.type === 'Convenience Store' && b.cuisineType?.includes('Snacks'))
    );

    return candidates.sort(() => 0.5 - Math.random())[0] || null;
  }

  // Final fallback to academic buildings
  const academicFallback = allBuildings.filter(b =>
    b.facilities?.toLowerCase().includes('classroom') ||
    b.purpose?.toLowerCase().includes('academic')
  );

  return academicFallback[0] || null;
};


/**
 * Parse the LLM response into a structured format
 */
const parseResponse = (responseText, allBuildings) => {
  try {
    console.log("Parsing response text:", responseText.substring(0, 200) + "...");
    
    // Split response by the section markers
    const routeSummaryMatch = responseText.match(/===ROUTE SUMMARY===\s*([\s\S]*?)(?====|$)/);
    const weatherAdvisoryMatch = responseText.match(/===WEATHER ADVISORY===\s*([\s\S]*?)(?====|$)/);
    const journeySegmentsMatch = responseText.match(/===JOURNEY SEGMENTS===\s*([\s\S]*?)(?====|$)/);
    const optimizedTaskOrderMatch = responseText.match(/===OPTIMIZED TASK ORDER===\s*([\s\S]*?)(?====|$)/);
    const totalMetricsMatch = responseText.match(/===TOTAL METRICS===\s*([\s\S]*?)(?====|$)/);
    
    // Extract journey segments
    const segments = [];
    
    if (journeySegmentsMatch && journeySegmentsMatch[1]) {
      // Split the journey segments section by looking for "FROM:" sections
      const segmentTexts = journeySegmentsMatch[1].split(/(?=- FROM:)/);
      
      segmentTexts.forEach(segmentText => {
        if (!segmentText.trim()) return;
        
        // Extract segment data using regex
        const fromMatch = segmentText.match(/- FROM:\s*(.*?)(?=\n|$)/);
        const toMatch = segmentText.match(/- TO:\s*(.*?)(?=\n|$)/);
        const distanceMatch = segmentText.match(/- DISTANCE:\s*(\d+)/);
        const timeMatch = segmentText.match(/- TIME:\s*(\d+)/);
        const indoorMatch = segmentText.match(/- INDOOR PERCENTAGE:\s*(\d+)/);
        const navigationMatch = segmentText.match(/- NAVIGATION:\s*([\s\S]*?)(?=(\n- [A-Z])|$)/);
        
        // Extract building IDs
        let fromBuilding = null;
        let toBuilding = null;
        
        if (fromMatch && fromMatch[1]) {
          const idMatch = fromMatch[1].match(/\((.*?)\)/);
          const buildingId = idMatch ? idMatch[1] : null;
          
          fromBuilding = allBuildings.find(b => b.id === buildingId || b.name.includes(fromMatch[1].split('(')[0].trim()));
        }
        
        if (toMatch && toMatch[1]) {
          const idMatch = toMatch[1].match(/\((.*?)\)/);
          const buildingId = idMatch ? idMatch[1] : null;
          
          toBuilding = allBuildings.find(b => b.id === buildingId || b.name.includes(toMatch[1].split('(')[0].trim()));
        }
        
        segments.push({
          from: fromMatch ? fromMatch[1].trim() : null,
          fromBuilding: fromBuilding,
          to: toMatch ? toMatch[1].trim() : null,
          toBuilding: toBuilding,
          distance: distanceMatch ? parseInt(distanceMatch[1]) : null,
          timeEstimate: timeMatch ? parseInt(timeMatch[1]) : null,
          indoorPercentage: indoorMatch ? parseInt(indoorMatch[1]) : null,
          navigation: navigationMatch ? navigationMatch[1].trim() : null
        });
      });
    }
    
    // Extract total metrics
    let totalTime = 0;
    let totalDistance = 0;
    let totalIndoorPercentage = 0;
    
    if (totalMetricsMatch && totalMetricsMatch[1]) {
      const timeMatch = totalMetricsMatch[1].match(/TOTAL TIME:\s*(\d+)/);
      const distanceMatch = totalMetricsMatch[1].match(/TOTAL DISTANCE:\s*(\d+)/);
      const indoorMatch = totalMetricsMatch[1].match(/INDOOR PERCENTAGE:\s*(\d+)/);
      
      totalTime = timeMatch ? parseInt(timeMatch[1]) : 0;
      totalDistance = distanceMatch ? parseInt(distanceMatch[1]) : 0;
      totalIndoorPercentage = indoorMatch ? parseInt(indoorMatch[1]) : 0;
    }
    
    // Create steps from segments for compatibility
    const steps = segments.map(segment => ({
      instruction: segment.navigation || `Go from ${segment.from} to ${segment.to}`,
      building: segment.toBuilding,
      timeEstimate: segment.timeEstimate,
      distance: segment.distance,
      indoorPercentage: segment.indoorPercentage
    }));
    
    // If no steps were created, fallback to old parsing method
    if (steps.length === 0) {
      console.log("No structured segments found, using fallback parsing");
      const lines = responseText.split('\n');
      lines.forEach(line => {
        if (line.trim().length > 10 && !line.includes('===')) {
          steps.push({
            instruction: line.trim(),
            building: null,
            timeEstimate: extractTimeEstimate(line)
          });
        }
      });
    }
    
    return {
      rawResponse: responseText,
      routeSummary: routeSummaryMatch ? routeSummaryMatch[1].trim() : null,
      weatherAdvisory: weatherAdvisoryMatch ? weatherAdvisoryMatch[1].trim() : null,
      optimizedTaskOrder: optimizedTaskOrderMatch ? optimizedTaskOrderMatch[1].trim() : null,
      segments: segments,
      steps: steps,
      totalTimeMinutes: totalTime,
      totalDistance: totalDistance,
      totalIndoorPercentage: totalIndoorPercentage,
      weatherConsiderations: weatherAdvisoryMatch ? weatherAdvisoryMatch[1].trim() : null
    };
  } catch (error) {
    console.error('Error parsing response:', error);
    // Return a simplified version if parsing fails
    return {
      rawResponse: responseText,
      steps: [{
        instruction: "Unable to parse the response into steps. See the full response below.",
        building: null,
        timeEstimate: null
      }],
      totalTimeMinutes: 0
    };
  }
};

/**
 * Extract time estimate from step text
 */
const extractTimeEstimate = (stepText) => {
  const timeMatch = stepText.match(/(\d+)\s*minutes?/i);
  if (timeMatch) {
    return parseInt(timeMatch[1]);
  }
  return null;
};