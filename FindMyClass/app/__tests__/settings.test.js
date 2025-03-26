import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';
import SettingsScreen from '../screens/settings';
import { ThemeProvider } from '../../contexts/ThemeContext';
import { LanguageProvider } from '../../contexts/LanguageContext';

// Helper component to wrap SettingsScreen with context providers
const renderWithProviders = () =>
  render(
    <LanguageProvider>
      <ThemeProvider>
        <SettingsScreen />
      </ThemeProvider>
    </LanguageProvider>
  );

describe('SettingsScreen', () => {
  it('should render and toggle dark mode', () => {
    renderWithProviders();

    const darkModeSwitch = screen.getByRole('switch');
    expect(darkModeSwitch).toBeTruthy();

    // Initially, it should not be dark mode
    expect(darkModeSwitch.props.value).toBe(false);

    fireEvent(darkModeSwitch, 'valueChange', true); // Toggle to dark mode
    expect(darkModeSwitch.props.value).toBe(true); // Should be dark mode now
  });

  it('should toggle language when clicked', () => {
    renderWithProviders();

    const languageButton = screen.getByText(/App Language/i);
    expect(languageButton).toBeTruthy();

    fireEvent.press(languageButton); // Simulate language toggle
    // Since it's the first click, it should switch to French
    expect(screen.getByText('French')).toBeTruthy();

    fireEvent.press(languageButton); // Toggle back to English
    expect(screen.getByText('English')).toBeTruthy();
  });

  it('should display the about section correctly', () => {
    renderWithProviders();

    const aboutText = screen.getByText(/This app was created for the SOEN 390 MiniCapstone project/i);
    expect(aboutText).toBeTruthy();

    // Check that the team names are visible
    const teamMembers = screen.getByText(/• Ashkan Forghani/);
    expect(teamMembers).toBeTruthy();
  });
});
