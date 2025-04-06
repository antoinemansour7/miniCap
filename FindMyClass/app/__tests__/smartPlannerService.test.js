// smartPlannerService.test.js
import axios from 'axios';
import { generateSmartPlan } from '../api/smartPlannerService';

// Create a proper mock for axios
jest.mock('axios', () => ({
  post: jest.fn()
}));

// Mock data
const mockCurrentLocation = { latitude: 45.495729, longitude: -73.578041 };
const mockWeatherData = { temperature: 2, conditions: 'Cloudy', precipitation: true };
const mockCampus = 'SGW';
const mockAllBuildings = [
  { id: 'H', name: 'Hall Building', latitude: 45.497092, longitude: -73.579037, purpose: 'Academic', facilities: 'classrooms' },
  { id: 'MB', name: 'JMSB', latitude: 45.495574, longitude: -73.579146, purpose: 'Academic', facilities: 'classrooms' },
  { id: 'WL', name: 'Webster Library', latitude: 45.497166, longitude: -73.578010, purpose: 'Library', facilities: 'study' },
  { id: 'FT', name: 'Faubourg Tower', latitude: 45.494356, longitude: -73.577997, purpose: 'Academic', facilities: 'classrooms' },
  { id: 'CL', name: 'CL Building', latitude: 45.494175, longitude: -73.579294, purpose: 'Academic', facilities: 'classrooms', type: 'Fast Food', cuisineType: ['Coffee'] }
];
const mockTasks = [
  { description: 'Study at Webster Library' },
  { description: 'Attend class at Hall Building' },
  { description: 'Get coffee at Tim Hortons in JMSB' }
];

// Mock Gemini API response
const mockGeminiResponse = {
  data: {
    candidates: [{
      content: {
        parts: [{
          text: `
===ROUTE SUMMARY===
Optimized route from current location to Webster Library, Hall Building, and JMSB, taking 15 minutes total.

===WEATHER ADVISORY===
Cold temperatures and precipitation. Use indoor connections where possible.

===JOURNEY SEGMENTS===
- FROM: Current Location (null)
- TO: Webster Library (WL)
- DISTANCE: 150 meters
- TIME: 3 minutes
- INDOOR PERCENTAGE: 20%
- NAVIGATION: Head north on Mackay St, enter through main entrance.

- FROM: Webster Library (WL)
- TO: Hall Building (H)
- DISTANCE: 120 meters
- TIME: 2 minutes
- INDOOR PERCENTAGE: 90%
- NAVIGATION: Take indoor walkway from 2nd floor.

- FROM: Hall Building (H)
- TO: JMSB (MB)
- DISTANCE: 180 meters
- TIME: 3 minutes
- INDOOR PERCENTAGE: 80%
- NAVIGATION: Exit south side, cross Maisonneuve Blvd.

===OPTIMIZED TASK ORDER===
1. Study at Webster Library
2. Attend class at Hall Building
3. Get coffee at Tim Hortons in JMSB

===TOTAL METRICS===
- TOTAL TIME: 8 minutes
- TOTAL DISTANCE: 450 meters
- INDOOR PERCENTAGE: 60%
`
        }]
      }
    }]
  }
};

describe('Smart Planner Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Mock successful axios response
    axios.post.mockResolvedValue(mockGeminiResponse);
  });

  test('generateSmartPlan generates an optimized plan', async () => {
    const result = await generateSmartPlan(mockTasks, mockCurrentLocation, mockAllBuildings, mockWeatherData, mockCampus);
    
    // Verify axios was called with correct parameters
    expect(axios.post).toHaveBeenCalled();
    expect(axios.post.mock.calls[0][0]).toContain('generativelanguage.googleapis.com');
    
    // Verify result structure
    expect(result).toHaveProperty('routeSummary');
    expect(result).toHaveProperty('weatherAdvisory');
    expect(result).toHaveProperty('segments');
    expect(result).toHaveProperty('totalTimeMinutes');
    expect(result).toHaveProperty('totalDistance');
    expect(result).toHaveProperty('totalIndoorPercentage');
    
    // Verify segments were parsed correctly
    expect(result.segments.length).toBeGreaterThan(0);
    expect(result.segments[0]).toHaveProperty('from');
    expect(result.segments[0]).toHaveProperty('to');
  });

  test('generateSmartPlan handles API errors', async () => {
    // Mock API error
    axios.post.mockRejectedValue(new Error('API Error'));
    
    await expect(generateSmartPlan(mockTasks, mockCurrentLocation, mockAllBuildings, mockWeatherData, mockCampus))
      .rejects.toThrow('Failed to generate plan');
  });

  test('generateSmartPlan handles invalid response format', async () => {
    // Mock invalid response format
    axios.post.mockResolvedValue({
      data: { candidates: [{ content: { parts: [] } }] }
    });
    
    await expect(generateSmartPlan(mockTasks, mockCurrentLocation, mockAllBuildings, mockWeatherData, mockCampus))
      .rejects.toThrow('Invalid response from Gemini API');
  });

  test('generateSmartPlan handles tasks without mapped buildings', async () => {
    // Mock mapTaskToBuilding to always return null by modifying mockAllBuildings temporarily
    const originalBuildings = [...mockAllBuildings];
    // Clear the buildings array to ensure no mappings can be found
    mockAllBuildings.length = 0;
    
    try {
      await expect(generateSmartPlan(
        [{ description: 'Truly unmappable task' }],
        mockCurrentLocation, 
        mockAllBuildings, 
        mockWeatherData, 
        mockCampus
      )).rejects.toThrow('Could not map any tasks to campus buildings');
    } finally {
      // Restore the original buildings after the test
      mockAllBuildings.push(...originalBuildings);
    }
  });
  
  test('mapTaskToBuilding handles various task descriptions', async () => {
    // This indirectly tests mapTaskToBuilding with different types of tasks
    const diverseTasks = [
      { description: 'Study at Webster library' },
      { description: 'Get coffee at JMSB' },
      { description: 'Attend lecture in Hall building' },
      { description: 'Research project in CL building' },
      { description: 'Grab lunch somewhere on campus' }
    ];
    
    axios.post.mockResolvedValue(mockGeminiResponse);
    const result = await generateSmartPlan(diverseTasks, mockCurrentLocation, mockAllBuildings, mockWeatherData, mockCampus);
    
    // Check that tasks were mapped to buildings
    expect(axios.post).toHaveBeenCalled();
    expect(result).toHaveProperty('tspOptimized', true);
  });
  
  test('TSP optimization with weather considerations', async () => {
    // Test with different weather conditions
    const goodWeather = { temperature: 20, conditions: 'Sunny', precipitation: false };
    
    // Good weather test
    axios.post.mockResolvedValue(mockGeminiResponse);
    await generateSmartPlan(mockTasks, mockCurrentLocation, mockAllBuildings, goodWeather, mockCampus);
    expect(axios.post).toHaveBeenCalled();
    
    // Reset mock
    jest.clearAllMocks();
    
    // Bad weather test
    const badWeather = { temperature: -5, conditions: 'Snowing', precipitation: true };
    axios.post.mockResolvedValue(mockGeminiResponse);
    await generateSmartPlan(mockTasks, mockCurrentLocation, mockAllBuildings, badWeather, mockCampus);
    expect(axios.post).toHaveBeenCalled();
  });
  
  test('parseResponse handles incomplete response data', async () => {
    // Mock incomplete response
    axios.post.mockResolvedValue({
      data: {
        candidates: [{
          content: {
            parts: [{
              text: `Some unstructured response without proper formatting`
            }]
          }
        }]
      }
    });
    
    const result = await generateSmartPlan(mockTasks, mockCurrentLocation, mockAllBuildings, mockWeatherData, mockCampus);
    
    // Verify fallback parsing was used
    expect(result).toHaveProperty('rawResponse');
    expect(result).toHaveProperty('steps');
    // The fallback parsing should at least create one step
    expect(result.steps.length).toBeGreaterThan(0);
  });
});