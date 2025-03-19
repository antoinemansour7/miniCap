import { Drawer } from 'expo-router/drawer';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useCallback, useEffect } from 'react';
import * as SplashScreen from 'expo-splash-screen';
import { Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { DrawerActions } from '@react-navigation/native';
import { AuthProvider } from '../contexts/AuthContext';
import ProfileButton from '../components/ProfileButton';
import { usePathname } from 'expo-router';
import RNUxcam from 'react-native-ux-cam';
import { uxCamKey } from './secrets'; 
import Constants from 'expo-constants';

export default function Layout() {

  const pathname = usePathname();

  useEffect(() => {

    if (Constants.appOwnership === 'expo') {
      console.warn('Skipping UXCam, Running in Expo Go');
      return;
    }
    // Initialize UXCam only once when the app starts
    const configuration = {
      userAppKey: uxCamKey,
      enableAutomaticScreenNameTagging: false,
      enableAdvancedGestureRecognition: true,
      enableImprovedScreenCapture: true,
    };

    RNUxcam.startWithConfiguration(configuration);
  }, []);

  useEffect(() => {
    // Tag the current screen name whenever route changes
    RNUxcam.tagScreenName(pathname);
  }, [pathname]);

  // Detect UI Freeze
  useEffect(() => {
    let lastFrameTime = Date.now();

    const detectFreeze = () => {
      const now = Date.now();
      const timeSinceLastFrame = now - lastFrameTime;

      if (timeSinceLastFrame > 3000) { // If no frame update for 3+ seconds
        RNUxcam.logEvent('AppFreezeDetected', {
          screen: pathname,
          freezeDuration: timeSinceLastFrame + 'ms',
          timestamp: new Date().toISOString(),
        });
        console.warn(' App freeze detected:', timeSinceLastFrame, 'ms');
      }

      lastFrameTime = now;
      requestAnimationFrame(detectFreeze);
    };

    requestAnimationFrame(detectFreeze);
  }, []);


  // Removed searchText state since search bar is no longer needed for maps
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
            drawerItemStyle: {
              // Hide auth routes from drawer
              display: route.name.startsWith('auth/') ? 'none' : undefined
            },
            // Uniform header height for all routes
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
            headerTitle: () =>
              // For the maps route, simply display the title without a search bar.
              route.name === 'index' ? (
                <Text style={styles.headerTitle}>Map</Text>
              ) : route.name === 'screens/index' ? (
                <Text style={styles.headerTitle}>Home</Text>
              ) : (
                <Text style={styles.headerTitle}>
                  {route.name.replace('screens/', '')}
                </Text>
              ),
            drawerActiveBackgroundColor: '#800000',
            drawerActiveTintColor: '#fff',
          })}
        >
          <Drawer.Screen
            name="screens/index"
            options={{ drawerLabel: 'Home', title: 'Home' }}
          />
          <Drawer.Screen
            name="index"
            options={{ drawerLabel: 'Map', title: 'Map' }}
          />
          <Drawer.Screen
            name="screens/schedule"
            options={{ drawerLabel: 'Schedule', title: 'Class Schedule' }}
          />
          <Drawer.Screen
            name="screens/profile"
            options={{ drawerLabel: 'Profile', title: 'Profile' }}
          />

          {/* Removed routes from the Drawer Nav below */}


          <Drawer.Screen name="screens/directions" options={{
            drawerLabel: () => null, 
            title: 'Directions',
            drawerItemStyle: { display: 'none' },
            headerShown: false,

            }}
          />

          <Drawer.Screen
            name="auth"
            options={{
              drawerLabel: () => null,
              title: 'auth',
              drawerItemStyle: { display: 'none' },
            }}
          />
          <Drawer.Screen
            name="api/auth"
            options={{
              drawerLabel: () => null,
              title: 'api/auth',
              drawerItemStyle: { display: 'none' },
            }}
          />
             <Drawer.Screen
            name="api/googleCalendar"
            options={{
              drawerLabel: () => null,
              title: 'api/googleCalendar',
              drawerItemStyle: { display: 'none' },
            }}
          />
              <Drawer.Screen
            name="styles/authStyles"
            options={{
              drawerLabel: () => null,
              title: 'styles/authStyles',
              drawerItemStyle: { display: 'none' },
            }}
          />
             
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
