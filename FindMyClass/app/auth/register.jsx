import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity,  Alert } from 'react-native';
import { useRouter } from 'expo-router'; 
import { registerUser } from '../api/auth'; 
import { styles  } from '../../styles/authStyles';

export default function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter(); 

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

  return (
    <View style={styles.wrapper}>
      <View style={styles.container}>
        <Text style={styles.title}>Register</Text>
        <TextInput
          style={styles.input}
          placeholder="First Name"
          placeholderTextColor="#666"
          value={firstName}
          onChangeText={setFirstName}
        />
        <TextInput
          style={styles.input}
          placeholder="Last Name"
          placeholderTextColor="#666"
          value={lastName}
          onChangeText={setLastName}
        />
        <TextInput
          style={styles.input}
          placeholder="Email"
          placeholderTextColor="#666"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        <TextInput
          style={styles.input}
          placeholder="Password"
          placeholderTextColor="#666"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          returnKeyType="done"
        />
        <TouchableOpacity 
          testID="register-button"
          style={styles.button} 
          onPress={handleRegister} 
          disabled={isLoading}
        >
          <Text style={styles.buttonText}>{isLoading ? "Registering..." : "Register"}</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={handleLoginNavigation}>
          <Text style={styles.registerLink}>Already a User? Login!</Text>
        </TouchableOpacity>
      </View>
    </View> 
  );
}

