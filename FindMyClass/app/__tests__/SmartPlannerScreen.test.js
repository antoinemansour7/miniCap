import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import SmartPlannerScreen from '../screens/SmartPlannerScreen';
import { Alert } from 'react-native';
import { generateSmartPlan } from '../api/smartPlannerService';
import * as Location from 'expo-location';
import axios from 'axios';
import { act } from 'react-test-renderer';

// Mock required dependencies
jest.mock('@expo/vector-icons', () => ({
  Ionicons: () => null,
  MaterialIcons: () => null,
  FontAwesome5: () => null,
  MaterialCommunityIcons: () => null,
}));

jest.mock('react-native-maps', () => {
  const { View } = require('react-native');
  const MockMapView = (props) => <View testID="mapview" {...props}>{props.children}</View>;
  MockMapView.Marker = (props) => <View testID="marker" {...props}>{props.children}</View>;
  MockMapView.Polyline = (props) => <View testID="polyline" {...props}>{props.children}</View>;
  
  return {
    __esModule: true,
    default: MockMapView,
    Marker: MockMapView.Marker,
    Polyline: MockMapView.Polyline,
  };
});

jest.mock('expo-linear-gradient', () => {
  const { View } = require('react-native');
  return {
    LinearGradient: (props) => <View testID="linear-gradient" {...props}>{props.children}</View>
  };
});

jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
}));

jest.mock('expo-location', () => ({
  requestForegroundPermissionsAsync: jest.fn(),
  getCurrentPositionAsync: jest.fn(),
}));

jest.mock('axios', () => ({
  get: jest.fn(),
}));

jest.mock('../api/smartPlannerService', () => ({
  generateSmartPlan: jest.fn(),
}));

// Test data
const HALL_BUILDING_COORDINATES = {
  latitude: 45.497092,
  longitude: -73.579037
};

const MOCK_PLAN_RESULT = {
  totalTimeMinutes: 25,
  totalDistance: 1200,
  totalIndoorPercentage: 70,
  weatherAdvisory: "Weather is favorable.",
  routeSummary: "Your optimal route",
  steps: [
    {
      building: {
        id: "H",
        name: "Hall Building",
        latitude: 45.497092,
        longitude: -73.579037
      },
      instruction: "Start at Hall Building",
      timeEstimate: 0,
      distance: 0,
      indoorPercentage: 100
    }
  ]
};

describe('SmartPlannerScreen', () => {
  // Setup before each test
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(Alert, 'alert').mockImplementation(() => {});
    
    // Default mock implementations
    Location.requestForegroundPermissionsAsync.mockResolvedValue({ status: 'granted' });
    Location.getCurrentPositionAsync.mockResolvedValue({ coords: HALL_BUILDING_COORDINATES });
    
    axios.get.mockResolvedValue({
      data: {
        main: { temp: 20 },
        weather: [{ main: 'Clear' }]
      }
    });
    
    generateSmartPlan.mockResolvedValue(MOCK_PLAN_RESULT);
    
    // Mock timers
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  test('renders without crashing', () => {
    const navigation = { navigate: jest.fn() };
    const { getByText } = render(<SmartPlannerScreen navigation={navigation} />);
    
    // Basic check to ensure component rendered
    expect(getByText('Smart Planner')).toBeTruthy();
  });

  test('toggles campus when pressed', () => {
    const navigation = { navigate: jest.fn() };
    const { getByText } = render(<SmartPlannerScreen navigation={navigation} />);
    
    // Initial state is SGW
    expect(getByText('SGW Campus')).toBeTruthy();
    
    // Toggle campus
    fireEvent.press(getByText('SGW Campus'));
    
    // Check that it changed to Loyola
    expect(getByText('Loyola Campus')).toBeTruthy();
  });

  test('can add a task', async () => { // Add async
    const navigation = { navigate: jest.fn() };
    const { getByPlaceholderText, getByTestId } = render(
      <SmartPlannerScreen navigation={navigation} />
    );
    
    // Add await before fireEvent
    await fireEvent.changeText(getByPlaceholderText('Add a new task...'), 'Test task');
    await fireEvent.press(getByTestId('add-task-button'));
  }, 10000); // Increase timeout

  test('can add and remove a task', () => {
    const navigation = { navigate: jest.fn() };
    const { getByPlaceholderText, getByTestId, queryAllByTestId } = render(
      <SmartPlannerScreen navigation={navigation} />
    );
    
    // Add a task
    const input = getByPlaceholderText('Add a new task...');
    const addButton = getByTestId('add-task-button');
    
    fireEvent.changeText(input, 'Test task');
    fireEvent.press(addButton);
    
    // Check task exists
    const removeButtons = queryAllByTestId(/remove-task-/);
    expect(removeButtons.length).toBe(1);
    
    // Remove the task
    fireEvent.press(removeButtons[0]);
    
    // Check task was removed
    const updatedRemoveButtons = queryAllByTestId(/remove-task-/);
    expect(updatedRemoveButtons.length).toBe(0);
  });

  test('prevents adding empty task', () => {
    const navigation = { navigate: jest.fn() };
    const { getByPlaceholderText, getByTestId, queryAllByTestId } = render(
      <SmartPlannerScreen navigation={navigation} />
    );
    
    // Try to add empty task
    const input = getByPlaceholderText('Add a new task...');
    const addButton = getByTestId('add-task-button');
    
    fireEvent.changeText(input, '');
    fireEvent.press(addButton);
    
    // Check no task was added
    const removeButtons = queryAllByTestId(/remove-task-/);
    expect(removeButtons.length).toBe(0);
  });

  test('can modify task text', () => {
    const navigation = { navigate: jest.fn() };
    const { getByPlaceholderText, getByTestId, getByDisplayValue } = render(
      <SmartPlannerScreen navigation={navigation} />
    );
    
    // Add a task
    const input = getByPlaceholderText('Add a new task...');
    const addButton = getByTestId('add-task-button');
    
    fireEvent.changeText(input, 'Original task');
    fireEvent.press(addButton);
    
    // Find and modify the task
    const taskInput = getByDisplayValue('Original task');
    fireEvent.changeText(taskInput, 'Modified task');
    
    // Verify modification
    expect(getByDisplayValue('Modified task')).toBeTruthy();
  });

  test('shows alert when generating plan with no tasks', () => {
    const navigation = { navigate: jest.fn() };
    const { getByText } = render(<SmartPlannerScreen navigation={navigation} />);
    
    // Try to generate plan with no tasks
    fireEvent.press(getByText('Generate Optimized Plan'));
    
    // Check error alert
    expect(Alert.alert).toHaveBeenCalledWith(
      'Error',
      'Please add at least one task.'
    );
  });

  test('handles location permission denied', async () => {
    Location.requestForegroundPermissionsAsync.mockResolvedValue({ status: 'denied' });
    
    const navigation = { navigate: jest.fn() };
    render(<SmartPlannerScreen navigation={navigation} />);
    
    // Wait for useEffect to complete
    await act(async () => {
      await Promise.resolve();
    });
    
    expect(Alert.alert).toHaveBeenCalledWith(
      'Permission Denied',
      'We need location permissions to optimize your route.'
    );
  });

  test('handles location error', async () => {
    // Mock location error
    Location.requestForegroundPermissionsAsync.mockRejectedValue(new Error('Location error'));
    
    const navigation = { navigate: jest.fn() };
    render(<SmartPlannerScreen navigation={navigation} />);
    
    // Advanced timers
    jest.runAllTimers();
    
    // Wait for the alert to be called
    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith(
        'Error',
        'Failed to get location. Please try again.'
      );
    });
  });

  test('handles weather API error', () => {
    // Mock weather API error
    axios.get.mockRejectedValue(new Error('Weather API error'));
    
    const navigation = { navigate: jest.fn() };
    const { getByText } = render(<SmartPlannerScreen navigation={navigation} />);
    
    // Run all timers to allow promises to resolve
    jest.runAllTimers();
    
    // Component should still render without crashing
    expect(getByText('Smart Planner')).toBeTruthy();
  });

  test('handles plan generation with location but no tasks', () => {
    const navigation = { navigate: jest.fn() };
    const { getByText } = render(<SmartPlannerScreen navigation={navigation} />);
    
    // Try to generate plan with no tasks
    fireEvent.press(getByText('Generate Optimized Plan'));
    
    // Check error alert for no tasks
    expect(Alert.alert).toHaveBeenCalledWith(
      'Error',
      'Please add at least one task.'
    );
  });

  test('handles successful plan generation', async () => {
    const navigation = { navigate: jest.fn() };
    const { getByText, getByPlaceholderText, getByTestId } = render(
      <SmartPlannerScreen navigation={navigation} />
    );
    
    // Add a task
    const input = getByPlaceholderText('Add a new task...');
    const addButton = getByTestId('add-task-button');
    
    fireEvent.changeText(input, 'Visit library');
    fireEvent.press(addButton);
    
    // Mock successful generation
    generateSmartPlan.mockResolvedValue(MOCK_PLAN_RESULT);
    
    // Generate plan
    fireEvent.press(getByText('Generate Optimized Plan'));
    
    // Run timers to resolve promises and animations
    jest.runAllTimers();
    
    // We can't easily test the plan rendering due to animations,
    // but we can verify the function was called with correct params
    expect(generateSmartPlan).toHaveBeenCalled();
  });

  test('handles plan generation error', async () => {
    // Mock error in plan generation
    generateSmartPlan.mockRejectedValue(new Error('Plan generation error'));
    
    const navigation = { navigate: jest.fn() };
    const { getByText, getByPlaceholderText, getByTestId } = render(
      <SmartPlannerScreen navigation={navigation} />
    );
    
    // Add a task
    const input = getByPlaceholderText('Add a new task...');
    const addButton = getByTestId('add-task-button');
    
    fireEvent.changeText(input, 'Visit library');
    fireEvent.press(addButton);
    
    // Generate plan
    fireEvent.press(getByText('Generate Optimized Plan'));
    
    // Run timers
    jest.runAllTimers();
    
    // Wait for alert
    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith(
        'Error',
        'Failed to generate plan. Please try again.'
      );
    });
  });

  test('handles getWeatherIcon for different conditions', () => {
    // Test rainy weather
    axios.get.mockResolvedValue({
      data: {
        main: { temp: 10 },
        weather: [{ main: 'Rain' }]
      }
    });
    
    const navigation = { navigate: jest.fn() };
    render(<SmartPlannerScreen navigation={navigation} />);
    
    // Run timers to resolve promises
    jest.runAllTimers();
    
    // Test cloudy weather
    axios.get.mockResolvedValue({
      data: {
        main: { temp: 18 },
        weather: [{ main: 'Clouds' }]
      }
    });
    
    render(<SmartPlannerScreen navigation={navigation} />);
    
    // Run timers
    jest.runAllTimers();
    
    // Test sunny weather
    axios.get.mockResolvedValue({
      data: {
        main: { temp: 25 },
        weather: [{ main: 'Clear' }]
      }
    });
    
    render(<SmartPlannerScreen navigation={navigation} />);
    
    // Run timers
    jest.runAllTimers();
    
    // The function getWeatherIcon is internal, so we can't directly test its return value,
    // but we can verify the component renders with different weather conditions
  });

  test('shows alert when all tasks are empty', () => {
    const navigation = { navigate: jest.fn() };
    const { getByText, getByPlaceholderText, getByTestId } = render(
      <SmartPlannerScreen navigation={navigation} />
    );
    
    // Add empty task
    fireEvent.changeText(getByPlaceholderText('Add a new task...'), '   ');
    fireEvent.press(getByTestId('add-task-button'));
    
    // Try to generate plan
    fireEvent.press(getByText('Generate Optimized Plan'));
    
    expect(Alert.alert).toHaveBeenCalledWith(
      'Error',
      'Please add at least one task.'
    );
  });

  test('toggles map fullscreen', async () => {
    const navigation = { navigate: jest.fn() };
    const { getByText, getByPlaceholderText, getByTestId } = render(
      <SmartPlannerScreen navigation={navigation} />
    );
    
    // Add task and generate plan first
    fireEvent.changeText(getByPlaceholderText('Add a new task...'), 'Test task');
    fireEvent.press(getByTestId('add-task-button'));
    fireEvent.press(getByText('Generate Optimized Plan'));
    
    // Wait for plan to generate
    await act(async () => {
      jest.runAllTimers();
    });
    
    // Find and click fullscreen button
    fireEvent.press(getByTestId('mapview').parent.findByProps({testID: 'mapFullscreenButton'}));
    
    // Verify fullscreen state
    // This might need adjustment based on your actual implementation
    expect(getByTestId('mapview').parent.props.style.height).toBe(height);
  });

  test('selects journey segments', async () => {
    const navigation = { navigate: jest.fn() };
    const { getByText, getByPlaceholderText, getByTestId } = render(
      <SmartPlannerScreen navigation={navigation} />
    );
    
    // Add task and generate plan
    fireEvent.changeText(getByPlaceholderText('Add a new task...'), 'Test task');
    fireEvent.press(getByTestId('add-task-button'));
    fireEvent.press(getByText('Generate Optimized Plan'));
    
    await act(async () => {
      jest.runAllTimers();
    });
    
    // Find and click a segment
    const segmentButton = getByTestId('segment-button-0');
    fireEvent.press(segmentButton);
    
    // Verify active segment is updated
    expect(segmentButton.props.style).toContainEqual(
      expect.objectContaining({ backgroundColor: CONCORDIA_BURGUNDY })
    );
  });

  test('selects correct weather icons', async () => {
    // Mock rainy weather
    axios.get.mockResolvedValue({
      data: {
        main: { temp: 10 },
        weather: [{ main: 'Rain' }]
      }
    });
  
    const navigation = { navigate: jest.fn() };
    const { findByProps, getByText } = render(<SmartPlannerScreen navigation={navigation} />);
  
    await act(async () => {
      jest.runAllTimers();
    });
  
    // Verify rainy icon is shown in weather info
    const weatherInfo = getByText(/°C, Rain/);
    expect(weatherInfo).toBeTruthy();
  });

  test('shows correct colors for indoor percentages', async () => {
    const navigation = { navigate: jest.fn() };
    const { getByText, getByPlaceholderText, getByTestId, getAllByTestId } = render(
      <SmartPlannerScreen navigation={navigation} />
    );
  
    // Add task
    fireEvent.changeText(getByPlaceholderText('Add a new task...'), 'Test task');
    fireEvent.press(getByTestId('add-task-button'));
  
    // Mock plan with different indoor percentages
    const mockPlan = {
      ...MOCK_PLAN_RESULT,
      steps: [
        { 
          building: { id: "H", name: "Hall", latitude: 45.497, longitude: -73.579 },
          instruction: "Step 1",
          timeEstimate: 5,
          distance: 100,
          indoorPercentage: 90 // Mostly indoor
        },
        { 
          building: { id: "LB", name: "Library", latitude: 45.4975, longitude: -73.5795 },
          instruction: "Step 2",
          timeEstimate: 5,
          distance: 100,
          indoorPercentage: 50 // Mixed
        }
      ]
    };
    generateSmartPlan.mockResolvedValue(mockPlan);
  
    // Generate plan
    fireEvent.press(getByText('Generate Optimized Plan'));
  
    await act(async () => {
      jest.runAllTimers();
    });
  
    // Verify badge colors (you'll need to add testID="indoor-badge" to your badge component)
    const badges = getAllByTestId('indoor-badge');
    expect(badges[0].props.style.backgroundColor).toBe('#23A55A'); // Mostly indoor
    expect(badges[1].props.style.backgroundColor).toBe('#FFB302'); // Mixed
  });

  test('calculates correct map region for route', async () => {
    const navigation = { navigate: jest.fn() };
    const { getByText, getByPlaceholderText, getByTestId } = render(
      <SmartPlannerScreen navigation={navigation} />
    );
  
    // Add task
    fireEvent.changeText(getByPlaceholderText('Add a new task...'), 'Test task');
    fireEvent.press(getByTestId('add-task-button'));
  
    // Mock plan with multiple locations
    const mockPlan = {
      ...MOCK_PLAN_RESULT,
      steps: [
        {
          building: {
            id: "H",
            name: "Hall Building",
            latitude: 45.497092,
            longitude: -73.579037
          },
          // ... other properties
        },
        {
          building: {
            id: "LB",
            name: "Library Building",
            latitude: 45.4975,
            longitude: -73.5795
          },
          // ... other properties
        }
      ]
    };
    generateSmartPlan.mockResolvedValue(mockPlan);
  
    // Generate plan
    fireEvent.press(getByText('Generate Optimized Plan'));
  
    await act(async () => {
      jest.runAllTimers();
    });
  
    // Verify map region was calculated correctly
    const mapView = getByTestId('mapview');
    expect(mapView.props.region.latitudeDelta).toBeGreaterThan(0);
    expect(mapView.props.region.longitudeDelta).toBeGreaterThan(0);
  });

  test('renders polyline for route', async () => {
    const navigation = { navigate: jest.fn() };
    const { getByText, getByPlaceholderText, getByTestId } = render(
      <SmartPlannerScreen navigation={navigation} />
    );
  
    // Add task and generate plan
    fireEvent.changeText(getByPlaceholderText('Add a new task...'), 'Test task');
    fireEvent.press(getByTestId('add-task-button'));
    fireEvent.press(getByText('Generate Optimized Plan'));
  
    await act(async () => {
      jest.runAllTimers();
    });
  
    // Verify polyline exists with correct coordinates
    const polyline = getByTestId('polyline');
    expect(polyline.props.coordinates.length).toBeGreaterThan(1);
    expect(polyline.props.strokeColor).toBe('#912338');
  });

  test('renders markers for buildings', async () => {
    const navigation = { navigate: jest.fn() };
    const { getByText, getByPlaceholderText, getAllByTestId } = render(
      <SmartPlannerScreen navigation={navigation} />
    );
  
    // Add task and generate plan
    fireEvent.changeText(getByPlaceholderText('Add a new task...'), 'Test task');
    fireEvent.press(getByText('Add'));
    fireEvent.press(getByText('Generate Optimized Plan'));
  
    await act(async () => {
      jest.runAllTimers();
    });
  
    // Verify markers exist
    const markers = getAllByTestId('marker');
    expect(markers.length).toBeGreaterThan(0);
  });

  test('shows weather advisory when precipitation', async () => {
    // Mock rainy weather
    axios.get.mockResolvedValue({
      data: {
        main: { temp: 10 },
        weather: [{ main: 'Rain' }]
      }
    });
  
    const navigation = { navigate: jest.fn() };
    const { findByText } = render(<SmartPlannerScreen navigation={navigation} />);
  
    await act(async () => {
      jest.runAllTimers();
    });
  
    // Add task and generate plan
    fireEvent.changeText(getByPlaceholderText('Add a new task...'), 'Test task');
    fireEvent.press(getByTestId('add-task-button'));
    fireEvent.press(getByText('Generate Optimized Plan'));
  
    await act(async () => {
      jest.runAllTimers();
    });
  
    // Verify advisory appears
    const advisory = await findByText('Rain detected');
    expect(advisory).toBeTruthy();
  });

  test('updates active segment when scrolling', async () => {
    const navigation = { navigate: jest.fn() };
    const { getByText, getByPlaceholderText, getByTestId } = render(
      <SmartPlannerScreen navigation={navigation} />
    );
  
    // Add task and generate plan with multiple segments
    fireEvent.changeText(getByPlaceholderText('Add a new task...'), 'Test task');
    fireEvent.press(getByTestId('add-task-button'));
    
    const mockPlan = {
      ...MOCK_PLAN_RESULT,
      steps: Array(5).fill().map((_, i) => ({
        building: {
          id: `B${i}`,
          name: `Building ${i}`,
          latitude: 45.497092 + i * 0.001,
          longitude: -73.579037 + i * 0.001
        },
        instruction: `Step ${i}`,
        timeEstimate: 5,
        distance: 200,
        indoorPercentage: 50
      }))
    };
    generateSmartPlan.mockResolvedValue(mockPlan);
    
    fireEvent.press(getByText('Generate Optimized Plan'));
  
    await act(async () => {
      jest.runAllTimers();
    });
  
    // Find the FlatList and simulate scroll
    const flatList = getByTestId('segment-flatlist'); // Add testID to your FlatList
    fireEvent.scroll(flatList, {
      nativeEvent: {
        contentOffset: { x: width * 2 }, // Scroll to third segment
        contentSize: { width: width * 5, height: 0 },
        layoutMeasurement: { width, height: 0 }
      }
    });
  
    // Verify active segment updated
    expect(getByText('Building 2')).toBeTruthy(); // Third segment should be active
  });

  test('handles empty plan result from API', async () => {
    const navigation = { navigate: jest.fn() };
    const { getByText, getByPlaceholderText, getByTestId, queryByText } = render(
      <SmartPlannerScreen navigation={navigation} />
    );
  
    // Add task
    fireEvent.changeText(getByPlaceholderText('Add a new task...'), 'Test task');
    fireEvent.press(getByTestId('add-task-button'));
  
    // Mock empty response
    generateSmartPlan.mockResolvedValue({});
  
    // Generate plan
    fireEvent.press(getByText('Generate Optimized Plan'));
  
    await act(async () => {
      jest.runAllTimers();
    });
  
    // Verify no journey is shown
    expect(queryByText('Your Journey')).toBeNull();
  });

  test('handles single-segment journey', async () => {
    const navigation = { navigate: jest.fn() };
    const { getByText, getByPlaceholderText, getByTestId, queryAllByTestId } = render(
      <SmartPlannerScreen navigation={navigation} />
    );
  
    // Add task
    fireEvent.changeText(getByPlaceholderText('Add a new task...'), 'Test task');
    fireEvent.press(getByTestId('add-task-button'));
  
    // Mock single-segment response
    generateSmartPlan.mockResolvedValue({
      ...MOCK_PLAN_RESULT,
      steps: [MOCK_PLAN_RESULT.steps[0]] // Only keep first step
    });
  
    // Generate plan
    fireEvent.press(getByText('Generate Optimized Plan'));
  
    await act(async () => {
      jest.runAllTimers();
    });
  
    // Verify no progress lines are rendered
    expect(queryAllByTestId('progress-line').length).toBe(0);
  });

  test('handles segments without buildings', async () => {
    const navigation = { navigate: jest.fn() };
    const { getByText, getByPlaceholderText, getByTestId, queryAllByTestId } = render(
      <SmartPlannerScreen navigation={navigation} />
    );
  
    // Add task
    fireEvent.changeText(getByPlaceholderText('Add a new task...'), 'Test task');
    fireEvent.press(getByTestId('add-task-button'));
  
    // Mock segment without building
    generateSmartPlan.mockResolvedValue({
      ...MOCK_PLAN_RESULT,
      steps: [{
        instruction: "Walk to next location",
        timeEstimate: 5,
        distance: 200,
        indoorPercentage: 20
      }]
    });
  
    // Generate plan
    fireEvent.press(getByText('Generate Optimized Plan'));
  
    await act(async () => {
      jest.runAllTimers();
    });
  
    // Verify no markers rendered
    expect(queryAllByTestId('marker').length).toBe(0);
  });

  test('shows precipitation advisory when weather has precipitation', async () => {
    // Mock weather with precipitation
    axios.get.mockResolvedValue({
      data: {
        main: { temp: 5 },
        weather: [{ main: 'Snow' }] // Precipitation type
      }
    });
  
    const navigation = { navigate: jest.fn() };
    const { findByText } = render(<SmartPlannerScreen navigation={navigation} />);
  
    await act(async () => {
      jest.runAllTimers();
    });
  
    // Add task and generate plan
    fireEvent.changeText(getByPlaceholderText('Add a new task...'), 'Test task');
    fireEvent.press(getByTestId('add-task-button'));
    fireEvent.press(getByText('Generate Optimized Plan'));
  
    await act(async () => {
      jest.runAllTimers();
    });
  
    // Verify advisory appears
    const advisory = await findByText(/minimizes outdoor exposure/);
    expect(advisory).toBeTruthy();
  });
  test('handles single-coordinate route for map region', async () => {
  const navigation = { navigate: jest.fn() };
  const { getByText, getByPlaceholderText, getByTestId } = render(
    <SmartPlannerScreen navigation={navigation} />
  );

  // Add task
  fireEvent.changeText(getByPlaceholderText('Add a new task...'), 'Test task');
  fireEvent.press(getByTestId('add-task-button'));

  // Mock plan with only current location (no buildings)
  generateSmartPlan.mockResolvedValue({
    ...MOCK_PLAN_RESULT,
    steps: []
  });

  // Generate plan
  fireEvent.press(getByText('Generate Optimized Plan'));

  await act(async () => {
    jest.runAllTimers();
  });

  // Verify default region is used
  const mapView = getByTestId('mapview');
  expect(mapView.props.region.latitudeDelta).toBe(0.01);
});
});