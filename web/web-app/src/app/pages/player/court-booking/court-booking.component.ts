import { Component, OnInit, OnDestroy, ChangeDetectorRef, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';

// PrimeNG Modules
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { SelectModule } from 'primeng/select';
import { MessageModule } from 'primeng/message';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { BadgeModule } from 'primeng/badge';
import { TooltipModule } from 'primeng/tooltip';
import { TabsModule } from 'primeng/tabs';
import { DividerModule } from 'primeng/divider';
import { DatePickerModule } from 'primeng/datepicker';
import { AccordionModule } from 'primeng/accordion';

// Services
import { FirebaseAuthService } from '../../../services/firebase-auth.service';
import { CourtScheduleService, CourtSchedule, AvailableSlot, CourtBooking } from '../../../services/court-schedule.service';
import { VenueService, Venue } from '../../../services/venue.service';
import { UserService } from '../../../services/user.service';
import { MessageService, ConfirmationService } from 'primeng/api';
import { ErrorHandlerService } from '../../../services/error-handler.service';

// Components
import { PageHeaderComponent, BreadcrumbItem } from '../../../layout/component/page-header.component';

@Component({
  selector: 'app-court-booking',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    CardModule,
    ButtonModule,
    TableModule,
    SelectModule,
    MessageModule,
    ToastModule,
    ConfirmDialogModule,
    ProgressSpinnerModule,
    BadgeModule,
    TooltipModule,
    TabsModule,
    DividerModule,
    DatePickerModule,
    AccordionModule,
    // PageHeaderComponent removed
  ],
  providers: [ConfirmationService],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: './court-booking.component.html',
  styleUrls: ['./court-booking.component.scss', '../../../shared/styles/container.styles.scss', '../../../shared/styles/button.styles.scss']
})
export class CourtBookingComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  // Data
  availableSlots: AvailableSlot[] = [];
  myBookings: CourtBooking[] = [];
  venues: Venue[] = [];
  loading = false;
  bookingLoading = false;
  errorMessage = '';
  successMessage = '';
  
  // Track which courts are being booked to prevent multiple requests
  private bookingInProgress = new Set<string>();
  
  // User name cache
  private userNameCache = new Map<string, string>();
  
  // Court arrays cache to prevent recalculation on every change detection
  private courtsArrayCache = new Map<string, { number: number; isBooked: boolean; playerName: string; playerCount: number; maxPlayers: number; teams: { teamNumber: number; players: { name: string; userId: string }[] }[] }[]>();
  
  // Track pending user name requests to prevent duplicates
  private pendingUserNameRequests = new Set<string>();


  // Form
  searchForm: FormGroup;

  // Date range
  dateRange: Date[] = [];
  minDate = new Date();
  maxDate = new Date();

  // Breadcrumbs
  breadcrumbs: BreadcrumbItem[] = [
    { label: 'Player', routerLink: '/player' },
    { label: 'Court Booking', routerLink: '/player/court-booking' }
  ];

  // User info
  currentUser: any = null;

  constructor(
    private fb: FormBuilder,
    private authService: FirebaseAuthService,
    private courtScheduleService: CourtScheduleService,
    private venueService: VenueService,
    private userService: UserService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private errorHandlerService: ErrorHandlerService,
    private cdr: ChangeDetectorRef
  ) {
    this.searchForm = this.createForm();
    
    // Set max date to 1 year from now
    this.maxDate.setFullYear(this.maxDate.getFullYear() + 1);
  }

  ngOnInit(): void {
    this.loadCurrentUser();
    this.loadVenues();
    this.setDefaultDateRange();
    this.loadMyBookings();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    
    // Clear caches
    this.userNameCache.clear();
    this.courtsArrayCache.clear();
    this.pendingUserNameRequests.clear();
    this.bookingInProgress.clear();
  }

  private createForm(): FormGroup {
    const today = new Date();
    const nextWeek = new Date();
    nextWeek.setDate(today.getDate() + 7);
    
    return this.fb.group({
      venueId: ['', Validators.required],
      startDate: [today, Validators.required],
      endDate: [nextWeek, Validators.required]
    });
  }

  private loadCurrentUser(): void {
    this.authService.userProfile$
      .pipe(takeUntil(this.destroy$))
      .subscribe(profile => {
        this.currentUser = profile;
        if (profile) {
          this.loadMyBookings();
        }
      });
  }

  private loadVenues(): void {
    this.venueService.getVenues()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (venues) => {
          this.venues = venues.sort((a, b) => a.name.localeCompare(b.name));
        },
        error: (error) => {
          console.error('Error loading venues:', error);
        }
      });
  }

  private setDefaultDateRange(): void {
    const today = new Date();
    const nextWeek = new Date();
    nextWeek.setDate(today.getDate() + 7);
    
    this.dateRange = [today, nextWeek];
    // Set default values for the form
    this.searchForm.patchValue({ 
      startDate: today,
      endDate: nextWeek
    });
  }

  onSearch(): void {
    if (this.searchForm.valid) {
      this.loadAvailableSlots();
    } else {
      this.markFormGroupTouched(this.searchForm);
      this.errorMessage = 'Please select a venue and date range.';
    }
  }

  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      control?.markAsTouched();
    });
  }

  private loadAvailableSlots(): void {
    const formValue = this.searchForm.value;
    // Guard against undefined values to avoid 404 on API URL
    if (!formValue?.venueId || !formValue?.startDate || !formValue?.endDate) {
      return;
    }
    const startDate = this.formatDateForBackend(formValue.startDate);
    const endDate = this.formatDateForBackend(formValue.endDate);
    const venueId = formValue.venueId;

    this.loading = true;
    this.errorMessage = '';
    
    // Clear courts array cache when loading new slots
    this.courtsArrayCache.clear();

    this.courtScheduleService.getAvailableSlots(venueId, startDate, endDate)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (slots) => {
          this.availableSlots = slots;
          this.loading = false;
        },
        error: (error) => {
          console.error('Error loading available slots:', error);
          this.errorHandlerService.handleApiError(error, 'Loading Available Slots');
          this.loading = false;
        }
      });
  }

  private loadMyBookings(): void {
    if (!this.currentUser?.firebaseUid) return;

    const startDate = this.formatDateForBackend(new Date());
    const endDate = this.formatDateForBackend(this.maxDate);

    this.courtScheduleService.getUserBookings(this.currentUser.firebaseUid, startDate, endDate)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (bookings) => {
          this.myBookings = bookings.filter(booking => booking.status === 'confirmed');
        },
        error: (error) => {
          console.error('Error loading user bookings:', error);
        }
      });
  }



  cancelBooking(booking: CourtBooking): void {
    this.confirmationService.confirm({
      message: `Are you sure you want to cancel your booking for ${this.formatDate((booking as any).bookingDate || (booking as any).date || '')} from ${this.formatTimeRange(booking.timeSlot, booking.gameDuration)}?`,
      header: 'Confirm Cancellation',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Cancel Booking',
      rejectLabel: 'Keep Booking',
      accept: () => {
        this.performCancellation(booking);
      }
    });
  }

  private performCancellation(booking: CourtBooking): void {
    if (!booking.id || !this.currentUser?.firebaseUid) return;

    this.courtScheduleService.cancelBooking(booking.id, this.currentUser.firebaseUid)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          if (response.success) {
            this.messageService.add({
              severity: 'success',
              summary: 'Success',
              detail: 'Booking cancelled successfully.'
            });
            this.loadMyBookings(); // Refresh my bookings
            this.loadAvailableSlots(); // Refresh available slots
          } else {
            this.errorMessage = response.message || 'Failed to cancel booking.';
          }
        },
        error: (error) => {
          console.error('Error cancelling booking:', error);
          this.errorHandlerService.handleApiError(error, 'Cancelling Booking');
        }
      });
  }

  private formatDateForBackend(date: Date): string {
    // Use local date components to avoid timezone issues
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  formatDate(dateInput: string | Date): string {
    if (!dateInput) return '';
    let date: Date | null = null;
    if (dateInput instanceof Date) {
      date = dateInput;
    } else if (typeof dateInput === 'string') {
      // Safely parse YYYY-MM-DD to avoid cross-browser issues
      const parts = dateInput.split('-');
      if (parts.length === 3 && parts[0].length === 4) {
        const year = parseInt(parts[0], 10);
        const month = parseInt(parts[1], 10) - 1; // zero-based
        const day = parseInt(parts[2], 10);
        date = new Date(year, month, day);
      } else {
        const parsed = new Date(dateInput);
        date = isNaN(parsed.getTime()) ? null : parsed;
      }
    }
    if (!date) return '';
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  // Scheduled date display (from schedule, not when it was booked)
  getBookingDisplayDate(booking: CourtBooking): string {
    const raw = (booking as any)?.bookingDate || (booking as any)?.date || '';
    return this.formatDate(raw);
  }

  formatDateTime(dateInput: string | Date): string {
    if (!dateInput) return '';
    let date: Date | null = null;
    if (dateInput instanceof Date) {
      date = dateInput;
    } else if (typeof dateInput === 'string') {
      // Try to normalize various string formats (ISO or others)
      const isoLike = /\d{4}-\d{2}-\d{2}T/.test(dateInput);
      if (isoLike) {
        const parsed = new Date(dateInput);
        date = isNaN(parsed.getTime()) ? null : parsed;
      } else {
        const parsed = new Date(dateInput);
        date = isNaN(parsed.getTime()) ? null : parsed;
      }
    }
    if (!date) return '';
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    });
  }

  // Booked-at display removed since timestamps are no longer tracked
  getBookingBookedAtDisplay(booking: CourtBooking): string {
    return '';
  }

  formatTime(timeSlot: string): string {
    const [hours, minutes] = timeSlot.split(':');
    const hour = parseInt(hours, 10);
    const minute = parseInt(minutes, 10);
    
    const period = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
    
    return `${displayHour}:${minute.toString().padStart(2, '0')} ${period}`;
  }

  formatTimeRange(timeSlot: string, durationMinutes: number): string {
    const [hours, minutes] = timeSlot.split(':');
    const startHour = parseInt(hours, 10);
    const startMinute = parseInt(minutes, 10);
    
    // Calculate end time
    const startTimeInMinutes = startHour * 60 + startMinute;
    const endTimeInMinutes = startTimeInMinutes + durationMinutes;
    
    const endHour = Math.floor(endTimeInMinutes / 60) % 24;
    const endMinute = endTimeInMinutes % 60;
    
    // Format start time
    const startPeriod = startHour >= 12 ? 'PM' : 'AM';
    const startDisplayHour = startHour === 0 ? 12 : startHour > 12 ? startHour - 12 : startHour;
    const startTime = `${startDisplayHour}:${startMinute.toString().padStart(2, '0')}`;
    
    // Format end time
    const endPeriod = endHour >= 12 ? 'PM' : 'AM';
    const endDisplayHour = endHour === 0 ? 12 : endHour > 12 ? endHour - 12 : endHour;
    const endTime = `${endDisplayHour}:${endMinute.toString().padStart(2, '0')}`;
    
    // If both times have the same period, only show it once
    if (startPeriod === endPeriod) {
      return `${startTime} - ${endTime} ${startPeriod.toLowerCase()}`;
    } else {
      return `${startTime} ${startPeriod.toLowerCase()} - ${endTime} ${endPeriod.toLowerCase()}`;
    }
  }

  formatDuration(duration: number): string {
    const hours = Math.floor(duration / 60);
    const minutes = duration % 60;
    
    if (hours > 0 && minutes > 0) {
      return `${hours}h ${minutes}m`;
    } else if (hours > 0) {
      return `${hours}h`;
    } else {
      return `${minutes}m`;
    }
  }

  getVenueName(venueId: string): string {
    const venue = this.venues.find(v => v.id === venueId);
    return venue ? venue.name : venueId;
  }

  getAvailableCourtsCount(slot: AvailableSlot): number {
    const courts = this.getCourtsArray(slot);
    return courts.filter(court => court.playerCount < court.maxPlayers).length;
  }

  getSlotHeader(slot: AvailableSlot): string {
    const date = this.formatDate(slot.date);
    const venue = this.getVenueName(slot.venueId);
    const time = this.formatTimeRange(slot.timeSlot, slot.gameDuration);
    const availableCount = this.getAvailableCourtsCount(slot);
    
    let status = '';
    if (slot.isBookedByUser) {
      status = ' - You\'re booked';
    } else if ((slot.totalCourts - slot.bookings.length) === 0) {
      status = ' - All Courts Booked';
    } else {
      status = ` - ${availableCount} courts available`;
    }
    
    return `${date} | ${venue} | ${time}${status}`;
  }


  getCourtsArray(slot: AvailableSlot): { number: number; isBooked: boolean; playerName: string; playerCount: number; maxPlayers: number; teams: { teamNumber: number; players: { name: string; userId: string }[] }[] }[] {
    // Create a unique cache key for this slot (includes venue and time to ensure uniqueness)
    const cacheKey = `${slot.venueId}-${slot.date}-${slot.timeSlot}-${slot.scheduleId}`;
    
    // Return cached result if available
    if (this.courtsArrayCache.has(cacheKey)) {
      return this.courtsArrayCache.get(cacheKey)!;
    }
    
    const courts: { number: number; isBooked: boolean; playerName: string; playerCount: number; maxPlayers: number; teams: { teamNumber: number; players: { name: string; userId: string }[] }[] }[] = [];
    
    // Create array of all courts
    for (let i = 1; i <= slot.totalCourts; i++) {
      courts.push({
        number: i,
        isBooked: false,
        playerName: '',
        playerCount: 0,
        maxPlayers: 4,
        teams: [
          { teamNumber: 1, players: [] },
          { teamNumber: 2, players: [] }
        ]
      });
    }
    
    // Group bookings by court number and organize by teams
    const bookingsByCourt = new Map<number, CourtBooking[]>();
    slot.bookings.forEach(booking => {
      if (booking.courtNumber) {
        if (!bookingsByCourt.has(booking.courtNumber)) {
          bookingsByCourt.set(booking.courtNumber, []);
        }
        bookingsByCourt.get(booking.courtNumber)!.push(booking);
      }
    });
    
    // Update court information with team data
    bookingsByCourt.forEach((courtBookings, courtNumber) => {
      const courtIndex = courtNumber - 1;
      if (courtIndex >= 0 && courtIndex < courts.length) {
        courts[courtIndex].isBooked = courtBookings.length > 0;
        courts[courtIndex].playerCount = courtBookings.length;
        
        // Organize players by teams
        const team1Players: { name: string; userId: string }[] = [];
        const team2Players: { name: string; userId: string }[] = [];
        
        courtBookings.forEach(booking => {
          const playerInfo = {
            name: this.getUserName(booking.userId),
            userId: booking.userId
          };
          
          if (booking.teamNumber === 1) {
            team1Players.push(playerInfo);
          } else if (booking.teamNumber === 2) {
            team2Players.push(playerInfo);
          }
          
          // Fetch user names if not in cache and not already pending
          if (!this.userNameCache.has(booking.userId) && !this.pendingUserNameRequests.has(booking.userId)) {
            this.fetchUserName(booking.userId);
          }
        });
        
        courts[courtIndex].teams = [
          { teamNumber: 1, players: team1Players },
          { teamNumber: 2, players: team2Players }
        ];
        
        // Create summary player names for display
        const allPlayerNames = [...team1Players, ...team2Players].map(p => p.name);
        courts[courtIndex].playerName = allPlayerNames.join(', ');
      }
    });
    
    // Cache the result
    this.courtsArrayCache.set(cacheKey, courts);
    
    return courts;
  }

  private getUserName(firebaseUid: string): string {
    return this.userNameCache.get(firebaseUid) || 'Loading...';
  }

  private fetchUserName(firebaseUid: string): void {
    // Avoid duplicate requests
    if (this.userNameCache.has(firebaseUid) || this.pendingUserNameRequests.has(firebaseUid)) {
      return;
    }
    
    // Mark request as pending
    this.pendingUserNameRequests.add(firebaseUid);
    
    this.userService.getUserByFirebaseUid(firebaseUid)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (user) => {
          // Remove from pending requests
          this.pendingUserNameRequests.delete(firebaseUid);
          
          if (user) {
            const displayName = user.display_name || 
                              (user.first_name && user.last_name ? `${user.first_name} ${user.last_name}` : null) ||
                              user.first_name || 
                              user.last_name || 
                              user.username || 
                              user.email || 
                              'Unknown Player';
            this.userNameCache.set(firebaseUid, displayName);
          } else {
            this.userNameCache.set(firebaseUid, 'Unknown Player');
          }
          
          // Clear the courts array cache to force recalculation with new user names
          this.courtsArrayCache.clear();
          
          // Trigger change detection to update the UI
          this.triggerChangeDetection();
        },
        error: (error) => {
          console.error('Error fetching user name for', firebaseUid, error);
          
          // Remove from pending requests
          this.pendingUserNameRequests.delete(firebaseUid);
          
          this.userNameCache.set(firebaseUid, 'Unknown Player');
          
          // Clear the courts array cache to force recalculation
          this.courtsArrayCache.clear();
          
          this.triggerChangeDetection();
        }
      });
  }

  private triggerChangeDetection(): void {
    // Force change detection to update the UI with new user names
    this.cdr.detectChanges();
  }

  getBookingStatusBadge(status: string): "success" | "info" | "warn" | "secondary" | "contrast" | "danger" {
    switch (status) {
      case 'confirmed': return 'success';
      case 'cancelled': return 'danger';
      case 'completed': return 'info';
      default: return 'secondary';
    }
  }

  getBookingStatusLabel(status: string): string {
    switch (status) {
      case 'confirmed': return 'Confirmed';
      case 'cancelled': return 'Cancelled';
      case 'completed': return 'Completed';
      default: return 'Unknown';
    }
  }

  private getBookingStartDate(booking: CourtBooking): Date | null {
    const anyBooking = booking as any;
    if (!anyBooking?.bookingDate && !anyBooking?.date) return null;
    if (!anyBooking?.timeSlot) return null;
    // bookingDate expected YYYY-MM-DD, timeSlot HH:mm
    const dateStr: string = anyBooking.bookingDate || anyBooking.date;
    const dateParts = dateStr.split('-');
    const timeParts = anyBooking.timeSlot.split(':');
    if (dateParts.length !== 3 || timeParts.length < 2) return null;
    const year = parseInt(dateParts[0], 10);
    const month = parseInt(dateParts[1], 10) - 1;
    const day = parseInt(dateParts[2], 10);
    const hour = parseInt(timeParts[0], 10);
    const minute = parseInt(timeParts[1], 10);
    const dt = new Date(year, month, day, hour, minute, 0, 0);
    return isNaN(dt.getTime()) ? null : dt;
  }

  canCancelBooking(booking: CourtBooking): boolean {
    const start = this.getBookingStartDate(booking);
    if (!start) return false;
    const now = new Date();
    const msDiff = start.getTime() - now.getTime();
    const hoursDiff = msDiff / (1000 * 60 * 60);
    return hoursDiff > 2 && booking.status === 'confirmed';
  }

  isCourtBeingBooked(slot: AvailableSlot, courtNumber: number): boolean {
    const bookingKey = `${slot.venueId}-${slot.date}-${slot.timeSlot}-${courtNumber}`;
    return this.bookingInProgress.has(bookingKey);
  }

  isCourtFull(slot: AvailableSlot, courtNumber: number): boolean {
    const courts = this.getCourtsArray(slot);
    const court = courts.find(c => c.number === courtNumber);
    return court ? court.playerCount >= court.maxPlayers : false;
  }

  canBookCourt(slot: AvailableSlot, courtNumber: number): boolean {
    return !this.isCourtFull(slot, courtNumber) && 
           !this.isCourtBeingBooked(slot, courtNumber) && 
           !this.isUserAlreadyBooked(slot, courtNumber);
  }

  isUserAlreadyBooked(slot: AvailableSlot, courtNumber: number): boolean {
    if (!this.currentUser?.firebaseUid) return false;
    
    // Check if the current user has a booking for this specific court and time slot
    return slot.bookings.some(booking => 
      booking.courtNumber === courtNumber && 
      booking.userId === this.currentUser.firebaseUid &&
      booking.status === 'confirmed'
    );
  }


  canJoinTeam(slot: AvailableSlot, courtNumber: number, teamNumber: number): boolean {
    if (!this.currentUser?.firebaseUid) return false;
    
    // Check if user is already booked for this court
    if (this.isUserAlreadyBooked(slot, courtNumber)) {
      return false;
    }
    
    // Check if team has space (less than 2 players)
    const courts = this.getCourtsArray(slot);
    const court = courts.find(c => c.number === courtNumber);
    if (!court) return false;
    
    const team = court.teams.find(t => t.teamNumber === teamNumber);
    if (!team) return false;
    
    return team.players.length < 2;
  }

  isTeamBeingBooked(slot: AvailableSlot, courtNumber: number, teamNumber: number): boolean {
    const bookingKey = `${slot.venueId}-${slot.date}-${slot.timeSlot}-${courtNumber}-${teamNumber}`;
    return this.bookingInProgress.has(bookingKey);
  }

  joinTeam(slot: AvailableSlot, courtNumber: number, teamNumber: number): void {
    if (!this.currentUser?.firebaseUid) {
      this.errorMessage = 'Please log in to join a team.';
      return;
    }

    // Check if user is already booked for this court
    if (this.isUserAlreadyBooked(slot, courtNumber)) {
      this.messageService.add({
        severity: 'info',
        summary: 'Already Playing',
        detail: 'You are already playing on this court.',
        life: 3000
      });
      return;
    }

    // Check if team has space
    if (!this.canJoinTeam(slot, courtNumber, teamNumber)) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Team Full',
        detail: 'This team is already full.',
        life: 3000
      });
      return;
    }

    this.confirmationService.confirm({
      message: `Are you sure you want to book a slot on Team ${teamNumber} on Court ${courtNumber} for ${this.formatDate(slot.date)} from ${this.formatTimeRange(slot.timeSlot, slot.gameDuration)}?`,
      header: 'Book slot',
      icon: 'pi pi-users',
      acceptLabel: 'Book slot',
      rejectLabel: 'Cancel',
      accept: () => {
        this.performTeamBooking(slot, courtNumber, teamNumber);
      }
    });
  }

  private performTeamBooking(slot: AvailableSlot, courtNumber: number, teamNumber: number): void {
    if (!this.currentUser?.firebaseUid) return;

    const bookingKey = `${slot.venueId}-${slot.date}-${slot.timeSlot}-${courtNumber}-${teamNumber}`;
    
    // Prevent multiple booking attempts for the same team
    if (this.bookingInProgress.has(bookingKey)) {
      return;
    }

    this.bookingLoading = true;
    this.bookingInProgress.add(bookingKey);

    const booking = {
      scheduleId: slot.scheduleId,
      userId: this.currentUser.firebaseUid,
      userName: this.currentUser.display_name || this.currentUser.email,
      bookingDate: slot.date,
      timeSlot: slot.timeSlot,
      gameDuration: slot.gameDuration,
      venueId: slot.venueId,
      courtNumber: courtNumber,
      teamNumber: teamNumber,
      status: 'confirmed' as const
    };

    this.courtScheduleService.createBooking(booking)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.bookingLoading = false;
          this.bookingInProgress.delete(bookingKey);
          
          if (response.success) {
            this.messageService.add({
              severity: 'success',
              summary: 'Success',
              detail: `Successfully booked slot on Team ${teamNumber}!`
            });
            this.loadAvailableSlots(); // Refresh available slots
            this.loadMyBookings(); // Refresh my bookings
          } else {
            this.errorMessage = response.message || 'Failed to book slot.';
          }
        },
        error: (error) => {
          this.bookingLoading = false;
          this.bookingInProgress.delete(bookingKey);
          console.error('Error booking team position:', error);
          
          // Check if it's a booking conflict error
          if (error.status === 409 && (error.error?.message?.includes('already have a confirmed booking') || error.error?.message?.includes('already booked on this day'))) {
            this.messageService.add({
              severity: 'warn',
              summary: 'Already Booked Today',
              detail: 'You already have a confirmed booking on this day.',
              life: 5000
            });
          } else if (error.error?.message?.includes('already full') || error.error?.message?.includes('already booked')) {
            this.messageService.add({
              severity: 'warn',
              summary: 'Position Unavailable',
              detail: error.error.message || 'This team position is no longer available.',
              life: 5000
            });
          } else if (error.error?.message?.includes('already booked for this court')) {
            this.messageService.add({
              severity: 'info',
              summary: 'Already Playing',
              detail: error.error.message || 'You are already playing on this court.',
              life: 5000
            });
          } else {
            this.errorHandlerService.handleApiError(error, 'Booking Slot');
          }
        }
      });
  }

}
