import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { loginUser } from '../api/auth.js';
import { useAuth } from '../../contexts/AuthContext.js';
import { useTheme } from '../../contexts/ThemeContext.js';
import { useLanguage } from '../../contexts/LanguageContext.js';
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
  const { darkMode } = useTheme();
  const { t, language } = useLanguage();

  // Custom translations specifically for login screen
  const loginPageText = {
    English: {
      title: "Login",
      buttonText: "Login",
      loadingText: "Logging in...",
      googleButtonText: "Sign in with Google",
      registerText: "Not a User? Register Now!"
    },
    French: {
      title: "Connexion",
      buttonText: "Connexion",
      loadingText: "Connexion en cours...",
      googleButtonText: "Se connecter avec Google",
      registerText: "Pas encore inscrit? Créer un compte!"
    }
  };

  const loginText = loginPageText[language];

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
    iosClientId: '625867070738-vdkl0rjh31rgdjbcrkdk1f7t26rvgule.apps.googleusercontent.com',
    webClientId: 'YOUR_WEB_CLIENT_ID',
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
      showAlert('success', `${t.welcome} ${userCredential.user.displayName || userCredential.user.email}`);
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
    
  }, [response, t]);

  const handleLogin = async () => {
    setIsLoading(true);
    try {
      const user = await loginUser(email, password);
      setIsLoading(false);
      login(user);
      showAlert('success', `${t.welcome} ${user.email}`);
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

  const handleGoogleLogin = () => {
    promptAsync();
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
    googleButton: {
      backgroundColor: darkMode ? '#2c2c2c' : '#fff',
      borderColor: darkMode ? '#444' : '#dcdcdc',
    },
    googleButtonText: {
      color: darkMode ? '#f0f0f0' : '#555',
    },
    registerLink: {
      color: darkMode ? '#ff9999' : '#800000',
    }
  };

  return (
    <View style={[styles.wrapper, themeStyles.wrapper]}>
      <View style={[styles.container, themeStyles.container]}>
        <Text style={[styles.title, themeStyles.title]}>{loginText.title}</Text>
        <TextInput
          style={[styles.input, themeStyles.input]}
          placeholder="Email"
          placeholderTextColor={darkMode ? '#888' : '#888'}
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        <TextInput
          style={[styles.input, themeStyles.input]}
          placeholder="Password"
          placeholderTextColor={darkMode ? '#888' : '#888'}
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />
        {/* Standard login button */}
        <TouchableOpacity style={[styles.button, themeStyles.button]} onPress={handleLogin} disabled={isLoading}>
          <Text style={styles.buttonText}>
            {isLoading ? loginText.loadingText : loginText.buttonText}
          </Text>
        </TouchableOpacity>
        {/* Google Sign-In Button */}
        <TouchableOpacity style={[styles.googleButton, themeStyles.googleButton]} onPress={handleGoogleLogin}>
          <Image source={require('../../assets/googleLogo.png')} style={styles.googleLogo} />
          <Text style={[styles.googleButtonText, themeStyles.googleButtonText]}>{loginText.googleButtonText}</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={handleRegisterNavigation}>
          <Text style={[styles.registerLink, themeStyles.registerLink]}>{loginText.registerText}</Text>
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
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  container: {
    width: '100%',
    maxWidth: 350,
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
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderRadius: 4,
    paddingHorizontal: 10,
    marginBottom: 15,
    fontSize: 16,
  },
  button: {
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
    fontWeight: '500',
  },
  registerLink: {
    textAlign: 'center',
    fontSize: 16,
    marginTop: 10,
  },
});