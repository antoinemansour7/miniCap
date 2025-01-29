import { auth, db } from './config.js'; // Use .js extension for ES module imports
import { collection, getDocs } from 'firebase/firestore';

async function testFirestoreConnection() {
  try {
    // Attempt to read data from a Firestore collection
    const testCollection = 'test-collection'; // Replace with an actual collection name
    const querySnapshot = await getDocs(collection(db, testCollection));

    console.log('Firestore is working! Retrieved documents:');
    querySnapshot.forEach((doc) => {
      console.log(`${doc.id} =>`, doc.data());
    });
  } catch (error) {
    console.error('Error testing Firestore connection:', error);
  }
}

function testAuthInitialization() {
  try {
    // Check if Auth instance is initialized
    if (auth) {
      console.log('Firebase Auth is working!');
    } else {
      console.log('Firebase Auth is not initialized.');
    }
  } catch (error) {
    console.error('Error testing Firebase Auth:', error);
  }
}

// Run the tests
testFirestoreConnection();
testAuthInitialization();