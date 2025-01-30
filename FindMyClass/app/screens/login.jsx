import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { loginUser } from '../api/auth.js'; // Import API function

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigation = useNavigation();

  const handleLogin = async () => {
    setIsLoading(true);
    try {
      const user = await loginUser(email, password);
      setIsLoading(false);
      Alert.alert('Success', `Welcome ${user.email}`);
      // Navigate to home or dashboard after successful login
    } catch (error) {
      setIsLoading(false);
      Alert.alert('Login Error', error.message);
    }
  };

  const handleRegisterNavigation = () => {
    navigation.navigate('Register');
  };

  return (
    <View style={styles.wrapper}> {/* ✅ Ensure everything is wrapped inside a View */}
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
        <TouchableOpacity style={styles.button} onPress={handleLogin} disabled={isLoading}>
          <Text style={styles.buttonText}>{isLoading ? "Logging in..." : "Log In"}</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={handleRegisterNavigation}>
          <Text style={styles.registerLink}>Not a User? Register Now!</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { // ✅ Added a wrapper View
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