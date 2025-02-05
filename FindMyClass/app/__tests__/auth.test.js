import axios from "axios";
import auth from "../api/auth"; // Adjust path as needed

jest.mock("axios"); // ✅ Mock axios to prevent real API calls

describe("Auth API", () => {
  const API_URL = "http://localhost:5500/auth";

  afterEach(() => {
    jest.clearAllMocks(); // ✅ Clear mocks after each test
  });

  test("loginUser makes a POST request and returns data", async () => {
    const mockData = { token: "fake-jwt-token", user: { id: 1, email: "test@example.com" } };
    axios.post.mockResolvedValue({ data: mockData });

    const result = await auth.loginUser("test@example.com", "password123");

    expect(axios.post).toHaveBeenCalledWith(`${API_URL}/login`, { email: "test@example.com", password: "password123" });
    expect(result).toEqual(mockData);
  });

  test("registerUser makes a POST request and returns data", async () => {
    const mockData = { message: "User registered successfully" };
    axios.post.mockResolvedValue({ data: mockData });

    const result = await auth.registerUser("test@example.com", "password123", "John", "Doe");

    expect(axios.post).toHaveBeenCalledWith(`${API_URL}/register`, { email: "test@example.com", password: "password123", firstName: "John", lastName: "Doe" });
    expect(result).toEqual(mockData);
  });

  test("logoutUser makes a POST request and returns data", async () => {
    const mockData = { message: "User logged out" };
    axios.post.mockResolvedValue({ data: mockData });

    const result = await auth.logoutUser();

    expect(axios.post).toHaveBeenCalledWith(`${API_URL}/logout`);
    expect(result).toEqual(mockData);
  });

  test("loginUser handles API errors", async () => {
    axios.post.mockRejectedValue({ response: { data: { error: "Invalid credentials" } } });

    await expect(auth.loginUser("test@example.com", "wrongpassword")).rejects.toEqual({ response: { data: { error: "Invalid credentials" } } });

    expect(axios.post).toHaveBeenCalledWith(`${API_URL}/login`, { email: "test@example.com", password: "wrongpassword" });
  });

  test("registerUser handles API errors", async () => {
    axios.post.mockRejectedValue({ response: { data: { error: "User already exists" } } });

    await expect(auth.registerUser("test@example.com", "password123", "John", "Doe")).rejects.toEqual({ response: { data: { error: "User already exists" } } });

    expect(axios.post).toHaveBeenCalledWith(`${API_URL}/register`, { email: "test@example.com", password: "password123", firstName: "John", lastName: "Doe" });
  });

  test("logoutUser handles API errors", async () => {
    axios.post.mockRejectedValue({ response: { data: { error: "Not authenticated" } } });

    await expect(auth.logoutUser()).rejects.toEqual({ response: { data: { error: "Not authenticated" } } });

    expect(axios.post).toHaveBeenCalledWith(`${API_URL}/logout`);
  });
});