import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { registerUser } from '../../backend/firebase/auth';


export default function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const[ firstName, setFirstName] = useState('');
  const[ lastName, setLastName] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const navigation = useNavigation();

  //no backend live
  const handleRegister = async () => {
    setIsLoading(true);
    try {
      // Register the user
      await registerUser(email, password, firstName, lastName);
      setIsLoading(false);
      alert('Registration Successful', 'You have successfully registered');

    } catch (error) {
      setIsLoading(false);
      alert('Registration Error', error.message);
    }
  };

// Function to handle navigation to the login screen
const handleLoginNavigation = () => {
    navigation.navigate('screens/login'); 
  };
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Register</Text>
      <TextInput
        style={styles.input}
        placeholder="First Name"
        placeholderTextColor="#888"
        value={firstName}
        onChangeText={setFirstName}
        autoCapitalize="none"
      />
      <TextInput
        style={styles.input}
        placeholder="Last Name"
        placeholderTextColor="#888"
        value={lastName}
        onChangeText={setLastName}
        autoCapitalize="none"
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
      <TouchableOpacity style={styles.button} onPress={handleRegister}>
        <Text style={styles.buttonText}>Register</Text>
      </TouchableOpacity>
      <View style={styles.smallContainer}>
     <TouchableOpacity onPress={handleLoginNavigation}>
      <Text style={styles.registerLink}>Already a User? Login!</Text>
      </TouchableOpacity>
      </View>
    </View>
    
  );
}

const styles = StyleSheet.create({
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
  smallContainer: {
    justifyContent: 'left',
    alignItems: 'left',
    padding: 25,
  },
  registerLink: {
    fontSize: 15,
    fontWeight: 'bold',
  },
});
