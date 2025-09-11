import { Injectable, inject, runInInjectionContext, Injector } from '@angular/core';
import { 
  Auth, 
  signInWithEmailLink, 
  sendSignInLinkToEmail, 
  isSignInWithEmailLink,
  signOut,
  onAuthStateChanged,
  User,
  updateProfile
} from '@angular/fire/auth';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { actionCodeSettings } from '../../environments/firebase.config';
import { setPersistence, browserLocalPersistence } from 'firebase/auth';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

export interface UserProfile {
  firebaseUid: string; // Firebase user identifier - single source of truth
  email: string;
  username: string;
  first_name?: string;
  last_name?: string;
  display_name?: string;
  email_verified?: boolean;
  roles: string[];
  mobile?: string;
  rating?: number;
  profile_picture?: string;
  interests?: string[];
  profile_completed?: boolean;
  club_memberships?: ClubMembership[];
}

export interface ClubMembership {
  club_id: string;
  club_name: string;
  role: string;
  is_admin: boolean;
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
    private injector: Injector,
    private http: HttpClient
  ) {
    // Set Firebase auth persistence to local (survives browser restarts)
    this.setAuthPersistence();
    
    // Listen to authentication state changes
    runInInjectionContext(this.injector, () => {
      onAuthStateChanged(this.auth, async (user) => {
        this.currentUserSubject.next(user);
        
        if (user) {
          // Set up token refresh listener to prevent expiry during development
          this.setupTokenRefresh(user);
          
          // Add a small delay to ensure user is fully authenticated
          setTimeout(async () => {
            try {
              // Check if this is a new user with signup data
              const hasSignupData = localStorage.getItem('signupData') !== null;
              
              if (hasSignupData) {
                // Only sync to database if this is a new user (has signup data)
                await this.syncUserToDatabase();
              }
              
              // Always load profile (existing users need this, new users get it after sync)
              await this.loadUserProfileWithRetry();
            } catch (error: any) {
              console.error('User profile not yet available, will retry later:', error.message);
            }
          }, 500);
        } else {
          this.userProfileSubject.next(null);
        }
      });
    });
  }

  // ---- Retry helpers ----
  private wait(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private async loadUserProfileWithRetry(maxRetries = 3, delayMs = 300): Promise<void> {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        await this.loadUserProfile();
        const profile = this.getCurrentUserProfile();
        if (profile && Array.isArray(profile.roles) && profile.roles.length > 0) {
          return; // roles are present
        }
      } catch {}
      if (attempt < maxRetries) {
        await this.wait(delayMs);
      }
    }
    // Final attempt without enforcing roles; best-effort
    await this.loadUserProfile();
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
        
        // Get email from local storage
        const email = window.localStorage.getItem('emailForSignIn');
        if (!email) {
          throw new Error('Missing email for sign-in');
        }
        
        // Complete sign in
        const result = await signInWithEmailLink(this.auth, email, window.location.href);
        window.localStorage.removeItem('emailForSignIn');
        
        // Check if this is a new user with signup data
        const hasSignupData = localStorage.getItem('signupData') !== null;
        
        if (hasSignupData) {
          // Only sync to database if this is a new user (has signup data)
          await this.syncUserToDatabase();
        }
        
        // Always load profile (existing users need this, new users get it after sync)
        await this.loadUserProfileWithRetry();
        
        return result.user;
      } catch (error) {
        console.error('❌ Error completing sign-in:', error);
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
        
        // Retrieve sign-up data from localStorage if this is a new user
        let signupData = null;
        try {
          const storedData = localStorage.getItem('signupData');
          if (storedData) {
            signupData = JSON.parse(storedData);
          } else {
            return; // Exit early if no signup data
          }
        } catch (error) {
          console.warn('Could not retrieve sign-up data:', error);
          return; // Exit early if there's an error parsing signup data
        }
        
        // Create user data for the backend
        const userData = {
          firebase_uid: currentUser.uid,
          email: currentUser.email,
          username: currentUser.email?.split('@')[0] || 'user',
          display_name: signupData?.name && signupData?.surname 
            ? `${signupData.name} ${signupData.surname}` 
            : (currentUser.displayName || currentUser.email?.split('@')[0] || 'User'),
          first_name: signupData?.name || null,
          last_name: signupData?.surname || null,
          mobile: signupData?.mobile || null,
          email_verified: currentUser.emailVerified
        };
        
        // Get the Firebase ID token for authentication
        const idToken = await currentUser.getIdToken();
        
        // Call the Quarkus backend to create/update user
        const headers = {
          'Authorization': `Bearer ${idToken}`,
          'Content-Type': 'application/json'
        };
        
        await this.http.post(`${environment.quarkusApiUrl}/users`, userData, { headers }).toPromise();
        
        // Clear the stored signup data after successful sync
        localStorage.removeItem('signupData');
        
        // Proactively refresh profile with retries so roles are present before navigation
        await this.loadUserProfileWithRetry(3, 200);
        
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
        
        // Get the Firebase ID token for authentication
        const idToken = await currentUser.getIdToken();
        
        // Call the Quarkus backend to get user profile
        const headers = {
          'Authorization': `Bearer ${idToken}`,
          'Content-Type': 'application/json'
        };
        
        const response: any = await this.http.get(`${environment.quarkusApiUrl}/users/firebase/${currentUser.uid}`, { headers }).toPromise();
        
        if (response) {
          // Fetch roles separately since User entity doesn't include them
          let roles: string[] = [];
          try {
            const rolesResponse: any = await this.http.get(`${environment.quarkusApiUrl}/users/firebase/${currentUser.uid}/roles`, { headers }).toPromise();
            if (rolesResponse && Array.isArray(rolesResponse)) {
              roles = rolesResponse.map((userRole: any) => userRole.role?.role_name || userRole.role_name || 'unknown');
            }
          } catch (rolesError) {
            console.warn('Could not fetch user roles:', rolesError);
          }
          
          // Transform the response to match the expected UserProfile interface
          const userProfile: UserProfile = {
            firebaseUid: response.firebase_uid,
            email: response.email,
            username: response.username,
            first_name: response.first_name,
            last_name: response.last_name,
            display_name: response.display_name,
            email_verified: response.email_verified,
            mobile: response.mobile,
            rating: response.rating,
            profile_picture: response.profile_picture,
            interests: response.interests,
            profile_completed: response.profile_completed,
            roles: roles
          };
          
          this.userProfileSubject.next(userProfile);
        } else {
          console.error('Failed to load user profile: User not found');
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
        const currentUser = this.auth.currentUser;
        if (!currentUser) {
          throw new Error('User not authenticated');
        }
        
        // Get the Firebase ID token for authentication
        const idToken = await currentUser.getIdToken();
        
        // Call the Quarkus backend to assign role
        const headers = {
          'Authorization': `Bearer ${idToken}`,
          'Content-Type': 'application/json'
        };
        
        const roleData = { roleName: role };
        await this.http.post(`${environment.quarkusApiUrl}/users/firebase/${targetUserId}/roles`, roleData, { headers }).toPromise();
        
        // Refresh profile after role change
        await this.loadUserProfileWithRetry();
        
      } catch (error) {
        console.error('Error assigning role:', error);
        throw error;
      }
    });
  }

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

  /**
   * Configure Firebase auth persistence to survive browser restarts and deployments
   */
  private async setAuthPersistence(): Promise<void> {
    try {
      // Get the underlying Firebase Auth instance
      const firebaseAuth = this.auth;
      await setPersistence(firebaseAuth, browserLocalPersistence);
    } catch (error) {
      console.warn('⚠️ Failed to set Firebase auth persistence:', error);
    }
  }

  /**
   * Set up automatic token refresh to prevent expiry during development
   */
  private setupTokenRefresh(user: User): void {
    // Firebase tokens expire every hour, refresh every 30 minutes for development
    const REFRESH_INTERVAL = 30 * 60 * 1000; // 30 minutes in milliseconds
    
    const refreshToken = async () => {
      try {
        const token = await user.getIdToken(true); // Force refresh
        
        // Store the refreshed token timestamp
        localStorage.setItem('lastTokenRefresh', Date.now().toString());
        
        // Also store the user's auth state more aggressively
        localStorage.setItem('firebaseAuthUser', JSON.stringify({
          uid: user.uid,
          email: user.email,
          lastRefresh: Date.now()
        }));
      } catch (error) {
        console.warn('⚠️ Failed to refresh Firebase token:', error);
      }
    };

    // Refresh immediately if token is old
    const lastRefresh = localStorage.getItem('lastTokenRefresh');
    if (!lastRefresh || (Date.now() - parseInt(lastRefresh)) > REFRESH_INTERVAL) {
      refreshToken();
    }

    // Set up periodic refresh
    const intervalId = setInterval(refreshToken, REFRESH_INTERVAL);
    
    // Store interval ID to clear it later if needed
    localStorage.setItem('tokenRefreshIntervalId', intervalId.toString());
    
    // Clean up interval when user signs out
    this.auth.onIdTokenChanged(() => {
      // This will be called when user signs out
      clearInterval(intervalId);
      localStorage.removeItem('tokenRefreshIntervalId');
    });
  }

  /**
   * Attempt to recover authentication state after deployment or browser issues
   */
  async recoverAuthentication(): Promise<boolean> {
    try {
      const currentUser = this.auth.currentUser;
      
      if (currentUser) {
        // Force token refresh to ensure validity
        await currentUser.getIdToken(true);
        return true;
      }
      
      return false;
    } catch (error) {
      console.warn('⚠️ Authentication recovery failed:', error);
      return false;
    }
  }

  /**
   * Update Firebase user profile
   */
  async updateUserProfile(profileData: { displayName?: string; photoURL?: string }): Promise<void> {
    const currentUser = this.auth.currentUser;
    if (!currentUser) {
      throw new Error('User not authenticated');
    }

    await updateProfile(currentUser, profileData);
  }

  /**
   * Force authentication state restoration during development
   */
  public forceAuthRestore(): void {
    if (!environment.development) return;
    
    // Check if we have a stored user
    const storedAuth = localStorage.getItem('firebaseAuthUser');
    if (storedAuth) {
      // Trigger a token refresh
      const currentUser = this.getCurrentUser();
      if (currentUser) {
        currentUser.getIdToken(true).then(() => {
          console.log('✅ Development: Auth state force restored');
        }).catch(error => {
          console.warn('⚠️ Development: Failed to force restore auth state:', error);
        });
      }
    }
  }

  /**
   * Get cached user authentication data including roles and club memberships
   */
  public getCachedUserAuthData(firebaseUid: string): Observable<any> {
    return this.http.get(`${environment.quarkusApiUrl}/users/firebase/${firebaseUid}/auth-data`);
  }

  /**
   * Load user profile with cached authentication data
   */
  public loadUserProfileWithCache(firebaseUid: string): Observable<UserProfile> {
    return this.getCachedUserAuthData(firebaseUid).pipe(
      map((cachedData: any) => {
        return {
          firebaseUid: cachedData.firebase_uid,
          email: cachedData.email,
          username: cachedData.username,
          display_name: cachedData.display_name,
          email_verified: true, // Assume verified if we have cached data
          roles: cachedData.roles || [],
          club_memberships: cachedData.club_memberships || []
        } as UserProfile;
      })
    );
  }
}
