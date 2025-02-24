import React from "react";
import { render, screen, fireEvent, waitFor, act } from "@testing-library/react-native";
import DirectionsScreen from "../screens/directions";
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
        await act(async () => {
            const { getByText } = render(<DirectionsScreen />);
            expect(getByText("Loading route...")).toBeTruthy();
        });
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

    test("handles location permission denial", async () => {
        Location.requestForegroundPermissionsAsync.mockResolvedValueOnce({
            status: 'denied'
        });

        const { getByText } = render(<DirectionsScreen />);

        await act(async () => {
            await waitFor(() => {
                expect(getByText(/Location permission denied/i)).toBeTruthy();
            });
        });
    });

    test("handles route updates with different travel modes", async () => {
        const { getByTestId } = render(<DirectionsScreen />);
        
        await act(async () => {
            await waitFor(() => {
                expect(global.fetch).toHaveBeenCalledWith(
                    expect.stringMatching(/mode=walking/i)
                );
            });
        });
    });

    test("handles error states properly", async () => {
        Location.getCurrentPositionAsync.mockRejectedValueOnce(
            new Error("Location error")
        );

        const { getByText } = render(<DirectionsScreen />);

        await act(async () => {
            await waitFor(() => {
                expect(getByText(/Location error/i)).toBeTruthy();
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

    test("cleans up location subscription on unmount", async () => {
        const mockRemove = jest.fn();
        Location.watchPositionAsync.mockImplementationOnce(() => ({
            remove: mockRemove
        }));

        const { unmount } = render(<DirectionsScreen />);
        
        await act(async () => {
            unmount();
            expect(mockRemove).toHaveBeenCalled();
        });
    });

    test("handles network errors during route fetch", async () => {
        global.fetch.mockImplementationOnce(() => 
            Promise.reject(new Error("Network error"))
        );

        const { getByTestId } = render(<DirectionsScreen />);

        await act(async () => {
            await waitFor(() => {
                expect(global.fetch).toHaveBeenCalled();
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

    test("handles invalid shuttle route request", async () => {
        const { getByTestId } = render(<DirectionsScreen />);
        
        await act(async () => {
            const invalidStart = { latitude: 45.1234, longitude: -73.1234 };
            const invalidEnd = { latitude: 45.5678, longitude: -73.5678 };
            
            // Simulate invalid shuttle route request
            await waitFor(() => {
                getByTestId("location-selector").props.updateRouteWithMode(invalidStart, invalidEnd, 'SHUTTLE');
            });
            
            expect(global.alert).toHaveBeenCalledWith(
                "Shuttle Service",
                "Shuttle service is only available between Loyola and SGW campuses.",
                expect.any(Array)
            );
        });
    });

    test("updates route info with valid response", async () => {
        const mockRouteResponse = {
            status: "OK",
            routes: [{
                overview_polyline: { points: "test_polyline" },
                legs: [{
                    distance: { text: "2.5 km" },
                    duration: { text: "30 mins" },
                    steps: [{
                        html_instructions: "Go straight",
                        distance: { text: "1 km" },
                        duration: { text: "10 mins" }
                    }]
                }]
            }]
        };

        global.fetch.mockImplementationOnce(() =>
            Promise.resolve({
                json: () => Promise.resolve(mockRouteResponse)
            })
        );

        const { getByText } = render(<DirectionsScreen />);

        await act(async () => {
            await waitFor(() => {
                expect(getByText("2.5 km -")).toBeTruthy();
                expect(getByText("30 mins")).toBeTruthy();
            });
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

    test("handles route calculation with transit mode", async () => {
        const { getByTestId } = render(<DirectionsScreen />);
        
        await act(async () => {
            const locationSelector = getByTestId("location-selector");
            fireEvent(locationSelector, 'updateRouteWithMode', {
                start: { latitude: 45.5017, longitude: -73.5673 },
                end: { latitude: 45.4958, longitude: -73.5789 },
                mode: 'TRANSIT'
            });
            
            await waitFor(() => {
                expect(global.fetch).toHaveBeenCalledWith(
                    expect.stringMatching(/mode=transit/i)
                );
            });
        });
    });

    test("handles directions data updates", async () => {
        const mockDirections = [{
            id: 0,
            instruction: "Test direction",
            distance: "1 km",
            duration: "10 mins"
        }];

        const { getByTestId } = render(<DirectionsScreen />);
        
        await act(async () => {
            const swipeUpModal = getByTestId("swipe-up-modal");
            fireEvent(swipeUpModal, 'setDirections', mockDirections);
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

    test("handles error in route calculation", async () => {
        global.fetch.mockImplementationOnce(() => 
            Promise.reject(new Error("Route calculation failed"))
        );

        const { getByText } = render(<DirectionsScreen />);

        await act(async () => {
            await waitFor(() => {
                expect(getByText("Route calculation failed")).toBeTruthy();
            });
        });
    });
});
