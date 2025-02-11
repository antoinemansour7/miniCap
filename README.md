# FindMyClass

FindMyClass is a React Native mobile application designed to help students navigate university buildings and find their classrooms efficiently. Built with Expo and Firebase, it provides an intuitive interface for classroom discovery and navigation.

## Features

- **Building Navigation**: Interactive maps of university buildings
- **Classroom Search**: Quick search functionality for finding specific rooms
- **User Authentication**: Secure login and registration system
- **Favorites**: Save frequently visited classrooms
- **Real-time Updates**: Live updates for room availability and changes
- **Offline Support**: Basic functionality works without internet connection

## Tech Stack

- **Frontend**: React Native, Expo
- **Backend**: Node.js, Express
- **Database**: Firebase Realtime Database
- **Authentication**: Firebase Auth
- **Maps**: React Native Maps
- **State Management**: React Context API
- **UI Components**: React Native Paper

## Project Setup

### Prerequisites
- **Node.js** (LTS version 18 or higher)
  [Download Node.js](https://nodejs.org/)
- **Expo CLI**
  ```bash
  npm install -g expo-cli
  ```
- **Firebase Account**
  [Create at Firebase Console](https://console.firebase.google.com/)
- **Git**
  [Download Git](https://git-scm.com/)

### Installation

1. **Clone the Repository**
   ```bash
   git clone https://github.com/your-username/FindMyClass.git
   cd FindMyClass
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Environment Configuration**
   Create a `.env` file in the project root:
   ```
   FIREBASE_API_KEY=your_api_key
   FIREBASE_AUTH_DOMAIN=your_auth_domain
   FIREBASE_PROJECT_ID=your_project_id
   FIREBASE_STORAGE_BUCKET=your_storage_bucket
   FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   FIREBASE_APP_ID=your_app_id
   BACKEND_URL=your_backend_url
   ```

### Running the Application

1. **Start Backend Server**
   ```bash
   cd FindMyClass-Backend
   npm install
   node server.js
   ```

2. **Start Frontend**
   ```bash
   # In project root
   npx expo start
   ```

3. **Testing the App**
   - Use Expo Go app on your mobile device
   - Scan QR code from terminal
   - Or use iOS/Android simulators

## Development Guidelines

### Code Style
- Follow ESLint configuration
- Use Prettier for formatting
- Follow component-based architecture
- Write meaningful commit messages

### Testing
```bash
npm run test        # Run unit tests
npm run test:e2e    # Run end-to-end tests
```

### Building for Production
```bash
expo build:android  # Build Android APK
expo build:ios      # Build iOS IPA
```

## Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

## Support

For support, please open an issue in the GitHub repository or contact the development team.

## License

This project is licensed under the MIT License - see the LICENSE file for details.
