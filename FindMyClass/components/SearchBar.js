import React, { useState } from 'react';
import { View, TextInput, StyleSheet, FlatList, TouchableOpacity, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { styles } from '../styles/searchBarStyles';

const SearchBar = ({ value, onChangeText, data = [], placeholder, onSelectItem }) => {
  const [filteredResults, setFilteredResults] = useState([]);

  const handleChangeText = (text) => {
    onChangeText(text); // Update parent's state
    if (text.trim().length > 0) {
      const filtered = data.filter(item =>
        item.name.toLowerCase().includes(text.toLowerCase())
        || item.id.toLowerCase().includes(text.toLowerCase())
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

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#A0A0A0" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder={placeholder || "Search for buildings, locations..."}
          placeholderTextColor="#A0A0A0"
          value={value}
          onChangeText={handleChangeText}
          testID="search-input"
        />
      </View>
      {filteredResults.length > 0 && (
        <View style={styles.suggestionsContainer}>
          <FlatList
            keyboardShouldPersistTaps="handled"
            data={filteredResults}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity onPress={() => handleSelectItem(item)} style={styles.searchResult}>
                <Text style={styles.buildingName}>{item.name}</Text>
                <Text style={styles.buildingId}>({item.id})</Text>
              </TouchableOpacity>
            )}
          />
        </View>
      )}
    </View>
  );
};


export default SearchBar;
