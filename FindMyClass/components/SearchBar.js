import React from 'react';
import { View, TextInput, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const SearchBar = ({ value, onChangeText, placeholder }) => {
  return (
    <View style={styles.searchContainer}>
      <Ionicons name="search" size={20} color="#A0A0A0" style={styles.searchIcon} />
      <TextInput
        style={styles.searchInput}
        placeholder={placeholder || "Search for buildings, locations..."}
        placeholderTextColor="#A0A0A0"
        value={value}
        onChangeText={onChangeText}
        testID="search-input"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: 8,
    paddingHorizontal: 10,
    margin: 10,
    borderWidth: 1,
    borderColor: '#ccc',
  },
  searchIcon: { marginRight: 8 },
  searchInput: { flex: 1, fontSize: 16, paddingVertical: 5 },
});

export default SearchBar;
