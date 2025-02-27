import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router'; // Use Expo Router
import { loginUser } from '../api/auth.js'; // Import your login API function
import { useAuth } from '../../contexts/AuthContext.js';
import { styles  } from '../../styles/authStyles';


export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter(); // Get the router from expo-router
  const { login } = useAuth();

  const handleLogin = async () => {
    setIsLoading(true);
    try {
      const user = await loginUser(email, password);
      setIsLoading(false);
      login(user); // Update global auth state
      Alert.alert('Success', `Welcome ${user.email}`);
      // Redirect to the Profile screen after successful login
      router.push('/screens/profile'); // Ensure that your Profile screen file maps to the '/profile' route
    } catch (error) {
      setIsLoading(false);
      Alert.alert('Login Error', error.message);
    }
  };

  const handleRegisterNavigation = () => {
    router.push('/auth/register');
  };

  // New handler for Google login navigation
  const handleGoogleLogin = () => {
    router.push('/auth/GoogleAuth'); // Updated the route to match file name
  };

  return (
    <View style={styles.wrapper}>
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
          <Text style={styles.buttonText}>
            {isLoading ? "Logging in..." : "Log In"}
          </Text>
        </TouchableOpacity>
        {/* New Google login button */}
        <TouchableOpacity 
          style={[styles.button, { backgroundColor: "#DB4437", marginTop: 10 }]} 
          onPress={handleGoogleLogin}
        >
          <Text style={styles.buttonText}>Login with Google</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={handleRegisterNavigation}>
          <Text style={styles.registerLink}>Not a User? Register Now!</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

