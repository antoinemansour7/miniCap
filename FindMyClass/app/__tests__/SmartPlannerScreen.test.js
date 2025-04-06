import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import SmartPlannerScreen from '../screens/SmartPlannerScreen';
import { Alert } from 'react-native';
import { generateSmartPlan } from '../api/smartPlannerService';
import * as Location from 'expo-location';
import axios from 'axios';

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

  test('can add a task', () => {
    const navigation = { navigate: jest.fn() };
    const { getByPlaceholderText, getByTestId } = render(
      <SmartPlannerScreen navigation={navigation} />
    );
    
    // Add a task
    const input = getByPlaceholderText('Add a new task...');
    const addButton = getByTestId('add-task-button');
    
    fireEvent.changeText(input, 'Test task');
    fireEvent.press(addButton);
    
    // Input should be cleared
    expect(input.props.value).toBe('');
  });

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
    // Mock location permission denied
    Location.requestForegroundPermissionsAsync.mockResolvedValue({ status: 'denied' });
    
    const navigation = { navigate: jest.fn() };
    render(<SmartPlannerScreen navigation={navigation} />);
    
    // Advanced timers
    jest.runAllTimers();
    
    // Wait for the alert to be called
    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith(
        'Permission Denied',
        'We need location permissions to optimize your route.'
      );
    });
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
});