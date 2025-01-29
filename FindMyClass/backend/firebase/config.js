import dotenv from 'dotenv';
import { initializeApp } from 'firebase/app';
import { getAuth, initializeAuth, 
  getReactNativePersistence, onAuthStateChanged } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Load environment variables
dotenv.config();

const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID,
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Export Auth and Firestore
 const auth = initializeAuth(app, {
  // Set the persistence to AybncStorage because React Native does not support  browser local storage
  // This setup ensure the user stay logged in even after the app is closed.
  persistence: getReactNativePersistence(AsyncStorage) 
});

onAuthStateChanged( auth, (user) => {
  if (user) {
    console.log('User is signed in');
  } else {
    console.log('User is signed out');
  }
});

export const db = getFirestore(app);
export { auth };