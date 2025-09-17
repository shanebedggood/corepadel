import { Injectable } from '@angular/core';
import { Observable, catchError, of, throwError, map } from 'rxjs';
import { QuarkusVenueService, Venue } from './quarkus-venue.service';
import { FirebaseAuthService } from './firebase-auth.service';

// Re-export the Venue interface for backward compatibility
export type { Venue } from './quarkus-venue.service';

@Injectable({
  providedIn: 'root'
})
export class VenueService {
  private venuesCache: Venue[] = [];
  private cacheExpiry = 30 * 60 * 1000; // 30 minutes
  private lastFetch = 0;

  constructor(private quarkusVenueService: QuarkusVenueService, private auth: FirebaseAuthService) {}

  /**
   * Get all venues from Quarkus backend.
   */
  getVenues(): Observable<Venue[]> {
    // Check if cache is valid
    if (this.venuesCache.length > 0 && Date.now() - this.lastFetch < this.cacheExpiry) {
      return of(this.venuesCache);
    }

    return this.quarkusVenueService.getVenues().pipe(
      map(venues => {
        this.venuesCache = venues;
        this.lastFetch = Date.now();
        return this.venuesCache;
      }),
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
    return this.quarkusVenueService.getVenueById(id).pipe(
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
    return this.quarkusVenueService.createVenue(venue).pipe(
      map(createdVenue => {
        // Clear cache to force refresh
        this.clearCache();
        return createdVenue;
      }),
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
    return this.quarkusVenueService.updateVenue(id, updates).pipe(
      map(updatedVenue => {
        // Clear cache to force refresh
        this.clearCache();
        return updatedVenue;
      }),
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
    return this.quarkusVenueService.deleteVenue(id).pipe(
      map(() => {
        // Clear cache to force refresh
        this.clearCache();
      }),
      catchError(error => {
        console.error('Error deleting venue in Quarkus:', error);
        return throwError(() => error);
      })
    );
  }

  getFavouriteClubIds(): Observable<string[]> {
    const user = this.auth.getCurrentUser();
    if (!user?.uid) return of([]);
    return this.quarkusVenueService.getFavouriteClubs(user.uid);
  }

  toggleFavouriteClub(clubId: string, isCurrentlyFavourite: boolean): Observable<void> {
    const user = this.auth.getCurrentUser();
    if (!user?.uid) return throwError(() => new Error('Not authenticated'));
    return isCurrentlyFavourite
      ? this.quarkusVenueService.removeFavouriteClub(user.uid, clubId)
      : this.quarkusVenueService.addFavouriteClub(user.uid, clubId);
  }

  /**
   * Clear the venues cache.
   */
  clearCache(): void {
    this.venuesCache = [];
    this.lastFetch = 0;
  }

  /**
   * Health check.
   */
  healthCheck(): Observable<string> {
    return this.quarkusVenueService.healthCheck().pipe(
      catchError(error => {
        console.error('Error checking venue service health:', error);
        return throwError(() => error);
      })
    );
  }
}
