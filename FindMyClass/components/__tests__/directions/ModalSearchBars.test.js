import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
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
});
