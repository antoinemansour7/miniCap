import { Drawer } from 'expo-router/drawer';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useCallback } from 'react';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { Button, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

import { useNavigation  } from '@react-navigation/native';
import { DrawerActions } from '@react-navigation/native';

export default function Layout() {
  const [fontsLoaded, fontError] = useFonts({
    // Add any custom fonts here if needed
  });

  const onLayoutRootView = useCallback(async () => {
    if (fontsLoaded || fontError) {
      await SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) {
    return null;
  }

  const navigation = useNavigation(); // Using the navigation hook to move the drawer '3 lines" icon to the right
  return (
    <GestureHandlerRootView style={{ flex: 1 }} onLayout={onLayoutRootView}>
      <Drawer 
        screenOptions={{
          headerShown: true,
          drawerStyle: {
            backgroundColor: '#fff',
          }, 
          drawerPosition:'right', // To move the drawer to the right
          headerLeft: () => null, // Removes default 3 lines icon from the left side
          headerRight: () => ( // Adds 3 lines icon to the right side
            <TouchableOpacity 
            onPress={ () => navigation.dispatch(DrawerActions.openDrawer())}
            style = {{marginRight: 10 }}
            > 
            <MaterialIcons  name="menu" size={30} color="#912338" />
            </TouchableOpacity>
          ),
          drawerActiveBackgroundColor: '#800000',
          drawerActiveTintColor: '#fff',
        }}
      >
        <Drawer.Screen
          name="screens/index"
          options={{
            drawerLabel: 'Home',
            title: 'Home',
          }}
        />
        <Drawer.Screen
          name="screens/map"
          options={{
            drawerLabel: 'Map',
            title: 'Map',
          }}
        />
        <Drawer.Screen
          name="screens/login"
          options={{
            drawerLabel: 'Login',
            title: 'Login',
          }}
        />

        <Drawer.Screen
          name="screens/register"
          options={{
            drawerLabel: 'Register',
            title: 'Register',
          }}
        />

        <Drawer.Screen 
        name = "screens/profile"
        options={{
          drawerLabel: 'Profile',
          title: 'Profile',
        }}
        />
      </Drawer>
    </GestureHandlerRootView>
  );
}
