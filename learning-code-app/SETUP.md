# React Native + Expo Learning Code App

This is a comprehensive React Native mobile application project that demonstrates mobile development concepts using Expo and Firebase integration.

## Quick Start Guide

### 1. Configure Firebase
Before running the app, you need to set up Firebase:

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project
3. Enable these services:
   - Authentication (Email/Password)
   - Cloud Firestore Database

4. Copy your Firebase config and create a `.env` file:
```bash
cp .env.example .env
```

5. Fill in your Firebase credentials in `.env`

### 2. Install Dependencies
```bash
npm install
```

### 3. Run the App
```bash
# Start development server
npm start

# Run on Android
npm run android

# Run on iOS (macOS only)
npm run ios

# Run on Web
npm run web
```

## Project Overview

This Learning Code To-Do App is a real-world mobile application that demonstrates:

- ✅ **React Native Development**: Native mobile app development
- ✅ **Expo Framework**: Rapid development and deployment
- ✅ **Firebase Integration**: Authentication and Firestore database
- ✅ **Navigation**: Expo Router with tab-based navigation
- ✅ **State Management**: Context API for auth state
- ✅ **TypeScript**: Type-safe development
- ✅ **Responsive UI**: Mobile-first design patterns
- ✅ **Cloud Integration**: Real-time data synchronization

## Features Implemented

### Authentication
- User registration with email and password
- User login
- Secure logout
- Session management

### Language Management
- Add programming languages to learn
- Set difficulty levels
- Delete languages
- Store preferences in Cloud Firestore

### Learning Steps
- Create learning steps for each language
- Add resources and links
- Track completion status
- Mark steps as completed

### User Profile
- View account information
- See membership date
- Quick access to sign out

## Architecture

### Firebase Services
- **Authentication**: Secure user authentication
- **Firestore**: Real-time database for languages and learning steps
- **Rules**: User-based access control for data privacy

### React Native Structure
- **Navigation**: Expo Router with authentication flow
- **Screens**: Modular screen components
- **Context**: Auth context for state management
- **Services**: Firebase service layer for data operations

## Building for Production

### Android APK
```bash
npm run eas-build
```

### iOS App
```bash
eas build --platform ios
```

## Environment Variables

Create a `.env` file with:
```
EXPO_PUBLIC_FIREBASE_API_KEY=your_key
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=your_domain
EXPO_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=your_bucket
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
EXPO_PUBLIC_FIREBASE_APP_ID=your_app_id
EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID=your_measurement_id
```

## Project Requirements Met

✅ Real-world mobile application using React Native and Expo
✅ Demonstrate mobile development concepts and techniques
✅ Clean, responsive, and user-friendly UI/UX design
✅ Integrated Firebase backend and Firestore database
✅ Prepared for APK deployment
✅ GitHub repository ready for submission
✅ Comprehensive documentation

## File Structure

```
learning-code-app/
├── app/                    # Navigation and screens
├── src/
│   ├── config/            # Firebase configuration
│   ├── context/           # Auth context
│   ├── services/          # Firebase services
│   ├── types/             # TypeScript types
│   └── components/        # Reusable components
├── assets/                # Images and assets
├── package.json           # Dependencies
├── app.json               # Expo config
├── tsconfig.json          # TypeScript config
├── babel.config.js        # Babel configuration
└── jest.config.js         # Jest testing config
```

## Next Steps

1. Configure Firebase credentials in `.env`
2. Run `npm install`
3. Start development: `npm start`
4. Test on Android/iOS/Web
5. Build APK: `npm run eas-build`
6. Push to GitHub and submit

## Support

For detailed information, see [README.md](./README.md)

---

**Ready to build? Start with `npm install` and `npm start`! 🚀**
