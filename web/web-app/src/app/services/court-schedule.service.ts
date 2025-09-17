import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError, timeout } from 'rxjs';
import { catchError, map, take } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { FirebaseAuthService } from './firebase-auth.service';

export interface CourtScheduleDay {
    dayOfWeek: number; // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
    venueId: string;
    timeSlot: string; // Format: "HH:MM"
    gameDuration: number; // Duration in minutes (60, 90, or 120)
    courtCount: number; // Number of courts available for this time slot
}

export interface CourtSchedule {
    id?: string;
    clubId: string;
    startDate: string; // Changed to string to match backend expectation
    endDate: string; // Changed to string to match backend expectation
    scheduleDays: CourtScheduleDay[];
}

export interface CourtScheduleResponse {
    success: boolean;
    message: string;
    schedule?: CourtSchedule;
}

export interface CourtBooking {
    id?: string;
    scheduleId: string;
    userId: string;
    userName: string;
    // API responses use 'date'; requests may use 'bookingDate'
    date?: string; // YYYY-MM-DD format
    bookingDate?: string; // kept optional for request payloads
    timeSlot: string; // HH:MM format
    gameDuration: number;
    venueId: string;
    courtNumber?: number;
    teamNumber?: number; // Team number: 1 or 2 (padel has 2 teams of 2 players each)
    status: 'confirmed' | 'cancelled' | 'completed';
}

export interface AvailableSlot {
    date: string; // YYYY-MM-DD format
    timeSlot: string; // HH:MM format
    gameDuration: number;
    scheduleId: string;
    venueId: string;
    venueName: string;
    availableCourts: number;
    totalCourts: number;
    bookings: CourtBooking[];
    isBookedByUser: boolean;
    userBookingId?: string;
}

@Injectable({
    providedIn: 'root'
})
export class CourtScheduleService {
    private readonly apiUrl = environment.quarkusApiUrl;

    constructor(
        private http: HttpClient,
        private authService: FirebaseAuthService
    ) {}

    /**
     * Get authentication headers for API calls
     */
    private async getAuthHeaders(): Promise<HttpHeaders> {
        return new Promise((resolve, reject) => {
            this.authService.currentUser$.pipe(
                take(1),
                map(user => {
                    if (!user) {
                        reject(new Error('User not authenticated'));
                        return;
                    }
                    
                    user.getIdToken().then(idToken => {
                        const headers = new HttpHeaders({
                            'Authorization': `Bearer ${idToken}`,
                            'Content-Type': 'application/json'
                        });
                        resolve(headers);
                    }).catch(reject);
                })
            ).subscribe();
        });
    }

    /**
     * Create a new court schedule
     */
    createSchedule(schedule: CourtSchedule): Observable<CourtScheduleResponse> {
        return this.http.post<CourtScheduleResponse>(`${this.apiUrl}/court-schedules`, schedule).pipe(
            catchError(error => {
                console.error('Error creating court schedule:', error);
                return throwError(() => error);
            })
        );
    }

    getSchedules(): Observable<CourtSchedule[]> {
        return this.http.get<CourtSchedule[]>(`${this.apiUrl}/court-schedules`).pipe(
            catchError(error => {
                console.error('Error fetching court schedules:', error);
                return throwError(() => error);
            })
        );
    }

    getSchedule(id: string): Observable<CourtSchedule> {
        return this.http.get<CourtSchedule>(`${this.apiUrl}/court-schedules/${id}`).pipe(
            catchError(error => {
                console.error('Error fetching court schedule:', error);
                return throwError(() => error);
            })
        );
    }

    /**
     * Get all court schedules for a club
     */
    getSchedulesByClub(clubId: string): Observable<CourtSchedule[]> {
        return this.http.get<CourtSchedule[]>(`${this.apiUrl}/court-schedules/club/${clubId}`).pipe(
            catchError(error => {
                console.error('Error fetching court schedules:', error);
                return throwError(() => error);
            })
        );
    }

    /**
     * Get active court schedules for a club within a date range
     */
    getActiveSchedules(clubId: string, startDate: string, endDate: string): Observable<CourtSchedule[]> {
        return this.http.get<CourtSchedule[]>(
            `${this.apiUrl}/court-schedules/club/${clubId}/active?startDate=${startDate}&endDate=${endDate}`
        ).pipe(
            catchError(error => {
                console.error('Error fetching active court schedules:', error);
                return throwError(() => error);
            })
        );
    }

    /**
     * Get available booking slots for a specific date range
     */
    getAvailableSlots(clubId: string, startDate: string, endDate: string): Observable<AvailableSlot[]> {
        return new Observable(observer => {
            this.getAuthHeaders().then(headers => {
                this.http.get<AvailableSlot[]>(
                    `${this.apiUrl}/court-schedules/club/${clubId}/available-slots?startDate=${startDate}&endDate=${endDate}`,
                    { headers }
                ).pipe(
                    timeout(30000), // 30 second timeout
                    catchError(error => {
                        console.error('Error fetching available slots:', error);
                        return throwError(() => error);
                    })
                ).subscribe(observer);
            }).catch(error => {
                observer.error(error);
            });
        });
    }

    /**
     * Create a court booking
     */
    createBooking(booking: Omit<CourtBooking, 'id'>): Observable<{ success: boolean; message: string; booking?: CourtBooking }> {
        return new Observable(observer => {
            this.getAuthHeaders().then(headers => {
                this.http.post<{ success: boolean; message: string; booking?: CourtBooking }>(
                    `${this.apiUrl}/court-bookings`, booking, { headers }
                ).pipe(
                    catchError(error => {
                        console.error('Error creating court booking:', error);
                        return throwError(() => error);
                    })
                ).subscribe(observer);
            }).catch(error => {
                observer.error(error);
            });
        });
    }

    /**
     * Cancel a court booking
     */
    cancelBooking(bookingId: string, userId: string): Observable<{ success: boolean; message: string }> {
        return new Observable(observer => {
            this.getAuthHeaders().then(headers => {
                this.http.delete<{ success: boolean; message: string }>(
                    `${this.apiUrl}/court-bookings/${bookingId}?userId=${userId}`, { headers }
                ).pipe(
                    catchError(error => {
                        console.error('Error cancelling court booking:', error);
                        return throwError(() => error);
                    })
                ).subscribe(observer);
            }).catch(error => {
                observer.error(error);
            });
        });
    }

    /**
     * Get user's court bookings
     */
    getUserBookings(userId: string, startDate?: string, endDate?: string): Observable<CourtBooking[]> {
        return new Observable(observer => {
            this.getAuthHeaders().then(headers => {
                let url = `${this.apiUrl}/court-bookings/user/${userId}`;
                if (startDate && endDate) {
                    url += `?startDate=${startDate}&endDate=${endDate}`;
                }
                
                this.http.get<CourtBooking[]>(url, { headers }).pipe(
                    catchError(error => {
                        console.error('Error fetching user bookings:', error);
                        return throwError(() => error);
                    })
                ).subscribe(observer);
            }).catch(error => {
                observer.error(error);
            });
        });
    }

    /**
     * Update a court schedule
     */
    updateSchedule(scheduleId: string, schedule: Partial<CourtSchedule>): Observable<CourtScheduleResponse> {
        return this.http.put<CourtScheduleResponse>(`${this.apiUrl}/court-schedules/${scheduleId}`, schedule).pipe(
            catchError(error => {
                console.error('Error updating court schedule:', error);
                return throwError(() => error);
            })
        );
    }

    /**
     * Delete a court schedule
     */
    deleteSchedule(scheduleId: string): Observable<{ success: boolean; message: string }> {
        return this.http.delete<{ success: boolean; message: string }>(`${this.apiUrl}/court-schedules/${scheduleId}`).pipe(
            catchError(error => {
                console.error('Error deleting court schedule:', error);
                return throwError(() => error);
            })
        );
    }

    /**
     * Utility method to check if a date falls within a schedule's date range
     */
    isDateInScheduleRange(date: Date, schedule: CourtSchedule): boolean {
        const checkDate = new Date(date);
        const startDate = new Date(schedule.startDate);
        const endDate = new Date(schedule.endDate);
        
        return checkDate >= startDate && checkDate <= endDate;
    }

    /**
     * Utility method to check if a day of week is scheduled
     */
    isDayScheduled(dayOfWeek: number, schedule: CourtSchedule): boolean {
        return schedule.scheduleDays.some(day => day.dayOfWeek === dayOfWeek);
    }

    /**
     * Utility method to get schedule configuration for a specific day
     */
    getScheduleForDay(dayOfWeek: number, schedule: CourtSchedule): CourtScheduleDay | undefined {
        return schedule.scheduleDays.find(day => day.dayOfWeek === dayOfWeek);
    }

    /**
     * Utility method to format time slot for display
     */
    formatTimeSlot(timeSlot: string): string {
        const [hours, minutes] = timeSlot.split(':');
        const hour = parseInt(hours, 10);
        const minute = parseInt(minutes, 10);
        
        const period = hour >= 12 ? 'PM' : 'AM';
        const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
        
        return `${displayHour}:${minute.toString().padStart(2, '0')} ${period}`;
    }

    /**
     * Utility method to calculate end time based on start time and duration
     */
    calculateEndTime(startTime: string, durationMinutes: number): string {
        const [hours, minutes] = startTime.split(':');
        const startDate = new Date();
        startDate.setHours(parseInt(hours, 10), parseInt(minutes, 10), 0, 0);
        
        const endDate = new Date(startDate.getTime() + durationMinutes * 60000);
        
        return `${endDate.getHours().toString().padStart(2, '0')}:${endDate.getMinutes().toString().padStart(2, '0')}`;
    }

    /**
     * Utility method to get court count from venue facilities
     */
    getCourtCountFromVenue(venue: any): number {
        if (!venue || !venue.facilities) {
            return 1; // Default to 1 court if no facilities found
        }
        
        // Look for court-related facilities
        const courtFacilities = venue.facilities.filter((facility: any) => 
            facility.facility && (
                facility.facility.name.toLowerCase().includes('court') ||
                facility.facility.name.toLowerCase().includes('padel') ||
                facility.facility.category.toLowerCase().includes('court')
            )
        );
        
        if (courtFacilities.length > 0) {
            return courtFacilities.reduce((total: number, facility: any) => total + (facility.quantity || 1), 0);
        }
        
        return 1; // Default to 1 court if no court facilities found
    }
}
