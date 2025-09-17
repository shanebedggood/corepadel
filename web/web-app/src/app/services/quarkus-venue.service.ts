import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, map, of, throwError, switchMap } from 'rxjs';
import { environment } from '../../environments/environment';

// Facility interface
export interface Facility {
    id: string;
    name: string;
    description?: string;
    icon?: string;
    category: string;
    is_countable: boolean;
    unit?: string;
}

// Venue-Facility relationship interface
export interface VenueFacility {
    facility: Facility;
    quantity: number;
    notes?: string;
}

// Venue Types - updated to use normalized facilities
export interface Venue {
    id?: string;
    name: string;
    website?: string;
    facilities: VenueFacility[];  // Array of facility relationships with quantities
    address: {
        street: string;
        suburb?: string;
        city: string;
        province?: string;
        postalCode?: string;
        country: string;
    };
}

@Injectable({
    providedIn: 'root'
})
export class QuarkusVenueService {
    private readonly apiUrl = environment.quarkusApiUrl;

    constructor(private http: HttpClient) {}

    /**
     * Get all venues (now using unified Club API).
     */
    getVenues(): Observable<Venue[]> {
        return this.http.get<Venue[]>(`${this.apiUrl}/clubs?type=VENUE`).pipe(
            catchError(error => {
                console.error('Error fetching venues from Quarkus:', error);
                return throwError(() => error);
            })
        );
    }

  private authHeaders(): Observable<{ [k: string]: string }> {
    return new Observable(sub => {
      // lazy import to avoid circular deps; use Firebase SDK via window if available
      try {
        const stored = localStorage.getItem('firebaseAuthUser');
        const firebase = (window as any)?.firebaseAuth;
        const currentUser = (firebase && firebase.currentUser) || null;
        const getToken = currentUser?.getIdToken ? currentUser.getIdToken.bind(currentUser) : null;
        const resolve = (token: string | null) => {
          const headers: any = { 'Content-Type': 'application/json' };
          if (token) headers['Authorization'] = `Bearer ${token}`;
          sub.next(headers); sub.complete();
        };
        if (getToken) {
          getToken().then((t: string) => resolve(t)).catch(() => resolve(null));
        } else {
          resolve(null);
        }
      } catch {
        sub.next({ 'Content-Type': 'application/json' }); sub.complete();
      }
    });
  }

  getFavouriteClubs(firebaseUid: string): Observable<string[]> {
    return this.authHeaders().pipe(
      switchMap(headers => this.http.get<any[]>(`${this.apiUrl}/users/firebase/${firebaseUid}/favourites`, { headers })),
      map(list => (list || []).map(item => item.clubId || item.club_id)),
      catchError(error => {
        console.error('Error fetching favourite clubs:', error);
        return of([]);
      })
    );
  }

  addFavouriteClub(firebaseUid: string, clubId: string): Observable<void> {
    return this.authHeaders().pipe(
      switchMap(headers => this.http.post<void>(`${this.apiUrl}/users/firebase/${firebaseUid}/favourites/${clubId}`, {}, { headers })),
      catchError(error => {
        console.error('Error adding favourite club:', error);
        return throwError(() => error);
      })
    );
  }

  removeFavouriteClub(firebaseUid: string, clubId: string): Observable<void> {
    return this.authHeaders().pipe(
      switchMap(headers => this.http.delete<void>(`${this.apiUrl}/users/firebase/${firebaseUid}/favourites/${clubId}`, { headers })),
      catchError(error => {
        console.error('Error removing favourite club:', error);
        return throwError(() => error);
      })
    );
  }

    /**
     * Get venue by ID (now using unified Club API).
     */
    getVenueById(id: string): Observable<Venue | null> {
        return this.http.get<Venue>(`${this.apiUrl}/clubs/${id}`).pipe(
            catchError(error => {
                console.error('Error fetching venue from Quarkus:', error);
                return throwError(() => error);
            })
        );
    }

    /**
     * Create a new venue (now using unified Club API).
     */
    createVenue(venue: Omit<Venue, 'id'>): Observable<Venue> {
        return this.http.post<Venue>(`${this.apiUrl}/clubs`, venue).pipe(
            catchError(error => {
                console.error('Error creating venue in Quarkus:', error);
                return throwError(() => error);
            })
        );
    }

    /**
     * Update an existing venue (now using unified Club API).
     */
    updateVenue(id: string, updates: Partial<Venue>): Observable<Venue> {
        return this.http.put<Venue>(`${this.apiUrl}/clubs/${id}`, updates).pipe(
            catchError(error => {
                console.error('Error updating venue in Quarkus:', error);
                return throwError(() => error);
            })
        );
    }

    /**
     * Delete a venue (now using unified Club API).
     */
    deleteVenue(id: string): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/clubs/${id}`).pipe(
            catchError(error => {
                console.error('Error deleting venue in Quarkus:', error);
                return throwError(() => error);
            })
        );
    }

    /**
     * Get all facilities.
     */
    getFacilities(): Observable<Facility[]> {
        return this.http.get<Facility[]>(`${this.apiUrl}/facilities`).pipe(
            catchError(error => {
                console.error('Error fetching facilities from Quarkus:', error);
                return throwError(() => error);
            })
        );
    }

    /**
     * Get facilities by category.
     */
    getFacilitiesByCategory(category: string): Observable<Facility[]> {
        return this.http.get<Facility[]>(`${this.apiUrl}/facilities/category/${category}`).pipe(
            catchError(error => {
                console.error('Error fetching facilities by category from Quarkus:', error);
                return throwError(() => error);
            })
        );
    }

    /**
     * Health check (now using unified Club API).
     */
    healthCheck(): Observable<string> {
        return this.http.get(`${this.apiUrl}/clubs/health`, { responseType: 'text' }).pipe(
            catchError(error => {
                console.error('Error checking venue service health:', error);
                return throwError(() => error);
            })
        );
    }
} 