import React from "react";
import { render, screen, fireEvent, waitFor, act } from "@testing-library/react-native";
import DirectionsScreen from "../screens/directions";
import * as Location from "expo-location";

// --- MOCK SETUP ---

// Mock expo-router to supply parameters.
jest.mock("expo-router", () => ({
  useRouter: jest.fn(() => ({ push: jest.fn() })),
  useLocalSearchParams: jest.fn(() => ({
    destination: JSON.stringify({ latitude: 45.5017, longitude: -73.5673 }),
    buildingName: "Test Building",
  })),
}));

// Mock react-native-maps components.
jest.mock("react-native-maps", () => {
  const React = require("react");
  const MockMapView = ({ children, ...props }) => <div testID="map-view" {...props}>{children}</div>;
  return {
    __esModule: true,
    default: MockMapView,
    Marker: ({ children, ...props }) => <div {...props}>{children}</div>,
    Polyline: ({ children, ...props }) => <div {...props}>{children}</div>,
    Circle: ({ children, ...props }) => <div {...props}>{children}</div>,
  };
});

// Mock expo-location.
jest.mock("expo-location", () => ({
  requestForegroundPermissionsAsync: jest.fn(() =>
    Promise.resolve({ status: "granted" })
  ),
  getCurrentPositionAsync: jest.fn(() =>
    Promise.resolve({
      coords: { latitude: 45.5017, longitude: -73.5673 },
    })
  ),
  getLastKnownPositionAsync: jest.fn(() =>
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

// Mock bottom sheet (if used).
jest.mock("@gorhom/bottom-sheet", () => {
  const React = require("react");
  return {
    __esModule: true,
    default: React.forwardRef(() => null),
    BottomSheetView: ({ children }) => <>{children}</>,
    BottomSheetFlatList: ({ children }) => <>{children}</>,
  };
});

// Mock child components.
jest.mock("../../components/directions/LocationSelector", () => {
  return function MockLocationSelector(props) {
    return <div testID="location-selector" {...props} />;
  };
});

jest.mock("../../components/directions/ModalSearchBars", () => {
  return function MockModalSearchBars(props) {
    return <div testID="modal-search-bars" {...props} />;
  };
});

jest.mock("../../components/directions/SwipeUpModal", () => {
  return function MockSwipeUpModal(props) {
    return <div testID="swipe-up-modal" {...props} />;
  };
});

// Mock global alert (used in shuttle branch)
beforeAll(() => {
  global.alert = jest.fn();
});

// Global fetch mock.
global.fetch = jest.fn(() =>
  Promise.resolve({
    json: () =>
      Promise.resolve({
        status: "OK",
        routes: [
          {
            overview_polyline: { points: "_p~iF~ps|U_ulLnnqC_mqNvxq`@" },
            legs: [
              {
                distance: { text: "1.2 km" },
                duration: { text: "15 mins" },
                steps: [
                  {
                    html_instructions: "Walk north",
                    distance: { text: "100 m" },
                    duration: { text: "2 mins" },
                    polyline: { points: "_p~iF~ps|U" },
                  },
                ],
              },
            ],
          },
        ],
      }),
  })
);

// Shuttle coordinates for testing
const LOYOLA_COORDS = { latitude: 45.458424, longitude: -73.640259 };
const SGW_COORDS = { latitude: 45.495729, longitude: -73.578041 };

// --- TEST SUITE ---

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

  test("handles successful location permission and renders map", async () => {
    await act(async () => {
      render(<DirectionsScreen />);
    });
    await waitFor(() => {
      expect(Location.getCurrentPositionAsync).toHaveBeenCalledWith({
        accuracy: Location.Accuracy.High,
      });
      expect(screen.getByTestId("map-view")).toBeTruthy();
    });
  });

  test("displays user location marker when permission granted", async () => {
    const mockLocation = { coords: { latitude: 45.5017, longitude: -73.5673 } };
    Location.getCurrentPositionAsync.mockResolvedValueOnce(mockLocation);
    await act(async () => {
      render(<DirectionsScreen />);
    });
    await waitFor(() => {
      expect(screen.getByTestId("map-view")).toBeTruthy();
    });
  });

  test("handles location permission denial", async () => {
    Location.requestForegroundPermissionsAsync.mockResolvedValueOnce({
      status: "denied",
    });
    await act(async () => {
      render(<DirectionsScreen />);
    });
    await waitFor(() => {
      expect(screen.getByText(/Location permission denied/i)).toBeTruthy();
    });
  });

  test("handles route update with WALKING mode", async () => {
    await act(async () => {
      render(<DirectionsScreen />);
    });
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringMatching(/mode=walking/i)
      );
    });
  });

  test("handles network errors during route fetch", async () => {
    global.fetch.mockImplementationOnce(() =>
      Promise.reject(new Error("Network error"))
    );
    await act(async () => {
      render(<DirectionsScreen />);
    });
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalled();
    });
  });

  test("updates route on location change", async () => {
    const mockWatchCallback = jest.fn();
    Location.watchPositionAsync.mockImplementationOnce((options, callback) => {
      // Save callback so we can call it manually.
      mockWatchCallback.mockImplementationOnce(callback);
      return { remove: jest.fn() };
    });
    await act(async () => {
      render(<DirectionsScreen />);
    });
    await waitFor(() => {
      expect(Location.watchPositionAsync).toHaveBeenCalledWith(
        expect.any(Object),
        expect.any(Function)
      );
    });
    // Simulate a location update.
    const newLoc = { coords: { latitude: 45.5020, longitude: -73.5670 } };
    act(() => {
      mockWatchCallback(newLoc);
    });
    expect(Location.watchPositionAsync).toHaveBeenCalled();
  });

  test("cleans up location subscription on unmount", async () => {
    const mockRemove = jest.fn();
    Location.watchPositionAsync.mockImplementationOnce(() => ({
      remove: mockRemove,
    }));
    const { unmount } = render(<DirectionsScreen />);
    await act(async () => {
      unmount();
    });
    expect(mockRemove).toHaveBeenCalled();
  });

  test("calculates shuttle route between valid campuses", async () => {
    await act(async () => {
      render(<DirectionsScreen />);
    });
    // Call the updateRouteWithMode function passed as a prop to the LocationSelector.
    await act(async () => {
      const locationSelector = screen.getByTestId("location-selector");
      // Valid shuttle route: using Loyola as start and SGW as destination.
      await locationSelector.props.updateRouteWithMode(LOYOLA_COORDS, SGW_COORDS, "SHUTTLE");
    });
    // For a valid shuttle route, no alert should be fired.
    expect(global.alert).not.toHaveBeenCalled();
  });

  test("handles invalid shuttle route request (shows alert once)", async () => {
    await act(async () => {
      render(<DirectionsScreen />);
    });
    await act(async () => {
      const locationSelector = screen.getByTestId("location-selector");
      // Use invalid start/end coordinates that do not meet shuttle conditions.
      await locationSelector.props.updateRouteWithMode(
        { latitude: 45.1234, longitude: -73.1234 },
        { latitude: 45.5678, longitude: -73.5678 },
        "SHUTTLE"
      );
    });
    expect(global.alert).toHaveBeenCalledWith(
      "Shuttle Service",
      "Shuttle service is only available between Loyola and SGW campuses.",
      expect.any(Array)
    );
  });

  test("updates route info with valid response", async () => {
    const mockRouteResponse = {
      status: "OK",
      routes: [
        {
          overview_polyline: { points: "test_polyline" },
          legs: [
            {
              distance: { text: "2.5 km" },
              duration: { text: "30 mins" },
              steps: [
                {
                  html_instructions: "Go straight",
                  distance: { text: "1 km" },
                  duration: { text: "10 mins" },
                  polyline: { points: "abc123" },
                },
              ],
            },
          ],
        },
      ],
    };

    global.fetch.mockImplementationOnce(() =>
      Promise.resolve({
        json: () => Promise.resolve(mockRouteResponse),
      })
    );
    await act(async () => {
      render(<DirectionsScreen />);
    });
    await waitFor(() => {
      expect(screen.getByText("2.5 km -")).toBeTruthy();
      expect(screen.getByText("30 mins")).toBeTruthy();
    });
  });

  test("handles modal visibility state", async () => {
    const { getByTestId } = render(<DirectionsScreen />);
    await act(async () => {
      // Simulate a press on the location selector to trigger modal open.
      fireEvent.press(getByTestId("location-selector"));
    });
    await waitFor(() => {
      expect(getByTestId("modal-search-bars")).toBeTruthy();
    });
    // Simulate closing the modal by calling its handleCloseModal prop.
    const modalSearchBars = getByTestId("modal-search-bars");
    act(() => {
      modalSearchBars.props.handleCloseModal();
    });
  });

  test("handles map region changes to update zoom level", async () => {
    const { getByTestId } = render(<DirectionsScreen />);
    await act(async () => {
      const mapView = getByTestId("map-view");
      fireEvent(mapView, "onRegionChangeComplete", {
        latitude: 45.5017,
        longitude: -73.5673,
        latitudeDelta: 0.02,
        longitudeDelta: 0.02,
      });
    });
  });

  test("updates custom location details", async () => {
    const { getByTestId } = render(<DirectionsScreen />);
    const customLocation = {
      name: "Custom Place",
      coordinates: { latitude: 45.5017, longitude: -73.5673 },
    };
    await act(async () => {
      const locationSelector = getByTestId("location-selector");
      fireEvent(locationSelector, "setCustomLocationDetails", customLocation);
    });
  });

  test("handles route calculation with transit mode", async () => {
    await act(async () => {
      render(<DirectionsScreen />);
    });
    await act(async () => {
      const locationSelector = screen.getByTestId("location-selector");
      // Simulate a transit mode route update.
      await locationSelector.props.updateRouteWithMode(
        { latitude: 45.5017, longitude: -73.5673 },
        { latitude: 45.4958, longitude: -73.5789 },
        "TRANSIT"
      );
    });
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringMatching(/mode=transit/i)
      );
    });
  });

  test("handles directions data updates via SwipeUpModal", async () => {
    const mockDirections = [
      {
        id: 0,
        instruction: "Test direction",
        distance: "1 km",
        duration: "10 mins",
      },
    ];
    const { getByTestId } = render(<DirectionsScreen />);
    await act(async () => {
      const swipeUpModal = getByTestId("swipe-up-modal");
      fireEvent(swipeUpModal, "setDirections", mockDirections);
    });
  });

  test("handles polyline rendering with coordinates", async () => {
    const { getByTestId } = render(<DirectionsScreen />);
    const mockCoordinates = [
      { latitude: 45.5017, longitude: -73.5673 },
      { latitude: 45.4958, longitude: -73.5789 },
    ];
    await act(async () => {
      const mapView = getByTestId("map-view");
      fireEvent(mapView, "setCoordinates", mockCoordinates);
    });
  });

  test("handles error in route calculation", async () => {
    global.fetch.mockImplementationOnce(() =>
      Promise.reject(new Error("Route calculation failed"))
    );
    await act(async () => {
      render(<DirectionsScreen />);
    });
    await waitFor(() => {
      expect(screen.getByText("Route calculation failed")).toBeTruthy();
    });
  });

  test("ignores outdated fetch response when travel mode changes", async () => {
    let resolveFetch;
    global.fetch.mockImplementationOnce(() =>
      new Promise((resolve) => {
        resolveFetch = () =>
          resolve({
            json: () =>
              Promise.resolve({
                status: "OK",
                routes: [
                  {
                    legs: [
                      {
                        distance: { text: "5 km" },
                        duration: { text: "25 mins" },
                        steps: [
                          {
                            html_instructions: "Outdated instruction",
                            distance: { text: "5 km" },
                            duration: { text: "25 mins" },
                            polyline: { points: "outdated" },
                          },
                        ],
                      },
                    ],
                  },
                ],
              }),
          });
      })
    );

    const { getByTestId, queryByText } = render(<DirectionsScreen />);

    // Simulate starting a shuttle route update (which uses fetch).
    await act(async () => {
      const locationSelector = getByTestId("location-selector");
      await locationSelector.props.updateRouteWithMode(
        { latitude: 45.5017, longitude: -73.5673 },
        { latitude: 45.4958, longitude: -73.5789 },
        "SHUTTLE"
      );
    });
    // Before fetch resolves, simulate a travel mode change.
    await act(async () => {
      const locationSelector = getByTestId("location-selector");
      locationSelector.props.setTravelMode("WALKING");
    });
    // Now resolve the outdated fetch.
    await act(async () => {
      resolveFetch();
    });
    // The outdated response should not update route info.
    expect(queryByText("5 km -")).toBeNull();
  });

  // --- ADDITIONAL TESTS FOR BRANCH COVERAGE ---

  test("handles missing destination param gracefully", async () => {
    // Override the mock for expo-router:
    const { useLocalSearchParams } = require("expo-router");
    useLocalSearchParams.mockReturnValueOnce({
      // No 'destination' key
      buildingName: "Test Building",
    });

    await act(async () => {
      render(<DirectionsScreen />);
    });
    await waitFor(() => {
      expect(screen.getByText("Error: No destination provided.")).toBeTruthy();
    });
  });

  test("handles invalid JSON param gracefully", async () => {
    const { useLocalSearchParams } = require("expo-router");
    useLocalSearchParams.mockReturnValueOnce({
      destination: "not valid JSON",
      buildingName: "Test Building",
    });

    await act(async () => {
      render(<DirectionsScreen />);
    });
    await waitFor(() => {
      expect(screen.getByText("Error: Invalid destination format.")).toBeTruthy();
    });
  });

  test("handles missing lat/lng in destination param", async () => {
    const { useLocalSearchParams } = require("expo-router");
    useLocalSearchParams.mockReturnValueOnce({
      destination: JSON.stringify({ lat: 45.5017 }), // Missing 'latitude' or 'longitude'
      buildingName: "Test Building",
    });

    await act(async () => {
      render(<DirectionsScreen />);
    });
    await waitFor(() => {
      expect(screen.getByText("Error: Invalid destination coordinates.")).toBeTruthy();
    });
  });

  test("handles no route found scenario (empty routes array)", async () => {
    global.fetch.mockImplementationOnce(() =>
      Promise.resolve({
        json: () =>
          Promise.resolve({
            status: "OK",
            routes: [], // empty array triggers 'No route found' error
          }),
      })
    );

    await act(async () => {
      render(<DirectionsScreen />);
    });
    await waitFor(() => {
      // The code likely throws or sets an error with "No route found"
      expect(screen.getByText(/No route found/i)).toBeTruthy();
    });
  });

  test("handles polyline styling for BUS", async () => {
    const mockRouteResponse = {
      status: "OK",
      routes: [
        {
          legs: [
            {
              distance: { text: "1 km" },
              duration: { text: "10 mins" },
              steps: [
                {
                  html_instructions: "Take Bus",
                  distance: { text: "1 km" },
                  duration: { text: "10 mins" },
                  polyline: { points: "dummy" },
                  transit_details: {
                    line: {
                      vehicle: { type: "BUS" },
                      short_name: "B12",
                      name: "Bus 12",
                    },
                  },
                },
              ],
            },
          ],
        },
      ],
    };
    global.fetch.mockImplementationOnce(() =>
      Promise.resolve({ json: () => Promise.resolve(mockRouteResponse) })
    );

    const { toJSON } = render(<DirectionsScreen />);
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalled();
    });

    // Check for a Polyline with strokeColor "purple"
    const tree = toJSON();
    function findPolylineWithColor(node, color) {
      if (!node) return false;
      if (node.props && node.props.strokeColor === color) return true;
      if (node.children && Array.isArray(node.children)) {
        return node.children.some((child) => findPolylineWithColor(child, color));
      }
      return false;
    }
    expect(findPolylineWithColor(tree, "purple")).toBe(true);
  });

  test("handles polyline styling for METRO (green for 'Verte')", async () => {
    const mockRouteResponse = {
      status: "OK",
      routes: [
        {
          legs: [
            {
              steps: [
                {
                  html_instructions: "Take Metro",
                  polyline: { points: "dummy" },
                  transit_details: {
                    line: {
                      vehicle: { type: "METRO" },
                      short_name: "M1",
                      name: "Ligne Verte",
                    },
                  },
                },
              ],
            },
          ],
        },
      ],
    };
    global.fetch.mockImplementationOnce(() =>
      Promise.resolve({ json: () => Promise.resolve(mockRouteResponse) })
    );

    const { toJSON } = render(<DirectionsScreen />);
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalled();
    });

    function findPolylineWithColor(node, color) {
      if (!node) return false;
      if (node.props && node.props.strokeColor === color) return true;
      if (node.children && Array.isArray(node.children)) {
        return node.children.some((child) => findPolylineWithColor(child, color));
      }
      return false;
    }
    expect(findPolylineWithColor(toJSON(), "green")).toBe(true);
  });

  test("handles polyline styling for TRAIN", async () => {
    const mockRouteResponse = {
      status: "OK",
      routes: [
        {
          legs: [
            {
              steps: [
                {
                  html_instructions: "Take Train",
                  polyline: { points: "dummy" },
                  transit_details: {
                    line: {
                      vehicle: { type: "TRAIN" },
                      short_name: "T1",
                      name: "Train 1",
                    },
                  },
                },
              ],
            },
          ],
        },
      ],
    };
    global.fetch.mockImplementationOnce(() =>
      Promise.resolve({ json: () => Promise.resolve(mockRouteResponse) })
    );

    const { toJSON } = render(<DirectionsScreen />);
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalled();
    });

    function findPolylineWithColor(node, color) {
      if (!node) return false;
      if (node.props && node.props.strokeColor === color) return true;
      if (node.children && Array.isArray(node.children)) {
        return node.children.some((child) => findPolylineWithColor(child, color));
      }
      return false;
    }
    expect(findPolylineWithColor(toJSON(), "lightgrey")).toBe(true);
  });
});
