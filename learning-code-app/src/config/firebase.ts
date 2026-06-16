import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey:  'AIzaSyD-mm-JUrI0SFm_y-hCC6zrnqe_PG6YCR4',
  authDomain:  'learning-code-to-do-app.firebaseapp.com',
  projectId:  'learning-code-to-do-app',
  storageBucket: 'learning-code-to-do-app.firebasestorage.app',
  messagingSenderId:  '1005053790800',
  appId:  '1:1005053790800:web:9b5b5870e81f080e77df55',
  measurementId: 'G-RWZEVGD1R1',
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export default app;