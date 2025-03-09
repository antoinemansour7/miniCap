import { StyleSheet } from 'react-native';

const mapStyles = StyleSheet.create({
    container: { flex: 1 },
    map: { flex: 1 },
    userMarker: { alignItems: 'center', justifyContent: 'center' },
    whiteOutline: { width: 16, height: 16, borderRadius: 8, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center' },
    userDot: { width: 12, height: 12, borderRadius: 6, backgroundColor: '#9B1B30' },
    recenterButton: {
        position: 'absolute',
        top: 110,           // ⬅️ Move it down below categories
        right: 5,          // ⬅️ Keep it on the far right
        backgroundColor: '#9B1B30',
        padding: 12,
        borderRadius: 25,
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 3,
      },
        
    recenterText: { fontSize: 20, color: '#fff', textAlign: 'center' },
    categoryChipsContainer: {
        paddingVertical: 8,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderColor: '#ddd',
      },
      
      chip: {
        paddingVertical: 8,
        paddingHorizontal: 12,
        backgroundColor: '#f0f0f0',
        borderRadius: 20,
        marginRight: 10,
      },
      
      chipSelected: {
        backgroundColor: '#912338',
      },
      
      chipText: {
        fontSize: 14,
        color: '#333',
      },
      
      chipTextSelected: {
        color: '#fff',
      },
      bottomSheetContent: {
        flex: 1,
        backgroundColor: '#fff',
        paddingBottom: 16,
        borderTopLeftRadius: 16,
        borderTopRightRadius: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -3 },
        shadowOpacity: 0.1,
        shadowRadius: 5,
        elevation: 10,
      },
      
      bottomSheetHeader: {
        fontSize: 20,
        fontWeight: '700',
        color: '#912338',
        paddingVertical: 16,
        paddingHorizontal: 20,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderColor: '#f0f0f0',
        borderTopLeftRadius: 16,
        borderTopRightRadius: 16,
      },
      
      placeItemContainer: {
        backgroundColor: '#fff',
        marginHorizontal: 16,
        marginVertical: 8,
        borderRadius: 12,
        padding: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 3,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
      },
      
      placeInfo: {
        flex: 1,
        paddingRight: 10,
      },
      
      placeName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
      },
      
      placeVicinity: {
        fontSize: 14,
        color: '#666',
        marginTop: 4,
      },
      
      placeDistance: {
        fontSize: 12,
        color: '#999',
        marginTop: 4,
      },
      
      directionsButton: {
        backgroundColor: '#912338',
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
      },
      
      directionsButtonText: {
        color: '#fff',
        fontWeight: '600',
        fontSize: 12,
      },      
});

export default mapStyles;