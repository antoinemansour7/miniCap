import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, Image } from 'react-native'; // Added Image import
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
        {/* Replaced Google login button UI */}
        <TouchableOpacity 
          onPress={handleGoogleLogin}
          style={[
            {
              flexDirection: 'row',
              alignItems: 'center',
              backgroundColor: '#fff',
              borderWidth: 1,
              borderColor: '#dcdcdc',
              borderRadius: 4,
              paddingVertical: 10,
              paddingHorizontal: 15,
              marginTop: 10,
            }
          ]}
        >
          <Image 
            source={require('../../assets/googleLogo.png')}
            style={{ width: 20, height: 20, marginRight: 10 }} 
          />
          <Text style={{ color: '#757575', fontSize: 16 }}>Sign in with Google</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={handleRegisterNavigation}>
          <Text style={styles.registerLink}>Not a User? Register Now!</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

