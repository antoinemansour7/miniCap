// Card.js
import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

const Card = ({ iconName, title }) => {
  return (
    <TouchableOpacity style={styles.card}>
      <Icon name={iconName} size={40} color="#9B1B30" style={styles.icon} />
      <Text style={styles.title}>{title}</Text> 
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#F5F5F5', // Grayscale background for the cards
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
    color: '#333',
  },
});

export default Card;
