import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, map, of, throwError } from 'rxjs';
import { environment } from '../../environments/environment';

// Venue Types - matching the existing interface structure
export interface Venue {
    id?: string;
    name: string;
    website?: string;
    facilities?: string;
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
     * Get all venues.
     */
    getVenues(): Observable<Venue[]> {
        return this.http.get<Venue[]>(`${this.apiUrl}/venues`).pipe(
            catchError(error => {
                console.error('Error fetching venues from Quarkus:', error);
                return throwError(() => error);
            })
        );
    }

    /**
     * Get venue by ID.
     */
    getVenueById(id: string): Observable<Venue | null> {
        return this.http.get<Venue>(`${this.apiUrl}/venues/${id}`).pipe(
            catchError(error => {
                console.error('Error fetching venue from Quarkus:', error);
                return throwError(() => error);
            })
        );
    }

    /**
     * Create a new venue.
     */
    createVenue(venue: Omit<Venue, 'id'>): Observable<Venue> {
        return this.http.post<Venue>(`${this.apiUrl}/venues`, venue).pipe(
            catchError(error => {
                console.error('Error creating venue in Quarkus:', error);
                return throwError(() => error);
            })
        );
    }

    /**
     * Update an existing venue.
     */
    updateVenue(id: string, updates: Partial<Venue>): Observable<Venue> {
        return this.http.put<Venue>(`${this.apiUrl}/venues/${id}`, updates).pipe(
            catchError(error => {
                console.error('Error updating venue in Quarkus:', error);
                return throwError(() => error);
            })
        );
    }

    /**
     * Delete a venue.
     */
    deleteVenue(id: string): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/venues/${id}`).pipe(
            catchError(error => {
                console.error('Error deleting venue in Quarkus:', error);
                return throwError(() => error);
            })
        );
    }

    /**
     * Health check.
     */
    healthCheck(): Observable<string> {
        return this.http.get(`${this.apiUrl}/venues/health`, { responseType: 'text' }).pipe(
            catchError(error => {
                console.error('Error checking venue service health:', error);
                return throwError(() => error);
            })
        );
    }
} 