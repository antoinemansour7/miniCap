import axios from "axios";

const API_URL = "http://localhost:5500/auth";  // Ensure correct backend URL is used

// ✅ Login API Call
export const loginUser = async (email, password) => {
  try {
    const response = await axios.post(`${API_URL}/login`, { email, password });
    return response.data;
  } catch (error) {
    console.error("Login error:", error.response?.data || error.message);
    throw error;
  }
};

// ✅ Register API Call
export const registerUser = async (email, password, firstName, lastName) => {
  try {
    console.log("📤 Sending registration request..."); // ✅ Log request
    const response = await axios.post(`${API_URL}/register`, { email, password, firstName, lastName });
    console.log("✅ Registration successful:", response.data); // ✅ Log response
    return response.data;
  } catch (error) {
    console.error("❌ Registration error:", error.response?.data || error.message);
    throw error;
  }
};

// ✅ Logout API Call
export const logoutUser = async () => {
  try {
    const response = await axios.post(`${API_URL}/logout`);
    return response.data;
  } catch (error) {
    console.error("Logout error:", error.response?.data || error.message);
    throw error;
  }
};

// ✅ Add default export to fix Expo Router warning
export default {
  loginUser,
  registerUser,
  logoutUser,
};