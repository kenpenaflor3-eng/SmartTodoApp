import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  updateProfile,
  User as FirebaseUser,
} from 'firebase/auth';
import { collection, addDoc, query, where, getDocs, updateDoc, doc, deleteDoc, setDoc, deleteField } from 'firebase/firestore';
import { auth, db } from '../config/firebase';
import { User, Language, LearningStep } from '../types';

// Auth Service
export const authService = {
  async signUp(email: string, password: string, displayName: string): Promise<FirebaseUser> {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(userCredential.user, { displayName });
    
    // Create user document in Firestore
    await setDoc(doc(db, 'users', userCredential.user.uid), {
      uid: userCredential.user.uid,
      email: email,
      displayName: displayName,
      createdAt: new Date(),
    });
    
    return userCredential.user;
  },

  async signIn(email: string, password: string): Promise<FirebaseUser> {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  },

  async signOut(): Promise<void> {
    await firebaseSignOut(auth);
  },

  getCurrentUser(): FirebaseUser | null {
    return auth.currentUser;
  },
};

// Languages Service
export const languagesService = {
  async addLanguage(language: Omit<Language, 'id' | 'createdAt'>): Promise<Language> {
    const docRef = await addDoc(collection(db, 'languages'), {
      ...language,
      createdAt: new Date(),
    });
    return {
      ...language,
      id: docRef.id,
      createdAt: new Date(),
    };
  },

  async getUserLanguages(userId: string): Promise<Language[]> {
    const q = query(collection(db, 'languages'), where('userId', '==', userId));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => ({
      ...doc.data(),
      id: doc.id,
    })) as Language[];
  },

  async updateLanguage(id: string, updates: Partial<Language>): Promise<void> {
    const docRef = doc(db, 'languages', id);
    // Filter out undefined values to avoid Firestore errors
    const cleanUpdates = Object.fromEntries(
      Object.entries(updates).filter(([_, value]) => value !== undefined)
    );
    if (Object.keys(cleanUpdates).length > 0) {
      await updateDoc(docRef, cleanUpdates);
    }
  },

  async deleteLanguage(id: string): Promise<void> {
    const docRef = doc(db, 'languages', id);
    await deleteDoc(docRef);
  },
};

// Learning Steps Service
export const learningStepsService = {
  async addStep(step: Omit<LearningStep, 'id' | 'createdAt'>): Promise<LearningStep> {
    const docRef = await addDoc(collection(db, 'learningSteps'), {
      ...step,
      createdAt: new Date(),
    });
    return {
      ...step,
      id: docRef.id,
      createdAt: new Date(),
    };
  },

  async getLanguageSteps(languageId: string, userId: string): Promise<LearningStep[]> {
    const q = query(
      collection(db, 'learningSteps'),
      where('languageId', '==', languageId),
      where('userId', '==', userId)
    );
    const querySnapshot = await getDocs(q);
    const steps = querySnapshot.docs.map((doc) => ({
      ...(doc.data() as Omit<LearningStep, 'id'>),
      id: doc.id,
    })) as LearningStep[];
    return steps.sort((a, b) => a.order - b.order);
  },

  async getUserSteps(userId: string): Promise<LearningStep[]> {
    const q = query(
      collection(db, 'learningSteps'),
      where('userId', '==', userId)
    );
    const querySnapshot = await getDocs(q);
    const steps = querySnapshot.docs.map((doc) => ({
      ...(doc.data() as Omit<LearningStep, 'id'>),
      id: doc.id,
    })) as LearningStep[];
    return steps.sort((a, b) => a.order - b.order);
  },

  async updateStep(id: string, updates: Partial<LearningStep>): Promise<void> {
    const docRef = doc(db, 'learningSteps', id);
    // Filter out undefined values to avoid Firestore errors
    const cleanUpdates = Object.fromEntries(
      Object.entries(updates).filter(([_, value]) => value !== undefined)
    );
    if (Object.keys(cleanUpdates).length > 0) {
      await updateDoc(docRef, cleanUpdates);
    }
  },

  async deleteStep(id: string): Promise<void> {
    const docRef = doc(db, 'learningSteps', id);
    await deleteDoc(docRef);
  },

  async markStepComplete(id: string): Promise<void> {
    const docRef = doc(db, 'learningSteps', id);
    await updateDoc(docRef, {
      completed: true,
      completedAt: new Date(),
    });
  },
  async clearScheduledAt(id: string): Promise<void> {
    const docRef = doc(db, 'learningSteps', id);
    await updateDoc(docRef, {
      scheduledAt: deleteField(),
    });
  },
};
