import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../environments/environment';

export interface RunBooking {
    booking_id?: string;
    user_id: string;
    user_name: string;
    booking_date: string; // YYYY-MM-DD format
    booking_time: string; // HH:MM format (always 05:00)
    created_at?: string;
    updated_at?: string;
}

export interface RunSlot {
    date: string; // YYYY-MM-DD format
    time: string; // Always "05:00"
    bookings: RunBooking[];
    is_booked_by_user: boolean;
    user_booking_id?: string;
}

export interface BookingResponse {
    success: boolean;
    message: string;
    booking?: RunBooking;
}

@Injectable({
    providedIn: 'root'
})
export class RunBookingService {
    private apiUrl = `${environment.quarkusApiUrl}/run-bookings`;

    constructor(private http: HttpClient) {}

    /**
     * Get all run bookings for a specific month
     * @param year - Year (e.g., 2024)
     * @param month - Month (1-12)
     * @param userId - Current user ID to check if they have bookings
     */
    getBookingsForMonth(year: number, month: number, userId: string): Observable<RunSlot[]> {
        const url = `${this.apiUrl}/month/${year}/${month}?userId=${userId}`;
        return this.http.get<RunSlot[]>(url).pipe(
            map((slots: RunSlot[]) => {
                // Ensure all slots have the correct structure
                return slots.map(slot => ({
                    ...slot,
                    time: '05:00', // Always 5am
                    bookings: slot.bookings || []
                }));
            }),
            catchError(this.handleError<RunSlot[]>('getBookingsForMonth', []))
        );
    }

    /**
     * Create a new run booking
     * @param booking - The booking details
     */
    createBooking(booking: Omit<RunBooking, 'booking_id' | 'created_at' | 'updated_at'>): Observable<BookingResponse> {
        return this.http.post<BookingResponse>(this.apiUrl, booking).pipe(
            catchError(this.handleError<BookingResponse>('createBooking', { success: false, message: 'Failed to create booking' }))
        );
    }

    /**
     * Cancel a run booking
     * @param bookingId - The booking ID to cancel
     * @param userId - The user ID (required by backend)
     */
    cancelBooking(bookingId: string, userId: string): Observable<BookingResponse> {
        return this.http.delete<BookingResponse>(`${this.apiUrl}/${bookingId}?userId=${userId}`).pipe(
            catchError(this.handleError<BookingResponse>('cancelBooking', { success: false, message: 'Failed to cancel booking' }))
        );
    }

    /**
     * Get user's bookings for a specific date range
     * @param userId - User ID
     * @param startDate - Start date (YYYY-MM-DD)
     * @param endDate - End date (YYYY-MM-DD)
     */
    getUserBookings(userId: string, startDate: string, endDate: string): Observable<RunBooking[]> {
        const url = `${this.apiUrl}/user/${userId}?startDate=${startDate}&endDate=${endDate}`;
        return this.http.get<RunBooking[]>(url).pipe(
            catchError(this.handleError<RunBooking[]>('getUserBookings', []))
        );
    }

    /**
     * Check if a specific date is a weekday
     * @param date - Date to check
     */
    isWeekday(date: Date): boolean {
        const day = date.getDay();
        return day >= 1 && day <= 5; // Monday to Friday
    }

    /**
     * Generate all weekdays for a given month
     * @param year - Year
     * @param month - Month (0-11, JavaScript Date format)
     */
    generateWeekdaysForMonth(year: number, month: number): Date[] {
        const weekdays: Date[] = [];
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);

        for (let day = firstDay.getDate(); day <= lastDay.getDate(); day++) {
            const date = new Date(year, month, day);
            if (this.isWeekday(date)) {
                weekdays.push(date);
            }
        }

        return weekdays;
    }

    /**
     * Format date to YYYY-MM-DD string (timezone-safe)
     * @param date - Date to format
     */
    formatDate(date: Date): string {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
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
