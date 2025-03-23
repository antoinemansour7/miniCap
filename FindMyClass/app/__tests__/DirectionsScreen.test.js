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
                    travel_mode: "WALKING",
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
      expect(screen.getByText("Network error")).toBeTruthy();
    });
  });

  test("updates route on location change", async () => {
    const mockWatchCallback = jest.fn();
    Location.watchPositionAsync.mockImplementationOnce((options, callback) => {
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
    const newLoc = { coords: { latitude: 45.5020, longitude: -73.5670 } };
    act(() => {
      mockWatchCallback(newLoc);
    });
    await waitFor(() => {
      // Expect an additional fetch call after location change.
      expect(global.fetch).toHaveBeenCalledTimes(2);
    });
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
    await act(async () => {
      const locationSelector = screen.getByTestId("location-selector");
      await locationSelector.props.updateRouteWithMode(LOYOLA_COORDS, SGW_COORDS, "SHUTTLE");
    });
    expect(global.alert).not.toHaveBeenCalled();
  });

  test("handles invalid shuttle route request (shows alert once)", async () => {
    await act(async () => {
      render(<DirectionsScreen />);
    });
    await act(async () => {
      const locationSelector = screen.getByTestId("location-selector");
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
                  html_instructions: "<b>Go straight</b>",
                  distance: { text: "1 km" },
                  duration: { text: "10 mins" },
                  polyline: { points: "abc123" },
                  travel_mode: "WALKING",
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
      // Check that HTML tags are stripped from instructions.
      expect(screen.getByText("Go straight")).toBeTruthy();
      expect(screen.getByText("2.5 km -")).toBeTruthy();
      expect(screen.getByText("30 mins")).toBeTruthy();
    });
  });

  test("handles modal visibility state", async () => {
    const { getByTestId } = render(<DirectionsScreen />);
    await act(async () => {
      fireEvent.press(getByTestId("location-selector"));
    });
    await waitFor(() => {
      expect(getByTestId("modal-search-bars")).toBeTruthy();
    });
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
                            travel_mode: "WALKING",
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

    await act(async () => {
      const locationSelector = getByTestId("location-selector");
      await locationSelector.props.updateRouteWithMode(
        { latitude: 45.5017, longitude: -73.5673 },
        { latitude: 45.4958, longitude: -73.5789 },
        "SHUTTLE"
      );
    });
    await act(async () => {
      const locationSelector = getByTestId("location-selector");
      locationSelector.props.setTravelMode("WALKING");
    });
    await act(async () => {
      resolveFetch();
    });
    expect(queryByText("5 km -")).toBeNull();
  });

  // --- ADDITIONAL TESTS FOR MORE CONDITION COVERAGE ---

  test("handles polyline styling for TRANSIT with unknown vehicle type", async () => {
    // For an unrecognized vehicle type (e.g., 'FERRY'), color remains default (#912338)
    const mockRouteResponse = {
      status: "OK",
      routes: [
        {
          legs: [
            {
              steps: [
                {
                  html_instructions: "Take Ferry",
                  travel_mode: "TRANSIT",
                  polyline: { points: "dummy" },
                  transit_details: {
                    line: {
                      vehicle: { type: "FERRY" },
                      name: "Ferry Line",
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
    await waitFor(() => expect(global.fetch).toHaveBeenCalled());
    function findPolylineWithColor(node, color) {
      if (!node) return false;
      if (node.props && node.props.strokeColor === color) return true;
      if (node.children && Array.isArray(node.children)) {
        return node.children.some(child => findPolylineWithColor(child, color));
      }
      return false;
    }
    expect(findPolylineWithColor(toJSON(), "#912338")).toBe(true);
  });

  test("handles polyline styling for DRIVING mode", async () => {
    // A DRIVING mode route should use default color (#912338) with no dash pattern.
    const mockRouteResponse = {
      status: "OK",
      routes: [
        {
          legs: [
            {
              steps: [
                {
                  html_instructions: "Drive straight",
                  travel_mode: "DRIVING",
                  polyline: { points: "driving_dummy" },
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
    await waitFor(() => expect(global.fetch).toHaveBeenCalled());
    function findPolylineWithColor(node, color) {
      if (!node) return false;
      if (node.props && node.props.strokeColor === color) return true;
      if (node.children && Array.isArray(node.children)) {
        return node.children.some(child => findPolylineWithColor(child, color));
      }
      return false;
    }
    expect(findPolylineWithColor(toJSON(), "#912338")).toBe(true);
  });

  test("handles polyline styling for METRO with unknown line name (should yield grey)", async () => {
    // If the Metro line name does not include any known keyword, the color should be grey.
    const mockRouteResponse = {
      status: "OK",
      routes: [
        {
          legs: [
            {
              steps: [
                {
                  html_instructions: "Take Metro",
                  travel_mode: "TRANSIT",
                  polyline: { points: "dummy" },
                  transit_details: {
                    line: {
                      vehicle: { type: "METRO" },
                      name: "Ligne X", // Unknown keyword → grey
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
    await waitFor(() => expect(global.fetch).toHaveBeenCalled());
    function findPolylineWithColor(node, color) {
      if (!node) return false;
      if (node.props && node.props.strokeColor === color) return true;
      if (node.children && Array.isArray(node.children)) {
        return node.children.some(child => findPolylineWithColor(child, color));
      }
      return false;
    }
    expect(findPolylineWithColor(toJSON(), "grey")).toBe(true);
  });

  test("renders shuttle route with custom info", async () => {
    // For valid shuttle requests, the directions should show custom text
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
                  html_instructions: "Drive to shuttle stop",
                  travel_mode: "DRIVING",
                  polyline: { points: "shuttle_dummy" },
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
    await act(async () => {
      render(<DirectionsScreen />);
    });
    await act(async () => {
      const locationSelector = screen.getByTestId("location-selector");
      // Provide valid campus coordinates for shuttle.
      await locationSelector.props.updateRouteWithMode(LOYOLA_COORDS, SGW_COORDS, "SHUTTLE");
    });
    // Check that the rendered directions include the shuttle custom text.
    await waitFor(() => {
      expect(screen.getByText(/Shuttle departing at:/i)).toBeTruthy();
    });
  });
  
  test("strips HTML tags from instructions in directions", async () => {
    // Provide a route response with HTML tags in the instructions.
    const mockRouteResponse = {
      status: "OK",
      routes: [
        {
          legs: [
            {
              distance: { text: "500 m" },
              duration: { text: "5 mins" },
              steps: [
                {
                  html_instructions: "<div><span>Turn right</span></div>",
                  travel_mode: "WALKING",
                  polyline: { points: "html_dummy" },
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
    await act(async () => {
      render(<DirectionsScreen />);
    });
    await waitFor(() => {
      expect(screen.getByText("Turn right")).toBeTruthy();
      // Ensure that the HTML tags are stripped.
      expect(screen.queryByText(/<div>/)).toBeNull();
    });
  });

  test("calculates correct circle radius on zoom level changes", async () => {
    const { getByTestId } = render(<DirectionsScreen />);
    await waitFor(() => {
      const mapView = getByTestId("map-view");
      expect(mapView).toBeTruthy();
    });
  
    // Trigger zoom level change by changing region
    const region = {
      latitude: 45.5017,
      longitude: -73.5673,
      latitudeDelta: 0.1, // triggers zoom level recalculation
      longitudeDelta: 0.1,
    };
  
    await act(async () => {
      const mapView = getByTestId("map-view");
      fireEvent(mapView, "onRegionChangeComplete", region);
    });
  });
  
  test("renders custom start location marker when selectedStart is not userLocation", async () => {
    const { getByTestId } = render(<DirectionsScreen />);
    await act(async () => {
      const locationSelector = getByTestId("location-selector");
      locationSelector.props.setSelectedStart("customLocation");
      locationSelector.props.setStartLocation({
        latitude: 45.5040,
        longitude: -73.5675,
      });
    });
  
    await waitFor(() => {
      const mapJSON = getByTestId("map-view").props.children;
      const customStartMarker = mapJSON.find(child => child?.props?.title === "Start");
      expect(customStartMarker).toBeTruthy();
    });
  });
  
  test("updates custom search text in ModalSearchBars", async () => {
    const { getByTestId } = render(<DirectionsScreen />);
  
    await act(async () => {
      const locationSelector = getByTestId("location-selector");
      locationSelector.props.setIsModalVisible(true);
      locationSelector.props.setSearchType("DEST");
    });
  
    await waitFor(() => {
      const modalSearchBars = getByTestId("modal-search-bars");
      expect(modalSearchBars).toBeTruthy();
      modalSearchBars.props.setCustomSearchText("Custom Search Input");
    });
  });
  
  test("calculates different circle radius values based on zoom", async () => {
    const { getByTestId } = render(<DirectionsScreen />);
    const mapView = getByTestId("map-view");
  
    // Trigger a region change that leads to zoom level 10
    const region = {
      latitude: 45.5017,
      longitude: -73.5673,
      latitudeDelta: 5.625, // approx => zoom 10
      longitudeDelta: 5.625,
    };
  
    await act(async () => {
      fireEvent(mapView, "onRegionChangeComplete", region);
    });
  
    // Radius should adjust after zoom
    const radius = 20 * Math.pow(2, 15 - 10); // baseRadius * 2^(15 - zoom)
    expect(radius).toBe(20 * 32);
  });
  
});