import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Storage key for theme preference
const THEME_STORAGE_KEY = '@app_theme_preference';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [darkMode, setDarkMode] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Load saved theme preference on initial mount
  useEffect(() => {
    const loadThemePreference = async () => {
      try {
        const savedTheme = await AsyncStorage.getItem(THEME_STORAGE_KEY);
        if (savedTheme !== null) {
          setDarkMode(savedTheme === 'true'); // Convert string to boolean
        }
      } catch (error) {
        console.error('Failed to load theme preference:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadThemePreference();
  }, []);

  // Save theme preference when it changes
  useEffect(() => {
    const saveThemePreference = async () => {
      try {
        await AsyncStorage.setItem(THEME_STORAGE_KEY, String(darkMode));
      } catch (error) {
        console.error('Failed to save theme preference:', error);
      }
    };

    if (!isLoading) {
      saveThemePreference();
    }
  }, [darkMode, isLoading]);

  const toggleDarkMode = () => setDarkMode(prev => !prev);

  // Function to directly set dark/light mode
  const setThemeMode = (isDark) => {
    setDarkMode(Boolean(isDark));
  };

  return (
    <ThemeContext.Provider value={{ 
      darkMode, 
      toggleDarkMode, 
      setThemeMode,
      isLoading
    }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);