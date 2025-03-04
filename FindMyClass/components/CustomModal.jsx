import React from 'react';
import { Modal, View, Text, TouchableOpacity, TouchableWithoutFeedback, StyleSheet } from 'react-native';

const CustomModal = ({ visible, onClose, type, title, message }) => {
  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.modalBackground}>
          <TouchableWithoutFeedback>
            <View 
              testID="modal-container"
              style={[
                styles.modalContainer,
                type === 'success' ? styles.successBg : styles.errorBg
              ]}
            >
              <Text style={styles.modalTitle}>
                {title || (type === 'success' ? 'Welcome!' : 'Error')}
              </Text>
              <Text style={styles.modalMessage}>{message}</Text>
              <TouchableOpacity
                style={styles.modalButton}
                onPress={onClose}
              >
                <Text style={styles.modalButtonText}>OK</Text>
              </TouchableOpacity>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalBackground: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: '#fff',
    width: '80%',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
    textAlign: 'center',
  },
  modalMessage: {
    fontSize: 16,
    marginBottom: 20,
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
  },
  successBg: {
    backgroundColor: '#fff',
    borderTopWidth: 4,
    borderTopColor: '#912338',
  },
  errorBg: {
    backgroundColor: '#fff',
    borderTopWidth: 4,
    borderTopColor: '#dc3545',
  },
  modalButton: {
    backgroundColor: '#912338',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    minWidth: 120,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    elevation: 2,
  },
  modalButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
});

export default CustomModal;
