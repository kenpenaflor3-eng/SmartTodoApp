# 🚀 Quick Reference Guide

## Getting Started in 3 Steps

### Step 1: Install & Configure
```bash
# Install dependencies
npm install --legacy-peer-deps

# Copy environment file
cp .env.example .env

# Edit .env with Firebase credentials
```

### Step 2: Firebase Setup
1. Go to https://console.firebase.google.com
2. Create new project
3. Enable: Authentication (Email/Password) + Firestore
4. Copy credentials to .env

### Step 3: Run the App
```bash
npm start
# Scan QR code with Expo Go app
```

## 📱 Available Commands

| Command | Purpose |
|---------|---------|
| `npm start` | Start development server |
| `npm run android` | Run on Android emulator |
| `npm run ios` | Run on iOS simulator |
| `npm run web` | Run in web browser |
| `npm test` | Run tests |
| `npm run eas-build` | Build production APK |
| `npm run setup` | Install dependencies with flags |

## 🔐 Default Test Credentials

After setup, you can create test accounts:
- Email: test@example.com
- Password: password123
- Name: Test User

## 📂 Key Files

| File | Purpose |
|------|---------|
| `.env` | Firebase credentials (create from .env.example) |
| `app.json` | Expo configuration |
| `package.json` | Dependencies and scripts |
| `src/config/firebase.ts` | Firebase setup |
| `src/context/AuthContext.tsx` | Auth state management |
| `src/services/firebaseService.ts` | Firebase operations |

## 🎯 Feature Checklist

### Authentication
- [x] Sign Up with validation
- [x] Sign In
- [x] Sign Out
- [x] Session persistence
- [x] Error handling

### Languages
- [x] Add language
- [x] View all languages
- [x] Delete language
- [x] Difficulty levels
- [x] Real-time sync

### Learning Steps
- [x] Add steps
- [x] View steps
- [x] Mark complete
- [x] Add resources
- [x] Track progress

### User Profile
- [x] View info
- [x] Account details
- [x] Sign out button
- [x] Member since date

## 🔧 Troubleshooting

### Port Already in Use
```bash
# Kill process on port 19000
lsof -i :19000
kill -9 <PID>
```

### Clear Cache
```bash
npm cache clean --force
rm -rf node_modules
npm install --legacy-peer-deps
```

### Firebase Not Connecting
1. Verify .env file exists and has all keys
2. Check internet connection
3. Verify Firebase project is active
4. Check Firestore security rules

## 📦 Deployment

### Build APK
```bash
eas build --platform android
```

### Publish to GitHub
```bash
git add .
git commit -m "message"
git push origin main
```

## 🎓 Learning Objectives Covered

✅ React Native fundamentals
✅ Expo framework usage
✅ Navigation (Expo Router, React Navigation)
✅ State management (Context API)
✅ Firebase integration
✅ Firestore database
✅ TypeScript in React Native
✅ Authentication flows
✅ CRUD operations
✅ Error handling
✅ UI/UX best practices
✅ Mobile app deployment

## 💡 Tips & Tricks

### Hot Reload
- Press `r` in terminal for fast refresh
- Press `s` to open web version
- Press `i` for iOS simulator
- Press `a` for Android emulator

### Debugging
- Use console.log() for debugging
- Check terminal for errors
- Use React Native Debugger
- Check Firebase console for database logs

### Performance
- Avoid unnecessary re-renders
- Use useFocusEffect for screen focus
- Lazy load images
- Optimize database queries

## 📖 Documentation Files

- `README.md` - Full documentation
- `SETUP.md` - Setup guide
- `GITHUB.md` - GitHub & deployment
- `PROJECT_SUMMARY.md` - Project overview
- `QUICK_REFERENCE.md` - This file

## 🎬 Demo Walkthrough

1. **Sign Up**: Create account with email/password
2. **Sign In**: Login with credentials
3. **Add Language**: Tap + button, enter language details
4. **Add Steps**: Select language, tap + for steps
5. **Track Progress**: Mark steps as complete
6. **View Profile**: Check account info
7. **Sign Out**: Logout from profile screen

## 🌐 Web Links

- Firebase Console: https://console.firebase.google.com
- Expo Dashboard: https://expo.dev
- React Native Docs: https://reactnative.dev
- Expo Docs: https://docs.expo.dev

## ⚙️ System Requirements

- Node.js 18+
- npm 9+
- macOS/Windows/Linux
- 2GB RAM minimum
- Stable internet connection

## 📱 Tested On

- ✅ Android Emulator
- ✅ iOS Simulator
- ✅ Web Browser
- ✅ Physical Android Devices
- ✅ Physical iOS Devices (with development profile)

## 🎁 Bonus Features

- TypeScript support
- Comprehensive error handling
- Loading states
- User-friendly modals
- Real-time data sync
- Clean code structure

---

**Questions? Check the full README.md or SETUP.md**

**Ready to code? Run `npm start`! 🚀**
