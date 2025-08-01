# Firebase Authentication Setup

## ✅ **CURRENT STATUS: FIREBASE AUTH ACTIVE**

The application is currently using Firebase Authentication for all authentication and authorization needs.

### ✅ **Current Firebase Auth Implementation**

1. **Firebase Auth Service**
   - `src/app/services/firebase-auth.service.ts` - Complete Firebase authentication service
   - Supports Google OAuth login
   - Provides user profile management
   - Handles authentication state

2. **Authentication Guards**
   - `AuthGuard` - Uses Firebase authentication
   - `AdminGuard` - Uses Firebase authentication with role checking

3. **App Configuration**
   - `app.config.ts` - Configured with Firebase providers
   - Firebase Auth enabled and configured

4. **Environment Configuration**
   - Firebase config in both dev and prod environments
   - `firebase.config.ts` for centralized configuration

5. **Authentication Pages**
   - `email-input` - Email-based authentication (redirects to Google OAuth)
   - `signup` - User registration (redirects to Google OAuth)
   - `check-email` - Email verification page
   - `verify-email` - Email verification handling

### 🔧 **Firebase Configuration**

#### Current Firebase Config
```typescript
// src/environments/environment.ts
firebase: {
  apiKey: "AIzaSyAVNjToQcxMtJwbiL0jGXmFcZGTxMH_kXY",
  authDomain: "padel-3b62e.firebaseapp.com",
  projectId: "padel-3b62e",
  storageBucket: "padel-3b62e.firebasestorage.app",
  messagingSenderId: "436875903621",
  appId: "1:436875903621:web:d917cd0f68e4b217d21fec",
  measurementId: "G-0DT2RM3WY7"
}
```

### 🔄 **User Synchronization**

User synchronization to PostgreSQL is handled through:
- `UserService.getOrCreateUserFromFirebase()` method
- Firebase UID stored in `keycloak_uid` field (reused for Firebase)
- Same user profile structure maintained

### 🚨 **Important Notes**

1. **Magic Links Deprecated**: Firebase Auth magic links are deprecated by Google
2. **Current Implementation**: Uses Google OAuth for authentication
3. **Database Schema**: No changes needed - Firebase UIDs stored in existing `keycloak_uid` field
4. **User Roles**: Admin roles managed in PostgreSQL, not Firebase
5. **Backward Compatibility**: All existing interfaces maintained

### 🎯 **Authentication Flow**

1. **User visits application** → Redirected to `/auth/email-input`
2. **User enters email** → Redirected to Google OAuth
3. **Google OAuth authentication** → User authenticated
4. **User redirected to role chooser** → `/choose-role`
5. **User selects role** → Redirected to appropriate dashboard

### 📋 **Available Routes**

- `/auth/email-input` - Email input page (redirects to Google OAuth)
- `/auth/signup` - Signup page (redirects to Google OAuth)
- `/auth/check-email` - Email verification check page
- `/auth/verify-email` - Email verification page
- `/choose-role` - Role selection page (requires authentication)
- `/player/*` - Player dashboard routes (requires authentication)
- `/admin/*` - Admin dashboard routes (requires authentication + admin role)

### 🚀 **Getting Started**

1. **Start the application:**
   ```bash
   cd web/web-app
   npm start
   ```

2. **Access authentication:**
   - Navigate to `http://localhost:4200/auth/email-input`
   - Or click "Sign In" from the landing page

3. **Test authentication flow:**
   - Enter email → Google OAuth → Role selection → Dashboard

### 🔧 **Configuration**

The Firebase configuration is already set up and working. If you need to change the Firebase project:

1. Update `src/environments/environment.ts` with your Firebase config
2. Update `src/environments/environment.prod.ts` for production
3. Configure Firebase Authentication in Firebase Console
4. Enable Google OAuth provider in Firebase Console

### ✅ **Status**

- ✅ Firebase Auth fully implemented
- ✅ All components using Firebase Auth
- ✅ Authentication guards working
- ✅ User synchronization working
- ✅ Role-based access control working
- ✅ No Keycloak dependencies remaining 