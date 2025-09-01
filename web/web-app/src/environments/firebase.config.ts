import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getStorage } from 'firebase/storage';

// Real Firebase configuration for corepadelapp project
export const firebaseConfig = {
  apiKey: "AIzaSyBe_wPCKBVNcpAz5aswBWA_3rPm6hbO4CM",
  authDomain: "corepadelapp.firebaseapp.com",
  projectId: "corepadelapp",
  storageBucket: "corepadelapp.firebasestorage.app",
  messagingSenderId: "175491030033",
  appId: "1:175491030033:web:16be31a34d4ef28fbae5b0"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const storage = getStorage(app);

// Configure action code settings for passwordless sign-in
const actionCodeSettings = {
  url: window.location.hostname === 'localhost' 
    ? 'http://localhost:4200/auth/verify-email'
    : 'https://corepadel.com/auth/verify-email',
  handleCodeInApp: true,
  // Add email to URL for better reliability
  iOS: {
    bundleId: 'com.corepadel.app'
  },
  android: {
    packageName: 'com.corepadel.app',
    installApp: true,
    minimumVersion: '12'
  },
  dynamicLinkDomain: 'corepadel.page.link'
};

console.log('🚀 Using production Firebase services');
console.log('  - Auth Domain:', firebaseConfig.authDomain);
console.log('  - Storage Bucket:', firebaseConfig.storageBucket);
console.log('  - Project ID:', firebaseConfig.projectId);

export { app, auth, storage, actionCodeSettings };
