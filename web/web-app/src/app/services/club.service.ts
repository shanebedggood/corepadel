import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../environments/environment';

export interface Club {
    club_id?: string;
    name: string;
    website?: string;
}

@Injectable({
    providedIn: 'root'
})
export class ClubService {
    private apiUrl = `${environment.quarkusApiUrl}/clubs`;

    constructor(private http: HttpClient) {}

    /**
     * Get all clubs
     */
    getAllClubs(): Observable<Club[]> {
        return this.http.get<Club[]>(this.apiUrl).pipe(
            catchError(this.handleError<Club[]>('getAllClubs', []))
        );
    }

    /**
     * Get a club by ID
     */
    getClubById(clubId: string): Observable<Club | null> {
        return this.http.get<Club>(`${this.apiUrl}/${clubId}`).pipe(
            catchError(this.handleError<Club | null>('getClubById', null))
        );
    }

    /**
     * Create a new club
     */
    createClub(club: Club): Observable<Club | null> {
        return this.http.post<Club>(this.apiUrl, club).pipe(
            catchError(this.handleError<Club | null>('createClub', null))
        );
    }

    /**
     * Update an existing club
     */
    updateClub(clubId: string, club: Club): Observable<Club | null> {
        return this.http.put<Club>(`${this.apiUrl}/${clubId}`, club).pipe(
            catchError(this.handleError<Club | null>('updateClub', null))
        );
    }

    /**
     * Delete a club
     */
    deleteClub(clubId: string): Observable<boolean> {
        return this.http.delete(`${this.apiUrl}/${clubId}`).pipe(
            map(() => true),
            catchError(this.handleError<boolean>('deleteClub', false))
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