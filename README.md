# miniCap

# FindMyClass

FindMyClass is a React Native application built with Expo and Firebase. It simplifies mobile app development with cross-platform compatibility and a robust backend.

---

## Project Setup

### Prerequisites
Make sure you have the following installed before setting up the project:
- **Node.js** (LTS version 18 or higher)  
  [Download Node.js](https://nodejs.org/)
- **Expo CLI**  
  Install Expo CLI globally by running:
  ```bash
  npm install -g expo-cli
  ```

- **Firebase Account**
  Create a Firebase account at Firebase Console.

### Installation
1. Clone the Repository
   Clone the repository to your local machine:
   ```bash
   git clone https://github.com/<your-username>/FindMyClass.git
   cd FindMyClass
   ```

2. Install Dependencies
   Install the required dependencies by running:
   ```bash
   npm install
   ```

### Running the Application

1. Start the Backend
   Navigate to the `FindMyClass-Backend` directory and start the backend server:
   ```bash
   cd FindMyClass-Backend
   node server.js
   ```

2. Start the Frontend
   In a new terminal, navigate to the root directory of the project and start the Expo development server:
   ```bash
   npx expo start
   ```

### Additional Setup

1. Copy `app.json`
   Copy the `app.json` file provided in the Discord channel to the root directory of the project.

2. Create `.env` File
   Create a `.env` file in the `FindMyClass-Backend` directory with the necessary environment variables.
