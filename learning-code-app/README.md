# Learning Code To-Do App

A React Native mobile application built with Expo for managing your programming learning journey. Add languages you want to learn, create learning steps, and track your progress.

## 🚀 Features

- **User Authentication**: Sign up, sign in, and sign out with Firebase Authentication
- **Language Management**: Add, view, and manage programming languages you want to learn
- **Learning Steps**: Create detailed learning steps for each language with resources
- **Progress Tracking**: Mark steps as complete and track your learning progress
- **User Profile**: View your account information and learning statistics
- **Cloud Database**: Real-time data synchronization with Firestore
- **Responsive UI**: Clean and intuitive mobile-first design

## 📋 Project Structure

```
learning-code-app/
├── app/                          # Navigation and screens
│   ├── (auth)/                  # Authentication screens
│   │   ├── signin.tsx           # Sign in screen
│   │   ├── signup.tsx           # Sign up screen
│   │   └── _layout.tsx          # Auth navigation layout
│   ├── (tabs)/                  # Main app screens
│   │   ├── languages.tsx        # Languages management
│   │   ├── steps.tsx            # Learning steps
│   │   ├── profile.tsx          # User profile
│   │   └── _layout.tsx          # Tab navigation layout
│   └── _layout.tsx              # Root navigation
├── src/
│   ├── config/
│   │   └── firebase.ts          # Firebase configuration
│   ├── context/
│   │   └── AuthContext.tsx      # Authentication context
│   ├── services/
│   │   └── firebaseService.ts   # Firebase operations
│   ├── types/
│   │   └── index.ts             # TypeScript types
│   └── components/              # Reusable components
├── assets/                       # Images, icons, etc.
├── app.json                      # Expo configuration
├── package.json                  # Dependencies
├── tsconfig.json                # TypeScript configuration
└── README.md                     # This file
```

## 🛠️ Technologies Used

- **React Native**: Cross-platform mobile development
- **Expo**: Development framework and build service
- **Expo Router**: Navigation and routing
- **Firebase**: Authentication and Firestore database
- **TypeScript**: Type-safe development
- **React Navigation**: Navigation library

## 📦 Installation

### Prerequisites

- Node.js (v18 or later)
- npm or yarn
- Expo CLI: `npm install -g expo-cli`
- Firebase account

### Setup Instructions

1. **Clone the repository**
   ```bash
   cd learning-code-app
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure Firebase**
   - Create a Firebase project at [firebase.google.com](https://firebase.google.com)
   - Enable Authentication (Email/Password)
   - Enable Cloud Firestore database
   - Copy your Firebase config

4. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   - Edit `.env` with your Firebase credentials

5. **Start the development server**
   ```bash
   npm start
   ```

## 🚀 Running the App

### Run on Android
```bash
npm run android
```

### Run on iOS
```bash
npm run ios
```

### Run on Web
```bash
npm run web
```

### Build APK
```bash
npm run eas-build
```

## 📱 Features Explained

### 1. Authentication
- **Sign Up**: Create a new account with email and password
- **Sign In**: Log in to your existing account
- **Sign Out**: Safely log out from your profile

### 2. Language Management
- Add new programming languages with difficulty levels
- View all your languages
- Delete languages you no longer want to track
- Filter by difficulty (beginner, intermediate, advanced)

### 3. Learning Steps
- Create detailed steps for learning each language
- Add resources (tutorials, videos, documentation links)
- Mark steps as complete to track progress
- View step history and completion dates

### 4. Profile
- View your account information
- See when you joined
- Quick access to sign out

## 🗄️ Database Schema

### Users Collection
```typescript
{
  uid: string
  email: string
  displayName: string
  createdAt: Date
}
```

### Languages Collection
```typescript
{
  id: string
  userId: string
  name: string
  description: string
  icon: string
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  createdAt: Date
}
```

### Learning Steps Collection
```typescript
{
  id: string
  userId: string
  languageId: string
  title: string
  description: string
  resources: string[]
  completed: boolean
  completedAt?: Date
  order: number
  createdAt: Date
}
```

## 🎨 UI/UX Design

The app features:
- **Clean Design**: Minimalist interface focused on usability
- **Intuitive Navigation**: Bottom tab navigation for easy access
- **Visual Feedback**: Loading states, error messages, and success notifications
- **Responsive Layout**: Adapts to different screen sizes
- **Consistent Styling**: Unified color scheme and typography

## 🔒 Security Features

- Firebase Authentication for secure user accounts
- Password validation (minimum 6 characters)
- Email verification
- Secure data storage in Firestore with user-based access control
- No sensitive data stored locally

## 📝 API Reference

### Auth Service
```typescript
authService.signUp(email, password, displayName)
authService.signIn(email, password)
authService.signOut()
authService.getCurrentUser()
```

### Languages Service
```typescript
languagesService.addLanguage(language)
languagesService.getUserLanguages(userId)
languagesService.updateLanguage(id, updates)
languagesService.deleteLanguage(id)
```

### Learning Steps Service
```typescript
learningStepsService.addStep(step)
learningStepsService.getLanguageSteps(languageId)
learningStepsService.updateStep(id, updates)
learningStepsService.deleteStep(id)
learningStepsService.markStepComplete(id)
```

## 🐛 Troubleshooting

### Firebase Connection Issues
- Verify Firebase credentials in `.env`
- Check Firebase project settings
- Ensure Firestore is enabled

### Build Issues
- Clear cache: `npm install` and `expo prebuild --clean`
- Check Node.js version: `node --version`
- Clear Expo cache: `expo start -c`

### Android APK Build Issues
- Ensure Java Development Kit (JDK) is installed
- Set ANDROID_HOME environment variable
- Run `eas build --platform android` with valid credentials

## 📚 Learning Resources

- [React Native Documentation](https://reactnative.dev)
- [Expo Documentation](https://docs.expo.dev)
- [Firebase Documentation](https://firebase.google.com/docs)
- [Expo Router Guide](https://docs.expo.dev/routing/introduction/)

## 🤝 Contributing

Feel free to fork this project and submit pull requests for improvements.

## 📄 License

This project is open source and available under the MIT License.

## 👨‍💻 Developer Notes

### Best Practices Used
1. **Component-based Architecture**: Reusable components
2. **Context API**: State management
3. **TypeScript**: Type safety
4. **Error Handling**: Comprehensive error messages
5. **Code Organization**: Clear folder structure
6. **Responsive Design**: Mobile-first approach

### Future Enhancements
- [ ] Add progress statistics and charts
- [ ] Implement learning streak counter
- [ ] Add reminders and notifications
- [ ] Social sharing features
- [ ] Offline support with local caching
- [ ] Dark mode theme
- [ ] Multiple language support
- [ ] Study timer/Pomodoro integration

## 📞 Support

For issues, questions, or suggestions, please open an issue in the repository.

---

**Happy Learning! 🚀📚**
