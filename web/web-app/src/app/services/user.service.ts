import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { ErrorHandlerService } from './error-handler.service';

export interface User {
    firebase_uid: string; // Firebase user identifier - single source of truth
    email: string;
    username: string;
    first_name?: string;
    last_name?: string;
    display_name?: string;
    mobile?: string;
    rating?: number;
    profile_picture?: string;
    email_verified?: boolean;
}

export interface UserRole {
    role_id?: string;
    user_id: string;
    role_name: string;
}

export interface UserClub {
    membership_id?: string;
    user: User;
    club: Club;
    role: UserRole;
}

export interface Club {
    club_id?: string;
    name: string;
    website?: string;
}

export interface CachedUserData {
    firebase_uid: string;
    email: string;
    username: string;
    display_name?: string;
    roles: string[];
    club_memberships: ClubMembership[];
    cached_at: string;
    expires_at: string;
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
export class UserService {
    private apiUrl = `${environment.quarkusApiUrl}/users`;

    constructor(
        private http: HttpClient,
        private errorHandlerService: ErrorHandlerService
    ) {}

    /**
     * Get all active users
     */
    getAllUsers(): Observable<User[]> {
        return this.http.get<User[]>(this.apiUrl).pipe(
            catchError(this.handleError<User[]>('getAllUsers', []))
        );
    }

    /**
     * Get users with pagination
     */
    getUsersWithPagination(page: number, size: number): Observable<User[]> {
        return this.http.get<User[]>(`${this.apiUrl}/page/${page}/size/${size}`).pipe(
            catchError(this.handleError<User[]>('getUsersWithPagination', []))
        );
    }



    /**
     * Get a user by Firebase UID
     */
    getUserByFirebaseUid(firebaseUid: string): Observable<User | null> {
        return this.http.get<User>(`${this.apiUrl}/firebase/${firebaseUid}`).pipe(
            catchError(this.handleError<User | null>('getUserByFirebaseUid', null))
        );
    }

    /**
     * Get a user by email
     */
    getUserByEmail(email: string): Observable<User | null> {
        return this.http.get<User>(`${this.apiUrl}/email/${email}`).pipe(
            catchError(this.handleError<User | null>('getUserByEmail', null))
        );
    }

    /**
     * Search users by name, email, or username
     */
    searchUsers(searchTerm: string): Observable<User[]> {
        return this.http.get<User[]>(`${this.apiUrl}/search?q=${encodeURIComponent(searchTerm)}`).pipe(
            catchError(this.handleError<User[]>('searchUsers', []))
        );
    }

    /**
     * Create a new user
     */
    createUser(user: User): Observable<User | null> {
        return this.http.post<User>(this.apiUrl, user).pipe(
            catchError(this.handleError<User | null>('createUser', null))
        );
    }



    /**
     * Update user profile by Firebase UID
     */
    updateUserProfile(firebaseUid: string, profileData: any): Observable<User | null> {
        return this.http.put<User>(`${this.apiUrl}/firebase/${firebaseUid}/profile`, profileData).pipe(
            catchError(this.handleError<User | null>('updateUserProfile', null))
        );
    }



    /**
     * Get all roles for a user by Firebase UID
     */
    getUserRoles(firebaseUid: string): Observable<UserRole[]> {
        return this.http.get<UserRole[]>(`${this.apiUrl}/firebase/${firebaseUid}/roles`).pipe(
            catchError(this.handleError<UserRole[]>('getUserRoles', []))
        );
    }

    /**
     * Get all roles for a user by Firebase UID (keycloak UID)
     */
    getUserRolesByCognitoSub(cognitoSub: string): Observable<UserRole[]> {
        // Call backend endpoint that resolves roles directly by Cognito sub
        return this.http.get<UserRole[]>(`${this.apiUrl}/cognito/${cognitoSub}/roles`).pipe(
            catchError(this.handleError<UserRole[]>('getUserRolesByCognitoSub', []))
        );
    }

    /**
     * Add a role to a user by Firebase UID
     */
    addRoleToUser(firebaseUid: string, roleName: string): Observable<UserRole | null> {
        return this.http.post<UserRole>(`${this.apiUrl}/firebase/${firebaseUid}/roles?role=${roleName}`, {}).pipe(
            catchError(this.handleError<UserRole | null>('addRoleToUser', null))
        );
    }

    /**
     * Add a role to a user by Cognito sub
     */
    addRoleToUserByCognitoSub(cognitoSub: string, roleName: string): Observable<UserRole | null> {
        // Use backend endpoint that adds role using Cognito sub directly
        return this.http.post<UserRole>(`${this.apiUrl}/cognito/${cognitoSub}/roles?role=${encodeURIComponent(roleName)}`, {}).pipe(
            catchError(this.handleError<UserRole | null>('addRoleToUserByCognitoSub', null))
        );
    }

    /**
     * Add a role to a user by Firebase UID (keycloak UID)
     */
    addRoleToUserByFirebaseUid(firebaseUid: string, roleName: string): Observable<UserRole | null> {
        return this.getUserByFirebaseUid(firebaseUid).pipe(
            switchMap(user => {
                if (!user || !user.firebase_uid) {
                    throw new Error('User not found or firebase_uid is missing');
                }
                return this.addRoleToUser(user.firebase_uid, roleName);
            }),
            catchError(this.handleError<UserRole | null>('addRoleToUserByFirebaseUid', null))
        );
    }

    /**
     * Remove a role from a user by Firebase UID
     */
    removeRoleFromUser(firebaseUid: string, roleName: string): Observable<boolean> {
        return this.http.delete(`${this.apiUrl}/firebase/${firebaseUid}/roles/${roleName}`).pipe(
            map(() => true),
            catchError(this.handleError<boolean>('removeRoleFromUser', false))
        );
    }

    /**
     * Check if a user has a specific role
     */
    userHasRole(firebaseUid: string, roleName: string): Observable<boolean> {
        return this.getUserRoles(firebaseUid).pipe(
            map(roles => roles.some(role => role.role_name === roleName)),
            catchError(this.handleError<boolean>('userHasRole', false))
        );
    }

    /**
     * Get all clubs for a user by Firebase UID
     */
    getUserClubs(firebaseUid: string): Observable<UserClub[]> {
        return this.http.get<UserClub[]>(`${this.apiUrl}/firebase/${firebaseUid}/clubs`).pipe(
            catchError(this.handleError<UserClub[]>('getUserClubs', []))
        );
    }

    /**
     * Get all clubs for a user by Firebase UID
     */
    getUserClubsByCognitoSub(cognitoSub: string): Observable<UserClub[]> {
        return this.http.get<UserClub[]>(`${this.apiUrl}/cognito/${cognitoSub}/clubs`).pipe(
            catchError(this.handleError<UserClub[]>('getUserClubsByCognitoSub', []))
        );
    }

    /**
     * Add a user to a club by Firebase UID
     */
    addUserToClub(firebaseUid: string, clubId: string, role: string = 'member'): Observable<UserClub | null> {
        return this.http.post<UserClub>(`${this.apiUrl}/firebase/${firebaseUid}/clubs/${clubId}?role=${role}`, {}).pipe(
            catchError(this.handleError<UserClub | null>('addUserToClub', null))
        );
    }

    /**
     * Add a user to a club by Firebase UID
     */
    addUserToClubByFirebaseUid(firebaseUid: string, clubId: string, role: string = 'member'): Observable<UserClub | null> {
        return this.getUserByFirebaseUid(firebaseUid).pipe(
            switchMap((user: User | null) => {
                if (!user || !user.firebase_uid) {
                    return of(null);
                }
                return this.addUserToClub(user.firebase_uid, clubId, role);
            }),
            catchError(this.handleError<UserClub | null>('addUserToClubByFirebaseUid', null))
        );
    }

    /**
     * Remove a user from a club by Firebase UID
     */
    removeUserFromClub(firebaseUid: string, clubId: string): Observable<boolean> {
        return this.http.delete(`${this.apiUrl}/firebase/${firebaseUid}/clubs/${clubId}`).pipe(
            map(() => true),
            catchError(this.handleError<boolean>('removeUserFromClub', false))
        );
    }

    /**
     * Remove a user from a club by Firebase UID
     */
    removeUserFromClubByFirebaseUid(firebaseUid: string, clubId: string): Observable<boolean> {
        return this.removeUserFromClub(firebaseUid, clubId);
    }

    /**
     * Get or create user from Firebase profile
     */
    getOrCreateUserFromFirebase(firebaseProfile: any): Observable<User | null> {
        const firebaseUid = firebaseProfile.firebase_uid;
        
        if (!firebaseUid) {
            console.error('No firebase_uid provided in firebaseProfile:', firebaseProfile);
            return of(null);
        }
        
        return this.getUserByFirebaseUid(firebaseUid).pipe(
            switchMap(existingUser => {
                if (existingUser) {
                    return of(existingUser);
                } else {
                    // Create new user
                    const user: User = {
                        firebase_uid: firebaseUid,
                        email: firebaseProfile.email,
                        username: firebaseProfile.display_name || firebaseProfile.email?.split('@')[0],
                        first_name: firebaseProfile.first_name || firebaseProfile.display_name?.split(' ')[0],
                        last_name: firebaseProfile.last_name || firebaseProfile.display_name?.split(' ').slice(1).join(' '),
                        display_name: firebaseProfile.display_name || `${firebaseProfile.first_name || ''} ${firebaseProfile.last_name || ''}`.trim(),
                        email_verified: firebaseProfile.email_verified || false
                    };
                    return this.createUser(user);
                }
            }),
            catchError(this.handleError<User | null>('getOrCreateUserFromFirebase', null))
        );
    }

    /**
     * Health check
     */
    healthCheck(): Observable<string> {
        return this.http.get(`${this.apiUrl}/health`, { responseType: 'text' }).pipe(
            catchError(this.handleError<string>('healthCheck', 'Service unavailable'))
        );
    }

    /**
     * Get cached user authentication data (roles and club memberships)
     */
    getCachedUserAuthData(firebaseUid: string): Observable<CachedUserData> {
        return this.http.get<CachedUserData>(`${this.apiUrl}/firebase/${firebaseUid}/auth-data`).pipe(
            catchError(this.handleError<CachedUserData>('getCachedUserAuthData'))
        );
    }

    /**
     * Invalidate user cache
     */
    invalidateUserCache(firebaseUid: string): Observable<string> {
        return this.http.delete(`${this.apiUrl}/firebase/${firebaseUid}/cache`, { responseType: 'text' }).pipe(
            catchError(this.handleError<string>('invalidateUserCache', 'Cache invalidation failed'))
        );
    }

    /**
     * Get user's admin clubs
     */
    getUserAdminClubs(firebaseUid: string): Observable<ClubMembership[]> {
        return this.http.get<ClubMembership[]>(`${this.apiUrl}/firebase/${firebaseUid}/admin-clubs`).pipe(
            catchError(this.handleError<ClubMembership[]>('getUserAdminClubs', []))
        );
    }

    /**
     * Handle HTTP errors
     */
    private handleError<T>(operation = 'operation', result?: T) {
        return (error: any): Observable<T> => {
            // Notify user of the error
            this.errorHandlerService.handleApiError(error, operation);
            
            // For read-only operations, return default value
            // For write operations, rethrow the error
            const isReadOperation = operation.includes('get') || operation.includes('search') || operation.includes('health');
            
            if (isReadOperation && result !== undefined) {
                return of(result as T);
            } else {
                return throwError(() => error);
            }
        };
    }
} 