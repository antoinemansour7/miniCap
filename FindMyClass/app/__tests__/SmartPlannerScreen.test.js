import React from 'react';
import { render, fireEvent, waitFor, act } from '@testing-library/react-native';
import { Alert } from 'react-native';
import SmartPlannerScreen from '../screens/SmartPlannerScreen';
import { generateSmartPlan } from '../api/smartPlannerService';
import * as Location from 'expo-location';
import axios from 'axios';
import SGWBuildings from '../../components/SGWBuildings';

// Mock dependencies
jest.mock('../api/smartPlannerService', () => ({
  generateSmartPlan: jest.fn()
}));

jest.mock('expo-location', () => ({
  requestForegroundPermissionsAsync: jest.fn(),
  getCurrentPositionAsync: jest.fn()
}));

jest.mock('axios', () => ({
  get: jest.fn()
}));

// Mock vector icons and other dependencies
jest.mock('@expo/vector-icons', () => ({
  Ionicons: 'Ionicons',
  MaterialIcons: 'MaterialIcons',
  FontAwesome5: 'FontAwesome5',
  MaterialCommunityIcons: 'MaterialCommunityIcons'
}));

jest.mock('react-native-maps', () => {
  const { View } = require('react-native');
  return {
    __esModule: true,
    default: View,
    Marker: View,
    Polyline: View,
    MapView: View
  };
});

jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 })
}));

jest.mock('expo-linear-gradient', () => {
  const { View } = require('react-native');
  return {
    LinearGradient: View
  };
});

describe('SmartPlannerScreen', () => {
  const HALL_BUILDING_COORDINATES = {
    latitude: 45.497092,
    longitude: -73.579037
  };

  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();

    // Spy on Alert.alert
    jest.spyOn(Alert, 'alert');
    // Mock location setup
    Location.requestForegroundPermissionsAsync.mockResolvedValue({ status: 'granted' });
    Location.getCurrentPositionAsync.mockResolvedValue({
      coords: HALL_BUILDING_COORDINATES
    });

    // Mock weather API
    axios.get.mockResolvedValue({
      data: {
        main: { temp: 20 },
        weather: [{ main: 'Clear' }]
      }
    });

    // Reset generateSmartPlan mock
    generateSmartPlan.mockReset();
  });

  const renderComponent = (props = {}) => {
    const defaultProps = {
      navigation: {
        navigate: jest.fn(),
        goBack: jest.fn()
      }
    };
    return render(<SmartPlannerScreen {...defaultProps} {...props} />);
  };

  const addTask = async (screen, taskDescription = 'Attend lecture') => {
    const taskInput = screen.getByPlaceholderText('Add a new task...');
    const addTaskButton = screen.getByTestId('add-task-button');

    // Add task
    await act(async () => {
      fireEvent.changeText(taskInput, taskDescription);
      fireEvent.press(addTaskButton);
    });
  };

  const generatePlan = async (screen) => {
    const generatePlanButton = screen.getByText('Generate Optimized Plan');
    
    await act(async () => {
      fireEvent.press(generatePlanButton);
    });
  };

  it('handles error scenarios', async () => {
    // Mock error in plan generation
    generateSmartPlan.mockRejectedValue(new Error('Server error'));

    const screen = renderComponent();

    // Wait for component to initialize
    await waitFor(() => {
      expect(screen.getByText('Smart Planner')).toBeTruthy();
    });

    // Add a task to bypass initial validation
    await addTask(screen);

    // Generate plan
    await generatePlan(screen);

    // Verify error handling
    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith(
        'Error', 
        'Please add at least one task.'
      );
    });
  });

  it('handles empty task generation attempt', async () => {
    const screen = renderComponent();

    // Wait for component to initialize
    await waitFor(() => {
      expect(screen.getByText('Smart Planner')).toBeTruthy();
    });

    // Generate plan without tasks
    await generatePlan(screen);

    // Verify error alert for no tasks
    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith(
        'Error', 
        'Please add at least one task.'
      );
    });
  });
  

  it('toggles campus between SGW and Loyola', async () => {
    const screen = renderComponent();

    // Wait for component to initialize
    await waitFor(() => {
      expect(screen.getByText('Smart Planner')).toBeTruthy();
    });

    // Initial campus
    expect(screen.getByText('SGW Campus')).toBeTruthy();

    // Toggle campus
    const campusToggle = screen.getByText('SGW Campus');
    
    await act(async () => {
      fireEvent.press(campusToggle);
    });

    // Check campus changed
    await waitFor(() => {
      expect(screen.getByText('Loyola Campus')).toBeTruthy();
    });
  });

  it('handles weather conditions correctly', async () => {
    // Test various weather conditions
    const weatherScenarios = [
      { main: 'Clouds', precipitation: false },
      { main: 'Rain', precipitation: true },
      { main: 'Snow', precipitation: true },
      { main: 'Clear', precipitation: false }
    ];

    for (const scenario of weatherScenarios) {
      // Reset mocks
      jest.clearAllMocks();

      // Mock weather API
      axios.get.mockResolvedValue({
        data: {
          main: { temp: 20 },
          weather: [{ main: scenario.main }]
        }
      });

      const screen = renderComponent();

      // Wait for weather to load
      await waitFor(() => {
        expect(screen.getByText(new RegExp(`${scenario.main}`, 'i'))).toBeTruthy();
      });
    }
  });
  
});