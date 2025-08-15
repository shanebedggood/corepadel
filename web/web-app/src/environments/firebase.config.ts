import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFunctions, connectFunctionsEmulator } from 'firebase/functions';

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
const functions = getFunctions(app);

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

// Connect to local Functions emulator only in development
if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
  try {
    connectFunctionsEmulator(functions, 'localhost', 5001);
  } catch (error) {
    console.warn('⚠️ Functions emulator connection failed (might already be connected):', error);
  }
}
export { app, auth, functions, actionCodeSettings };
