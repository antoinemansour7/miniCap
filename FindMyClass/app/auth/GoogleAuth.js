import React, { useEffect, useState } from "react";
import { View, Text, Button, Alert } from "react-native";
import * as Google from "expo-auth-session/providers/google";
import { getAuth, GoogleAuthProvider, signInWithCredential } from "firebase/auth";
import { initializeApp } from "firebase/app";
import { useAuth } from '../../contexts/AuthContext'; // new import
import { useRouter } from 'expo-router'; // new import

// ✅ Your Firebase config (copy from Firebase Console)
const firebaseConfig = {
    apiKey: "AIzaSyAOj18hgmMc9-GiCCYH3_qJyG1HlrukoEc",
    authDomain: "findmyclass-de714.firebaseapp.com",
    projectId: "findmyclass-de714",
    storageBucket: "findmyclass-de714.firebasestorage.app",
    messagingSenderId: "566973195502",
    appId: "1:566973195502:web:165b434272a1ee6e613fff"
  };

// 🔥 Initialize Firebase only once
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);


export default function GoogleAuth() {
    const [user, setUser] = useState(null);
    const { login } = useAuth(); // get global login function
    const router = useRouter(); // get router
  
    // ✅ Google Sign-In Configuration
    const [request, response, promptAsync] = Google.useAuthRequest({
      
      iosClientId: "625867070738-vdkl0rjh31rgdjbcrkdk1f7t26rvgule.apps.googleusercontent.com",
      webClientId: "625867070738-tuutugqs4lki8pv3gie97tfnqvm056ha.apps.googleusercontent.com"
    });
  
    // ✅ Handle authentication response
    useEffect(() => {
      if (response?.type === "success") {
        const { id_token } = response.params;
        const credential = GoogleAuthProvider.credential(id_token);
  
        signInWithCredential(getAuth(), credential)
          .then((userCredential) => {
            setUser(userCredential.user);
            login(userCredential.user); // update global auth state
            Alert.alert("Success", `Welcome ${userCredential.user.displayName || userCredential.user.email}!`);
            router.push('/screens/profile'); // navigate to Profile screen
          })
          .catch((error) => {
            console.error("Google Sign-In Error:", error);
            Alert.alert("Error", "Failed to sign in with Google");
          });
      }
    }, [response]);
  
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text>Google Sign-In</Text>
        {!user ? (
          <Button
            title="Sign in with Google"
            disabled={!request}
            onPress={() => promptAsync()}
          />
        ) : (
          <Text>Welcome, {user.displayName || user.email}</Text>
        )}
      </View>
    );
  }
