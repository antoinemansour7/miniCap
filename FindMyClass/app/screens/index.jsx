import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import Card from '../../components/Card';
import { navigateToNextClass } from '../../components/nextClass';
import { useTheme } from '../../contexts/ThemeContext';
import { useLanguage } from '../../contexts/LanguageContext'; // 🌍

export default function Index() {
  // Initialize the navigation object
  const navigation = useNavigation();
  
  // Use the language context
  const { t } = useLanguage();
  
  // Use the theme context
  const { darkMode } = useTheme();
  
  // Dynamic styles based on theme
  const dynamicStyles = {
    container: {
      backgroundColor: darkMode ? '#121212' : '#FFFFFF',
    },
    title: {
      color: darkMode ? '#FFFFFF' : '#333333',
    },
    icon: {
      color: '#9B1B30', // This could also be themed if needed
    }
  };

  return (
    <View style={[styles.container, dynamicStyles.container]}>
      <View style={styles.titleContainer}>
        <Ionicons name="location" size={30} style={[styles.icon, { color: dynamicStyles.icon.color }]} />
        <Text style={[styles.title, dynamicStyles.title]}>{t.map}</Text>
      </View>

      <View style={styles.row}>
        <Card 
          iconName="map" 
          title={t.sgwMap} 
          onPress={() => navigation.navigate('index', { campus: 'SGW' })}
          darkMode={darkMode}
        />
        <Card 
          iconName="map" 
          title={t.loyMap} 
          onPress={() => navigation.navigate('index', { campus: 'Loyola' })}
          darkMode={darkMode}
        />
      </View>
      
      <View style={styles.row}>
        <Card 
          iconName="person" 
          title={t.profile} 
          onPress={() => navigation.navigate('screens/profile')}
          darkMode={darkMode}
        />
        <Card 
          iconName="settings" 
          title={t.settings}
          onPress={() => navigation.navigate('screens/settings')}
          darkMode={darkMode}
        />
      </View>

      <View style={styles.row}>
        <Card 
          iconName="calendar" 
          title={t.mySchedule} 
          onPress={() => navigation.navigate('screens/schedule')}
          darkMode={darkMode}
        />
        <Card 
          iconName="navigate" 
          title="Next Class" // Add this translation key to your language files
          onPress={navigateToNextClass}
          darkMode={darkMode}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 40,
  },
  icon: {
    marginRight: 10,
  },
  title: {
    fontSize: 30,
    fontWeight: 'bold',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    width: '100%',
  },
});