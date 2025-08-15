# Firebase Setup Guide for Core Padel

This guide will help you set up Firebase authentication with passwordless sign-in and user sync to PostgreSQL.

## 🎯 What We've Set Up

1. **Firebase Authentication** - Passwordless email link sign-in
2. **Firebase Functions** - User sync to PostgreSQL database
3. **Role-based Access** - Admin and Player roles with Player as default
4. **Angular Integration** - Frontend authentication service and components

## 📋 Prerequisites

- Firebase project created (`corepadelapp`)
- Firebase CLI installed and logged in
- PostgreSQL database running (local or cloud)
- Angular app dependencies installed

## 🔧 Configuration Steps

### 1. Firebase Console Configuration

#### Enable Email Link Authentication
1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project (`corepadelapp`)
3. Navigate to **Authentication** > **Sign-in method**
4. Enable **Email link (passwordless sign-in)**
5. Configure authorized domains:
   - `localhost` (for development)
   - `corepadelapp.web.app` (for production)
   - `corepadelapp.firebaseapp.com` (for production)

#### Configure Email Templates
1. In **Authentication** > **Templates**
2. Customize the **Email link** template:
   - Subject: "Sign in to Core Padel"
   - Message: "Click the link below to sign in to Core Padel"

### 2. Update Firebase Configuration

Update the Firebase config in `web/web-app/src/environments/firebase.config.ts`:

```typescript
export const firebaseConfig = {
  apiKey: "your-api-key",
  authDomain: "corepadelapp.firebaseapp.com",
  projectId: "corepadelapp",
  storageBucket: "corepadelapp.appspot.com",
  messagingSenderId: "your-sender-id",
  appId: "your-app-id",
  measurementId: "your-measurement-id"
};
```

### 3. Database Configuration

#### Set Environment Variables for Firebase Functions

Create a `.env` file in the `functions` directory:

```bash
# PostgreSQL Database Configuration
DB_HOST=your-database-host
DB_PORT=5432
DB_NAME=corepadel
DB_USERNAME=corepadel
DB_PASSWORD=your-database-password
DB_SSL=true
```

#### Database Schema Requirements

Ensure your PostgreSQL database has the required tables:

```sql
-- User table
CREATE TABLE core.user (
    user_id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    cognito_sub VARCHAR(255) UNIQUE NOT NULL,
    email VARCHAR(255) NOT NULL,
    username VARCHAR(255),
    display_name VARCHAR(255),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- User role table
CREATE TABLE core.user_role (
    role_id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES core.user(user_id) ON DELETE CASCADE,
    role_name VARCHAR(255) NOT NULL,
    UNIQUE(user_id, role_name)
);

-- Role lookup table
CREATE TABLE core.role (
    role_name VARCHAR(255) PRIMARY KEY
);

-- Insert default roles
INSERT INTO core.role (role_name) VALUES ('admin'), ('player') ON CONFLICT DO NOTHING;
```

### 4. Update Angular Routes

Add the Firebase auth route to your Angular routing:

```typescript
// In app.routes.ts
{
  path: 'auth',
  component: FirebaseAuthComponent
}
```

## 🚀 Deployment

### Local Development

1. **Start Firebase Emulators:**
   ```bash
   firebase emulators:start
   ```

2. **Start Angular Development Server:**
   ```bash
   cd web/web-app
   npm start
   ```

3. **Test the Authentication Flow:**
   - Go to `http://localhost:4200/auth`
   - Enter your email address
   - Check your email for the sign-in link
   - Click the link to complete sign-in

### Production Deployment

1. **Deploy to Firebase:**
   ```bash
   ./deploy-firebase.sh
   ```

2. **Configure Production Settings:**
   - Update authorized domains in Firebase Console
   - Set production database connection
   - Configure email templates

## 🔐 Authentication Flow

### Passwordless Sign-In Process

1. **User enters email** on the sign-in page
2. **Firebase sends email link** with authentication token
3. **User clicks link** in email
4. **Angular app processes link** and completes authentication
5. **Firebase Function syncs user** to PostgreSQL database
6. **User is assigned 'player' role** by default
7. **User is redirected** based on their role

### Role Management

- **Default Role**: All new users get 'player' role
- **Admin Assignment**: Only existing admins can assign admin role
- **Role Checking**: Use `firebaseAuth.hasRole('admin')` in components

## 🛠️ Available Functions

### Firebase Functions

- `syncUserToDatabase()` - Syncs user to PostgreSQL with default role
- `assignUserRole(targetUserId, role)` - Assigns role to user (admin only)
- `getUserProfile()` - Gets user profile with roles from database

### Angular Service Methods

- `sendSignInLink(email)` - Sends passwordless sign-in link
- `completeSignInWithEmailLink()` - Completes sign-in process
- `syncUserToDatabase()` - Syncs user to database
- `hasRole(role)` - Checks if user has specific role
- `isAdmin()` - Checks if user is admin
- `isPlayer()` - Checks if user is player

## 🔍 Testing

### Test Authentication Flow

1. **Send Sign-In Link:**
   ```typescript
   await firebaseAuth.sendSignInLink('test@example.com');
   ```

2. **Complete Sign-In:**
   ```typescript
   await firebaseAuth.completeSignInWithEmailLink();
   ```

3. **Check User Profile:**
   ```typescript
   const profile = firebaseAuth.getCurrentUserProfile();
   console.log('User roles:', profile?.roles);
   ```

### Test Role Assignment (Admin Only)

```typescript
await firebaseAuth.assignUserRole('target-user-id', 'admin');
```

## 🐛 Troubleshooting

### Common Issues

1. **Email Link Not Working:**
   - Check authorized domains in Firebase Console
   - Verify email template configuration
   - Check spam folder

2. **Database Connection Failed:**
   - Verify environment variables in Firebase Functions
   - Check database credentials and network access
   - Ensure database schema is correct

3. **User Not Synced:**
   - Check Firebase Functions logs
   - Verify database connection
   - Check user table constraints

### Debug Commands

```bash
# View Firebase Functions logs
firebase functions:log

# Test Firebase Functions locally
firebase emulators:start --only functions

# Check database connection
psql -h your-host -U corepadel -d corepadel -c "SELECT * FROM core.user LIMIT 5;"
```

## 📚 Additional Resources

- [Firebase Authentication Documentation](https://firebase.google.com/docs/auth)
- [Firebase Functions Documentation](https://firebase.google.com/docs/functions)
- [Angular Firebase Documentation](https://github.com/angular/angularfire)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)

## 🔄 Migration from AWS Cognito

If migrating from AWS Cognito:

1. **Export users** from Cognito User Pool
2. **Import users** to Firebase Authentication
3. **Update frontend** to use Firebase Auth
4. **Deploy new functions** for user sync
5. **Test authentication flow** thoroughly

## 🎉 Next Steps

1. **Customize UI** - Update the authentication component styling
2. **Add Role Management** - Create admin interface for role assignment
3. **Implement Guards** - Add route guards based on user roles
4. **Add Profile Management** - Allow users to update their profiles
5. **Set Up Monitoring** - Configure Firebase Analytics and monitoring
