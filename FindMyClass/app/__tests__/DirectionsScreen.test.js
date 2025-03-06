import React from "react";
import { render, screen, fireEvent, waitFor, act } from "@testing-library/react-native";
import DirectionsScreen, {
    fetchRouteData,
    processShuttleMode,
    processRouteData,
    getMetroLineColor,
    detectTransferPoint,
    updateRouteWithMode
  } from "../screens/directions";  
import * as Location from "expo-location";


// Mock expo-router
jest.mock("expo-router", () => ({
  useRouter: jest.fn(() => ({ push: jest.fn() })),
  useLocalSearchParams: jest.fn(() => ({
    destination: JSON.stringify({ latitude: 45.5017, longitude: -73.5673 }),
    buildingName: "Test Building"
  })),
}));

// Mock the entire react-native-maps module
jest.mock('react-native-maps', () => {
  const React = require('react');
  const MapView = ({ children, ...props }) => {
    return <div testID="map-view" {...props}>{children}</div>;
  };
  return {
    __esModule: true,
    default: MapView,
    Marker: ({ children, ...props }) => <div {...props}>{children}</div>,
    Polyline: ({ children, ...props }) => <div {...props}>{children}</div>,
    Circle: ({ children, ...props }) => <div {...props}>{children}</div>,
  };
});

// Mock expo-location
jest.mock("expo-location", () => ({
  requestForegroundPermissionsAsync: jest.fn(() =>
    Promise.resolve({ status: "granted" })
  ),
  getCurrentPositionAsync: jest.fn(() =>
    Promise.resolve({
      coords: { latitude: 45.5017, longitude: -73.5673 },
    })
  ),
  watchPositionAsync: jest.fn(() => ({
    remove: jest.fn(),
  })),
  Accuracy: {
    High: 6,
    Balanced: 3,
    Low: 1,
  },
}));

jest.mock("@gorhom/bottom-sheet", () => {
  const React = require("react");
  return {
    __esModule: true,
    default: React.forwardRef(() => null),
    BottomSheetView: ({ children }) => <>{children}</>,
    BottomSheetFlatList: ({ children }) => <>{children}</>,
  };
});

// Mock LocationSelector component
jest.mock('../../components/directions/LocationSelector', () => {
  return function MockLocationSelector(props) {
    return <div testID="location-selector" {...props} />;
  };
});

// Mock SwipeUpModal component
jest.mock('../../components/directions/SwipeUpModal', () => {
  return function MockSwipeUpModal(props) {
    return <div testID="swipe-up-modal" {...props} />;
  };
});

// Mock ModalSearchBars component
jest.mock('../../components/directions/ModalSearchBars', () => {
  return function MockModalSearchBars(props) {
    return <div testID="modal-search-bars" {...props} />;
  };
});

// Mock global.alert
beforeAll(() => {
  global.alert = jest.fn();
});

// Mock fetch globally
global.fetch = jest.fn(() =>
  Promise.resolve({
    json: () => Promise.resolve({
      status: "OK",
      routes: [{
        overview_polyline: { points: "_p~iF~ps|U_ulLnnqC_mqNvxq`@" },
        legs: [{
          distance: { text: "1.2 km" },
          duration: { text: "15 mins" },
          steps: [{
            html_instructions: "Walk north",
            distance: { text: "100 m" },
            duration: { text: "2 mins" }
          }]
        }]
      }]
    })
  })
);

// Add shuttle coordinates for testing
const LOYOLA_COORDS = { latitude: 45.458424, longitude: -73.640259 };
const SGW_COORDS = { latitude: 45.495729, longitude: -73.578041 };

describe("DirectionsScreen Component", () => {
    beforeEach(() => {
        jest.clearAllMocks();
        global.fetch.mockClear();
    });

    test("renders loading state initially", async () => {
        const { getByText, queryByText } = render(<DirectionsScreen />);
        expect(getByText("Loading route...")).toBeTruthy();
        await waitFor(() => {
            expect(queryByText("Loading route...")).not.toBeTruthy();
        }, { timeout: 5000 }); 
    });
    
    

    test("handles successful location permission", async () => {
        const { getByTestId } = render(<DirectionsScreen />);
        
        await act(async () => {
            await waitFor(() => {
                expect(getByTestId("map-view")).toBeTruthy();
                expect(Location.getCurrentPositionAsync).toHaveBeenCalledWith({
                    accuracy: Location.Accuracy.High
                });
            });
        });
    });

    test("displays user location marker when permission granted", async () => {
        const mockLocation = {
            coords: { latitude: 45.5017, longitude: -73.5673 }
        };
        
        Location.getCurrentPositionAsync.mockResolvedValueOnce(mockLocation);
        
        const { getByTestId } = render(<DirectionsScreen />);
        
        await act(async () => {
            await waitFor(() => {
                expect(getByTestId("map-view")).toBeTruthy();
            });
        });
    });


    test("updates route on location change", async () => {
        const { getByTestId } = render(<DirectionsScreen />);
        
        const mockWatchCallback = jest.fn();
        Location.watchPositionAsync.mockImplementationOnce((options, callback) => {
            mockWatchCallback.mockImplementationOnce(callback);
            return { remove: jest.fn() };
        });

        await act(async () => {
            await waitFor(() => {
                expect(Location.watchPositionAsync).toHaveBeenCalledWith(
                    expect.any(Object),
                    expect.any(Function)
                );
            });
        });
    });


    test("calculates shuttle route between campuses", async () => {
        const { getByTestId } = render(<DirectionsScreen />);
        
        await act(async () => {
            const start = LOYOLA_COORDS;
            const end = SGW_COORDS;
            
            // Simulate shuttle route request directly
            await waitFor(() => {
                getByTestId("location-selector").props.updateRouteWithMode(start, end, 'SHUTTLE');
            });
            
            expect(global.alert).not.toHaveBeenCalled();
        });
    });


    test("handles modal visibility state", async () => {
        const { getByTestId } = render(<DirectionsScreen />);
        
        await act(async () => {
            // Test opening modal
            fireEvent.press(getByTestId("location-selector"));
            
            await waitFor(() => {
                expect(getByTestId("modal-search-bars")).toBeTruthy();
            });
            
            // Test closing modal
            const modalSearchBars = getByTestId("modal-search-bars");
            fireEvent(modalSearchBars, 'handleCloseModal');
        });
    });

    test("handles map region changes", async () => {
        const { getByTestId } = render(<DirectionsScreen />);
        
        await act(async () => {
            const mapView = getByTestId("map-view");
            
            fireEvent(mapView, 'onRegionChangeComplete', {
                latitude: 45.5017,
                longitude: -73.5673,
                latitudeDelta: 0.02,
                longitudeDelta: 0.02
            });
        });
    });

    test("updates custom location details", async () => {
        const { getByTestId } = render(<DirectionsScreen />);
        
        const customLocation = {
            name: "Custom Place",
            coordinates: { 
                latitude: 45.5017, 
                longitude: -73.5673 
            }
        };

        await act(async () => {
            const locationSelector = getByTestId("location-selector");
            fireEvent(locationSelector, 'setCustomLocationDetails', customLocation);
        });
    });


    test("handles polyline rendering with coordinates", async () => {
        const { getByTestId } = render(<DirectionsScreen />);
        const mockCoordinates = [
            { latitude: 45.5017, longitude: -73.5673 },
            { latitude: 45.4958, longitude: -73.5789 }
        ];

        await act(async () => {
            const mapView = getByTestId("map-view");
            fireEvent(mapView, 'setCoordinates', mockCoordinates);
        });
    });

    
});
