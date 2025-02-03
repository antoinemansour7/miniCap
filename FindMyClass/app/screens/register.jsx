import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useRouter } from 'expo-router'; // ✅ Use useRouter for Expo Router
import { registerUser } from '../api/auth'; // ✅ Correct import

export default function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter(); // ✅ Use router instead of navigation

  const handleRegister = async () => {
    setIsLoading(true);
    try {
      await registerUser(email, password, firstName, lastName);
      setIsLoading(false);
      Alert.alert('Success', 'Registration Successful!');
      router.push('/screens/login'); // ✅ Check if this matches your file structure
    } catch (error) {
      setIsLoading(false);
      Alert.alert('Registration Error', error.message);
    }
  };

  const handleLoginNavigation = () => {
    router.push('/screens/login'); // ✅ Corrected path
  };

  return (
    <View style={styles.wrapper}>
      <View style={styles.container}>
        <Text style={styles.title}>Register</Text>
        <TextInput
          style={styles.input}
          placeholder="First Name"
          placeholderTextColor="#888"
          value={firstName}
          onChangeText={setFirstName}
        />
        <TextInput
          style={styles.input}
          placeholder="Last Name"
          placeholderTextColor="#888"
          value={lastName}
          onChangeText={setLastName}
        />
        <TextInput
          style={styles.input}
          placeholder="Email"
          placeholderTextColor="#888"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        <TextInput
          style={styles.input}
          placeholder="Password"
          placeholderTextColor="#888"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />
        <TouchableOpacity style={styles.button} onPress={handleRegister} disabled={isLoading}>
          <Text style={styles.buttonText}>{isLoading ? "Registering..." : "Register"}</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={handleLoginNavigation}>
          <Text style={styles.registerLink}>Already a User? Login!</Text>
        </TouchableOpacity>
      </View>
    </View> 
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 25,
    backgroundColor: '#f9f9f9',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 25,
  },
  input: {
    width: '100%',
    height: 50,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    marginBottom: 15,
    backgroundColor: '#fff',
  },
  button: {
    width: '100%',
    height: 50,
    backgroundColor: '#800000',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  registerLink: {
    fontSize: 15,
    fontWeight: 'bold',
  },
});