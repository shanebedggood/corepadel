import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';

// PrimeNG Modules
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { PaginatorModule } from 'primeng/paginator';
import { MessageModule } from 'primeng/message';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { BadgeModule } from 'primeng/badge';
import { TooltipModule } from 'primeng/tooltip';

// Services
import { FirebaseAuthService } from '../../../services/firebase-auth.service';
import { CourtScheduleService, CourtSchedule } from '../../../services/court-schedule.service';
import { VenueService, Venue } from '../../../services/venue.service';
import { MessageService, ConfirmationService } from 'primeng/api';
import { ErrorHandlerService } from '../../../services/error-handler.service';

// Components
import { PageHeaderComponent, BreadcrumbItem } from '../../../layout/component/page-header.component';

@Component({
  selector: 'app-court-schedules',
  standalone: true,
    imports: [
        CommonModule,
        RouterModule,
        ReactiveFormsModule,
        CardModule,
        ButtonModule,
        TableModule,
        PaginatorModule,
        MessageModule,
        ToastModule,
        ConfirmDialogModule,
        ProgressSpinnerModule,
        BadgeModule,
        TooltipModule,
        PageHeaderComponent
    ],
  providers: [ConfirmationService],
  templateUrl: './court-schedules.component.html',
  styleUrls: ['./court-schedules.component.scss']
})
export class CourtSchedulesComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  // Data
  courtSchedules: CourtSchedule[] = [];
  venues: Venue[] = [];
  loading = false;
  errorMessage = '';

  // Pagination
  first = 0;
  rows = 10;
  totalRecords = 0;

  // Breadcrumbs
  breadcrumbs: BreadcrumbItem[] = [
    { label: 'Admin', routerLink: '/admin' },
    { label: 'Court Schedules', routerLink: '/admin/court-schedules' }
  ];

  constructor(
    private authService: FirebaseAuthService,
    private courtScheduleService: CourtScheduleService,
    private venueService: VenueService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private errorHandlerService: ErrorHandlerService
  ) {}

  ngOnInit(): void {
    this.loadVenues();
    this.loadCourtSchedules();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadVenues(): void {
    this.venueService.getVenues()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (venues) => {
          this.venues = venues;
        },
        error: (error) => {
          console.error('Error loading venues:', error);
        }
      });
  }

  private loadCourtSchedules(): void {
    this.loading = true;
    this.errorMessage = '';

    this.courtScheduleService.getSchedules()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (schedules) => {
          this.courtSchedules = schedules;
          this.totalRecords = schedules.length;
          this.loading = false;
        },
        error: (error) => {
          console.error('Error loading court schedules:', error);
          this.errorHandlerService.handleApiError(error, 'Loading Court Schedules');
          this.loading = false;
        }
      });
  }


  refreshSchedules(): void {
    this.loadCourtSchedules();
  }

  navigateToCreate(): void {
    // Navigation will be handled by routerLink in template
  }

  formatDate(dateString: string): string {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString();
  }

  formatDaysOfWeek(scheduleDays: any[]): string {
    if (!scheduleDays || scheduleDays.length === 0) return '';
    
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const uniqueDays = [...new Set(scheduleDays.map(day => day.dayOfWeek))];
    const days = uniqueDays.map(dayOfWeek => dayNames[dayOfWeek]).join(', ');
    return days;
  }

  formatDaysWithCourts(scheduleDays: any[]): string[] {
    if (!scheduleDays || scheduleDays.length === 0) return [];
    
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    return scheduleDays.map(day => {
      const dayName = dayNames[day.dayOfWeek];
      const courtCount = day.courtCount || 1;
      return `${dayName} - ${courtCount} court${courtCount > 1 ? 's' : ''}`;
    });
  }

  getUniqueVenues(scheduleDays: any[]): string[] {
    if (!scheduleDays || scheduleDays.length === 0) return [];
    return [...new Set(scheduleDays.map(day => day.venueId))];
  }

  getUniqueTimeSlots(scheduleDays: any[]): any[] {
    if (!scheduleDays || scheduleDays.length === 0) return [];
    const uniqueSlots = new Map();
    scheduleDays.forEach(day => {
      const key = `${day.timeSlot}-${day.gameDuration}`;
      if (!uniqueSlots.has(key)) {
        uniqueSlots.set(key, { timeSlot: day.timeSlot, gameDuration: day.gameDuration });
      }
    });
    return Array.from(uniqueSlots.values());
  }

  getStatusBadge(status: string): "success" | "info" | "warn" | "secondary" | "contrast" | "danger" {
    // For now, all schedules are active
    return 'success';
  }

  getStatusLabel(status: string): string {
    // For now, all schedules are active
    return 'Active';
  }

  getVenueName(venueId: string): string {
    const venue = this.venues.find(v => v.id === venueId);
    return venue ? venue.name : venueId; // Fallback to ID if venue not found
  }

  deleteSchedule(schedule: CourtSchedule): void {
    this.confirmationService.confirm({
      message: `Are you sure you want to delete this court schedule? This action cannot be undone.`,
      header: 'Confirm Delete',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Delete',
      rejectLabel: 'Cancel',
      accept: () => {
        this.performDelete(schedule);
      }
    });
  }

  private performDelete(schedule: CourtSchedule): void {
    if (!schedule.id) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Cannot delete schedule: Invalid schedule ID'
      });
      return;
    }

    this.courtScheduleService.deleteSchedule(schedule.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          if (response.success) {
            this.messageService.add({
              severity: 'success',
              summary: 'Success',
              detail: 'Court schedule deleted successfully'
            });
            this.loadCourtSchedules(); // Refresh the list
          } else {
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: response.message || 'Failed to delete court schedule'
            });
          }
        },
        error: (error) => {
          console.error('Error deleting court schedule:', error);
          this.errorHandlerService.handleApiError(error, 'Deleting Court Schedule');
        }
      });
  }
}
