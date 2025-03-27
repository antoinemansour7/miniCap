import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import FloatingChatButton from '../../components/FloatingChatButton';
import { useAuth } from '../../contexts/AuthContext';
import { useRouter } from 'expo-router';
import { useTheme } from '../../contexts/ThemeContext';
import { useLanguage } from '../../contexts/LanguageContext';

export default function Profile() {
  const { user } = useAuth();
  const router = useRouter();
  const { darkMode } = useTheme();
  const { t } = useLanguage();
  const [profilePicture, setProfilePicture] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    (async () => {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        setErrorMessage(t?.permissionError);
      }
    })();
  }, []);

  useEffect(() => {
    async function loadImage() {
      const savedUri = await AsyncStorage.getItem('profile_picture');
      if (savedUri) setProfilePicture(savedUri);
    }
    loadImage();
  }, []);

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      setErrorMessage(t?.photoAccessError);
      return;
    }

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 1,
      });

      if (result.canceled) return;

      const asset = result.assets[0];
      setProfilePicture(asset.uri);
      await AsyncStorage.setItem('profile_picture', asset.uri);
      setErrorMessage('');
    } catch (error) {
      console.error('Image error:', error);
      setErrorMessage(t?.imageError);
    }
  };

  if (!user) {
    return (
      <View style={[styles.container, { backgroundColor: darkMode ? '#111' : '#e9edf0' }]}>
        <Text style={[styles.warning, { color: darkMode ? '#f88' : '#a00' }]}>
          {t?.pleaseLogin}
        </Text>
        <TouchableOpacity
          style={[styles.button, { backgroundColor: '#800000' }]}
          onPress={() => router.push('/auth/login')}
        >
          <Text style={styles.buttonText}>{t?.login}</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: darkMode ? '#000' : '#e9edf0' }]}>
      {errorMessage !== '' && (
        <View style={[styles.errorBanner, { backgroundColor: darkMode ? '#330000' : '#ffdddd' }]}>
          <Text style={[styles.errorText, { color: darkMode ? '#ff7777' : '#ff0000' }]}>
            {errorMessage}
          </Text>
        </View>
      )}

      <View style={[styles.profileCard, { backgroundColor: darkMode ? '#111' : '#fff' }]}>
        {user.photoURL ? (
          <>
            <Image source={{ uri: user.photoURL }} style={styles.profileImage} />
            <Text style={[styles.changeText, { color: '#800000' }]}>Google Account Photo</Text>
          </>
        ) : (
          <TouchableOpacity onPress={pickImage} style={styles.imageContainer}>
            {profilePicture ? (
              <Image source={{ uri: profilePicture }} style={styles.profileImage} />
            ) : (
              <View style={[styles.placeholder, { backgroundColor: darkMode ? '#222' : '#fff' }]}>
                <Text style={[styles.placeholderText, { color: '#800000' }]}>{t.addPhoto}</Text>
              </View>
            )}
            <Text style={[styles.changeText, { color: '#800000' }]}>{t.changePhoto}</Text>
          </TouchableOpacity>
        )}

        <Text style={[styles.userText, { color: darkMode ? '#fff' : '#333' }]}>
          {t.welcome}, {user.displayName || user.email}
        </Text>

        <TouchableOpacity style={styles.scheduleButton} onPress={() => router.push('/screens/schedule')}>
          <Text style={styles.scheduleButtonText}>{t.viewSchedule}</Text>
        </TouchableOpacity>
      </View>
      <FloatingChatButton />
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
  profileCard: {
    borderRadius: 16,
    paddingVertical: 30,
    paddingHorizontal: 25,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 10,
    elevation: 8,
    marginBottom: 30,
    width: '100%',
    maxWidth: 350,
  },
  imageContainer: {
    alignItems: 'center',
    marginBottom: 15,
  },
  profileImage: {
    width: 140,
    height: 140,
    borderRadius: 70,
    borderWidth: 2,
    borderColor: '#800000',
  },
  placeholder: {
    width: 140,
    height: 140,
    borderRadius: 70,
    borderWidth: 2,
    borderColor: '#800000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    fontSize: 16,
  },
  changeText: {
    marginTop: 8,
    fontSize: 14,
    fontStyle: 'italic',
  },
  userText: {
    fontSize: 22,
    fontWeight: '600',
    marginTop: 10,
  },
  scheduleButton: {
    backgroundColor: '#800000',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginTop: 15,
  },
  scheduleButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  warning: {
    fontSize: 18,
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#800000',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  errorBanner: {
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
    width: '100%',
    maxWidth: 350,
    borderWidth: 1,
    borderColor: '#ff5c5c',
  },
  errorText: {
    fontSize: 15,
    textAlign: 'center',
  },
});
