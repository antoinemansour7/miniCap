import React, { useCallback, useEffect } from 'react';
import { Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Drawer } from 'expo-router/drawer';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import * as SplashScreen from 'expo-splash-screen';
import { DrawerActions } from '@react-navigation/native';
import { MaterialIcons } from '@expo/vector-icons';
import { usePathname } from 'expo-router';

import { AuthProvider } from '../contexts/AuthContext';
import { ThemeProvider, useTheme } from '../contexts/ThemeContext';
import { LanguageProvider, useLanguage } from '../contexts/LanguageContext';
import ProfileButton from '../components/ProfileButton';
import RNUxcam from 'react-native-ux-cam';
import { uxCamKey } from './secrets'; 
import Constants from 'expo-constants';

const getTitleForRoute = (routeName, t) => {
  switch (routeName) {
    case 'index':
      return t.map;
    case 'screens/index':
      return t.home;
    case 'screens/profile':
      return t.profile;
    case 'screens/schedule':
      return t.schedule;
    case 'screens/settings':
      return t.settings;
    default:
      return routeName.replace('screens/', '');
  }
};

function AppDrawerLayout() {
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


  const { t } = useLanguage();
  const { darkMode } = useTheme();

  const fontsLoaded = true;

  const onLayoutRootView = useCallback(async () => {
    if (fontsLoaded) {
      await SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) return null;

  const backgroundColor = darkMode ? '#000' : '#fff';
  const textColor = darkMode ? '#fff' : '#333';

  return (
    <GestureHandlerRootView style={{ flex: 1 }} onLayout={onLayoutRootView}>
      <Drawer
        screenOptions={({ route, navigation }) => {
          const title = getTitleForRoute(route.name, t); // ✅ string only
          return {
            headerShown: true,
            drawerItemStyle: {
              display: route.name.startsWith('auth/') ? 'none' : undefined,
            },
            headerStyle: {
              height: 110,
              backgroundColor,
            },
            headerTintColor: textColor,
            drawerStyle: {
              backgroundColor,
            },
            drawerLabelStyle: {
              color: textColor,
              fontWeight: 'bold',
            },
            drawerPosition: 'right',
            headerLeft: () => <ProfileButton />,
            headerRight: () => (
              <TouchableOpacity
                testID="menu-button"
                onPress={() => navigation.dispatch(DrawerActions.openDrawer())}
                style={{ marginRight: 10 }}
              >
                <MaterialIcons name="menu" size={30} color={textColor} />
              </TouchableOpacity>
            ),
            headerTitle: () => (
              <Text style={[styles.headerTitle, { color: textColor }]}>
                {title}
              </Text>
            ),
            drawerActiveBackgroundColor: '#800000',
            drawerActiveTintColor: '#fff',
          };
        }}
      >
        <Drawer.Screen name="screens/index" options={{ drawerLabel: t.home, title: t.home }} />
        <Drawer.Screen name="index" options={{ drawerLabel: t.map, title: t.map }} />
        <Drawer.Screen name="screens/schedule" options={{ drawerLabel: t.schedule, title: t.schedule }} />
        <Drawer.Screen name="screens/profile" options={{ drawerLabel: t.profile, title: t.profile }} />
        <Drawer.Screen name="screens/settings" options={{ drawerLabel: t.settings, title: t.settings }} />

        {/* Hidden routes */}
        <Drawer.Screen name="screens/directions" options={{ drawerLabel: () => null, title: 'Directions', drawerItemStyle: { display: 'none' }, headerShown: false }} />
        <Drawer.Screen name="auth" options={{ drawerLabel: () => null, title: 'auth', drawerItemStyle: { display: 'none' } }} />
        <Drawer.Screen name="api/auth" options={{ drawerLabel: () => null, title: 'api/auth', drawerItemStyle: { display: 'none' } }} />
        <Drawer.Screen name="api/googleCalendar" options={{ drawerLabel: () => null, title: 'api/googleCalendar', drawerItemStyle: { display: 'none' } }} />
        <Drawer.Screen name="styles/authStyles" options={{ drawerLabel: () => null, title: 'styles/authStyles', drawerItemStyle: { display: 'none' } }} />
      </Drawer>
    </GestureHandlerRootView>
  );
}

// ✅ Export layout with all providers
export default function Layout() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <LanguageProvider>
          <AppDrawerLayout />
        </LanguageProvider>
      </ThemeProvider>
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
  },
});