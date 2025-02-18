import { Drawer } from 'expo-router/drawer';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useCallback, useState } from 'react';
import * as SplashScreen from 'expo-splash-screen';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { DrawerActions } from '@react-navigation/native';
import { AuthProvider } from '../contexts/AuthContext';
import ProfileButton from '../components/ProfileButton';

export default function Layout() {
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
            headerStyle: { height: 110 },
            drawerStyle: { backgroundColor: '#fff' },
            drawerPosition: 'right',
            headerLeft: () => <ProfileButton />,
            headerRight: () => (
              <TouchableOpacity
                testID="menu-button"
                onPress={() => navigation.dispatch(DrawerActions.openDrawer())}
                style={{ marginRight: 10 }}
              >
                <MaterialIcons name="menu" size={30} color="#912338" />
              </TouchableOpacity>
            ),
            headerTitle: () => (
              <Text style={styles.headerTitle}>{route.name.replace('screens/', '')}</Text>
            ),
            drawerActiveBackgroundColor: '#800000',
            drawerActiveTintColor: '#fff',
          })}
        >
          <Drawer.Screen name="screens/index" options={{ drawerLabel: 'Home', title: 'Home' }} />
          <Drawer.Screen name="screens/map" options={{ drawerLabel: 'Map', title: 'Map' }} />
          <Drawer.Screen name="screens/schedule" options={{ drawerLabel: 'Schedule', title: 'Class Schedule' }} />
        </Drawer>
      </GestureHandlerRootView>
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
  },
});
