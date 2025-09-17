import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { RunBookingService, RunSlot, RunBooking } from '../../services/run-booking.service';
import { FirebaseAuthService } from '../../services/firebase-auth.service';
import { ErrorHandlerService } from '../../services/error-handler.service';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { CardModule } from 'primeng/card';
import { BadgeModule } from 'primeng/badge';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';
import { ProgressSpinnerModule } from 'primeng/progressspinner';

interface CalendarDay {
    date: Date;
    isCurrentMonth: boolean;
    isToday: boolean;
    isWeekday: boolean;
    isBookable: boolean;
    slot?: RunSlot;
}

@Component({
    selector: 'app-run-booking',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        ButtonModule,
        DialogModule,
        CardModule,
        BadgeModule,
        TagModule,
        TooltipModule,
        ProgressSpinnerModule
    ],
    templateUrl: './run-booking.component.html',
    styleUrls: ['./run-booking.component.scss', '../../shared/styles/container.styles.scss']
})
export class RunBookingComponent implements OnInit, OnDestroy {
    private destroy$ = new Subject<void>();
    
    // Calendar state
    currentDate = new Date();
    selectedDate: Date | null = null;
    calendarDays: CalendarDay[] = [];
    
    // Booking state
    slots: RunSlot[] = [];
    loading = false;
    selectedSlot: RunSlot | null = null;
    showBookingModal = false;
    
    // User info
    currentUser: any = null;
    
    // Month navigation
    currentMonth = new Date().getMonth();
    currentYear = new Date().getFullYear();
    
    // Modal state
    newBookingName = '';
    isCreatingBooking = false;
    isCancellingBooking = false;
    

    constructor(
        private runBookingService: RunBookingService,
        private firebaseAuthService: FirebaseAuthService,
        private errorHandlerService: ErrorHandlerService
    ) {}

    ngOnInit(): void {
        this.loadUserInfo();
        this.generateCalendar();
        this.loadBookings();
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }

    private loadUserInfo(): void {
        this.firebaseAuthService.userProfile$
            .pipe(takeUntil(this.destroy$))
            .subscribe(profile => {
                this.currentUser = profile;
            });
    }

    private generateCalendar(): void {
        this.calendarDays = [];
        
        // Get first day of month and calculate start of calendar grid
        const firstDay = new Date(this.currentYear, this.currentMonth, 1);
        const startDate = new Date(firstDay);
        startDate.setDate(startDate.getDate() - firstDay.getDay());
        
        // Generate 42 days (6 weeks)
        for (let i = 0; i < 42; i++) {
            const date = new Date(startDate);
            date.setDate(startDate.getDate() + i);
            
            const isCurrentMonth = date.getMonth() === this.currentMonth;
            const isToday = this.isToday(date);
            const isWeekday = this.runBookingService.isWeekday(date);
            const isBookable = isCurrentMonth;
            
            this.calendarDays.push({
                date,
                isCurrentMonth,
                isToday,
                isWeekday,
                isBookable
            });
        }
    }

    private loadBookings(): void {
        if (!this.currentUser?.firebaseUid) return;
        
        this.loading = true;
        this.runBookingService.getBookingsForMonth(
            this.currentYear, 
            this.currentMonth + 1, // API expects 1-12, JavaScript uses 0-11
            this.currentUser.firebaseUid
        ).pipe(takeUntil(this.destroy$))
        .subscribe({
            next: (slots) => {
                this.slots = slots;
                this.updateCalendarWithBookings();
                this.loading = false;
            },
            error: (error) => {
                console.error('Error loading bookings:', error);
                this.errorHandlerService.handleApiError(error, 'Run Bookings');
                this.loading = false;
            }
        });
    }

    private updateCalendarWithBookings(): void {
        this.calendarDays.forEach(day => {
            if (day.isBookable) {
                const dateStr = this.runBookingService.formatDate(day.date);
                day.slot = this.slots.find(slot => slot.date === dateStr);
            }
        });
    }

    private isToday(date: Date): boolean {
        const today = new Date();
        return date.toDateString() === today.toDateString();
    }

    onDateSelect(date: Date): void {
        if (date.getMonth() !== this.currentMonth) {
            return;
        }

        this.selectedDate = date;
        const dateStr = this.runBookingService.formatDate(date);
        this.selectedSlot = this.slots.find(slot => slot.date === dateStr) || {
            date: dateStr,
            time: '05:00',
            bookings: [],
            is_booked_by_user: false
        };
        
        
        this.showBookingModal = true;
    }

    onPreviousMonth(): void {
        this.currentMonth--;
        if (this.currentMonth < 0) {
            this.currentMonth = 11;
            this.currentYear--;
        }
        this.generateCalendar();
        this.loadBookings();
    }

    onNextMonth(): void {
        this.currentMonth++;
        if (this.currentMonth > 11) {
            this.currentMonth = 0;
            this.currentYear++;
        }
        this.generateCalendar();
        this.loadBookings();
    }

    onCreateBooking(): void {
        if (!this.selectedSlot || !this.currentUser?.firebaseUid) {
            return;
        }

        this.isCreatingBooking = true;
        const userDisplayName = this.currentUser.display_name || 
                               `${this.currentUser.first_name || ''} ${this.currentUser.last_name || ''}`.trim() || 
                               'Unknown User';
        
        const booking: Omit<RunBooking, 'booking_id'> = {
            user_id: this.currentUser.firebaseUid,
            user_name: userDisplayName,
            booking_date: this.selectedSlot.date,
            booking_time: '05:00'
        };

        this.runBookingService.createBooking(booking)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (response) => {
                    if (response.success) {
                        this.errorHandlerService.handleSuccess('Run booking created successfully!');
                        this.loadBookings(); // Reload to get updated data
                        this.showBookingModal = false;
                    } else {
                        this.errorHandlerService.handleApiError({ message: response.message || 'Failed to create booking' }, 'Run Booking Creation');
                    }
                    this.isCreatingBooking = false;
                },
                error: (error) => {
                    console.error('Error creating booking:', error);
                    this.errorHandlerService.handleApiError(error, 'Run Booking Creation');
                    this.isCreatingBooking = false;
                }
            });
    }

    onCancelBooking(bookingId: string): void {
        this.isCancellingBooking = true;
        this.runBookingService.cancelBooking(bookingId, this.currentUser?.firebaseUid || '')
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (response) => {
                    if (response.success) {
                        this.errorHandlerService.handleSuccess('Run booking cancelled successfully!');
                        this.loadBookings(); // Reload to get updated data
                        this.showBookingModal = false; // Close the dialog
                    } else {
                        this.errorHandlerService.handleApiError({ message: response.message || 'Failed to cancel booking' }, 'Run Booking Cancellation');
                    }
                    this.isCancellingBooking = false;
                },
                error: (error) => {
                    console.error('Error cancelling booking:', error);
                    this.errorHandlerService.handleApiError(error, 'Run Booking Cancellation');
                    this.isCancellingBooking = false;
                }
            });
    }

    onCloseModal(): void {
        this.showBookingModal = false;
        this.selectedDate = null;
        this.selectedSlot = null;
    }

    getMonthName(): string {
        return new Date(this.currentYear, this.currentMonth).toLocaleDateString('en-US', { 
            month: 'long', 
            year: 'numeric' 
        });
    }

    getDayName(date: Date): string {
        return date.toLocaleDateString('en-US', { weekday: 'short' });
    }

    getBookingCount(slot: RunSlot): number {
        return slot?.bookings?.length || 0;
    }

    isUserBooked(slot: RunSlot): boolean {
        return slot?.is_booked_by_user || false;
    }

    getUserBookingId(slot: RunSlot): string | undefined {
        return slot?.user_booking_id;
    }

    trackByDate(index: number, day: CalendarDay): string {
        return day.date.toISOString();
    }

    getDayClasses(day: CalendarDay): string {
        const classes = ['calendar-day'];
        
        if (!day.isCurrentMonth) {
            classes.push('other-month');
        }
        
        if (day.isBookable) {
            classes.push('bookable');
        }
        
        if (day.isToday) {
            classes.push('today');
        }
        
        if (this.selectedDate && day.date.toDateString() === this.selectedDate.toDateString()) {
            classes.push('selected');
        }
        
        return classes.join(' ');
    }

    getDayTooltip(day: CalendarDay): string {
        if (!day.isCurrentMonth) {
            return 'Other month';
        }
        
        if (day.slot) {
            const count = this.getBookingCount(day.slot);
            const isBooked = this.isUserBooked(day.slot);
            
            if (isBooked) {
                return `You're booked (${count} total runners)`;
            } else if (count > 0) {
                return `${count} runner${count > 1 ? 's' : ''} booked`;
            } else {
                return 'Available - Click to book';
            }
        }
        
        return 'Available - Click to book';
    }

    // Determines if a provided ISO date string (YYYY-MM-DD) is in the past (before today)
    isDateInPast(dateStr?: string | null): boolean {
        if (!dateStr) {
            return false;
        }
        const target = new Date(`${dateStr}T00:00:00`);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return target < today;
    }
}
