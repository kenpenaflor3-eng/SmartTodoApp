import 'react-native-get-random-values';
import 'react-native-url-polyfill/auto';
import { initializeApp, getApp, getApps } from 'firebase/app';
import { initializeAuth, getAuth, getReactNativePersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Replace the values below with your Firebase web app config from the console.
const firebaseConfig = {
  apiKey: 'AIzaSyBcz7XQFypLjMqb72fsY1WRGSb5p7HFj20',
  authDomain: 'smarttodoapp-122611.firebaseapp.com',
  projectId: 'smarttodoapp-122611',
  storageBucket: 'smarttodoapp-122611.firebasestorage.app',
  messagingSenderId: '232173300194',
  appId: '1:232173300194:web:9c3a4900e3bf7d49d1f1bb',
};

let app;
let auth = null;
let db = null;
let authInitialized = false;
let dbInitialized = false;

try {
  app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
} catch (e) {
  console.warn('Firebase app init failed:', e);
}

if (app) {
  try {
    if (Platform.OS !== 'web') {
      try {
        auth = initializeAuth(app, {
          persistence: getReactNativePersistence(AsyncStorage),
        });
      } catch (innerError) {
        // Firebase Auth may already be initialized during hot reload.
        auth = getAuth(app);
      }
    } else {
      auth = getAuth(app);
    }
    authInitialized = true;
  } catch (e) {
    console.warn('Firebase auth init failed:', e);
  }

  try {
    db = getFirestore(app);
    dbInitialized = true;
  } catch (e) {
    console.warn('Firebase db init failed:', e);
  }
}

export { auth, db, authInitialized, dbInitialized };
export default app;

