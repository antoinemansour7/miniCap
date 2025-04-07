import React, { useState } from 'react';
import { View, TextInput, StyleSheet, FlatList, TouchableOpacity, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { styles } from '../styles/searchBarStyles';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';

const SearchBar = ({ value, onChangeText, data = [], placeholder, onSelectItem, darkMode }) => {
  const { t } = useLanguage();
  // Accept darkMode as prop or use context if not provided
  const themeContext = useTheme();
  const isDarkMode = darkMode !== undefined ? darkMode : themeContext.darkMode;
  
  const [filteredResults, setFilteredResults] = useState([]);

  const handleChangeText = (text) => {
    onChangeText(text); // Update parent's state
    if (text.trim().length > 0) {
      const filtered = data.filter(item =>
        item.name?.toLowerCase().includes(text.toLowerCase())
        || item.id?.toLowerCase().includes(text.toLowerCase())
      );
      setFilteredResults(filtered);
    } else {
      setFilteredResults([]);
    }
  };

  const handleSelectItem = (item) => {
    onChangeText(item.name); // Update parent's state with the selected item name
    setFilteredResults([]);
    if (onSelectItem) onSelectItem(item);
  };

  const handleClearSearch = () => {
    onChangeText(""); // Clear the search input
    setFilteredResults([]);
  };

  // Dynamic styles based on theme
  const dynamicStyles = {
    searchContainer: {
      backgroundColor: isDarkMode ? '#333' : '#FFFFFF',
      borderColor: isDarkMode ? '#444' : '#E0E0E0',
    },
    searchInput: {
      color: isDarkMode ? '#FFFFFF' : '#000000',
    },
    suggestionsContainer: {
      backgroundColor: isDarkMode ? '#222' : '#FFFFFF',
      borderColor: isDarkMode ? '#444' : '#E0E0E0',
    },
    searchResult: {
      borderBottomColor: isDarkMode ? '#444' : '#F0F0F0',
    },
    buildingName: {
      color: isDarkMode ? '#FFFFFF' : '#000000',
    },
    buildingId: {
      color: isDarkMode ? '#BBBBBB' : '#666666',
    },
    searchIcon: {
      color: isDarkMode ? '#999' : '#A0A0A0',
    },
    clearButton: {
      color: isDarkMode ? '#777' : '#D3D3D3',
    }
  };

  return (
    <View style={styles.container}>
      <View style={[styles.searchContainer, dynamicStyles.searchContainer]}>
        <Ionicons 
          name="search" 
          size={20} 
          color={dynamicStyles.searchIcon.color} 
          style={styles.searchIcon} 
        />
        <TextInput
          style={[styles.searchInput, dynamicStyles.searchInput]}
          placeholder={placeholder || t.searchPlaceholder || "Search for buildings, locations..."}
          placeholderTextColor={isDarkMode ? '#999' : '#A0A0A0'}
          value={value}
          onChangeText={handleChangeText}
          testID="search-input"
        />
       { value.length > 0 &&
        (<TouchableOpacity
          style={styles.clearButton}
          onPress={handleClearSearch} 
          testID="clear-button"
        > 
          <Ionicons 
            name="close-circle" 
            size={20} 
            color={dynamicStyles.clearButton.color} 
          />
        </TouchableOpacity>)}
      </View>
      {filteredResults.length > 0 && (
        <View style={[styles.suggestionsContainer, dynamicStyles.suggestionsContainer]}>
          <FlatList
            keyboardShouldPersistTaps="handled"
            data={filteredResults}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity 
                onPress={() => handleSelectItem(item)} 
                style={[styles.searchResult, dynamicStyles.searchResult]}
              >
                <Text style={[styles.buildingName, dynamicStyles.buildingName]}>
                  {item.name}
                </Text>
                <Text style={[styles.buildingId, dynamicStyles.buildingId]}>
                  ({item.id})
                </Text>
              </TouchableOpacity>
            )}
          />
        </View>
      )}
    </View>
  );
};

export default SearchBar;