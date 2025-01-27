import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';


export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  //no backend live
  const handleLogin = () => {
    console.log('Email:', email);
    console.log('Password:', password);
  };
  
  // With the help of useNavigation hook, we can navigate to the register screen
  // You just had to initiate it at the top of the file
  const navigation = useNavigation();
  
  const handleRegisterNavigation = () => {
    navigation.navigate('screens/register'); 
  };


  return (
    <View style={styles.container}>
      <Text style={styles.title}>Login</Text>
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
      <TouchableOpacity style={styles.button} onPress={handleLogin}>
        <Text style={styles.buttonText}>Log In</Text>
      </TouchableOpacity>
      <View style={styles.smallContainer}>
      <TouchableOpacity onPress={handleRegisterNavigation}>
        <Text style={styles.registerLink}>Not a User? Register Now!</Text>
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
