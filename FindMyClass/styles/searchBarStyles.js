import { StyleSheet } from "react-native";


export const styles = StyleSheet.create({
    container: {
      margin: 10,
    },
    searchContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: '#FFF',
      borderRadius: 8,
      paddingHorizontal: 10,
      borderWidth: 1,
      borderColor: '#ccc',
    },
    searchIcon: { 
      marginRight: 8 
    },
    searchInput: { 
      flex: 1, 
      fontSize: 16, 
      paddingVertical: 5 
    },
    suggestionsContainer: {
      backgroundColor: '#FFF',
      borderColor: '#ccc',
      borderWidth: 1,
      borderTopWidth: 0,
      borderBottomLeftRadius: 8,
      borderBottomRightRadius: 8,
      maxHeight: 200,
    },
    suggestionItem: {
      padding: 10,
      borderBottomColor: '#eee',
      borderBottomWidth: 1,
    },
    suggestionText: {
      fontSize: 16,
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
  });