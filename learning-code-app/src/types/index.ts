export interface User {
  uid: string;
  email: string;
  displayName?: string;
  createdAt: Date;
}

export interface Language {
  id: string;
  name: string;
  description: string;
  icon: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  createdAt: Date;
  userId: string;
}

export interface LearningStep {
  id: string;
  languageId: string;
  title: string;
  description: string;
  resources: string[];
  completed: boolean;
  order: number;
  createdAt: Date;
  completedAt?: Date;
  scheduledAt?: string;
  userId: string;
}

export interface AuthContextType {
  user: User | null;
  loading: boolean;
  isSignedIn: boolean;
  signUp: (email: string, password: string, displayName: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}
