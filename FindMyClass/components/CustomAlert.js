import React, { useState } from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet } from 'react-native';

let alertFn = null;

export const CustomAlertProvider = ({ children }) => {
  const [visible, setVisible] = useState(false);
  const [alertData, setAlertData] = useState({ type: '', message: '' });

  alertFn = (type, message) => {
    setAlertData({ type, message });
    setVisible(true);
  };

  return (
    <>
      {children}
      <Modal transparent visible={visible} animationType="fade">
        <View style={styles.overlay}>
          <View style={[styles.container, alertData.type === 'success' ? styles.success : styles.error]}>
            <Text style={styles.message}>{alertData.message}</Text>
            <TouchableOpacity onPress={() => setVisible(false)}>
              <Text style={styles.button}>OK</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </>
  );
};

export const showAlert = (type, message) => {
  if (alertFn) alertFn(type, message);
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  container: {
    width: '80%',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
  },
  success: {
    backgroundColor: '#d4edda',
  },
  error: {
    backgroundColor: '#f8d7da',
  },
  message: {
    fontSize: 16,
    marginBottom: 10,
  },
  button: {
    fontSize: 16,
    color: 'blue',
  },
});
