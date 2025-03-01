import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  // ...existing styles...
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderColor: '#dcdcdc',
    borderWidth: 1,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 4,
    marginTop: 12,
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
  // ...existing styles...
});

// Add a default export to satisfy routes expecting a default export.
export default styles;
