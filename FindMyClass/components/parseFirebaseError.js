const parseFirebaseError = (error) => {
    let message = "An unexpected error occurred. Please try again.";
    if (error.code) {
      switch (error.code) {
        case 'auth/invalid-email':
          message = "Please enter a valid email address.";
          break;
        case 'auth/user-disabled':
          message = "This account has been disabled. Please contact support.";
          break;
        case 'auth/user-not-found':
          message = "No user found with this email. Please sign up.";
          break;
        case 'auth/wrong-password':
          message = "Incorrect password. Please try again.";
          break;
        case 'auth/invalid-credential':
          message = "Invalid credentials. Please try again.";
          break;
        case 'auth/weak-password':
          message = "Password should be at least 6 characters.";
          break;
        case 'auth/email-already-in-use':
          message = "An account with this email already exists.";
          break;
        case 'auth/operation-not-allowed':
          message = "Signing in with email and password is not enabled.";
          break;
        // Add more cases as needed for other error codes
        default:
          message = error.message;  // Fall back to the raw Firebase message if no cases match
      }
    }
    return message;
  };

  export default parseFirebaseError;