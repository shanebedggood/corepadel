# Local Development Setup with Firebase Emulators

This guide will help you set up local development environment with Firebase emulators for testing profile picture uploads and other Firebase services.

## 🎯 What We're Setting Up

- **Firebase Auth Emulator** - Local authentication testing
- **Firebase Functions Emulator** - Local cloud functions testing  
- **Firebase Storage Emulator** - Local file storage testing
- **Firebase Hosting Emulator** - Local hosting testing

## 📋 Prerequisites

1. **Firebase CLI** installed globally:
   ```bash
   npm install -g firebase-tools
   ```

2. **Firebase Login**:
   ```bash
   firebase login
   ```

3. **Node.js** (>=18.0.0) and **npm** (>=8.0.0)

## 🚀 Quick Start

### Option 1: Using the Script (Recommended)
```bash
# Make the script executable (first time only)
chmod +x start-emulators.sh

# Start all emulators
./start-emulators.sh
```

### Option 2: Using npm Scripts
```bash
# Start all development services
npm run dev

# Or start just Firebase emulators
npm run firebase:emulators
```

### Option 3: Manual Start
```bash
# Start Firebase emulators
firebase emulators:start --only auth,functions,storage,hosting
```

## 🔧 Emulator Ports

| Service | Port | URL |
|---------|------|-----|
| Auth | 9099 | http://localhost:9099 |
| Functions | 5001 | http://localhost:5001 |
| Storage | 9199 | http://localhost:9199 |
| Hosting | 5000 | http://localhost:5000 |

## 📱 Emulator UI

Once started, you can access the Firebase Emulator UI at:
```
http://localhost:4000
```

This provides a web interface to:
- View and manage authentication users
- Monitor function executions
- Browse storage files
- View hosting files

## 🧪 Testing Profile Picture Uploads

### 1. Start the Development Environment
```bash
# Terminal 1: Start all services
npm run dev

# Terminal 2: Start just emulators (if needed separately)
npm run firebase:emulators
```

### 2. Access the Application
- **Angular App**: http://localhost:4200
- **Firebase Emulator UI**: http://localhost:4000

### 3. Test Profile Picture Upload
1. Navigate to the profile update page
2. Select an image file
3. The image will be processed and uploaded to the local storage emulator
4. Check the Firebase Emulator UI to see the uploaded file

### 4. Verify Upload
- Go to http://localhost:4000
- Click on "Storage" tab
- You should see your uploaded profile picture in the `profile-pictures/{userId}/` folder

## 🔍 Debugging

### Check Emulator Status
```bash
# Check if emulators are running
firebase emulators:export --help

# View emulator logs
firebase emulators:start --debug
```

### Common Issues

1. **Port Already in Use**
   ```bash
   # Kill processes using the ports
   lsof -ti:9099 | xargs kill -9
   lsof -ti:5001 | xargs kill -9
   lsof -ti:9199 | xargs kill -9
   lsof -ti:5000 | xargs kill -9
   ```

2. **Firebase CLI Not Found**
   ```bash
   # Install Firebase CLI
   npm install -g firebase-tools
   
   # Login to Firebase
   firebase login
   ```

3. **Emulator Connection Issues**
   - Check that your Angular app is running on `localhost:4200`
   - Verify the emulator ports are not blocked by firewall
   - Ensure you're using the correct Firebase project

### Debug Logs
The application will show connection status in the browser console:
- ✅ "Functions emulator connected"
- ✅ "Storage emulator connected"
- ⚠️ "Emulator connection failed" (if already connected)

## 📊 Emulator Data Persistence

By default, emulator data is not persisted between restarts. To persist data:

```bash
# Export emulator data
firebase emulators:export ./emulator-data

# Start with imported data
firebase emulators:start --import ./emulator-data
```

## 🔒 Security Rules Testing

Firebase Storage security rules are configured in `storage.rules`:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // Profile pictures - users can only access their own profile pictures
    match /profile-pictures/{userId}/{allPaths=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Default rule - deny all other access
    match /{allPaths=**} {
      allow read, write: if false;
    }
  }
}
```

These rules ensure:
- Users can only upload/access their own profile pictures
- All other storage access is denied by default
- Authentication is required for all storage operations

## 🚀 Production Deployment

When ready to deploy to production:

```bash
# Deploy to production Firebase project
firebase deploy --only storage

# Or deploy all services
firebase deploy
```

## 📚 Additional Resources

- [Firebase Emulator Documentation](https://firebase.google.com/docs/emulator-suite)
- [Storage Emulator Guide](https://firebase.google.com/docs/emulator-suite/install_and_configure#storage)
- [Local Development Best Practices](https://firebase.google.com/docs/emulator-suite/install_and_configure#best_practices)

## 🔧 Configuration Files

### firebase.json
```json
{
  "emulators": {
    "auth": { "port": 9099 },
    "functions": { "port": 5001 },
    "storage": { "port": 9199 },
    "hosting": { "port": 5000 }
  }
}
```

### Environment Detection
The application automatically detects localhost and connects to emulators:
```typescript
if (window.location.hostname === 'localhost') {
  connectStorageEmulator(storage, 'localhost', 9199);
}
```

## 🎯 Next Steps

1. **Test the setup** by uploading a profile picture
2. **Explore the emulator UI** to understand the data structure
3. **Test error scenarios** by uploading invalid files
4. **Verify security rules** work as expected
5. **Deploy to production** when ready
