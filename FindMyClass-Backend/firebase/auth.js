import { auth } from "./config.js";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  updateProfile
} from "firebase/auth";
import { addDocument } from "./firestore.js"; // Import Firestore function to store user data

// Login User
export const loginUser = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    console.log("User logged in: ", userCredential.user);
    return userCredential.user;
  } catch (error) {
    console.error("Login Error: ", error);
    throw error;
  }
};

// Register User
export const registerUser = async (email, password, firstName, lastName) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Update the user profile with the first and last name
    await updateProfile(user, {
      displayName: `${firstName} ${lastName}`,
    });

    // Store additional user data in Firestore (e.g., first name, last name)
    await addDocument("users", {
      uid: user.uid,
      email: user.email,
      firstName,
      lastName,
    });

    console.log("User registered and profile updated: ", user);
    return user;
  } catch (error) {
    console.error("Registration Error: ", error);
    throw error;
  }
};

// Logout User
export const logoutUser = async () => {
  try {
    await signOut(auth);
    console.log("User logged out successfully");
  } catch (error) {
    console.error("Error during sign out: ", error);
    throw error;
  }
};