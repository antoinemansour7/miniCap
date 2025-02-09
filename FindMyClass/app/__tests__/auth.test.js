import axios from 'axios';
import { loginUser, registerUser, logoutUser } from '../api/auth';

// Mock the entire axios module
jest.mock('axios', () => ({
  post: jest.fn()
}));

describe('Authentication Service', () => {
  // Reset mocks before each test
  beforeEach(() => {
    jest.clearAllMocks();
    console.error = jest.fn(); // Mock console.error
    console.log = jest.fn();   // Mock console.log
  });

  describe('loginUser', () => {
    const mockCredentials = {
      email: 'test@example.com',
      password: 'password123'
    };

    it('should successfully login a user', async () => {
      const mockResponse = { data: { token: 'fake-token', user: { id: 1 } } };
      axios.post.mockResolvedValue(mockResponse);

      const result = await loginUser(mockCredentials.email, mockCredentials.password);

      expect(axios.post).toHaveBeenCalledWith(
        'http://localhost:5500/auth/login',
        mockCredentials
      );
      expect(result).toEqual(mockResponse.data);
    });

    it('should throw an error when login fails', async () => {
      const mockError = new Error('Invalid credentials');
      mockError.response = { data: 'Invalid credentials' };
      axios.post.mockRejectedValue(mockError);

      await expect(loginUser(mockCredentials.email, mockCredentials.password))
        .rejects.toThrow();
      expect(console.error).toHaveBeenCalled();
    });
  });

  describe('registerUser', () => {
    const mockUser = {
      email: 'test@example.com',
      password: 'password123',
      firstName: 'John',
      lastName: 'Doe'
    };

    it('should successfully register a user', async () => {
      const mockResponse = { data: { user: { id: 1, ...mockUser } } };
      axios.post.mockResolvedValue(mockResponse);

      const result = await registerUser(
        mockUser.email,
        mockUser.password,
        mockUser.firstName,
        mockUser.lastName
      );

      expect(axios.post).toHaveBeenCalledWith(
        'http://localhost:5500/auth/register',
        mockUser
      );
      expect(result).toEqual(mockResponse.data);
      expect(console.log).toHaveBeenCalledWith('📤 Sending registration request...');
      expect(console.log).toHaveBeenCalledWith('✅ Registration successful:', mockResponse.data);
    });

    it('should throw an error when registration fails', async () => {
      const mockError = new Error('Email already exists');
      mockError.response = { data: 'Email already exists' };
      axios.post.mockRejectedValue(mockError);

      await expect(registerUser(
        mockUser.email,
        mockUser.password,
        mockUser.firstName,
        mockUser.lastName
      )).rejects.toThrow();
      expect(console.error).toHaveBeenCalled();
    });
  });

  describe('logoutUser', () => {
    it('should successfully logout a user', async () => {
      const mockResponse = { data: { message: 'Logged out successfully' } };
      axios.post.mockResolvedValue(mockResponse);

      const result = await logoutUser();

      expect(axios.post).toHaveBeenCalledWith('http://localhost:5500/auth/logout');
      expect(result).toEqual(mockResponse.data);
    });

    it('should throw an error when logout fails', async () => {
      const mockError = new Error('Session expired');
      mockError.response = { data: 'Session expired' };
      axios.post.mockRejectedValue(mockError);

      await expect(logoutUser()).rejects.toThrow();
      expect(console.error).toHaveBeenCalled();
    });
  });
});