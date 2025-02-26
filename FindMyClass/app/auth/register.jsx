import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, Image } from 'react-native';
import { useRouter } from 'expo-router'; 
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db, signInWithGoogle } from '../../../firebase/config';
import { styles } from '../../styles/authStyles';

export default function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter(); 

  // Regular email/password registration
  const handleRegister = async () => {
    if (!email || !password || !firstName || !lastName) {
      Alert.alert('Error', 'All fields are required.');
      return;
    }

    setIsLoading(true);
    try {
      // Create user in Firebase Authentication
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Store additional user info in Firestore
      await setDoc(doc(db, 'users', user.uid), {
        firstName,
        lastName,
        email,
        createdAt: new Date(),
        isGoogleUser: false
      });

      setIsLoading(false);
      Alert.alert('Success', 'Registration Successful!');
      router.push('/auth/login'); 
    } catch (error) {
      setIsLoading(false);
      Alert.alert('Registration Error', error.message);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      setIsLoading(true);
      const user = await signInWithGoogle();
      
      // Store additional Google user info in Firestore
      await setDoc(doc(db, 'users', user.uid), {
        firstName: user.displayName?.split(' ')[0] || '',
        lastName: user.displayName?.split(' ')[1] || '',
        email: user.email,
        createdAt: new Date(),
        isGoogleUser: true,
        profilePicture: user.photoURL || ''
      }, { merge: true });
      
      Alert.alert('Success', 'Google Sign-In Successful!');
      router.push('/auth/login');
    } catch (error) {
      Alert.alert('Google Sign-In Error', error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoginNavigation = () => {
    router.push('/auth/login'); 
  };

  return (
    <View style={styles.wrapper}>
      <View style={styles.container}>
        <Text style={styles.title}>Register</Text>
        
        {/* Google Sign In Button */}
        <TouchableOpacity 
          style={[styles.button, styles.googleButton]}
          onPress={handleGoogleSignIn}
          disabled={isLoading}
        >
          <View style={styles.googleButtonContent}>
            <Image 
              source={require('../../assets/images/google-icon.png')}
              style={styles.googleIcon}
            />
            <Text style={[styles.buttonText, styles.googleButtonText]}>
              Sign up with Google
            </Text>
          </View>
        </TouchableOpacity>

        <View style={styles.divider}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>or</Text>
          <View style={styles.dividerLine} />
        </View>

        {/* Regular Registration Form */}
        <TextInput
          style={styles.input}
          placeholder="First Name"
          placeholderTextColor="#666"
          value={firstName}
          onChangeText={setFirstName}
          editable={!isLoading}
        />
        <TextInput
          style={styles.input}
          placeholder="Last Name"
          placeholderTextColor="#666"
          value={lastName}
          onChangeText={setLastName}
          editable={!isLoading}
        />
        <TextInput
          style={styles.input}
          placeholder="Email"
          placeholderTextColor="#666"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          editable={!isLoading}
        />
        <TextInput
          style={styles.input}
          placeholder="Password"
          placeholderTextColor="#666"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          returnKeyType="done"
          editable={!isLoading}
        />
        
        {/* Regular Register Button */}
        <TouchableOpacity 
          testID="register-button"
          style={[styles.button, isLoading && styles.disabledButton]} 
          onPress={handleRegister} 
          disabled={isLoading}
        >
          <Text style={styles.buttonText}>
            {isLoading ? "Please wait..." : "Register"}
          </Text>
        </TouchableOpacity>
        
        {/* Login Navigation Link */}
        <TouchableOpacity 
          onPress={handleLoginNavigation}
          disabled={isLoading}
        >
          <Text style={styles.registerLink}>Already a User? Login!</Text>
        </TouchableOpacity>
      </View>
    </View> 
  );
}