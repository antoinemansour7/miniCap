import express from "express";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase/config.js"; // Ensure Firebase is initialized
import { registerUser } from "../firebase/auth.js";

const router = express.Router();

router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    res.json({
      uid: user.uid,
      email: user.email,
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});



// Register Route
router.post("/register", async (req, res) => {
  const { email, password, firstName, lastName } = req.body;

  // Validate password length
  if (!password || password.length < 6) {
    return res.status(400).json({ error: "Password must be at least 6 characters long." });
  }

  try {
    const user = await registerUser(email, password, firstName, lastName);
    res.json({ user });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Logout Route
router.post("/logout", async (req, res) => {
  try {
    await logoutUser();
    res.json({ message: "User logged out successfully" });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

export default router;