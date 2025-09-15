import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, FormArray, ReactiveFormsModule, Validators } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { SelectModule } from 'primeng/select';
import { InputTextModule } from 'primeng/inputtext';
import { DatePickerModule } from 'primeng/datepicker';
import { CheckboxModule } from 'primeng/checkbox';
import { MessageModule } from 'primeng/message';
import { MessageService } from 'primeng/api';
import { PageHeaderComponent } from '../../../layout/component/page-header.component';
import { FirebaseAuthService } from '../../../services/firebase-auth.service';
import { VenueService, Venue } from '../../../services/venue.service';
import { CourtScheduleService, CourtSchedule, CourtScheduleDay } from '../../../services/court-schedule.service';
import { ErrorHandlerService } from '../../../services/error-handler.service';


@Component({
    selector: 'app-schedule-courts',
    standalone: true,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        ButtonModule,
        CardModule,
        SelectModule,
        InputTextModule,
        DatePickerModule,
        CheckboxModule,
        MessageModule,
        PageHeaderComponent
    ],
    templateUrl: './schedule-courts.component.html',
    styleUrls: ['./schedule-courts.component.scss']
})
export class ScheduleCourtsComponent implements OnInit, OnDestroy {
    private destroy$ = new Subject<void>();
    
    scheduleForm: FormGroup;
    availableVenues: Venue[] = [];
    loading = false;
    saving = false;
    errorMessage = '';
    successMessage = '';
    isEditMode = false;
    scheduleId: string | null = null;
    
    // Days of the week options
    daysOfWeek = [
        { label: 'Monday', value: 1 },
        { label: 'Tuesday', value: 2 },
        { label: 'Wednesday', value: 3 },
        { label: 'Thursday', value: 4 },
        { label: 'Friday', value: 5 },
        { label: 'Saturday', value: 6 },
        { label: 'Sunday', value: 0 }
    ];
    
    // Time slots (every 30 minutes from 5 AM to 10 PM)
    timeSlots = this.generateTimeSlots();
    
    // Page header configuration
    breadcrumbs = [
        { label: 'Admin', routerLink: '/admin' },
        { label: 'Court Schedules', routerLink: '/admin/court-schedules' },
        { label: 'Create Schedule' }
    ];

    // Date properties for template
    today = new Date();

    constructor(
        private fb: FormBuilder,
        private router: Router,
        private route: ActivatedRoute,
        private authService: FirebaseAuthService,
        private venueService: VenueService,
        private courtScheduleService: CourtScheduleService,
        private messageService: MessageService,
        private errorHandlerService: ErrorHandlerService
    ) {
        this.scheduleForm = this.createForm();
    }

    ngOnInit(): void {
        this.loadAvailableVenues();
        // If editing, load existing schedule
        const id = this.route.snapshot.paramMap.get('id');
        if (id) {
            this.isEditMode = true;
            this.scheduleId = id;
            this.breadcrumbs[2].label = 'Edit Schedule';
            this.loadSchedule(id);
        }
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }

    private createForm(): FormGroup {
        return this.fb.group({
            venueId: ['', Validators.required],
            startDate: [null, Validators.required],
            endDate: [null, Validators.required],
            scheduleDays: this.fb.array([])
        });
    }

    private generateTimeSlots(): { label: string; value: string }[] {
        const slots = [];
        for (let hour = 5; hour <= 22; hour++) {
            for (let minute = 0; minute < 60; minute += 30) {
                const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
                const displayTime = this.formatTimeDisplay(hour, minute);
                slots.push({ label: displayTime, value: timeString });
            }
        }
        return slots;
    }

    private formatTimeDisplay(hour: number, minute: number): string {
        const period = hour >= 12 ? 'PM' : 'AM';
        const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
        return `${displayHour}:${minute.toString().padStart(2, '0')} ${period}`;
    }

    private formatDateForBackend(date: Date | null): string {
        if (!date) {
            throw new Error('Date is required');
        }
        // Format as YYYY-MM-DD for backend
        return date.toISOString().split('T')[0];
    }

    private loadAvailableVenues(): void {
        this.loading = true;
        this.venueService.getVenues()
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (venues: Venue[]) => {
                    this.availableVenues = venues.sort((a: Venue, b: Venue) => a.name.localeCompare(b.name));
                    this.loading = false;
                },
                error: (error: any) => {
                    console.error('Error loading venues:', error);
                    this.errorHandlerService.handleApiError(error, 'Loading Venues');
                    this.loading = false;
                }
            });
    }

    private loadSchedule(id: string): void {
        this.loading = true;
        this.courtScheduleService.getSchedule(id)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (schedule) => {
                    // Populate form
                    this.scheduleForm.patchValue({
                        venueId: schedule.scheduleDays[0]?.venueId || '', // Get venue from first day
                        startDate: new Date(schedule.startDate),
                        endDate: new Date(schedule.endDate)
                    });
                    // Clear and repopulate existing FormArray to keep types consistent
                    const daysArray = this.scheduleDaysArray;
                    daysArray.clear();
                    for (const d of schedule.scheduleDays) {
                        const normalizedTime = (d.timeSlot && d.timeSlot.length >= 5)
                            ? d.timeSlot.substring(0,5)
                            : d.timeSlot;
                        const dayName = this.daysOfWeek.find(day => day.value === d.dayOfWeek)?.label || '';
                        const group = this.fb.group({
                            dayOfWeek: [d.dayOfWeek, Validators.required],
                            dayName: [dayName],
                            timeSlot: [normalizedTime, Validators.required],
                            gameDuration: [d.gameDuration, Validators.required]
                        });
                        daysArray.push(group);
                    }
                    this.saving = false;
                    this.loading = false;
                },
                error: (error) => {
                    this.loading = false;
                    console.error('Error loading schedule:', error);
                    this.errorHandlerService.handleApiError(error, 'Loading Court Schedule');
                }
            });
    }


    get scheduleDaysArray(): FormArray {
        return this.scheduleForm.get('scheduleDays') as FormArray;
    }

    onDaySelectionChange(dayValue: number, event: Event): void {
        const target = event.target as HTMLInputElement;
        const isChecked = target.checked;
        if (isChecked) {
            this.addScheduleDay(dayValue);
        } else {
            this.removeScheduleDay(dayValue);
        }
    }

    private addScheduleDay(dayValue: number): void {
        const dayName = this.daysOfWeek.find(d => d.value === dayValue)?.label || '';
        const dayFormGroup = this.fb.group({
            dayOfWeek: [dayValue, Validators.required],
            dayName: [dayName],
            timeSlot: ['', Validators.required],
            gameDuration: [60, Validators.required]
        });
        
        this.scheduleDaysArray.push(dayFormGroup);
    }

    private removeScheduleDay(dayValue: number): void {
        const index = this.scheduleDaysArray.controls.findIndex(
            control => control.get('dayOfWeek')?.value === dayValue
        );
        if (index !== -1) {
            this.scheduleDaysArray.removeAt(index);
        }
    }

    removeScheduleDayByIndex(index: number): void {
        if (index >= 0 && index < this.scheduleDaysArray.length) {
            this.scheduleDaysArray.removeAt(index);
        }
    }

    isDaySelected(dayValue: number): boolean {
        return this.scheduleDaysArray.controls.some(
            control => control.get('dayOfWeek')?.value === dayValue
        );
    }

    getSelectedDays(): number[] {
        return this.scheduleDaysArray.controls.map(
            control => control.get('dayOfWeek')?.value
        );
    }

    onSubmit(): void {
        if (this.scheduleForm.valid) {
            this.saving = true;
            this.errorMessage = '';
            this.successMessage = '';

            const formValue = this.scheduleForm.value;
            
            // Get the selected venue
            const selectedVenue = this.availableVenues.find(venue => venue.id === formValue.venueId);
            
            if (!selectedVenue) {
                this.errorMessage = 'Please select a venue for the schedule.';
                this.saving = false;
                return;
            }

            const schedule: CourtSchedule = {
                clubId: selectedVenue.id || '', // Using venue ID as club ID for now
                startDate: this.formatDateForBackend(formValue.startDate),
                endDate: this.formatDateForBackend(formValue.endDate),
                scheduleDays: formValue.scheduleDays.map((day: any) => ({
                    dayOfWeek: day.dayOfWeek,
                    venueId: formValue.venueId, // Use the schedule-level venue ID
                    timeSlot: day.timeSlot,
                    gameDuration: day.gameDuration
                }))
            };

            console.log('Sending schedule data:', schedule);

            const operation = this.isEditMode 
                ? this.courtScheduleService.updateSchedule(this.scheduleId!, schedule)
                : this.courtScheduleService.createSchedule(schedule);

            operation
                .pipe(takeUntil(this.destroy$))
                .subscribe({
                        next: (response) => {
                            this.saving = false;
                            if (response.success) {
                                const action = this.isEditMode ? 'updated' : 'created';
                                this.messageService.add({
                                    severity: 'success',
                                    summary: 'Success',
                                    detail: `Court schedule has been ${action} successfully. Players can now book courts.`
                                });
                                // Navigate back to court schedules list immediately
                                this.router.navigate(['/admin/court-schedules']);
                            } else {
                                const action = this.isEditMode ? 'update' : 'create';
                                this.errorMessage = response.message || `Failed to ${action} court schedule.`;
                            }
                        },
                    error: (error) => {
                        this.saving = false;
                        const action = this.isEditMode ? 'updating' : 'creating';
                        console.error(`Error ${action} court schedule:`, error);
                        this.errorHandlerService.handleApiError(error, `${action.charAt(0).toUpperCase() + action.slice(1)} Court Schedule`);
                    }
                });
        } else {
            this.markFormGroupTouched(this.scheduleForm);
            this.errorMessage = 'Please fill in all required fields correctly.';
        }
    }

    private markFormGroupTouched(formGroup: FormGroup): void {
        Object.keys(formGroup.controls).forEach(key => {
            const control = formGroup.get(key);
            control?.markAsTouched();

            if (control instanceof FormGroup) {
                this.markFormGroupTouched(control);
            } else if (control instanceof FormArray) {
                control.controls.forEach(arrayControl => {
                    if (arrayControl instanceof FormGroup) {
                        this.markFormGroupTouched(arrayControl);
                    } else {
                        arrayControl.markAsTouched();
                    }
                });
            }
        });
    }

    private resetForm(): void {
        this.scheduleForm.reset();
        this.scheduleDaysArray.clear();
        this.errorMessage = '';
        this.successMessage = '';
    }

    onCancel(): void {
        this.router.navigate(['/admin/court-schedules']);
    }
}
