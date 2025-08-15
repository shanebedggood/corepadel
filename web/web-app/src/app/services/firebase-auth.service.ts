import { Injectable, inject, runInInjectionContext, Injector } from '@angular/core';
import { 
  Auth, 
  signInWithEmailLink, 
  sendSignInLinkToEmail, 
  isSignInWithEmailLink,
  signOut,
  onAuthStateChanged,
  User
} from '@angular/fire/auth';
import { 
  Functions, 
  httpsCallable 
} from '@angular/fire/functions';
import { BehaviorSubject, Observable, from } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { actionCodeSettings } from '../../environments/firebase.config';

export interface UserProfile {
  userId?: string;
  firebaseUid: string;
  email: string;
  username: string;
  displayName?: string;
  firstName?: string;
  lastName?: string;
  emailVerified?: boolean;
  roles: string[];
  mobile?: string;
  rating?: number;
  profilePicture?: string;
  // Legacy snake_case properties for backward compatibility
  first_name?: string;
  last_name?: string;
  email_verified?: boolean;
  profile_picture?: string;
}

@Injectable({
  providedIn: 'root'
})
export class FirebaseAuthService {
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  private userProfileSubject = new BehaviorSubject<UserProfile | null>(null);
  
  public currentUser$ = this.currentUserSubject.asObservable();
  public userProfile$ = this.userProfileSubject.asObservable();
  public isAuthenticated$ = this.currentUser$.pipe(map(user => !!user));

  constructor(
    private auth: Auth,
    private functions: Functions,
    private injector: Injector
  ) {
    // Listen to authentication state changes
    runInInjectionContext(this.injector, () => {
      onAuthStateChanged(this.auth, async (user) => {
        this.currentUserSubject.next(user);
        
        if (user) {
          // Add a small delay to ensure user is fully authenticated
          setTimeout(async () => {
            try {
              await this.loadUserProfile();
            } catch (error: any) {
              console.error('User profile not yet available, will retry later:', error.message);
            }
          }, 1000);
        } else {
          this.userProfileSubject.next(null);
        }
      });
    });
  }

  /**
   * Send passwordless sign-in link to email
   */
  async sendSignInLink(email: string): Promise<void> {
    return runInInjectionContext(this.injector, async () => {
      try {
        // Store email in localStorage before sending the link
        window.localStorage.setItem('emailForSignIn', email);
        await sendSignInLinkToEmail(this.auth, email, actionCodeSettings);
        
      } catch (error) {
        console.error('❌ Error sending sign-in link:', error);
        // Remove email from localStorage if sending failed
        window.localStorage.removeItem('emailForSignIn');
        throw error;
      }
    });
  }

  /**
   * Complete passwordless sign-in with email link
   */
  async completeSignInWithEmailLink(): Promise<User | null> {
    return runInInjectionContext(this.injector, async () => {
      try {
        if (!this.isSignInLink()) {
          throw new Error('Invalid sign-in link');
        }

        // Try to get email from multiple sources
        let email = window.localStorage.getItem('emailForSignIn');
        
        // If not in localStorage, try to get from URL parameters
        if (!email) {
          const urlParams = new URLSearchParams(window.location.search);
          email = urlParams.get('email');
        }
        
        // If still not found, try to extract from the URL itself
        if (!email) {
          const url = new URL(window.location.href);
          email = url.searchParams.get('email');
        }
        
        if (!email) {
          throw new Error('Email not found. Please try signing in again.');
        }
        // Complete sign-in
        const result = await signInWithEmailLink(this.auth, email, window.location.href);
        
        // Clear email from localStorage
        window.localStorage.removeItem('emailForSignIn');

        // Wait a moment for auth state to update
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Sync user to database
        await this.syncUserToDatabase();
        
        return result.user;
        
      } catch (error) {
        console.error('Error completing sign-in:', error);
        throw error;
      }
    });
  }

  /**
   * Sync user to PostgreSQL database
   */
  async syncUserToDatabase(): Promise<void> {
    return runInInjectionContext(this.injector, async () => {
      try {
        // Ensure user is authenticated
        const currentUser = this.auth.currentUser;
        if (!currentUser) {
          throw new Error('User not authenticated');
        }
        
        // Pass user information directly to the function
        const syncUserFunction = httpsCallable(this.functions, 'syncUserToDatabase');
        const result = await syncUserFunction({
          uid: currentUser.uid,
          email: currentUser.email,
          displayName: currentUser.displayName || currentUser.email?.split('@')[0] || 'User'
        });
        
        // Reload user profile after a short delay
        setTimeout(async () => {
          try {
            await this.loadUserProfile();
          } catch (error: any) {
            console.error('User profile not yet available:', error.message);
          }
        }, 2000);
        
      } catch (error) {
        console.error('Error syncing user to database:', error);
        throw error;
      }
    });
  }

  /**
   * Load user profile from database
   */
  async loadUserProfile(): Promise<void> {
    return runInInjectionContext(this.injector, async () => {
      try {
        const currentUser = this.auth.currentUser;
        if (!currentUser) {
          return;
        }
        
        const getUserProfileFunction = httpsCallable(this.functions, 'getUserProfile');
        const result: any = await getUserProfileFunction({
          uid: currentUser.uid,
          email: currentUser.email,
          displayName: currentUser.displayName || currentUser.email?.split('@')[0] || 'User'
        });
        
        if (result.data.success) {
          this.userProfileSubject.next(result.data.user);
        } else {
          console.error('Failed to load user profile:', result.data);
        }
        
      } catch (error) {
        console.error('Error loading user profile:', error);
        // Don't throw error here as it might be a new user not yet in database
      }
    });
  }

  /**
   * Assign role to user (admin only)
   */
  async assignUserRole(targetUserId: string, role: 'admin' | 'player'): Promise<void> {
    return runInInjectionContext(this.injector, async () => {
      try {
        const assignRoleFunction = httpsCallable(this.functions, 'assignUserRole');
        const result = await assignRoleFunction({ targetUserId, role });
        
      } catch (error) {
        console.error('Error assigning role:', error);
        throw error;
      }
    });
  }

  /**
   * Sign out user
   */
  async signOut(): Promise<void> {
    return runInInjectionContext(this.injector, async () => {
      try {
        await signOut(this.auth);
        this.userProfileSubject.next(null);
      } catch (error) {
        console.error('Error signing out:', error);
        throw error;
      }
    });
  }

  /**
   * Get current user
   */
  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  /**
   * Get current user profile
   */
  getCurrentUserProfile(): UserProfile | null {
    return this.userProfileSubject.value;
  }

  /**
   * Check if user has specific role
   */
  hasRole(role: string): boolean {
    const profile = this.getCurrentUserProfile();
    return profile?.roles.includes(role) || false;
  }

  /**
   * Check if user is admin
   */
  isAdmin(): boolean {
    return this.hasRole('admin');
  }

  /**
   * Check if user is player
   */
  isPlayer(): boolean {
    return this.hasRole('player');
  }

  /**
   * Check if sign-in link is valid
   */
  isSignInLink(): boolean {
    return runInInjectionContext(this.injector, () => {
      try {
        return isSignInWithEmailLink(this.auth, window.location.href);
      } catch (error) {
        console.warn('Firebase API called outside injection context, attempting to handle gracefully');
        // Fallback: check URL parameters manually
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.has('apiKey') && urlParams.has('oobCode');
      }
    });
  }
}
