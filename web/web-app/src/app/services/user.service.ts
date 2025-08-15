import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import { environment } from '../../environments/environment';

export interface User {
    user_id?: string;
    firebase_uid: string; // Firebase user identifier
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
    role: string;
}

export interface Club {
    club_id?: string;
    name: string;
    website?: string;
}

@Injectable({
    providedIn: 'root'
})
export class UserService {
    private apiUrl = `${environment.quarkusApiUrl}/users`;

    constructor(private http: HttpClient) {}

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
     * Get a user by ID
     */
    getUserById(userId: string): Observable<User | null> {
        return this.http.get<User>(`${this.apiUrl}/${userId}`).pipe(
            catchError(this.handleError<User | null>('getUserById', null))
        );
    }

    /**
     * Get a user by Cognito sub (legacy method name for compatibility)
     */
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
     * Update an existing user
     */
    updateUser(userId: string, user: User): Observable<User | null> {
        return this.http.put<User>(`${this.apiUrl}/${userId}`, user).pipe(
            catchError(this.handleError<User | null>('updateUser', null))
        );
    }

    /**
     * Delete a user (soft delete)
     */
    deleteUser(userId: string): Observable<boolean> {
        return this.http.delete(`${this.apiUrl}/${userId}`).pipe(
            map(() => true),
            catchError(this.handleError<boolean>('deleteUser', false))
        );
    }

    /**
     * Get all roles for a user by PostgreSQL user ID
     */
    getUserRoles(userId: string): Observable<UserRole[]> {
        return this.http.get<UserRole[]>(`${this.apiUrl}/${userId}/roles`).pipe(
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
     * Add a role to a user by PostgreSQL user ID
     */
    addRoleToUser(userId: string, roleName: string): Observable<UserRole | null> {
        return this.http.post<UserRole>(`${this.apiUrl}/${userId}/roles?role=${roleName}`, {}).pipe(
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
                if (!user || !user.user_id) {
                    throw new Error('User not found or user_id is missing');
                }
                return this.addRoleToUser(user.user_id, roleName);
            }),
            catchError(this.handleError<UserRole | null>('addRoleToUserByFirebaseUid', null))
        );
    }

    /**
     * Remove a role from a user
     */
    removeRoleFromUser(userId: string, roleName: string): Observable<boolean> {
        return this.http.delete(`${this.apiUrl}/${userId}/roles/${roleName}`).pipe(
            map(() => true),
            catchError(this.handleError<boolean>('removeRoleFromUser', false))
        );
    }

    /**
     * Check if a user has a specific role
     */
    userHasRole(userId: string, roleName: string): Observable<boolean> {
        return this.getUserRoles(userId).pipe(
            map(roles => roles.some(role => role.role_name === roleName)),
            catchError(this.handleError<boolean>('userHasRole', false))
        );
    }

    /**
     * Get all clubs for a user by PostgreSQL user ID
     */
    getUserClubs(userId: string): Observable<UserClub[]> {
        return this.http.get<UserClub[]>(`${this.apiUrl}/${userId}/clubs`).pipe(
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
     * Add a user to a club
     */
    addUserToClub(userId: string, clubId: string, role: string = 'member'): Observable<UserClub | null> {
        return this.http.post<UserClub>(`${this.apiUrl}/${userId}/clubs/${clubId}?role=${role}`, {}).pipe(
            catchError(this.handleError<UserClub | null>('addUserToClub', null))
        );
    }

    /**
     * Add a user to a club by Firebase UID
     */
    addUserToClubByFirebaseUid(firebaseUid: string, clubId: string, role: string = 'member'): Observable<UserClub | null> {
        return this.getUserByFirebaseUid(firebaseUid).pipe(
            switchMap((user: User | null) => {
                if (!user || !user.user_id) {
                    return of(null);
                }
                return this.addUserToClub(user.user_id, clubId, role);
            }),
            catchError(this.handleError<UserClub | null>('addUserToClubByFirebaseUid', null))
        );
    }

    /**
     * Remove a user from a club
     */
    removeUserFromClub(userId: string, clubId: string): Observable<boolean> {
        return this.http.delete(`${this.apiUrl}/${userId}/clubs/${clubId}`).pipe(
            map(() => true),
            catchError(this.handleError<boolean>('removeUserFromClub', false))
        );
    }

    /**
     * Remove a user from a club by Firebase UID
     */
    removeUserFromClubByFirebaseUid(firebaseUid: string, clubId: string): Observable<boolean> {
        return this.getUserByFirebaseUid(firebaseUid).pipe(
            switchMap((user: User | null) => {
                if (!user || !user.user_id) {
                    return of(false);
                }
                return this.removeUserFromClub(user.user_id, clubId);
            }),
            catchError(this.handleError<boolean>('removeUserFromClubByFirebaseUid', false))
        );
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
                        username: firebaseProfile.displayName || firebaseProfile.email?.split('@')[0],
                        first_name: firebaseProfile.firstName || firebaseProfile.displayName?.split(' ')[0],
                        last_name: firebaseProfile.lastName || firebaseProfile.displayName?.split(' ').slice(1).join(' '),
                        display_name: firebaseProfile.displayName || `${firebaseProfile.firstName || ''} ${firebaseProfile.lastName || ''}`.trim(),
                        email_verified: firebaseProfile.emailVerified || false
                    };
                    return this.createUser(user);
                }
            }),
            catchError(this.handleError<User | null>('getOrCreateUserFromFirebase', null))
        );
    }

    /**
     * Get or create user from Firebase profile (legacy method name for compatibility)
     */
    getOrCreateUserFromCognito(firebaseProfile: any): Observable<User | null> {
        const firebaseUid = firebaseProfile.firebase_uid || firebaseProfile.cognito_sub;
        
        if (!firebaseUid) {
            console.error('No firebase_uid or cognito_sub provided in firebaseProfile:', firebaseProfile);
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
                        username: firebaseProfile.username,
                        first_name: firebaseProfile.first_name,
                        last_name: firebaseProfile.last_name,
                        display_name: firebaseProfile.display_name,
                        email_verified: firebaseProfile.email_verified
                    };
                    return this.createUser(user);
                }
            }),
            catchError(this.handleError<User | null>('getOrCreateUserFromCognito', null))
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
     * Handle HTTP errors
     */
    private handleError<T>(operation = 'operation', result?: T) {
        return (error: any): Observable<T> => {
            console.error(`${operation} failed:`, error);
            return of(result as T);
        };
    }
} 