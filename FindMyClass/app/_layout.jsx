import { Drawer } from 'expo-router/drawer';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useCallback } from 'react';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';

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

  return (
    <GestureHandlerRootView style={{ flex: 1 }} onLayout={onLayoutRootView}>
      <Drawer 
        screenOptions={{
          headerShown: true,
          drawerStyle: {
            backgroundColor: '#fff',
          }
        }}
      >
        <Drawer.Screen
          name="index"
          options={{
            drawerLabel: 'Home',
            title: 'Home',
          }}
        />
        <Drawer.Screen
          name="map"
          options={{
            drawerLabel: 'Map',
            title: 'Map',
          }}
        />
        <Drawer.Screen
          name="login"
          options={{
            drawerLabel: 'Login',
            title: 'Login',
          }}
        />
      </Drawer>
    </GestureHandlerRootView>
  );
}
