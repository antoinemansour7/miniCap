import { loginUser, registerUser, logoutUser } from './auth.js';

// Test user credentials
const testUser = {
  email: 'test1@example.com',
  password: 'testPassword123!',
  firstName: 'Test',
  lastName: 'User'
};

// Test registration
async function testRegistration() {
  try {
    const user = await registerUser(
      testUser.email,
      testUser.password,
      testUser.firstName,
      testUser.lastName
    );
    console.log('Registration successful:', user);
    return user;
  } catch (error) {
    console.error('Registration test failed:', error);
  }
}

// Test login
async function testLogin() {
  try {
    const user = await loginUser(testUser.email, testUser.password);
    console.log('Login successful:', user);
    return user;
  } catch (error) {
    console.error('Login test failed:', error);
  }
}

// Test logout
async function testLogout() {
  try {
    await logoutUser();
    console.log('Logout successful');
  } catch (error) {
    console.error('Logout test failed:', error);
  }
}

// Main test execution
async function runTests() {
  try {
    console.log('Starting tests...');
    
    // Test full flow
    await testRegistration();
    await testLogin();
    await testLogout();
    
    console.log('All tests completed');
  } catch (error) {
    console.error('Test suite failed:', error);
  }
}

// Run tests
runTests();