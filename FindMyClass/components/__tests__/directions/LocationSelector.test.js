import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import LocationSelector from "../../directions/LocationSelector";
import * as Location from "expo-location";

// Mock expo-router
jest.mock('expo-router', () => ({
    useRouter: () => ({
        push: jest.fn(),
    }),
}));

// Mock expo-location
jest.mock("expo-location", () => ({
    getCurrentPositionAsync: jest.fn(),
    Accuracy: { High: 1 }
}));

// Mock the dropdown component
jest.mock('react-native-element-dropdown', () => ({
    Dropdown: ({ onChange, testID }) => (
        <mock-dropdown testID={testID} onChangeText={onChange} />
    ),
}));

// Mock icons
jest.mock('@expo/vector-icons', () => ({
    Ionicons: 'mock-ionicons',
    FontAwesome: 'mock-fontawesome',
    FontAwesome5: 'mock-fontawesome5',
}));

describe("LocationSelector Component", () => {
    const mockProps = {
        startLocation: null,
        setStartLocation: jest.fn(),
        customStartName: "Custom Place",
        selectedStart: "userLocation",
        setSelectedStart: jest.fn(),
        userLocation: { latitude: 0, longitude: 0 },
        setUserLocation: jest.fn(),
        buildingName: "Building A",
        destinationName: "Destination B",
        destination: { latitude: 1, longitude: 1 },
        parsedDestination: { latitude: 2, longitude: 2 },
        selectedDest: "current",
        setSelectedDest: jest.fn(),
        setDestination: jest.fn(),
        setDestinationName: jest.fn(),
        travelMode: "DRIVING",
        setTravelMode: jest.fn(),
        setIsModalVisible: jest.fn(),
        setSearchType: jest.fn(),
        updateRouteWithMode: jest.fn(),
        updateRoute: jest.fn(),
        style: {},
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("renders correctly", () => {
        const { getByTestId } = render(<LocationSelector {...mockProps} />);
        expect(getByTestId("back-button")).toBeTruthy();
        expect(getByTestId("dropdown-start")).toBeTruthy();
        expect(getByTestId("dropdown-dest")).toBeTruthy();
    });

    it("handles travel mode changes correctly", () => {
        const { getByTestId } = render(<LocationSelector {...mockProps} />);
        const walkingMode = getByTestId("travel-mode-walking");
        fireEvent.press(walkingMode);
        expect(mockProps.setTravelMode).toHaveBeenCalledWith("WALKING");
        expect(mockProps.updateRouteWithMode).toHaveBeenCalledWith(
            mockProps.userLocation,
            mockProps.destination,
            "WALKING"
        );
    });

    it("handles back button press", () => {
        const { getByTestId } = render(<LocationSelector {...mockProps} />);
        const backButton = getByTestId("back-button");
        fireEvent.press(backButton);

    });
});