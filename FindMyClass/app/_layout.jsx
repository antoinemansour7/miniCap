import { Drawer } from 'expo-router/drawer';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useCallback, useState } from 'react';
import * as SplashScreen from 'expo-splash-screen';
import { View, Text, TextInput, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import { DrawerActions } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import { AuthProvider } from '../contexts/AuthContext';
import ProfileButton from '../components/ProfileButton';

export default function Layout() {
  const [searchText, setSearchText] = useState('');
  const fontsLoaded = true; // ✅ Remove useFonts if not using fonts

  const onLayoutRootView = useCallback(async () => {
    if (fontsLoaded) {
      await SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <AuthProvider>
      <GestureHandlerRootView style={{ flex: 1 }} onLayout={onLayoutRootView}>
        <Drawer
          screenOptions={({ route, navigation }) => ({
            headerShown: true,
            headerStyle: { height: route.name === 'screens/map' ? 140 : 110 },
            drawerStyle: { backgroundColor: '#fff' },
            drawerPosition: 'right',
            headerLeft: () => <ProfileButton />,
            headerRight: () => (
              <TouchableOpacity
                testID="menu-button"
                onPress={() => navigation.dispatch(DrawerActions.openDrawer())}
                style={route.name === 'screens/map' ? { marginRight: 3, marginTop: -50 } : { marginRight: 10 }} 
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
                      onChangeText={setSearchText}
                      testID="search-input"
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
          <Drawer.Screen name="screens/schedule" options={{ drawerLabel: 'Schedule', title: 'Class Schedule' }} />
          {/* Removed routes: screens/login, screens/register, screens/directions and any api/auth references */}
        </Drawer>
      </GestureHandlerRootView>
    </AuthProvider>
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