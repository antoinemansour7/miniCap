import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, TextInput } from 'react-native';
import FloatingChatButton from '../../components/FloatingChatButton';
import { MaterialIcons } from '@expo/vector-icons'; 

/*Things to change for later:
-Add edit image, have an image for each user
-Integrate user data after they sign up
-modify the look of the page a little, if we want the input fields to be exactly as the mockups (more height, less width)
-either move the chatbot circle or move the input fields
-password should be blurred
-implement security for when user wants to change info (implement 2FA/security questions maybe?)
*/

export default function Profile() {
  const [isEditing, setIsEditing] = useState(false);
  const [userData, setUserData] = useState({ //gonna have to change, still initial draft, pre-backend
    fullName: 'Taylor Morgan',
    email: 'taylormorgan@gmail.com',
    phoneNo: '',
    password: ''
  });
  const isLoggedIn = true;

  const handleSave = () => {
    // firebase functionality, to do later
    setIsEditing(false);
  };

  if (!isLoggedIn) {
    return (
      <View style={styles.container}>
        <View style={styles.messageContainer}>
          <Text style={styles.messageText}>
            You're not connected, click here to log in or sign up
          </Text>
          <TouchableOpacity style={styles.authButton}>
            <Text style={styles.authButtonText}>Log In</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.authButton}>
            <Text style={styles.authButtonText}>Sign Up</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  if (!isEditing) {
    return (
      <View style={styles.container}>
        <View style={styles.profileContainer}>
          <Image
            style={styles.profileImage}
            source={require('../../assets/images/default-profile.png')} // just used a default for now, we'll change this later (based on the user)
          />
          <Text style={styles.name}>{userData.fullName}</Text>
          <Text style={styles.email}>{userData.email}</Text>
          
          <TouchableOpacity 
            style={styles.editButton}
            onPress={() => setIsEditing(true)}
          >
            <Text style={styles.editButtonText}>Edit Profile</Text>
          </TouchableOpacity>
        </View>
        <FloatingChatButton />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.profileContainer}>
        <Image
          style={styles.profileImage}
          source={require('../../assets//images/default-profile.png')}
        />
        <Text style={styles.name}>{userData.fullName}</Text>
        <Text style={styles.email}>{userData.email}</Text>
        
        <View style={styles.inputContainer}>
          <View style={styles.inputWrapper}>
            <MaterialIcons 
              name="person-outline" 
              size={24} 
              style={styles.inputIcon} 
            />
            <TextInput
              style={styles.input}
              placeholder="Full Name"
              value={userData.fullName}
              onChangeText={(text) => setUserData({...userData, fullName: text})}
            />
          </View>

          <View style={styles.inputWrapper}>
            <MaterialIcons 
              name="mail-outline" 
              size={24} 
              style={styles.inputIcon} 
            />
            <TextInput
              style={styles.input}
              placeholder="E-Mail"
              value={userData.email}
              onChangeText={(text) => setUserData({...userData, email: text})}
            />
          </View>

          <View style={styles.inputWrapper}>
            <MaterialIcons 
              name="phone" 
              size={24} 
              style={styles.inputIcon} 
            />
            <TextInput
              style={styles.input}
              placeholder="Phone No."
              value={userData.phoneNo}
              onChangeText={(text) => setUserData({...userData, phoneNo: text})}
            />
          </View>

          <View style={styles.inputWrapper}>
            <MaterialIcons 
              name="lock-outline" 
              size={24} 
              style={styles.inputIcon} 
            />
            <TextInput
              style={styles.input}
              placeholder="Password"
              secureTextEntry
              value={userData.password}
              onChangeText={(text) => setUserData({...userData, password: text})}
            />
          </View>
        </View>

        <TouchableOpacity 
          style={styles.confirmButton}
          onPress={handleSave}
        >
          <Text style={styles.confirmButtonText}>Confirm Changes</Text>
        </TouchableOpacity>
      </View>
      <FloatingChatButton />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  profileContainer: {
    alignItems: 'center',
    paddingTop: 40,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 20,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  email: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 24,
  },
  editButton: {
    backgroundColor: '#943240', //red, matching the theme of the app
    paddingVertical: 12,
    paddingHorizontal: 40,
    borderRadius: 25,
    marginTop: 10,
  },
  editButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
  inputContainer: {
    width: '80%',
    marginTop: 20,
  },
  inputWrapper: {
    position: 'relative',
    marginBottom: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: '#943240',
    borderRadius: 25,
    padding: 15,
    fontSize: 16,
    paddingLeft: 50,
  },
  inputIcon: {
    position: 'absolute',
    left: 20,
    top: '50%',
    transform: [{ translateY: -12 }],
    zIndex: 1,
    color: '#943240',
  },
  confirmButton: {
    backgroundColor: '#943240',
    paddingVertical: 12,
    paddingHorizontal: 40,
    borderRadius: 25,
    marginTop: 10,
  },
  confirmButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
  messageContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  messageText: {
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 20,
  },
  authButton: {
    backgroundColor: '#943240',
    paddingVertical: 12,
    paddingHorizontal: 40,
    borderRadius: 25,
    marginTop: 10,
    width: '80%',
    alignItems: 'center',
  },
  authButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
});