import { Drawer } from 'expo-router/drawer';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useCallback, useState, useEffect } from 'react';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { View, Text, TextInput, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { DrawerActions } from '@react-navigation/native';

export default function Layout() {
  const [fontsLoaded, fontError] = useFonts({});
  const [searchText, setSearchText] = useState('');
  const navigation = useNavigation();

  const onLayoutRootView = useCallback(async () => {
    if (fontsLoaded || fontError) {
      await SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) {
    return null;
  }
  //File
  // Use useEffect to set params when searchText updates
  useEffect(() => {
    navigation.setParams({ searchText });  // Dynamically update searchText param
  }, [searchText, navigation]);

  return (
    <GestureHandlerRootView style={{ flex: 1 }} onLayout={onLayoutRootView}>
      <Drawer
        screenOptions={({ route }) => ({
          headerShown: true,
          headerStyle: { height: route.name === 'screens/map' ? 140 : 90 },
          drawerStyle: { backgroundColor: '#fff' },
          drawerPosition: 'right',
          headerLeft: () => null,
          headerRight: () => (
            <TouchableOpacity
              onPress={() => {
                navigation.dispatch(DrawerActions.openDrawer());
              }}
              style={route.name === 'screens/map' ? { marginRight: 3, marginTop: -50 } : { marginRight: 5 }} // Only modify for Map screen
            >
              <MaterialIcons name="menu" size={30} color="#912338" />
            </TouchableOpacity>
          ),          
          headerTitle: () =>
            route.name === 'screens/map' ? (
              <View style={styles.headerContainer}>
                <Text style={styles.headerTitle}>Map</Text>
                <View style={styles.searchContainer}>
                  <Ionicons name="search" size={20} color="#A0A0A0" style={styles.searchIcon} />
                  <TextInput
                    style={styles.searchInput}
                    placeholder="Search for buildings, locations..."
                    placeholderTextColor="#A0A0A0"
                    value={searchText}
                    onChangeText={(text) => {
                      setSearchText(text);
                    }}
                  />
                </View>
              </View>
            ) : (
              <Text style={styles.headerTitle}>{route.name.replace('screens/', '')}</Text>
            ),
          drawerActiveBackgroundColor: '#800000',
          drawerActiveTintColor: '#fff',
        })}
      >
        <Drawer.Screen name="screens/index" options={{ drawerLabel: 'Home', title: 'Home' }} />
        <Drawer.Screen name="screens/map" options={{ drawerLabel: 'Map', title: 'Map' }} />
        <Drawer.Screen name="screens/login" options={{ drawerLabel: 'Login', title: 'Login' }} />
        <Drawer.Screen name="screens/register" options={{ drawerLabel: 'Register', title: 'Register' }} />
        <Drawer.Screen name="screens/profile" options={{ drawerLabel: 'Profile', title: 'Profile' }} />
        <Drawer.Screen name="screens/schedule" options={{ drawerLabel: 'Schedule',title: 'Class Schedule'}}/>
      </Drawer>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  headerContainer: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: 8,
    paddingHorizontal: 10,
    width: 300,
    height: 45,
    borderWidth: 1,
    borderColor: '#ccc',
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 5,
  },
});
