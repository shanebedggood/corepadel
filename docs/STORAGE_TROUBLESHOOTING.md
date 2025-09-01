# Firebase Storage Troubleshooting Guide

This guide helps you diagnose and fix common Firebase Storage issues in the STRIDE & SERVE application.

## 🔍 Common Issues and Solutions

### 1. "Cannot read properties of undefined (reading 'path')"

**Symptoms:**
- Error occurs when trying to upload profile pictures
- Storage reference appears to be undefined

**Possible Causes:**
- Firebase Storage emulator not running
- Storage not properly injected into Angular service
- Firebase configuration issues

**Solutions:**

#### Check Emulator Status
```bash
# Start Firebase emulators
npm run firebase:emulators

# Check if storage emulator is running
curl http://localhost:9199
```

#### Verify Firebase Configuration
Check browser console for these messages:
```
🔧 Connecting to Firebase emulators...
✅ Storage emulator connected
✅ Functions emulator connected
🔧 Firebase emulator setup complete
```

#### Test Storage Service
Add the storage test component to your app temporarily:

1. Import the test component:
```typescript
import { StorageTestComponent } from './components/storage-test.component';
```

2. Add to your template:
```html
<app-storage-test></app-storage-test>
```

3. Check the output to verify storage is working

### 2. "Firebase Storage is not available"

**Symptoms:**
- Service reports storage is not available
- Storage instance is null or undefined

**Solutions:**

#### Check Dependency Injection
Verify `provideStorage` is in your `app.config.ts`:
```typescript
import { provideStorage } from '@angular/fire/storage';

export const appConfig: ApplicationConfig = {
  providers: [
    // ... other providers
    provideStorage(() => storage),
  ]
};
```

#### Check Firebase Config
Verify storage is exported from `firebase.config.ts`:
```typescript
import { getStorage } from 'firebase/storage';

const storage = getStorage(app);
export { app, auth, functions, storage, actionCodeSettings };
```

### 3. "Storage emulator connection failed"

**Symptoms:**
- Warning about storage emulator connection
- Uploads fail in development

**Solutions:**

#### Check Emulator Ports
Verify no other services are using port 9199:
```bash
# Check what's using port 9199
lsof -i :9199

# Kill any conflicting processes
lsof -ti:9199 | xargs kill -9
```

#### Restart Emulators
```bash
# Stop all emulators
pkill -f "firebase emulators"

# Start fresh
npm run firebase:emulators
```

### 4. "Failed to create storage reference"

**Symptoms:**
- Storage reference creation fails
- `ref()` function returns null

**Solutions:**

#### Check Storage Rules
Verify `storage.rules` exists and is valid:
```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /profile-pictures/{userId}/{allPaths=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

#### Check firebase.json
Verify storage configuration:
```json
{
  "storage": {
    "rules": "storage.rules"
  }
}
```

### 5. "Upload fails with authentication error"

**Symptoms:**
- Upload fails with permission denied
- User not authenticated

**Solutions:**

#### Check Authentication State
Verify user is logged in before upload:
```typescript
const currentUser = this.authService.getCurrentUser();
if (!currentUser) {
  throw new Error('User must be authenticated to upload files');
}
```

#### Check Storage Rules
Ensure rules allow authenticated users:
```javascript
allow read, write: if request.auth != null && request.auth.uid == userId;
```

## 🧪 Debugging Steps

### 1. Enable Debug Logging
The application includes extensive console logging. Check browser console for:
- Storage initialization messages
- Upload progress messages
- Error details

### 2. Test with Storage Test Component
Use the `StorageTestComponent` to isolate storage issues:
```typescript
// Add to any page temporarily
<app-storage-test></app-storage-test>
```

### 3. Check Network Tab
Monitor network requests in browser dev tools:
- Look for requests to `localhost:9199`
- Check for CORS errors
- Verify request/response format

### 4. Verify Emulator UI
Access Firebase Emulator UI at http://localhost:4000:
- Check Storage tab for uploaded files
- Verify authentication state
- Monitor function executions

## 🔧 Development vs Production

### Development (Localhost)
- Uses Firebase emulators
- Storage on port 9199
- No real Firebase costs
- Debug logging enabled

### Production
- Uses real Firebase Storage
- Requires proper Firebase project setup
- Real storage costs apply
- Debug logging disabled

## 📋 Checklist

Before reporting an issue, verify:

- [ ] Firebase emulators are running
- [ ] Angular app is running on localhost:4200
- [ ] User is authenticated
- [ ] Storage rules are configured
- [ ] No console errors in browser
- [ ] Network requests are successful
- [ ] Emulator UI shows storage service

## 🚨 Emergency Fallback

If storage is completely broken, the service includes a fallback for development:

```typescript
// For development/testing, return a mock URL if storage fails
if (window.location.hostname === 'localhost') {
  console.warn('Storage failed in development, returning mock URL');
  return `https://localhost:9199/profile-pictures/${userId}/mock-profile.webp`;
}
```

This allows development to continue even if storage is not working.

## 📞 Getting Help

If you're still experiencing issues:

1. **Check the logs** - Look for specific error messages
2. **Test with minimal setup** - Use the storage test component
3. **Verify environment** - Ensure all services are running
4. **Check Firebase docs** - Review [Firebase Storage documentation](https://firebase.google.com/docs/storage)
5. **Report with details** - Include error messages, console logs, and environment info
