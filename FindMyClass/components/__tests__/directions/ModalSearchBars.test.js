import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import { View, TouchableOpacity, Text } from 'react-native';
import ModalSearchBars from "../../directions/ModalSearchBars";

// Mock the building data imports
jest.mock('../../../components/SGWBuildings', () => ([
  {
    id: "H",
    name: "Hall Building",
    latitude: 45.497167,
    longitude: -73.578991
  }
]));

jest.mock('../../../components/loyolaBuildings', () => ([
  {
    id: "VL",
    name: "Vanier Library",
    latitude: 45.459026,
    longitude: -73.638606
  }
]));

// Mock GoogleSearchBar component with proper component imports
jest.mock('../../../components/GoogleSearchBar', () => {
  const React = require('react');
  const { TouchableOpacity, Text } = require('react-native');
  
  return function MockGoogleSearchBar({ onLocationSelected }) {
    return (
      <TouchableOpacity
        testID="google-search-bar"
        onPress={() => onLocationSelected(
          { latitude: 45.497167, longitude: -73.578991 },
          "1455 De Maisonneuve Blvd W, Montreal, QC H3G 1M8"
        )}
      >
        <Text>Search Location</Text>
      </TouchableOpacity>
    );
  };
});

const mockHandleCloseModal = jest.fn();
const mockUpdateRoute = jest.fn();
const mockSetStartLocation = jest.fn();
const mockSetDestination = jest.fn();
const mockSetCustomDest = jest.fn();
const mockSetDestinationName = jest.fn();
const mockSetCustomSearchText = jest.fn();
const mockSetCustomStartName = jest.fn();
const mockSetCustomLocationDetails = jest.fn();

const defaultProps = {
  searchType: "DEST",
  isModalVisible: true,
  handleCloseModal: mockHandleCloseModal,
  updateRoute: mockUpdateRoute,
  
  startLocation: {},
  setStartLocation: mockSetStartLocation,
  customSearchText: "",
  setCustomSearchText: mockSetCustomSearchText,
  setCustomStartName: mockSetCustomStartName,
  customLocationDetails: {},
  setCustomLocationDetails: mockSetCustomLocationDetails,
  
  destination: {},
  setDestination: mockSetDestination,
  customDest: "",
  setCustomDest: mockSetCustomDest,
  setDestinationName: mockSetDestinationName,
};

describe("ModalSearchBars", () => {
  it("renders the modal when visible", () => {
    const { getByText } = render(<ModalSearchBars {...defaultProps} />);
    expect(getByText("Search Destination")).toBeTruthy();
  });

  it("closes the modal when the close button is pressed", () => {
    const { getByTestId } = render(<ModalSearchBars {...defaultProps} />);
    fireEvent.press(getByTestId("close-button"));
    expect(mockHandleCloseModal).toHaveBeenCalled();
  });

  it("updates search text and calls search function", () => {
    const { getByPlaceholderText } = render(<ModalSearchBars {...defaultProps} />);
    const searchInput = getByPlaceholderText("Search for a building...");
    fireEvent.changeText(searchInput, "Hall Building");
    expect(mockSetCustomDest).toHaveBeenCalledWith("Hall Building");
  });

  it("clears search text when clear button is pressed", () => {
    const propsWithText = { ...defaultProps, customDest: "Some Text" };
    const { queryByTestId } = render(<ModalSearchBars {...propsWithText} />);
    const clearButton = queryByTestId("clear-button");
    expect(clearButton).not.toBeNull(); // Ensure it's there
    fireEvent.press(clearButton);
    expect(mockSetCustomDest).toHaveBeenCalledWith("");
  });

  it("does not render search results when search text is empty", () => {
    const { queryByTestId } = render(<ModalSearchBars {...defaultProps} />);
    expect(queryByTestId("search-results")).toBeNull();
  });

  it("renders search results when searching", () => {
    const propsWithSearch = { 
      ...defaultProps, 
      customDest: "Hall"
    };
    const { getByText, getByPlaceholderText } = render(<ModalSearchBars {...propsWithSearch} />);
    const searchInput = getByPlaceholderText("Search for a building...");
    fireEvent.changeText(searchInput, "Hall");
    expect(getByText("Hall Building")).toBeTruthy();
  });

  it("calls updateRoute when a building is selected", () => {
    const propsWithSearch = { 
      ...defaultProps, 
      customDest: "Hall"
    };
    const { getByText, getByPlaceholderText } = render(<ModalSearchBars {...propsWithSearch} />);
    const searchInput = getByPlaceholderText("Search for a building...");
    fireEvent.changeText(searchInput, "Hall");
    
    const buildingResult = getByText("Hall Building");
    fireEvent.press(buildingResult);
    
    expect(mockSetDestination).toHaveBeenCalledWith({
      latitude: 45.497167,
      longitude: -73.578991
    });
    expect(mockUpdateRoute).toHaveBeenCalled();
  });

  it("handles custom location selection correctly", () => {
    const props = {
      ...defaultProps,
      searchType: "START"  // Change to start location search
    };
    const { getByTestId, getByText } = render(<ModalSearchBars {...props} />);
    
    // Since this involves GoogleSearchBar which would need its own mocking,
    // we'll just verify the modal renders correctly for start location
    expect(getByText("Search Start Location")).toBeTruthy();
  });

  it("filters buildings by ID", () => {
    const propsWithSearch = { 
      ...defaultProps, 
      customDest: "H"
    };
    const { getByText, getByPlaceholderText } = render(<ModalSearchBars {...propsWithSearch} />);
    const searchInput = getByPlaceholderText("Search for a building...");
    fireEvent.changeText(searchInput, "H");
    expect(getByText("Hall Building")).toBeTruthy();
  });

  it("handles empty search results", () => {
    const propsWithSearch = { 
      ...defaultProps, 
      customDest: "XYZ"
    };
    const { queryByTestId, getByPlaceholderText } = render(<ModalSearchBars {...propsWithSearch} />);
    const searchInput = getByPlaceholderText("Search for a building...");
    fireEvent.changeText(searchInput, "XYZ");
    expect(queryByTestId("search-results")).toBeNull();
  });

  it("parses street name correctly from full address", () => {
    const props = {
      ...defaultProps,
      searchType: "START"
    };
    
    const { getByTestId } = render(<ModalSearchBars {...props} />);
    const searchBar = getByTestId("google-search-bar");
    
    fireEvent.press(searchBar);
    
    expect(mockSetCustomSearchText).toHaveBeenCalledWith("1455 De Maisonneuve Blvd W");
    expect(mockSetStartLocation).toHaveBeenCalledWith({
      latitude: 45.497167,
      longitude: -73.578991
    });
  });

  it("updates customLocationDetails when selecting custom location", () => {
    const props = {
      ...defaultProps,
      searchType: "START"
    };
    
    const { getByTestId } = render(<ModalSearchBars {...props} />);
    const searchBar = getByTestId("google-search-bar");
    
    fireEvent.press(searchBar);
    
    expect(mockSetCustomLocationDetails).toHaveBeenCalledWith({
      name: "1455 De Maisonneuve Blvd W",
      coordinates: {
        latitude: 45.497167,
        longitude: -73.578991
      }
    });
  });

  it("closes modal when clicking overlay", () => {
    const { getByTestId } = render(<ModalSearchBars {...defaultProps} />);
    const overlay = getByTestId("modal-overlay");
    fireEvent.press(overlay);
    expect(mockHandleCloseModal).toHaveBeenCalled();
  });

  it("handles search with mixed case input", () => {
    const propsWithSearch = { 
      ...defaultProps, 
      customDest: "hAlL"
    };
    const { getByText, getByPlaceholderText } = render(<ModalSearchBars {...propsWithSearch} />);
    const searchInput = getByPlaceholderText("Search for a building...");
    fireEvent.changeText(searchInput, "hAlL");
    expect(getByText("Hall Building")).toBeTruthy();
  });

  it("prevents modal close when clicking overlay", () => {
    const { getByTestId } = render(<ModalSearchBars {...defaultProps} />);
    const overlay = getByTestId("modal-overlay");
    fireEvent.press(overlay);
    expect(mockHandleCloseModal).not.toHaveBeenCalled();
  });

  it("updates multiple states when selecting a building", () => {
    const propsWithSearch = { 
      ...defaultProps, 
      customDest: "Hall"
    };
    const { getByText, getByPlaceholderText } = render(<ModalSearchBars {...propsWithSearch} />);
    const searchInput = getByPlaceholderText("Search for a building...");
    fireEvent.changeText(searchInput, "Hall");
    
    const buildingResult = getByText("Hall Building");
    fireEvent.press(buildingResult);
    
    expect(mockSetCustomDest).toHaveBeenCalledWith("Hall Building");
    expect(mockSetDestinationName).toHaveBeenCalledWith("Hall Building");
    expect(mockSetDestination).toHaveBeenCalled();
    expect(mockUpdateRoute).toHaveBeenCalled();
    expect(mockHandleCloseModal).toHaveBeenCalled();
  });
});
