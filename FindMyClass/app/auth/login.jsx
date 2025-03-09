import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { loginUser } from '../api/auth.js';
import { useAuth } from '../../contexts/AuthContext.js';
import * as Google from 'expo-auth-session/providers/google';
import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithCredential } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { firebaseConfig, googleAuthConfig } from '../secrets';
import CustomModal from '../../components/CustomModal';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { login } = useAuth();

  const app = initializeApp(firebaseConfig);
  const auth = getAuth(app);

  const [modalConfig, setModalConfig] = useState({
    visible: false,
    type: '',
    message: ''
  });

  const showAlert = (type, message) => {
    setModalConfig({
      visible: true,
      type,
      message
    });
  };

  // Setup Google auth request
  const [request, response, promptAsync] = Google.useAuthRequest({
    iosClientId: '625867070738-vdkl0rjh31rgdjbcrkdk1f7t26rvgule.apps.googleusercontent.com', // Replace with your iOS client ID
    webClientId: 'YOUR_WEB_CLIENT_ID', // Replace with your web client ID
    scopes: [
      'openid',
      'email',
      'profile',
      'https://www.googleapis.com/auth/calendar.readonly'
    ],
  });

  // Handle Google response
  useEffect(() => {

    if (response?.type !== 'success') return;

    const { id_token, access_token } = response.params;
    const credential = GoogleAuthProvider.credential(id_token);

    const handleUserSignIn = async (userCredential) => {
      await login(userCredential.user);
      await AsyncStorage.setItem("googleAccessToken", access_token);
      showAlert('success', `Welcome ${userCredential.user.displayName || userCredential.user.email}`);
      closeModalAndNavigate();
    };

    const closeModalAndNavigate = () => {
      setTimeout(() => {
        setModalConfig(prev => ({ ...prev, visible: false }));
        router.push('/screens/profile');
      }, 1500);
    };

    signInWithCredential(auth, credential)
      .then(handleUserSignIn)
      .catch((error) => {
        console.error('Google Sign-In Error:', error);
        showAlert('error', 'Failed to sign in with Google');
      });
    
  }, [response]);

  const handleLogin = async () => {
    setIsLoading(true);
    try {
      const user = await loginUser(email, password);
      setIsLoading(false);
      login(user);
      showAlert('success', `Welcome ${user.email}`);
      setTimeout(() => {
        setModalConfig(prev => ({ ...prev, visible: false }));
        router.push('/screens/profile');
      }, 1500);
    } catch (error) {
      setIsLoading(false);
      showAlert('error', error.message);
    }
  };

  const handleRegisterNavigation = () => {
    router.push('/auth/register');
  };

  // Change this handler to start the Google sign-in flow
  const handleGoogleLogin = () => {
    promptAsync();
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
        {/* Standard login button */}
        <TouchableOpacity style={styles.button} onPress={handleLogin} disabled={isLoading}>
          <Text style={styles.buttonText}>
            {isLoading ? "Logging in..." : "Log In"}
          </Text>
        </TouchableOpacity>
        {/* Google Sign-In Button */}
        <TouchableOpacity style={styles.googleButton} onPress={handleGoogleLogin}>
          <Image source={require('../../assets/googleLogo.png')} style={styles.googleLogo} />
          <Text style={styles.googleButtonText}>Sign in with Google</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={handleRegisterNavigation}>
          <Text style={styles.registerLink}>Not a User? Register Now!</Text>
        </TouchableOpacity>
      </View>

      <CustomModal
        visible={modalConfig.visible}
        type={modalConfig.type}
        message={modalConfig.message}
        onClose={() => setModalConfig(prev => ({ ...prev, visible: false }))}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  container: {
    width: '100%',
    maxWidth: 350,
    backgroundColor: '#f7f7f7',
    borderRadius: 8,
    padding: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
  },
  title: {
    fontSize: 26,
    fontWeight: '600',
    marginBottom: 20,
    textAlign: 'center',
    color: '#333',
  },
  input: {
    height: 50,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 4,
    paddingHorizontal: 10,
    marginBottom: 15,
    fontSize: 16,
    color: '#333',
    backgroundColor: '#fff',
  },
  button: {
    backgroundColor: '#800000',
    paddingVertical: 12,
    borderRadius: 4,
    alignItems: 'center',
    marginBottom: 15,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderColor: '#dcdcdc',
    borderWidth: 1,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 4,
    marginBottom: 15,
    elevation: 2,
  },
  googleLogo: {
    width: 24,
    height: 24,
    marginRight: 8,
  },
  googleButtonText: {
    fontSize: 16,
    color: '#555',
    fontWeight: '500',
  },
  registerLink: {
    color: '#800000',
    textAlign: 'center',
    fontSize: 16,
    marginTop: 10,
  },
});