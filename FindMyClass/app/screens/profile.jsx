import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, TextInput, Switch, Alert, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { useRouter } from 'expo-router';

export default function Profile() {
  const { user } = useAuth();
  const { darkMode } = useTheme();
  const { t } = useLanguage();
  const router = useRouter();
  const [profilePicture, setProfilePicture] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  // User profile data
  const [userProfile, setUserProfile] = useState({
    fullName: "",
    email: "",
    phone: "",
    password: "",
    accessibilityEnabled: false,
    accessibilityStatus: "" // Status for accessibility needs (e.g., "visual", "mobility", "hearing")
  });

  // Dynamic styles based on theme
  const dynamicStyles = {
    container: {
      backgroundColor: darkMode ? '#121212' : '#e9edf0',
    },
    profileCard: {
      backgroundColor: darkMode ? '#1E1E1E' : '#fff',
    },
    userText: {
      color: darkMode ? '#fff' : '#333',
    },
    emailText: {
      color: darkMode ? '#bbb' : '#666',
    },
    phoneText: {
      color: darkMode ? '#bbb' : '#666',
    },
    accessibilityIndicator: {
      backgroundColor: darkMode ? '#332222' : '#f0e6e6',
    },
    accessibilityOptionsLabel: {
      color: darkMode ? '#bbb' : '#666',
    },
    input: {
      backgroundColor: darkMode ? '#333' : '#f9f9f9',
      borderColor: darkMode ? '#444' : '#ddd',
      color: darkMode ? '#fff' : '#000',
    },
    switchLabel: {
      color: darkMode ? '#fff' : '#333',
    },
    accessibilityTypeButton: {
      backgroundColor: darkMode ? '#333' : '#f0f0f0',
      borderColor: darkMode ? '#444' : '#ddd',
    },
    accessibilityTypeSelected: {
      backgroundColor: darkMode ? '#331a1a' : '#f0e6e6',
      borderColor: '#800000',
    },
    accessibilityTypeText: {
      color: darkMode ? '#ddd' : '#333',
    },
    warning: {
      color: darkMode ? '#ff6666' : '#a00',
    },
    errorBanner: {
      backgroundColor: darkMode ? '#3a2222' : '#ffdddd',
      borderColor: darkMode ? '#ff5c5c' : '#ff5c5c',
    },
    errorText: {
      color: darkMode ? '#ff6666' : '#ff0000',
    },
    cancelButtonText: {
      color: darkMode ? '#ff6666' : '#800000',
    },
    changeText: {
      color: darkMode ? '#ff6666' : '#800000',
    },
    placeholderText: {
      color: darkMode ? '#ff6666' : '#800000',
    },
  };

  // Check camera roll permissions early on mount.
  useEffect(() => {
    (async () => {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        setErrorMessage(t.permissionError);
      }
    })();
  }, [t]);

  const loadProfileData = async () => {
    try {
      // Load profile picture
      const savedUri = await AsyncStorage.getItem('profile_picture');
      if (savedUri) setProfilePicture(savedUri);
      
      // Load user profile data
      const userData = await AsyncStorage.getItem('user_profile');
      if (userData) {
        const parsedData = JSON.parse(userData);
        setUserProfile(parsedData);
      } else {
        // Initialize with user data if available
        setUserProfile({
          fullName: user?.displayName || "",
          email: user?.email || "",
          phone: "",
          password: "",
          accessibilityEnabled: false,
          accessibilityStatus: ""
        });
        
        // Save initial profile data
        if (user) {
          await AsyncStorage.setItem('user_profile', JSON.stringify({
            fullName: user.displayName || "",
            email: user.email || "",
            phone: "",
            accessibilityEnabled: false,
            accessibilityStatus: "",
            createdAt: new Date().toISOString()
          }));
        }
      }
    } catch (error) {
      console.error("Error loading profile data:", error);
      setErrorMessage("Failed to load profile data");
    }
  };
  
  useEffect(() => {
    if (user) {
      loadProfileData();
    }
  }, [user]);

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      setErrorMessage(t.photoAccessError);
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
      setErrorMessage(""); // Clear any previous error after success
    } catch (error) {
      console.error("Error picking image:", error);
      setErrorMessage(t.imageError);
    }
  };

  const handleInputChange = (field, value) => {
    if (field === "password" && value.length < 6) {
      alert("Password must be at least 6 characters long.");
      return;
    }
  
    setUserProfile(prev => ({
      ...prev,
      [field]: value
    }));
  };
  

  const validateEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email); // NOSONAR
  };

  const checkDuplicateEmail = async (email) => {
    try {
      // Get all registered emails
      const registeredEmails = await AsyncStorage.getItem('registered_emails') || '[]';
      const emailsArray = JSON.parse(registeredEmails);
      
      // Check if email exists and isn't owned by current user
      return emailsArray.some(
        item => item.email.toLowerCase() === email.toLowerCase() && item.userId !== user.uid
      );
    } catch (error) {
      console.error("Error checking for duplicate email:", error);
      return false;
    }
  };


  const saveProfileChanges = async () => {
    // Validate inputs
    if (!userProfile.fullName.trim()) {
      setErrorMessage("Name cannot be empty");
      return;
    }

    if (!validateEmail(userProfile.email)) {
      setErrorMessage("Please enter a valid email address");
      return;
    }

    // Get original email
    const userData = await AsyncStorage.getItem('user_profile');
    const originalEmail = userData ? JSON.parse(userData).email : user?.email;
    
    setIsSaving(true);
    try {
      // Check for duplicate email if it changed
      if (userProfile.email.toLowerCase() !== originalEmail?.toLowerCase()) {
        const isDuplicate = await checkDuplicateEmail(userProfile.email);
        if (isDuplicate) {
          setErrorMessage("This email is already in use by another account");
          setIsSaving(false);
          return;
        }
        
        // Update registered emails
        const registeredEmails = await AsyncStorage.getItem('registered_emails') || '[]';
        const emailsArray = JSON.parse(registeredEmails);
        
        // Remove any existing entry for this user
        const filteredEmails = emailsArray.filter(item => item.userId !== user.uid);
        
        // Add the new email
        filteredEmails.push({
          userId: user.uid,
          email: userProfile.email.toLowerCase()
        });
        
        await AsyncStorage.setItem('registered_emails', JSON.stringify(filteredEmails));
      }

      // Set accessibility status based on preferences
      if (userProfile.accessibilityEnabled && !userProfile.accessibilityStatus) {
        userProfile.accessibilityStatus = "mobility"; // Default
      } else if (!userProfile.accessibilityEnabled) {
        userProfile.accessibilityStatus = ""; // Clear status
      }

      // Save profile data
      await AsyncStorage.setItem('user_profile', JSON.stringify({
        ...userProfile,
        updatedAt: new Date().toISOString()
      }));
      
      setErrorMessage("");
      setIsEditing(false);
      Alert.alert("Success", "Your profile information has been updated successfully.");
    } catch (error) {
      console.error("Error saving profile changes:", error);
      setErrorMessage("Failed to save changes. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const toggleEditMode = () => {
    if (isEditing) {
      // If currently editing, ask for confirmation before canceling
      Alert.alert(
        "Discard Changes",
        "Are you sure you want to discard your changes?",
        [
          { text: "Continue Editing", style: "cancel" },
          { 
            text: "Discard",
            style: "destructive",
            onPress: () => {
              // Reset to original data
              loadProfileData();
              setIsEditing(false);
              setErrorMessage("");
            }
          }
        ]
      );
    } else {
      // Start editing
      setIsEditing(true);
    }
  };

  if (!user) {
    return (
      <View style={[styles.container, dynamicStyles.container]}>
        <Text style={[styles.warning, dynamicStyles.warning]}>{t.pleaseLogin}</Text>
        <TouchableOpacity style={styles.button} onPress={() => router.push('/auth/login')}>
          <Text style={styles.buttonText}>{t.login}</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={[styles.container, dynamicStyles.container]}>
      {errorMessage !== "" && (
        <View style={[styles.errorBanner, dynamicStyles.errorBanner]}>
          <Text style={[styles.errorText, dynamicStyles.errorText]}>{errorMessage}</Text>
        </View>
      )}
      <View style={[styles.profileCard, dynamicStyles.profileCard]}>
        {/* Profile Image Section */}
        <View style={styles.imageSection}>
          {user.photoURL ? (
            <>
              <Image source={{ uri: user.photoURL }} style={styles.profileImage} />
              <Text style={[styles.changeText, dynamicStyles.changeText]}>Google Account Photo</Text>
            </>
          ) : (
            <TouchableOpacity onPress={pickImage} style={styles.imageContainer}>
              {profilePicture ? (
                <View style={styles.editImageContainer}>
                  <Image source={{ uri: profilePicture }} style={styles.profileImage} />
                  {isEditing && (
                    <TouchableOpacity style={styles.editImageButton} onPress={pickImage}>
                      <Text style={styles.editImageButtonText}>✏️</Text>
                    </TouchableOpacity>
                  )}
                </View>
              ) : (
                <View style={styles.placeholder}>
                  <Text style={[styles.placeholderText, dynamicStyles.placeholderText]}>{t.addPhoto}</Text>
                </View>
              )}
              <Text style={[styles.changeText, dynamicStyles.changeText]}>
                {isEditing ? t.changePhoto : "Profile Photo"}
              </Text>
            </TouchableOpacity>
          )}
        </View>
        
        {!isEditing ? (
          // Display mode
          <>
            <Text style={[styles.userText, dynamicStyles.userText]}>
              {userProfile.fullName || (user.displayName ? user.displayName : user.email)}
            </Text>
            <Text style={[styles.emailText, dynamicStyles.emailText]}>{userProfile.email || user.email}</Text>
            {userProfile.phone && <Text style={[styles.phoneText, dynamicStyles.phoneText]}>{userProfile.phone}</Text>}
            
            {userProfile.accessibilityEnabled && (
              <View style={[styles.accessibilityIndicator, dynamicStyles.accessibilityIndicator]}>
                <Text style={styles.accessibilityText}>
                  <Text style={styles.wheelchairIcon}>♿</Text> Accessibility Enabled
                  {userProfile.accessibilityStatus ? ` (${userProfile.accessibilityStatus})` : ''}
                </Text>
              </View>
            )}
            
            <TouchableOpacity style={styles.editButton} onPress={toggleEditMode}>
              <Text style={styles.editButtonText}>Edit Profile</Text>
            </TouchableOpacity>
          </>
        ) : (
          // Edit mode
          <View style={styles.editForm}>
            <View style={styles.inputContainer}>
              <TextInput
                style={[styles.input, dynamicStyles.input]}
                placeholder="Full Name"
                placeholderTextColor={darkMode ? "#999" : "#aaa"}
                value={userProfile.fullName}
                onChangeText={(value) => handleInputChange('fullName', value)}
              />
            </View>
            
            <View style={styles.inputContainer}>
              <TextInput
                style={[styles.input, dynamicStyles.input]}
                placeholder="E-Mail"
                placeholderTextColor={darkMode ? "#999" : "#aaa"}
                value={userProfile.email}
                onChangeText={(value) => handleInputChange('email', value)}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>
            
            <View style={styles.inputContainer}>
              <TextInput
                style={[styles.input, dynamicStyles.input]}
                placeholder="Phone No."
                placeholderTextColor={darkMode ? "#999" : "#aaa"}
                value={userProfile.phone}
                onChangeText={(value) => handleInputChange('phone', value)}
                keyboardType="phone-pad"
              />
            </View>
            
            <View style={styles.inputContainer}>
              <TextInput
                style={[styles.input, dynamicStyles.input]}
                placeholder="Password"
                placeholderTextColor={darkMode ? "#999" : "#aaa"}
                value={userProfile.password}
                onChangeText={(value) => handleInputChange('password', value)}
                secureTextEntry
              />
            </View>
            
            <View style={styles.accessibilitySection}>
              <View style={styles.switchContainer}>
                <View style={styles.accessibilityLabelContainer}>
                  <Text style={styles.wheelchairIcon}>♿</Text>
                  <Text style={[styles.switchLabel, dynamicStyles.switchLabel]}>Accessibility</Text>
                </View>
                <Switch
                  value={userProfile.accessibilityEnabled}
                  onValueChange={(value) => handleInputChange('accessibilityEnabled', value)}
                  trackColor={{ false: "#767577", true: "#a33" }}
                  thumbColor={userProfile.accessibilityEnabled ? "#800000" : "#f4f3f4"}
                />
              </View>
              
              {userProfile.accessibilityEnabled && (
                <View style={styles.accessibilityOptions}>
                  <Text style={[styles.accessibilityOptionsLabel, dynamicStyles.accessibilityOptionsLabel]}>
                    Select your accessibility needs:
                  </Text>
                  <View style={styles.accessibilityTypeContainer}>
                    <TouchableOpacity
                      style={[
                        styles.accessibilityTypeButton,
                        dynamicStyles.accessibilityTypeButton,
                        userProfile.accessibilityStatus === 'mobility' && dynamicStyles.accessibilityTypeSelected
                      ]}
                      onPress={() => handleInputChange('accessibilityStatus', 'mobility')}
                    >
                      <Text style={[styles.accessibilityTypeText, dynamicStyles.accessibilityTypeText]}>Mobility</Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity
                      style={[
                        styles.accessibilityTypeButton,
                        dynamicStyles.accessibilityTypeButton,
                        userProfile.accessibilityStatus === 'visual' && dynamicStyles.accessibilityTypeSelected
                      ]}
                      onPress={() => handleInputChange('accessibilityStatus', 'visual')}
                    >
                      <Text style={[styles.accessibilityTypeText, dynamicStyles.accessibilityTypeText]}>Visual</Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity
                      style={[
                        styles.accessibilityTypeButton,
                        dynamicStyles.accessibilityTypeButton,
                        userProfile.accessibilityStatus === 'hearing' && dynamicStyles.accessibilityTypeSelected
                      ]}
                      onPress={() => handleInputChange('accessibilityStatus', 'hearing')}
                    >
                      <Text style={[styles.accessibilityTypeText, dynamicStyles.accessibilityTypeText]}>Hearing</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            </View>
            
            <TouchableOpacity 
              style={styles.confirmButton} 
              onPress={saveProfileChanges}
              disabled={isSaving}
            >
              {isSaving ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Text style={styles.confirmButtonText}>Confirm Changes</Text>
              )}
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.cancelButton} onPress={toggleEditMode} disabled={isSaving}>
              <Text style={[styles.cancelButtonText, dynamicStyles.cancelButtonText]}>Cancel</Text>
            </TouchableOpacity>
          </View>
        )}
        
        {/* Schedule button always visible */}
        <TouchableOpacity 
          style={[styles.scheduleButton, isEditing && styles.scheduleButtonDisabled]} 
          onPress={() => router.push('/screens/schedule')}
          disabled={isEditing}
        >
          <Text style={styles.scheduleButtonText}>{t.viewSchedule}</Text>
        </TouchableOpacity>
      </View>
      {/* <FloatingChatButton /> */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
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
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 10,
    elevation: 8,
    marginBottom: 30,
    width: '100%',
    maxWidth: 350,
  },
  imageSection: {
    alignItems: 'center',
    marginBottom: 20,
  },
  imageContainer: {
    alignItems: 'center',
  },
  editImageContainer: {
    position: 'relative',
  },
  profileImage: {
    width: 140,
    height: 140,
    borderRadius: 70,
    borderWidth: 2,
    borderColor: '#800000',
  },
  editImageButton: {
    position: 'absolute',
    bottom: 5,
    right: 5,
    backgroundColor: '#800000',
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  editImageButtonText: {
    color: '#fff',
    fontSize: 16,
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
    textAlign: 'center',
  },
  emailText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 5,
  },
  phoneText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 15,
  },
  accessibilityIndicator: {
    backgroundColor: '#f0e6e6',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 12,
    marginBottom: 15,
    flexDirection: 'row',
    alignItems: 'center',
  },
  accessibilityText: {
    color: '#800000',
    fontSize: 14,
    flexDirection: 'row',
    alignItems: 'center',
  },
  wheelchairIcon: {
    fontSize: 16,
    marginRight: 5,
  },
  accessibilitySection: {
    width: '100%',
    marginVertical: 10,
  },
  accessibilityLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  accessibilityOptions: {
    marginTop: 10,
    width: '100%',
  },
  accessibilityOptionsLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  accessibilityTypeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  accessibilityTypeButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    backgroundColor: '#f0f0f0',
    borderWidth: 1,
    borderColor: '#ddd',
    flex: 1,
    marginHorizontal: 4,
    alignItems: 'center',
  },
  accessibilityTypeSelected: {
    backgroundColor: '#f0e6e6',
    borderColor: '#800000',
  },
  accessibilityTypeText: {
    fontSize: 13,
    color: '#333',
  },
  editButton: {
    backgroundColor: '#800000',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginBottom: 10,
  },
  editButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  scheduleButton: {
    backgroundColor: '#800000',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginTop: 10,
  },
  scheduleButtonDisabled: {
    backgroundColor: '#b08080',
  },
  scheduleButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  warning: {
    fontSize: 18,
    color: '#a00',
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
    backgroundColor: '#ffdddd',
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
    width: '100%',
    maxWidth: 350,
    borderColor: '#ff5c5c',
    borderWidth: 1,
  },
  errorText: {
    color: '#ff0000',
    fontSize: 15,
    textAlign: 'center',
  },
  // Edit form styles
  editForm: {
    width: '100%',
    alignItems: 'center',
  },
  inputContainer: {
    width: '100%',
    marginBottom: 12,
  },
  input: {
    width: '100%',
    height: 50,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 15,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
  },
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    marginVertical: 10,
  },
  switchLabel: {
    fontSize: 16,
    color: '#333',
  },
  confirmButton: {
    backgroundColor: '#800000',
    paddingVertical: 12,
    borderRadius: 8,
    width: '100%',
    alignItems: 'center',
    marginTop: 10,
  },
  confirmButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  cancelButton: {
    paddingVertical: 12,
    borderRadius: 8,
    width: '100%',
    alignItems: 'center',
    marginTop: 10,
  },
  cancelButtonText: {
    color: '#800000',
    fontSize: 16,
  },
});