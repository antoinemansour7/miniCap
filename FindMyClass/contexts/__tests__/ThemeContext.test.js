import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native'; // Correct testing library for React Native
import { ThemeProvider, useTheme } from '../../contexts/ThemeContext'; // Adjust path as needed
import { Text, Button } from 'react-native'; // Import necessary components

// Helper component to use the theme context
const TestComponent = () => {
  const { darkMode, toggleDarkMode } = useTheme();

  return (
    <React.Fragment>
      <Text>{darkMode ? 'Dark Mode' : 'Light Mode'}</Text> {/* Display current theme */}
      <Button onPress={toggleDarkMode} title="Toggle Theme" /> {/* Button to toggle theme */}
    </React.Fragment>
  );
};

describe('ThemeProvider', () => {
  it('should render the default theme as Light Mode', () => {
    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    );

    // Initially, it should be "Light Mode"
    expect(screen.getByText('Light Mode')).toBeTruthy();
  });

  it('should switch to Dark Mode when toggleDarkMode is called', () => {
    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    );

    // Initially, it should be "Light Mode"
    expect(screen.getByText('Light Mode')).toBeTruthy();

    // Simulate a button click to toggle the theme
    fireEvent.press(screen.getByText('Toggle Theme'));

    // After toggling, it should switch to "Dark Mode"
    expect(screen.getByText('Dark Mode')).toBeTruthy();
  });

  it('should toggle back to Light Mode when clicked again', () => {
    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    );

    // Initially, it should be "Light Mode"
    expect(screen.getByText('Light Mode')).toBeTruthy();

    // Toggle to Dark Mode
    fireEvent.press(screen.getByText('Toggle Theme'));
    expect(screen.getByText('Dark Mode')).toBeTruthy();

    // Toggle back to Light Mode
    fireEvent.press(screen.getByText('Toggle Theme'));
    expect(screen.getByText('Light Mode')).toBeTruthy();
  });
});
