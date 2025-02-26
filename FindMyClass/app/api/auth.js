import axios from "axios";

const API_URL = "http://10.0.0.178:5500/auth";

export const registerUser = async (email, password, firstName, lastName) => {
  try {
    console.log("📤 Sending registration request to:", API_URL);
    const response = await axios.post(`${API_URL}/register`, {
      email,
      password,
      firstName,
      lastName,
    });
    console.log("✅ Registration successful:", response.data);
    return response.data;
  } catch (error) {
    // Log more detailed error information
    console.error("❌ Registration error details:", {
      message: error.message,
      response: error.response?.data,
      url: API_URL,
    });
    throw error;
  }
};

// Rest of your code remains the same...