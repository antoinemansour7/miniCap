import React, { useState } from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

const ProfileButton = () => {
  const [modalVisible, setModalVisible] = useState(false);
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleOption = (option) => {
    setModalVisible(false);
    if (user) {
      if (option === 'profile') {
        router.push('/screens/profile');
      } else if (option === 'logout') {
        logout();
        router.push('/');
      }
    } else {
      if (option === 'login') {
        router.push('/auth/login');
      } else if (option === 'signup') {
        router.push('/screens/register');
      }
    }
  };

  return (
    <>
      <TouchableOpacity testID="profile-button" onPress={() => setModalVisible(true)} style={{ marginLeft: 10 }}>
        <Ionicons name="person" size={30} color="#912338" />
      </TouchableOpacity>
      <Modal
        transparent
        animationType="fade"
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            {user ? (
              <>
                <TouchableOpacity onPress={() => handleOption('profile')} style={styles.optionButton}>
                  <Text style={styles.optionText}>My Profile</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => handleOption('logout')} style={styles.optionButton}>
                  <Text style={styles.optionText}>Logout</Text>
                </TouchableOpacity>
              </>
            ) : (
              <>
                <TouchableOpacity onPress={() => handleOption('login')} style={styles.optionButton}>
                  <Text style={styles.optionText}>Login</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => handleOption('signup')} style={styles.optionButton}>
                  <Text style={styles.optionText}>Signup</Text>
                </TouchableOpacity>
              </>
            )}
            <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.cancelButton}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: 280,
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingVertical: 20,
    paddingHorizontal: 20,
    alignItems: 'center',
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  optionButton: {
    paddingVertical: 12,
    width: '100%',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderColor: '#eee',
  },
  optionText: {
    fontSize: 18,
    color: '#333',
  },
  cancelButton: {
    marginTop: 15,
    paddingVertical: 12,
    width: '100%',
    alignItems: 'center',
  },
  cancelText: {
    fontSize: 18,
    color: '#e60000',
    fontWeight: '600',
  },
});

export default ProfileButton;
