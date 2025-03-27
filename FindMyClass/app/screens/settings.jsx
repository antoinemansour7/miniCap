import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Switch, Alert, ScrollView } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { useLanguage } from '../../contexts/LanguageContext'; // 🌍

export default function SettingsScreen() {
  const { darkMode, toggleDarkMode } = useTheme();
  const { language, toggleLanguage, t } = useLanguage(); // 🌍

  const handleDeleteAccount = () => {
    Alert.alert(`${t.deleteAccount}`, `${t.deleteAccount} - Placeholder action`);
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: darkMode ? '#111' : '#fff' }}>
      <View style={styles.container}>
        {/* Appearance Section */}
        <Text style={[styles.sectionTitle, { color: darkMode ? '#fff' : '#000' }]}>{t.appearance}</Text>
        <View style={styles.rowItem}>
          <Text style={{ color: darkMode ? '#fff' : '#000' }}>{t.changeMode}</Text>
          <Switch value={darkMode} onValueChange={toggleDarkMode} />
        </View>

        {/* Language Section */}
        <Text style={[styles.sectionTitle, { color: darkMode ? '#fff' : '#000' }]}>{t.language}</Text>
        <TouchableOpacity style={styles.rowItem} onPress={toggleLanguage}>
          <Text style={{ color: darkMode ? '#fff' : '#000' }}>{t.appLanguage}</Text>
          <Text style={{ color: darkMode ? '#fff' : '#000' }}>{language}</Text>
        </TouchableOpacity>

        {/* About Section */}
        <Text style={[styles.sectionTitle, { color: darkMode ? '#fff' : '#000' }]}>{t.about}</Text>
        <View style={[styles.aboutBox, { backgroundColor: darkMode ? '#222' : '#f2f2f2' }]}>
          <Text style={[styles.aboutText, { color: darkMode ? '#fff' : '#000' }]}>{t.aboutText}</Text>
          <Text style={[styles.aboutText, { color: darkMode ? '#aaa' : '#444', marginTop: 10 }]}>{t.team}</Text>
          <Text style={[styles.aboutText, { color: darkMode ? '#aaa' : '#444' }]}>
            • Ashkan Forghani{'\n'}
            • Antoine Mansour{'\n'}
            • Sanjay Thambithurai{'\n'}
            • Andre Assaad{'\n'}
            • Nabih El-Helou{'\n'}
            • Daniel Wegrzyn{'\n'}
            • Adam Chami{'\n'}
            • Jad Aramouni{'\n'}
            • Baraa Chrit{'\n'}
            • Abilash Sasitharan
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 25,
    marginBottom: 10,
  },
  rowItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderColor: '#444',
  },
  aboutBox: {
    padding: 16,
    borderRadius: 10,
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#333',
  },
  aboutText: {
    fontSize: 14,
    lineHeight: 22,
  },
});
