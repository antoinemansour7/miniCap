import { StyleSheet } from 'react-native';

const mapStyles = StyleSheet.create({
    container: { flex: 1 },
    map: { flex: 1 },
    userMarker: { alignItems: 'center', justifyContent: 'center' },
    whiteOutline: { width: 16, height: 16, borderRadius: 8, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center' },
    userDot: { width: 12, height: 12, borderRadius: 6, backgroundColor: '#9B1B30' },
    recenterButton: {
        position: 'absolute',
        top: 65, // Adjust to be below the search bar
        right: 20, // Keep it near the right edge
        backgroundColor: '#9B1B30',
        padding: 12,
        borderRadius: 25,
        elevation: 5, // Android shadow
        shadowColor: '#000', // iOS shadow
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 3,
    },    
    recenterText: { fontSize: 20, color: '#fff', textAlign: 'center' },
});

export default mapStyles;