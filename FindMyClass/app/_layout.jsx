import { Drawer } from 'expo-router/drawer';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useCallback, useEffect } from 'react';
import * as SplashScreen from 'expo-splash-screen';
import { Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { DrawerActions } from '@react-navigation/native';
import { AuthProvider } from '../contexts/AuthContext';
import { ThemeProvider, useTheme } from '../contexts/ThemeContext';
import { LanguageProvider, useLanguage } from '../contexts/LanguageContext';
import ProfileButton from '../components/ProfileButton';
import { usePathname } from 'expo-router';
import Constants from 'expo-constants';
import RNUxcam from 'react-native-ux-cam';
import { uxCamKey } from './secrets';

// Function component that consumes the context
function ThemedLayout() {
  const { darkMode } = useTheme();
  const { t } = useLanguage();
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

      if (timeSinceLastFrame > 3000) {
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

  const fontsLoaded = true;

  const onLayoutRootView = useCallback(async () => {
    if (fontsLoaded) {
      await SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return null;
  }

  const getScreenTitle = (routeName) => {
    const screenTitles = {
      'index': t.map,
      'screens/index': t.home,
      'screens/schedule': t.schedule,
      'screens/profile': t.profile,
      'screens/settings': t.settings,
      'screens/SmartPlannerScreen': 'Smart Planner',
    };

    if (screenTitles[routeName]) {
      return screenTitles[routeName];
    }

    const baseName = routeName.replace('screens/', '');
    if (t[baseName]) {
      return t[baseName];
    }

    return baseName.charAt(0).toUpperCase() + baseName.slice(1);
  };

  const dynamicStyles = {
    headerTitle: {
      color: darkMode ? '#FFFFFF' : '#333',
    },
    drawer: {
      backgroundColor: darkMode ? '#121212' : '#fff',
    }
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }} onLayout={onLayoutRootView}>
      <Drawer
        screenOptions={({ route, navigation }) => ({
          headerShown: true,
          drawerItemStyle: {
            display: route.name.startsWith('auth/') ? 'none' : undefined
          },
          headerStyle: { 
            height: 110,
            backgroundColor: darkMode ? '#121212' : '#FFFFFF',
          },
          drawerStyle: dynamicStyles.drawer,
          drawerPosition: 'right',
          headerLeft: () => <ProfileButton darkMode={darkMode} />,
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
            <Text style={[styles.headerTitle, dynamicStyles.headerTitle]}>
              {getScreenTitle(route.name)}
            </Text>
          ),
          drawerActiveBackgroundColor: '#800000',
          drawerActiveTintColor: '#fff',
          drawerInactiveTintColor: darkMode ? '#FFFFFF' : '#333333',
        })}
      >
        <Drawer.Screen
          name="screens/index"
          options={{ drawerLabel: t.home, title: t.home }}
        />
        <Drawer.Screen
          name="index"
          options={{ drawerLabel: t.map, title: t.map }}
        />
        <Drawer.Screen
          name="screens/schedule"
          options={{ drawerLabel: t.schedule, title: t.schedule }}
        />
        <Drawer.Screen
          name="screens/profile"
          options={{ drawerLabel: t.profile, title: t.profile }}
        />
        <Drawer.Screen
          name="screens/settings"
          options={{ drawerLabel: t.settings, title: t.settings }}
        />
        <Drawer.Screen
          name="screens/SmartPlannerScreen"
          options={{ 
            drawerLabel: "Smart Planner", 
            title: "Smart Planner",
            headerTitle: "Smart Planner"
          }}
        />

        {/* Hidden routes below */}
        <Drawer.Screen
          name="screens/directions"
          options={{
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
          name="api/googleCalendars"
          options={{
            drawerLabel: () => null,
            title: 'api/googleCalendars',
            drawerItemStyle: { display: 'none' },
          }}
        />
        <Drawer.Screen
          name="secrets"
          options={{
            drawerLabel: () => null,
            title: 'secrets',
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
  );
}

// Main Layout component
export default function Layout() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <LanguageProvider>
          <ThemedLayout />
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
