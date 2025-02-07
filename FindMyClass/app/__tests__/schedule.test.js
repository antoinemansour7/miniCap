import React from "react";
import { render, fireEvent, act } from "@testing-library/react-native";
import Schedule from "../screens/schedule";
import { MaterialIcons } from "@expo/vector-icons";
import { Animated } from "react-native";

// Mock `Animated` to prevent animation-related errors in Jest
jest.mock("react-native/Libraries/Animated/NativeAnimatedHelper");

describe("Schedule Component", () => {
  it("renders the schedule grid correctly", () => {
    const { getByText } = render(<Schedule />);

    // Check if the header row contains time and weekday labels
    expect(getByText("Time")).toBeTruthy();
    expect(getByText("Mon")).toBeTruthy();
    expect(getByText("Tue")).toBeTruthy();
    expect(getByText("Wed")).toBeTruthy();
    expect(getByText("Thu")).toBeTruthy();
    expect(getByText("Fri")).toBeTruthy();
  });

  it("opens and closes the search modal", () => {
    const { getByPlaceholderText, queryByPlaceholderText, getByTestId } = render(<Schedule />);

    // Open modal by pressing an empty cell
    fireEvent.press(getByTestId("schedule-cell-0-0")); // First cell in the grid
    expect(getByPlaceholderText("Search for a class...")).toBeTruthy();

    // Close modal by pressing the close button
    fireEvent.press(getByTestId("close-search"));
    expect(queryByPlaceholderText("Search for a class...")).toBeNull();
  });

  it("toggles edit mode", () => {
    const { getByTestId } = render(<Schedule />);

    const editButton = getByTestId("edit-button");
    const addButton = getByTestId("add-button");
    const deleteButton = getByTestId("delete-button");

    // Before pressing, check that action buttons are not visible
    expect(addButton).toHaveStyle({ opacity: 0 });
    expect(deleteButton).toHaveStyle({ opacity: 0 });

    // Toggle edit mode
    fireEvent.press(editButton);

    // After toggling, check if the action buttons are visible
    expect(addButton).toHaveStyle({ opacity: 1 });
    expect(deleteButton).toHaveStyle({ opacity: 1 });

    // Toggle back
    fireEvent.press(editButton);
    expect(addButton).toHaveStyle({ opacity: 0 });
    expect(deleteButton).toHaveStyle({ opacity: 0 });
  });

  it("checks if animation values update when edit mode is toggled", () => {
    const { getByTestId } = render(<Schedule />);

    const editButton = getByTestId("edit-button");

    // Mock animations
    Animated.spring = jest.fn(() => ({
      start: jest.fn(),
    }));

    // Toggle edit mode
    fireEvent.press(editButton);

    // Ensure animations were called
    expect(Animated.spring).toHaveBeenCalledTimes(3);
  });
});