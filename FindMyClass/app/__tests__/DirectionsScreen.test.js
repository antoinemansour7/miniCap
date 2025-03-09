import React from "react";
import { render, screen, fireEvent, waitFor, act } from "@testing-library/react-native";
import DirectionsScreen, {
    fetchRouteData,
    processShuttleMode,
    processRouteData,
    getMetroLineColor,
    detectTransferPoint,
    updateRouteWithMode,
    calculateZoomLevel,
    getCircleRadius,
  } from "../screens/directions.jsx";  
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
describe("getMetroLineColor", () => {
  test("returns green for 'Verte' line", () => {
      expect(getMetroLineColor("Ligne Verte")).toBe("green");
      expect(getMetroLineColor("Verte")).toBe("green");
  });

  test("returns darkblue for 'Bleue' line", () => {
      expect(getMetroLineColor("Ligne Bleue")).toBe("darkblue");
      expect(getMetroLineColor("Bleue")).toBe("darkblue");
  });

  test("returns yellow for 'Jaune' line", () => {
      expect(getMetroLineColor("Ligne Jaune")).toBe("yellow");
      expect(getMetroLineColor("Jaune")).toBe("yellow");
  });

  test("returns orange for 'Orange' line", () => {
      expect(getMetroLineColor("Ligne Orange")).toBe("orange");
      expect(getMetroLineColor("Orange")).toBe("orange");
  });

  test("returns black (#000) for unknown lines", () => {
      expect(getMetroLineColor("Ligne Rouge")).toBe("#000");
      expect(getMetroLineColor("Some Random Line Name")).toBe("#000");
  });
});

describe("calculateZoomLevel", () => {
  test("calculates correct zoom level for given latitude delta", () => {
      expect(calculateZoomLevel({ latitudeDelta: 1 })).toBe(Math.round(Math.log2(360 / 1)));
      expect(calculateZoomLevel({ latitudeDelta: 10 })).toBe(Math.round(Math.log2(360 / 10)));
      expect(calculateZoomLevel({ latitudeDelta: 0.5 })).toBe(Math.round(Math.log2(360 / 0.5)));
  });
});

describe("getCircleRadius", () => {
  test("calculates correct circle radius based on zoom level", () => {
      const zoomLevelValues = [10, 12, 15, 17];
      zoomLevelValues.forEach(zoomLevel => {
          const expectedRadius = 20 * Math.pow(2, (15 - zoomLevel));
          expect(getCircleRadius(zoomLevel)).toBe(expectedRadius);
      });
  });
});

describe("fetchRouteData", () => {
  beforeEach(() => {
      jest.clearAllMocks();
  });

  test("fetches route data successfully", async () => {
      const mockResponse = {
          routes: [{ overview_polyline: { points: "encodedPolyline" } }]
      };

      global.fetch.mockResolvedValue({
          json: jest.fn().mockResolvedValue(mockResponse)
      });

      const start = { latitude: 45.5017, longitude: -73.5673 };
      const end = { latitude: 45.5088, longitude: -73.5617 };
      const mode = "driving";

      const data = await fetchRouteData(start, end, mode);

      expect(global.fetch).toHaveBeenCalledWith(
          expect.stringContaining("https://maps.googleapis.com/maps/api/directions/json"),
      );
      expect(data).toEqual(mockResponse);
  });

  test("throws an error when no route is found", async () => {
      global.fetch.mockResolvedValue({
          json: jest.fn().mockResolvedValue({ routes: [] })
      });

      const start = { latitude: 45.5017, longitude: -73.5673 };
      const end = { latitude: 45.5088, longitude: -73.5617 };
      const mode = "driving";

      await expect(fetchRouteData(start, end, mode)).rejects.toThrow("No route found");
  });

  test("handles fetch errors", async () => {
      global.fetch.mockRejectedValue(new Error("Network error"));

      const start = { latitude: 45.5017, longitude: -73.5673 };
      const end = { latitude: 45.5088, longitude: -73.5617 };
      const mode = "driving";

      await expect(fetchRouteData(start, end, mode)).rejects.toThrow("Network error");
  });
});


describe("detectTransferPoint", () => {
  test("returns null if first step", () => {
      const result = detectTransferPoint([{ travel_mode: "TRANSIT" }], 0, [], {});
      expect(result).toBeNull();
  });

  test("returns first coordinate for walking to transit transfer", () => {
      const steps = [
          { travel_mode: "WALKING" },
          { travel_mode: "TRANSIT", transit_details: { line: { vehicle: { type: "BUS" } } } }
      ];
      const decodedStep = [{ latitude: 45.5, longitude: -73.5 }];
      const result = detectTransferPoint(steps, 1, decodedStep, steps[1].transit_details.line);
      expect(result).toEqual(decodedStep[0]);
  });

  test("returns correct transfer location between different transit types", () => {
      const steps = [
          { travel_mode: "TRANSIT", transit_details: { line: { vehicle: { type: "BUS" } } } },
          { travel_mode: "TRANSIT", transit_details: { line: { vehicle: { type: "SUBWAY" } } } }
      ];
      const decodedStep = [{ latitude: 45.6, longitude: -73.6 }];
      steps[0].transit_details.arrival_stop = { location: { lat: 45.7, lng: -73.7 } };
      
      const result = detectTransferPoint(steps, 1, decodedStep, steps[1].transit_details.line);
      expect(result).toEqual({ latitude: 45.7, longitude: -73.7 });
  });

  test("returns correct transfer point for subway line change", () => {
      const steps = [
          { travel_mode: "TRANSIT", transit_details: { line: { name: "Red Line", vehicle: { type: "SUBWAY" } } } },
          { travel_mode: "TRANSIT", transit_details: { line: { name: "Blue Line", vehicle: { type: "SUBWAY" } } } }
      ];
      const decodedStep = [{ latitude: 45.8, longitude: -73.8 }];

      const result = detectTransferPoint(steps, 1, decodedStep, steps[1].transit_details.line);
      expect(result).toEqual(decodedStep[0]);
  });
});

describe("processRouteData", () => {
  let setCoordinates, setRouteInfo, setDirections, mapRef;

  beforeEach(() => {
      global.setCoordinates = jest.fn();
      global.setRouteInfo = jest.fn();
      global.setDirections = jest.fn();
      global.mapRef = { current: { fitToCoordinates: jest.fn() } };
  });

  test("processes walking step correctly", () => {
      const mockData = {
          routes: [{
              legs: [{
                  distance: { text: "5 km" },
                  duration: { text: "10 mins" },
                  steps: [
                      {
                          travel_mode: "WALKING",
                          polyline: { points: "_encodedPolyline" },
                          html_instructions: "Walk straight",
                          distance: { text: "500m" },
                          duration: { text: "5 mins" }
                      }
                  ]
              }]
          }]
      };

      processRouteData(mockData);

      expect(global.setCoordinates).toHaveBeenCalled();
      expect(global.setRouteInfo).toHaveBeenCalledWith({ distance: "5 km -", duration: "10 mins" });
      expect(global.setDirections).toHaveBeenCalled();
      expect(global.mapRef.current.fitToCoordinates).toHaveBeenCalled();
  });

  test("processes transit step correctly for BUS", () => {
      const mockData = {
          routes: [{
              legs: [{
                  distance: { text: "10 km" },
                  duration: { text: "20 mins" },
                  steps: [
                      {
                          travel_mode: "TRANSIT",
                          polyline: { points: "_encodedPolyline" },
                          transit_details: {
                              line: {
                                  vehicle: { type: "BUS" },
                                  short_name: "Bus 45"
                              }
                          },
                          distance: { text: "10 km" },
                          duration: { text: "20 mins" }
                      }
                  ]
              }]
          }]
      };

      processRouteData(mockData);

      expect(global.setCoordinates).toHaveBeenCalled();
      expect(global.setRouteInfo).toHaveBeenCalledWith({ distance: "10 km -", duration: "20 mins" });
      expect(global.setDirections).toHaveBeenCalled();
  });

  test("processes transit step correctly for SUBWAY", () => {
      const mockData = {
          routes: [{
              legs: [{
                  distance: { text: "15 km" },
                  duration: { text: "30 mins" },
                  steps: [
                      {
                          travel_mode: "TRANSIT",
                          polyline: { points: "_encodedPolyline" },
                          transit_details: {
                              line: {
                                  vehicle: { type: "SUBWAY" },
                                  name: "Metro Green Line"
                              }
                          },
                          distance: { text: "15 km" },
                          duration: { text: "30 mins" }
                      }
                  ]
              }]
          }]
      };

      processRouteData(mockData);

      expect(global.setCoordinates).toHaveBeenCalled();
      expect(global.setRouteInfo).toHaveBeenCalledWith({ distance: "15 km -", duration: "30 mins" });
      expect(global.setDirections).toHaveBeenCalled();
  });
});

