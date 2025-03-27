import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useTheme } from '../contexts/ThemeContext'; // ✅ import dark mode context

const Card = ({ iconName, title, onPress }) => {
  const { darkMode } = useTheme();

  return (
    <TouchableOpacity
      style={[
        styles.card,
        {
          backgroundColor: darkMode ? '#1A1A1A' : '#F5F5F5',
          borderColor: darkMode ? '#444' : '#ddd',
        },
      ]}
      onPress={onPress}
    >
      <Icon
        name={iconName}
        size={40}
        color={darkMode ? '#FFCDD2' : '#9B1B30'}
        style={styles.icon}
      />
      {typeof title === 'string' ? (
        <Text style={[styles.title, { color: darkMode ? '#fff' : '#333' }]}>
          {title}
        </Text>
      ) : (
        title
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    width: 150,
    height: 150,
    margin: 10,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 5,
    borderWidth: 1,
  },
  icon: {
    marginBottom: 10,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default Card;
