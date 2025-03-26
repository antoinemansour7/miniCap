import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import Card from '../../components/Card';
import { useLanguage } from '../../contexts/LanguageContext';
import { useTheme } from '../../contexts/ThemeContext'; // ✅ bring in dark mode

export default function Index() {
  const navigation = useNavigation();
  const { t } = useLanguage();
  const { darkMode } = useTheme(); // ✅ get dark mode state

  const textColor = darkMode ? '#fff' : '#333';
  const bgColor = darkMode ? '#000' : '#fff';

  return (
    <View style={[styles.container, { backgroundColor: bgColor }]} testID="index-container">
      {/* Page Title */}
      <View style={styles.titleContainer}>
        <Ionicons name="location" size={30} color="#9B1B30" style={styles.icon} />
        <Text style={[styles.title, { color: textColor }]} testID="map-title">{t?.map || 'Map'}</Text>
      </View>

      {/* Map Cards */}
      <View style={styles.row}>
        <Card
          iconName="map"
          title={<Text style={{ color: textColor }} testID="sgw-map">{t?.sgwMap || 'SGW Map'}</Text>}
          onPress={() => navigation.navigate('index', { campus: 'SGW' })}
          testID="sgw-map-card"
        />
        <Card
          iconName="map"
          title={<Text style={{ color: textColor }} testID="loy-map">{t?.loyMap || 'LOY Map'}</Text>}
          onPress={() => navigation.navigate('index', { campus: 'Loyola' })}
          testID="loy-map-card"
        />
      </View>

      {/* Profile & Settings */}
      <View style={styles.row}>
        <Card
          iconName="person"
          title={<Text style={{ color: textColor }} testID="profile">{t?.profile || 'Profile'}</Text>}
          onPress={() => navigation.navigate('screens/profile')}
          testID="profile-card"
        />
        <Card
          iconName="settings"
          title={<Text style={{ color: textColor }} testID="settings">{t?.settings || 'Settings'}</Text>}
          onPress={() => navigation.navigate('screens/settings')}
          testID="settings-card"
        />
      </View>

      {/* Schedule & Security */}
      <View style={styles.row}>
        <Card
          iconName="calendar"
          title={<Text style={{ color: textColor }} testID="schedule">{t?.mySchedule || 'My Schedule'}</Text>}
          onPress={() => navigation.navigate('screens/schedule')}
          testID="schedule-card"
        />
        <Card
          iconName="lock-closed"
          title={<Text style={{ color: textColor }} testID="security">{t?.security || 'Security'}</Text>}
          testID="security-card"
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
