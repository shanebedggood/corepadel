import { Injectable, inject } from '@angular/core';
import { Auth, User, signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider, signOut, onAuthStateChanged, user, sendSignInLinkToEmail, signInWithEmailLink, isSignInWithEmailLink } from '@angular/fire/auth';
import { Observable, from, of, throwError } from 'rxjs';
import { map, catchError, switchMap } from 'rxjs/operators';
import { UserService } from './user.service';

export enum UserRole {
  PLAYER = 'player',
  ADMIN = 'admin'
}

export interface UserProfile {
  // Database fields
  user_id: string; // user_id (uuid)
  firebase_uid: string; // firebase_uid
  email: string;
  username: string;
  first_name?: string;
  last_name?: string;
  display_name?: string;
  mobile?: string;
  rating?: number;
  profile_picture?: string;
  email_verified: boolean;
  roles: string[]; // Not in DB, populated from user_roles table
}



@Injectable({
  providedIn: 'root'
})
export class FirebaseAuthService {
  private auth = inject(Auth);
  private userService = inject(UserService);

  // Observable of the current user
  user$ = user(this.auth);

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): Observable<boolean> {
    return this.user$.pipe(
      map(user => !!user)
    );
  }

  /**
   * Get current user profile
   */
  getCurrentUserProfile(): Observable<UserProfile | null> {
    return this.user$.pipe(
      map(user => {
        if (!user) return null;
        
        const displayName = user.displayName || '';
        const [firstName, ...lastNameParts] = displayName.split(' ');
        const lastName = lastNameParts.join(' ') || '';

        return {
          // Database fields
          user_id: user.uid, // Using firebase UID as user_id for now
          firebase_uid: user.uid,
          email: user.email || '',
          username: user.displayName || user.email || '',
          first_name: firstName,
          last_name: lastName,
          display_name: user.displayName || '',
          mobile: '', // Not available in Firebase Auth
          rating: 1.0, // Default value
          profile_picture: user.photoURL || undefined,
          email_verified: user.emailVerified,
          roles: [] // Will be populated from PostgreSQL
        };
      })
    );
  }

  /**
   * Get user profile and sync to PostgreSQL
   */
  getUserProfileAndSync(): Observable<UserProfile | null> {
    return this.getCurrentUserProfile().pipe(
      switchMap(profile => {
        if (!profile) return of(null);
        
        // Sync user to PostgreSQL
        return this.userService.getOrCreateUserFromFirebase(profile).pipe(
          map(() => profile) // Return the original profile
        );
      })
    );
  }

  /**
   * Get current user's role claims
   */
  getCurrentUserRole(): Observable<{ roles: string[]; email: string; emailVerified: boolean }> {
    return this.getCurrentUserProfile().pipe(
      map(profile => {
        if (!profile) {
          return { roles: [], email: '', emailVerified: false };
        }
        return {
          roles: profile.roles,
          email: profile.email,
          emailVerified: profile.email_verified || false
        };
      })
    );
  }

  /**
   * Login with email and password
   */
  loginWithEmail(email: string, password: string): Observable<User> {
    return from(signInWithEmailAndPassword(this.auth, email, password)).pipe(
      map(result => result.user),
      catchError(error => {
        console.error('Email login failed:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Send passwordless sign-in link to email
   */
  sendSignInLinkToEmail(email: string): Observable<void> {
    const actionCodeSettings = {
      url: window.location.origin + '/auth/check-email',
      handleCodeInApp: true,
    };
    
    return from(sendSignInLinkToEmail(this.auth, email, actionCodeSettings)).pipe(
      map(() => {
        // Save the email for later use
        window.localStorage.setItem('emailForSignIn', email);
      }),
      catchError(error => {
        console.error('Failed to send sign-in link:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Check if the current URL is a sign-in link
   */
  isSignInWithEmailLink(): boolean {
    return isSignInWithEmailLink(this.auth, window.location.href);
  }

  /**
   * Sign in with email link
   */
  signInWithEmailLink(email: string): Observable<User> {
    return from(signInWithEmailLink(this.auth, email, window.location.href)).pipe(
      map(result => result.user),
      catchError(error => {
        console.error('Failed to sign in with email link:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Login with Google
   */
  loginWithGoogle(): Observable<User> {
    const provider = new GoogleAuthProvider();
    return from(signInWithPopup(this.auth, provider)).pipe(
      map(result => result.user),
      catchError(error => {
        console.error('Google login failed:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Login (defaults to Google)
   */
  login(): Observable<void> {
    return this.loginWithGoogle().pipe(
      map(() => {
        // Login successful, user will be redirected automatically
      })
    );
  }

  /**
   * Direct login that bypasses user info page completely
   */
  loginDirect(): Observable<void> {
    return this.loginWithGoogle().pipe(
      map(() => {
      })
    );
  }

  /**
   * Logout
   */
  logout(): Observable<void> {
    return from(signOut(this.auth)).pipe(
      map(() => {
      }),
      catchError(error => {
        console.error('Logout failed:', error);
        // If logout fails, try to redirect to home page anyway
        window.location.href = '/';
        return throwError(() => error);
      })
    );
  }

  /**
   * Get user roles from PostgreSQL
   */
  getUserRoles(): Observable<string[]> {
    return this.getCurrentUserProfile().pipe(
      switchMap(profile => {
        if (!profile) return of([]);
        return this.userService.getUserRolesByFirebaseUid(profile.firebase_uid);
      }),
      map(roles => roles.map(role => role.role_name))
    );
  }

  /**
   * Check if user has a specific role
   */
  hasRole(role: string): Observable<boolean> {
    return this.getUserRoles().pipe(
      map(roles => roles.includes(role))
    );
  }

  /**
   * Check if user is admin
   */
  isAdmin(): Observable<boolean> {
    return this.hasRole('admin');
  }

  /**
   * Get access token
   */
  getToken(): Observable<string> {
    return this.user$.pipe(
      switchMap(user => {
        if (!user) return throwError(() => new Error('No user logged in'));
        return from(user.getIdToken());
      })
    );
  }

  /**
   * Refresh token
   */
  refreshToken(): Observable<string> {
    return this.getToken();
  }

  /**
   * Update token if needed
   */
  updateToken(): Observable<boolean> {
    return this.user$.pipe(
      switchMap(user => {
        if (!user) return of(false);
        return from(user.getIdToken(true)).pipe(
          map(() => true)
        );
      })
    );
  }

  /**
   * Sign out (alias for logout)
   */
  signOut(): Observable<void> {
    return this.logout();
  }

  /**
   * Mock method for backward compatibility - returns empty array
   * This was used in Firebase to list users, but Firebase Auth doesn't provide this functionality
   */
  listPlayersWithPagination(page: number = 1, limit: number = 10): Observable<{ users: UserProfile[]; total: number }> {
    // Return empty result since Firebase Auth doesn't provide user listing functionality
    return of({ users: [], total: 0 });
  }

  /**
   * Get user profile by ID (mock implementation for backward compatibility)
   */
  getUserProfileById(userId: string): Observable<UserProfile | null> {
    // For now, return current user's profile if ID matches, otherwise throw error
    return this.getCurrentUserProfile().pipe(
      map(profile => {
        if (profile && (profile.firebase_uid === userId || profile.user_id === userId)) {
          return profile;
        }
        throw new Error('User not found');
      })
    );
  }

  /**
   * Get current user's club
   */
  getCurrentUserClub(): Observable<any> {
    return this.getCurrentUserProfile().pipe(
      switchMap(profile => {
        if (!profile) return of(null);
        return this.userService.getUserClubsByFirebaseUid(profile.firebase_uid).pipe(
          map(userClubs => {
            // Return the first club (assuming admin users are associated with one club)
            // You might want to modify this logic based on your requirements
            if (userClubs && userClubs.length > 0) {
              const userClub = userClubs[0];
              return {
                id: userClub.club.club_id,
                name: userClub.club.name,
                website: userClub.club.website,
                role: userClub.role
              };
            }
            return null;
          })
        );
      })
    );
  }
} 