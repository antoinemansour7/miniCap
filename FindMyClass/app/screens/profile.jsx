import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import FloatingChatButton from '../../components/FloatingChatButton';
import { useAuth } from '../../contexts/AuthContext';
import { useRouter } from 'expo-router';

export default function Profile() {
  const { user } = useAuth();
  const router = useRouter();
  
  if (!user) {
    return (
      <View style={styles.container}>
        <Text style={styles.warning}>Please log in to access your profile.</Text>
        <TouchableOpacity style={styles.button} onPress={() => router.push('/screens/login')}>
          <Text style={styles.buttonText}>Go to Login</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Display user info */}
      <Text style={styles.text}>Welcome, {user.email}</Text>
      {/* Add additional profile details as needed */}
      <FloatingChatButton />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  warning: {
    fontSize: 18,
    color: '#a00',
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#800000',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  text: {
    fontSize: 20,
    fontWeight: 'bold',
  },
});
