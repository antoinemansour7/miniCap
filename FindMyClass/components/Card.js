// Card.js
import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

const Card = ({ iconName, title, onPress, darkMode }) => {
  // Dynamic styles based on theme
  const dynamicStyles = {
    card: {
      backgroundColor: darkMode ? '#2D2D2D' : '#F5F5F5',
    },
    title: {
      color: darkMode ? '#FFFFFF' : '#333333',
    },
    icon: {
      color: '#9B1B30', // Keeping the brand color consistent across themes
    }
  };

  return (
    <TouchableOpacity 
      style={[styles.card, dynamicStyles.card]} 
      onPress={onPress}
    >
      <Icon 
        name={iconName} 
        size={40} 
        color={dynamicStyles.icon.color} 
        style={styles.icon} 
      />
      <Text style={[styles.title, dynamicStyles.title]}>{title}</Text> 
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
    elevation: 5, // Adds shadow for Android
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