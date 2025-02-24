import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import FloatingChatButton from '../../components/FloatingChatButton';
import { useAuth } from '../../contexts/AuthContext';
import { useRouter } from 'expo-router';

export default function Profile() {
  const { user } = useAuth();
  const router = useRouter();
  // Initialize profilePicture as an empty string instead of null.
  const [profilePicture, setProfilePicture] = useState("");

  // Check camera roll permissions early on mount.
  useEffect(() => {
    (async () => {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission required', 'Camera roll permission is required for profile picture!');
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
      Alert.alert('Permission required', 'Please allow access to your photos.');
      return;
    }
    try {
      const mediaType =
        ImagePicker.MediaType && ImagePicker.MediaType.Images
          ? ImagePicker.MediaType.Images
          : ImagePicker.MediaTypeOptions.Images;
      let result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: mediaType,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 1,
      });
      if (result.canceled) return;
      const asset = result.assets[0];
      setProfilePicture(asset.uri);
      await AsyncStorage.setItem('profile_picture', asset.uri);
    } catch (error) {
      console.error("Error picking image:", error);
      Alert.alert("Error", "An error occurred while picking the image.");
    }
  };

  if (!user) {
    return (
      <View style={styles.container}>
        <Text style={styles.warning}>Please log in to access your profile.</Text>
        <TouchableOpacity style={styles.loginButton} onPress={() => router.push('/screens/login')}>
          <Text style={styles.loginButtonText}>Go to Login</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.profileCard}>
        <TouchableOpacity onPress={pickImage} style={styles.imageContainer}>
          {profilePicture ? (
            <Image source={{ uri: profilePicture }} style={styles.profileImage} />
          ) : (
            <View style={styles.placeholder}>
              <Text style={styles.placeholderText}>Add Photo</Text>
            </View>
          )}
          <Text style={styles.changeText}>Change Photo</Text>
        </TouchableOpacity>
        <Text style={styles.userText}>Welcome, {user.email}</Text>
      </View>
      <FloatingChatButton />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    // Soft background color for a clean look
    flex: 1,
    backgroundColor: '#e9edf0',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  profileCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    paddingVertical: 30,
    paddingHorizontal: 25,
    alignItems: 'center',
    // Refined shadow for elevation
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
    backgroundColor: '#fff',
  },
  placeholderText: {
    color: '#800000',
    fontSize: 16,
  },
  changeText: {
    marginTop: 8,
    fontSize: 14,
    color: '#800000',
    fontStyle: 'italic',
  },
  userText: {
    fontSize: 22,
    fontWeight: '600',
    color: '#333',
  },
  warning: {
    fontSize: 18,
    color: '#a00',
    marginBottom: 20,
  },
  loginButton: {
    backgroundColor: '#800000',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
