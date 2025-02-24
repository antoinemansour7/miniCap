import { StyleSheet } from "react-native";


export const styles = StyleSheet.create({
    mainContainer: {
        flex: 1,
        paddingTop: 0, // Add padding to account for status bar
        paddingBottom: 0,
        // backgroundColor: "#912338",
    },  
    container: {
        flex: 1,
        paddingTop: 0, // Add padding to account for status bar
        paddingBottom: 0,

    },
    topCard: {
        width: '100%',
        backgroundColor: "#912338",
        padding: 12,
        paddingTop: 45,
        paddingBottom: 6,
        borderRadius: 20,
        
       // shadowColor: "#000",
        // shadowOffset: {
        //     width: 0,
        //     height: 2,
        // },
        // shadowOpacity: 0.25,
        // shadowRadius: 3.84,
        // elevation: 5,
        // zIndex: 1,
    },
    mapContainer: {
        flex: 1, // This will make it take up remaining space
        
    },
    card: {
        backgroundColor: "white", padding: 10, borderRadius: 10,
        shadowColor: "#000", shadowOpacity: 0.1, shadowRadius: 5,
    },
    dropdownContainer: {
        marginVertical: 4,
    },
    picker: {
        height: 45,
        width: '100%',
        backgroundColor: 'transparent',
    },
    input: {
        height: 45,
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingRight: 35, // Increase right padding to prevent text from going under the button
        backgroundColor: '#fff',
        width: '100%', // Ensure input takes full width
    },
    pickerContainer: {
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 8,
        backgroundColor: '#fff',
        overflow: 'hidden',
    },
    placeholderStyle: {
        fontSize: 16,
        color: '#666',
    },
    selectedTextStyle: {
        fontSize: 16,
        color: '#333',
    },
    customInputContainer: {
        marginTop: 8,
        zIndex: 1,
    },
    doneButton: {
        backgroundColor: '#912338',
        padding: 12,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 10,
    },
    changeRouteButton: {
        position: 'absolute',
        top: 50,
        right: 10,
        backgroundColor: '#912338',
        padding: 12,
        borderRadius: 8,
        zIndex: 1,
        elevation: 1,
    },
    buttonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '500',
    },
    searchContainer: {
        position: 'relative',
        zIndex: 3,
    },
    searchResults: {
        position: 'absolute',
        top: '100%',
        left: 0,
        right: 0,
        backgroundColor: 'white',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#ccc',
        maxHeight: 200,
        overflow: 'scroll',
        zIndex: 4,
    },
    searchResult: {
        padding: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    buildingName: {
        fontSize: 14,
        flex: 1,
    },
    buildingId: {
        fontSize: 12,
        color: '#666',
        marginLeft: 8,
    },
    selectedTravelMode: {
        borderColor: '#912338',
        backgroundColor: '#fff',
    },
    rowContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    dropdown: {
        flex: 1,
        height: 40,
        borderWidth: 1,
        borderRadius: 8,
        paddingHorizontal: 8,
        borderColor: '#ccc',
        backgroundColor: 'white',
    },
    travelModeContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 5,
        marginBottom: 2,
        gap: 14,
    },
    travelModeButton: {
        padding: 0,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#ccc',
        backgroundColor: 'white',
        width: 60,
        height: 30,
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContainer: {
        flex: 1,
        justifyContent: 'flex-start', // Changed from 'center' to 'flex-start'
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        paddingTop: 60, // Add padding at the top
        paddingHorizontal: 20,
        zIndex: 1000, 
    },
    modalContent: {
        backgroundColor: 'white',
        borderRadius: 10,
        padding: 20,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
        maxHeight: '80%', // Limit height to ensure visibility
        overflow: 'visible', // Allow content to overflow
        zIndex: 1000, // Ensure high z-index
    },
    closeButton: {
        position: 'absolute',
        right: 10,
        top: 10,
        zIndex: 1001, // Higher than modalContent
        padding: 5,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 15,
        marginTop: 10,
        textAlign: 'center',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    searchModalContent: {
        backgroundColor: 'white',
        marginTop: 50,
        marginHorizontal: 20,
        borderRadius: 10,
        padding: 20,
        minHeight: 200,
        maxHeight: '80%',
    },
    searchBarContainer: {
        position: 'relative',
        zIndex: 1001,
    },
    textInputContainer: {
        position: 'relative',
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 8, // Add this to maintain consistent spacing
    },
    clearButton: {
        position: 'absolute',
        right: 0,
        top: '40%', // Center vertically
        transform: [{ translateY: -10 }], // Adjust based on icon size to perfectly center
        padding: 5,
        zIndex: 5,
        justifyContent: 'center',
        alignItems: 'center',
    },
    leftArrow: {
        marginBottom: 8, 
    },
});