import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router'; 
import { registerUser } from '../api/auth'; 
import { styles } from '../../styles/authStyles';
import { useTheme } from '../../contexts/ThemeContext.js';
import { useLanguage } from '../../contexts/LanguageContext.js';

export default function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { darkMode } = useTheme();
  const { language } = useLanguage();

  // Custom translations for register screen
  const registerPageText = {
    English: {
      title: "Register",
      firstNamePlaceholder: "First Name",
      lastNamePlaceholder: "Last Name",
      emailPlaceholder: "Email",
      passwordPlaceholder: "Password",
      buttonText: "Register",
      loadingText: "Registering...",
      loginText: "Already a User? Login!"
    },
    French: {
      title: "S'inscrire",
      firstNamePlaceholder: "Prénom",
      lastNamePlaceholder: "Nom",
      emailPlaceholder: "Email",
      passwordPlaceholder: "Mot de passe",
      buttonText: "S'inscrire",
      loadingText: "Inscription en cours...",
      loginText: "Déjà inscrit? Connectez-vous!"
    }
  };

  const registerText = registerPageText[language];

  const handleRegister = async () => {
    if (!email || !password || !firstName || !lastName) {
      Alert.alert('Error', 'All fields are required.');
      return;
    }

    setIsLoading(true);
    try {
      await registerUser(email, password, firstName, lastName);
      setIsLoading(false);
      Alert.alert('Success', 'Registration Successful!');
      router.push('/auth/login'); 
    } catch (error) {
      setIsLoading(false);
      Alert.alert('Registration Error', error.message);
    }
  };

  const handleLoginNavigation = () => {
    router.push('/auth/login'); 
  };

  // Define theme-dependent styles
  const themeStyles = {
    wrapper: {
      backgroundColor: darkMode ? '#121212' : '#fff',
    },
    container: {
      backgroundColor: darkMode ? '#1e1e1e' : '#f7f7f7',
    },
    title: {
      color: darkMode ? '#f0f0f0' : '#333',
    },
    input: {
      borderColor: darkMode ? '#444' : '#ccc',
      backgroundColor: darkMode ? '#2c2c2c' : '#fff',
      color: darkMode ? '#f0f0f0' : '#333',
    },
    button: {
      backgroundColor: '#800000', // Keep primary action color consistent
    },
    registerLink: {
      color: darkMode ? '#ff9999' : '#800000',
    }
  };

  return (
    <View style={[styles.wrapper, themeStyles.wrapper]}>
      <View style={[styles.container, themeStyles.container]}>
        <Text style={[styles.title, themeStyles.title]}>{registerText.title}</Text>
        <TextInput
          style={[styles.input, themeStyles.input]}
          placeholder={registerText.firstNamePlaceholder}
          placeholderTextColor={darkMode ? '#888' : '#666'}
          value={firstName}
          onChangeText={setFirstName}
        />
        <TextInput
          style={[styles.input, themeStyles.input]}
          placeholder={registerText.lastNamePlaceholder}
          placeholderTextColor={darkMode ? '#888' : '#666'}
          value={lastName}
          onChangeText={setLastName}
        />
        <TextInput
          style={[styles.input, themeStyles.input]}
          placeholder={registerText.emailPlaceholder}
          placeholderTextColor={darkMode ? '#888' : '#666'}
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        <TextInput
          style={[styles.input, themeStyles.input]}
          placeholder={registerText.passwordPlaceholder}
          placeholderTextColor={darkMode ? '#888' : '#666'}
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          returnKeyType="done"
        />
        <TouchableOpacity 
          testID="register-button"
          style={[styles.button, themeStyles.button]} 
          onPress={handleRegister} 
          disabled={isLoading}
        >
          <Text style={styles.buttonText}>{isLoading ? registerText.loadingText : registerText.buttonText}</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={handleLoginNavigation}>
          <Text style={[styles.registerLink, themeStyles.registerLink]}>{registerText.loginText}</Text>
        </TouchableOpacity>
      </View>
    </View> 
  );
}