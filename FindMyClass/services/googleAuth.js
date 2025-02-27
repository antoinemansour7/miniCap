import { useState, useEffect } from 'react';
import { auth, signInWithGoogle } from 'backend-config';
import { onAuthStateChanged } from 'firebase/auth';

export const useGoogleAuth = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Monitor authentication state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    // Cleanup subscription
    return () => unsubscribe();
  }, []);

  // Wrapper for Google Sign-In
  const promptAsync = async () => {
    try {
      setLoading(true);
      const userCredential = await signInWithGoogle();
      setUser(userCredential);
      return { type: 'success', user: userCredential };
    } catch (signInError) {
      setError(signInError);
      console.error('Google Sign-In Error:', signInError);
      return { type: 'error', error: signInError };
    } finally {
      setLoading(false);
    }
  };

  // Sign out method
  const signOut = async () => {
    try {
      await auth.signOut();
      setUser(null);
    } catch (signOutError) {
      console.error('Sign Out Error:', signOutError);
      setError(signOutError);
    }
  };

  return {
    user,
    loading,
    error,
    promptAsync,
    signOut
  };
};