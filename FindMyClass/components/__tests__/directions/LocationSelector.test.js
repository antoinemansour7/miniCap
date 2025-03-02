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

    it("handles start location change to SGW Campus", () => {
        const { getByTestId } = render(<LocationSelector {...mockProps} />);
        const dropdown = getByTestId("dropdown-start");
        
        fireEvent(dropdown, 'onChangeText', { label: 'SGW Campus', value: 'SGWCampus' });
        
        expect(mockProps.setSelectedStart).toHaveBeenCalledWith('SGWCampus');
        expect(mockProps.updateRoute).toHaveBeenCalledWith(
            { latitude: 45.495729, longitude: -73.578041 },
            mockProps.destination
        );
    });

    it("handles start location change to custom location", () => {
        const { getByTestId } = render(<LocationSelector {...mockProps} />);
        const dropdown = getByTestId("dropdown-start");
        
        fireEvent(dropdown, 'onChangeText', { label: 'Custom Location', value: 'custom' });
        
        expect(mockProps.setSelectedStart).toHaveBeenCalledWith('custom');
        expect(mockProps.setSearchType).toHaveBeenCalledWith('START');
        expect(mockProps.setIsModalVisible).toHaveBeenCalledWith(true);
    });

    it("handles destination change to Loyola Campus", () => {
        const { getByTestId } = render(<LocationSelector {...mockProps} />);
        const dropdown = getByTestId("dropdown-dest");
        
        fireEvent(dropdown, 'onChangeText', { label: 'Loyola Campus', value: 'LoyolaCampus' });
        
        expect(mockProps.setSelectedDest).toHaveBeenCalledWith('LoyolaCampus');
        expect(mockProps.setDestination).toHaveBeenCalledWith({ 
            latitude: 45.458424, 
            longitude: -73.640259 
        });
    });

    it("handles user location fetching when not available", async () => {
        const mockCurrentPosition = {
            coords: {
                latitude: 45.5,
                longitude: -73.5
            }
        };
        Location.getCurrentPositionAsync.mockResolvedValueOnce(mockCurrentPosition);

        const propsWithoutUserLocation = {
            ...mockProps,
            userLocation: null
        };

        const { getByTestId } = render(<LocationSelector {...propsWithoutUserLocation} />);
        const dropdown = getByTestId("dropdown-start");
        
        await fireEvent(dropdown, 'onChangeText', { label: 'My Location', value: 'userLocation' });
        
        expect(Location.getCurrentPositionAsync).toHaveBeenCalled();
        expect(mockProps.setUserLocation).toHaveBeenCalledWith({
            latitude: 45.5,
            longitude: -73.5
        });
    });

    it("handles location fetching error", async () => {
        Location.getCurrentPositionAsync.mockRejectedValueOnce(new Error('Permission denied'));
        const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

        const propsWithoutUserLocation = {
            ...mockProps,
            userLocation: null
        };

        const { getByTestId } = render(<LocationSelector {...propsWithoutUserLocation} />);
        const dropdown = getByTestId("dropdown-start");
        
        await fireEvent(dropdown, 'onChangeText', { label: 'My Location', value: 'userLocation' });
        
        expect(consoleSpy).toHaveBeenCalledWith("Error getting current location:", expect.any(Error));
        consoleSpy.mockRestore();
    });

    it("handles all travel mode changes", () => {
        const { getByTestId } = render(<LocationSelector {...mockProps} />);
        
        const modes = ['driving', 'walking', 'transit', 'shuttle'];
        modes.forEach(mode => {
            const modeButton = getByTestId(`travel-mode-${mode}`);
            fireEvent.press(modeButton);
            expect(mockProps.setTravelMode).toHaveBeenCalledWith(mode.toUpperCase());
            expect(mockProps.updateRouteWithMode).toHaveBeenCalledWith(
                mockProps.userLocation,
                mockProps.destination,
                mode.toUpperCase()
            );
        });
    });

    it("handles custom destination selection", () => {
        const { getByTestId } = render(<LocationSelector {...mockProps} />);
        const dropdown = getByTestId("dropdown-dest");
        
        fireEvent(dropdown, 'onChangeText', { label: 'Custom Location', value: 'custom' });
        
        expect(mockProps.setSelectedDest).toHaveBeenCalledWith('custom');
        expect(mockProps.setSearchType).toHaveBeenCalledWith('DESTINATION');
        expect(mockProps.setIsModalVisible).toHaveBeenCalledWith(true);
    });
});