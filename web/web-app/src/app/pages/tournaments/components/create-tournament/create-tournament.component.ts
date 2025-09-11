import { CommonModule } from "@angular/common";
import { Component, OnInit, Injector, runInInjectionContext } from "@angular/core";
import { Router } from "@angular/router";
import { ButtonModule } from 'primeng/button';
import { TournamentService } from '../../../../services/tournament.service';
import { TournamentConfigService } from '../../../../services/tournament-config.service';
import { VenueService, Venue } from '../../../../services/venue.service';
import { FirebaseAuthService } from '../../../../services/firebase-auth.service';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from "@angular/forms";
import { take } from 'rxjs/operators';
import { combineLatest, catchError, of, map, switchMap, Observable } from 'rxjs';
import { InputTextModule } from 'primeng/inputtext';
import { InputGroupModule } from 'primeng/inputgroup';
import { InputGroupAddonModule } from 'primeng/inputgroupaddon';
import { TextareaModule } from 'primeng/textarea';
import { DatePickerModule } from 'primeng/datepicker';
import { SelectModule } from "primeng/select";
import { InputNumberModule } from "primeng/inputnumber";
import { AutoFocusModule } from 'primeng/autofocus';
import { BadgeModule } from 'primeng/badge';
import { MessageModule } from 'primeng/message';
import { ErrorHandlerService } from '../../../../services/error-handler.service';
import { BreadcrumbItem, PageHeaderComponent } from "../../../../layout/component/page-header.component";


// Define interfaces locally to work around TournamentService formatting issues
export interface TournamentFormat {
    id: string;
    name: string;
    description: string;
    isActive: boolean;
}

export interface TournamentConfig {
    formats: TournamentFormat[];
    statuses: TournamentStatus[];
    categories: TournamentCategory[];
    registrationTypes: TournamentRegistrationType[];
    venueTypes: TournamentVenueType[];
    lastUpdated: Date;
}

export interface RoundRobinConfig {
    progressionTypes: TournamentProgressionOption[];
    groupAdvancementSettings: {
        advancementModels: any[];
        eliminationBracketSize: Array<{
            id: string;
            name: string;
            description: string;
            teams: number;
            isActive: boolean;
        }>;
    };
    combinedAdvancementSettings: {
        numOfTeamsToAdvanceOverall: any[];
        eliminationBracketSize: Array<{
            id: string;
            name: string;
            description: string;
            teams: number;
            isActive: boolean;
        }>;
    };
    lastUpdated: Date;
}

export interface TournamentCategory {
    id: string;
    name: string;
    description: string;
    isActive: boolean;
}

export interface TournamentStatus {
    id: string;
    name: string;
    description: string;
    color: string;
    textColor: string;
    isActive: boolean;
    order: number;
}

export interface TournamentRegistrationType {
    id: string;
    name: string;
    description: string;
    isActive: boolean;
}

export interface TournamentVenueType {
    id: string;
    name: string;
    description: string;
    isActive: boolean;
}

export interface TournamentProgressionOption {
    id: string;
    name: string;
    description: string;
    isActive: boolean;
}

@Component({
    selector: 'app-create-tournament',
    standalone: true,
    imports: [
        CommonModule,
        ButtonModule,
        ReactiveFormsModule,
        InputTextModule,
        InputGroupModule,
        InputNumberModule,
        InputGroupAddonModule,
        TextareaModule,
        DatePickerModule,
        SelectModule,
        AutoFocusModule,
        BadgeModule,
        MessageModule,
        PageHeaderComponent
    ],
    templateUrl: './create-tournament.component.html',
    styles: []
})
export class CreateTournamentComponent implements OnInit {
    activeStep: number = 0;
    groupOptions: number[] = [2, 3, 4, 5, 6, 7, 8];
    teamsToAdvanceOptions: number[] = [1, 2, 4, 8];
    saving: boolean = false;
    loading: boolean = false;
    tournamentForm: FormGroup;
    errorMessage: string = '';
    successMessage: string = '';

    // Add showIcon property for date fields
    showIcon: boolean = true;

    // Currency for display
    currencySymbol: string = 'R'; // Default to South African Rand

    // Tournament configuration from Firebase
    tournamentConfig: TournamentConfig | null = null;
    roundRobinConfig: RoundRobinConfig | null = null;

    // Flag to track when form is being populated to prevent unwanted value clearing
    private isPopulatingForm: boolean = false;

    formats: TournamentFormat[] = [];
    statuses: TournamentStatus[] = [];
    categories: TournamentCategory[] = [];
    registrationTypes: TournamentRegistrationType[] = [];
    venueTypes: TournamentVenueType[] = [];
    progressionTypes: TournamentProgressionOption[] = [];
    venues: Venue[] = [];
    adminClubs: any[] = []; // Clubs where user is admin

    // Group advancement settings
    advancementModels: any[] = [];
    eliminationBracketSizes: any[] = [];
    teamsToAdvance: any[] = [];
    combinedEliminationBracketSizes: any[] = [];

    // Page header configuration
    breadcrumbs: BreadcrumbItem[] = [
        { label: 'Tournaments', route: '/admin/tournaments', icon: 'pi pi-trophy' },
        { label: 'Create New' }
    ];

    constructor(
        private tournamentService: TournamentService,
        private tournamentConfigService: TournamentConfigService,
        private venueService: VenueService,
        private authService: FirebaseAuthService,
        private fb: FormBuilder,
        private router: Router,
        private injector: Injector,
        private errorHandlerService: ErrorHandlerService
    ) {
        this.tournamentForm = this.fb.group({
            name: ['', Validators.required],
            description: ['', Validators.required],
            startDate: [null, Validators.required],
            endDate: [null, Validators.required],
            registrationStartDate: [null, Validators.required],
            registrationEndDate: [null, Validators.required],
            format: [null, Validators.required],
            category: [null, Validators.required],
            registrationType: [null, Validators.required],
            venueType: [null, Validators.required],
            venue: [null, Validators.required],
            club: [null, Validators.required], // Club selection - required
            accessType: ['open', Validators.required], // Tournament access type - default to open
            progressionOption: [null], // Will be conditionally required
            teamsToAdvance: [null], // Will be conditionally required for combined elimination
            eliminationBracketSize: [null], // Will be conditionally required
            maxParticipants: [null, [Validators.required, Validators.min(2), this.evenNumberValidator()]],
            noOfGroups: [null, [Validators.required]],
            teamsToAdvancePerGroup: [null, [Validators.required]],
            entryFee: [null, [Validators.required, Validators.min(0)]]
        });

        // Watch for venue type changes to update venue field validation
        this.tournamentForm.get('venueType')?.valueChanges.subscribe(venueTypeId => {
            const venueControl = this.tournamentForm.get('venue');
            const venueType = this.venueTypes.find(vt => vt.id === venueTypeId);
            if (venueType?.name === 'Single Venue') {
                venueControl?.setValidators(Validators.required);
            } else {
                venueControl?.clearValidators();
                // Only clear venue selection if not currently populating the form
                if (!this.isPopulatingForm) {
                    venueControl?.setValue(null); // Clear the venue selection
                }
            }
            venueControl?.updateValueAndValidity();
        });

        // Watch for changes in maxParticipants and noOfGroups to validate group configuration
        this.tournamentForm.get('maxParticipants')?.valueChanges.subscribe(() => {
            this.validateGroupConfiguration();
        });
        this.tournamentForm.get('noOfGroups')?.valueChanges.subscribe(() => {
            this.validateGroupConfiguration();
        });

        // Watch for format changes to load round-robin config when needed
        this.tournamentForm.get('format')?.valueChanges.subscribe(format => {
            this.loadRoundRobinConfigIfNeeded(format);
            this.updateRoundRobinValidation(format);
        });

        // Watch for progression option changes to show/hide group advancement settings
        this.tournamentForm.get('progressionOption')?.valueChanges.subscribe(progressionOption => {
            this.updateGroupAdvancementValidation(progressionOption);
        });
    }

    /**
     * Load admin clubs for the current user
     */
    private loadAdminClubs(): Observable<any[]> {
        return this.authService.currentUser$.pipe(
            switchMap(user => {
                if (user) {
                    return this.authService.getCachedUserAuthData(user.uid).pipe(
                        map((cachedData: any) => {
                            const adminClubs = cachedData.club_memberships?.filter((membership: any) => membership.is_admin) || [];
                            if (adminClubs.length === 0) {
                                throw new Error('You must be an admin of at least one club to create tournaments.');
                            }
                            return adminClubs;
                        })
                    );
                } else {
                    throw new Error('User not authenticated');
                }
            }),
            catchError(error => {
                console.error('Error loading admin clubs:', error);
                this.errorMessage = error.message || 'Failed to load your club information.';
                return of([]);
            })
        );
    }

    ngOnInit(): void {
        // Load all data in a single Observable chain within injection context
        runInInjectionContext(this.injector, () => {
            this.loading = true;
            // Load tournament config, venues, and admin clubs in parallel
            const configObs = this.tournamentConfigService.getTournamentConfig();
            const venuesObs = this.venueService.getVenues();
            const adminClubsObs = this.loadAdminClubs();

            combineLatest({ config: configObs, venues: venuesObs, adminClubs: adminClubsObs }).pipe(
                map(({ config, venues, adminClubs }) => {
                    // Set the data in the component
                    this.tournamentConfig = config as TournamentConfig;
                    const configData = config as TournamentConfig;
                    this.formats = configData.formats.filter((f: TournamentFormat) => f.isActive).sort((a: TournamentFormat, b: TournamentFormat) => a.name.localeCompare(b.name));
                    this.statuses = configData.statuses.filter((status: TournamentStatus) => status.isActive).sort((a: TournamentStatus, b: TournamentStatus) => a.order - b.order);
                    this.categories = configData.categories.filter((c: TournamentCategory) => c.isActive).sort((a: TournamentCategory, b: TournamentCategory) => a.name.localeCompare(b.name));
                    this.venueTypes = configData.venueTypes.filter((l: TournamentVenueType) => l.isActive).sort((a: TournamentVenueType, b: TournamentVenueType) => a.name.localeCompare(b.name));
                    this.registrationTypes = configData.registrationTypes.filter((r: TournamentRegistrationType) => r.isActive).sort((a: TournamentRegistrationType, b: TournamentRegistrationType) => a.name.localeCompare(b.name));
                    this.progressionTypes = []; // Initialize as empty - will be loaded conditionally
                    this.venues = venues.sort((a: Venue, b: Venue) => a.name.localeCompare(b.name));
                    this.adminClubs = (adminClubs as any[]).sort((a: any, b: any) => a.club_name.localeCompare(b.club_name));
                    
                    this.loading = false;
                    return true;
                }),
                catchError(error => {
                    console.error('Error in data loading chain: ', error);
                    this.loading = false;
                    this.errorMessage = 'Failed to load required data. Please try again or contact support.';
                    return of(false);
                })
            ).subscribe();
        });
    }

    saveTournament(): void {
        if (this.tournamentForm.valid) {
            this.saving = true;
            this.errorMessage = '';
            this.successMessage = '';

            const formValue = this.tournamentForm.value;
            // Ensure numeric values are properly converted
            // Convert dates to date-only strings to avoid timezone issues
            const processedFormValue = {
                ...formValue,
                maxParticipants: formValue.maxParticipants ? Number(formValue.maxParticipants) : null,
                noOfGroups: formValue.noOfGroups ? Number(formValue.noOfGroups) : null,
                entryFee: formValue.entryFee ? Number(formValue.entryFee) : null,
                startDate: formValue.startDate ? this.formatDateOnly(formValue.startDate) : null,
                endDate: formValue.endDate ? this.formatDateOnly(formValue.endDate) : null,
                registrationStartDate: formValue.registrationStartDate ? this.formatDateOnly(formValue.registrationStartDate) : null,
                registrationEndDate: formValue.registrationEndDate ? this.formatDateOnly(formValue.registrationEndDate) : null
            };

            // Use Firebase function to validate tournament and calculate status
            (this.tournamentService as any).validateTournamentConfig(processedFormValue).subscribe({
                next: (validationResult: any) => {
                    if (validationResult.isValid) {
                        // Get current user
                        const currentUser = this.authService.getCurrentUser();
                        if (!currentUser) {
                            this.saving = false;
                            this.errorMessage = 'No user found';
                            return;
                        }

                        // Find the selected venue object
                        const selectedVenue = this.venues.find(v => v.id === processedFormValue.venue);

                        // Get the status object or default to draft
                        const status = validationResult.calculatedStatus || this.statuses.find(s => s.id === 'draft');





                        // Find the selected objects by ID
                        const format = this.formats.find(f => f.id === processedFormValue.format);
                        const category = this.categories.find(c => c.id === processedFormValue.category);
                        const registrationType = this.registrationTypes.find(r => r.id === processedFormValue.registrationType);
                        const venueType = this.venueTypes.find(vt => vt.id === processedFormValue.venueType);
                        const progressionOption = processedFormValue.progressionOption ? this.progressionTypes.find(p => p.id === processedFormValue.progressionOption) : null;



                        // Get the selected club from the form
                        const selectedClub = this.adminClubs.find(club => club.club_id === processedFormValue.club);
                        
                        if (!selectedClub) {
                            this.errorMessage = 'Please select a club for the tournament.';
                            this.saving = false;
                            return;
                        }

                        const tournamentData = {
                            ...processedFormValue,
                            tournamentType: 'ROUND_ROBIN', // Specify the tournament type
                            format: format ? { id: format.id, name: format.name } : null,
                            category: category ? { id: category.id, name: category.name } : null,
                            registrationType: registrationType ? { id: registrationType.id, name: registrationType.name } : null,
                            venueType: venueType ? { id: venueType.id, name: venueType.name } : null,
                            progressionOption: progressionOption ? { id: progressionOption.id, name: progressionOption.name } : null,
                            clubId: selectedClub.club_id, // Use the selected club ID
                            firebaseUid: currentUser.uid,
                            status: status ? { id: status.id, name: status.name } : null,
                        };

                        // Only add venue data if a venue is selected
                        if (processedFormValue.venue && selectedVenue) {
                            tournamentData.venueId = processedFormValue.venue;
                            tournamentData.venue = selectedVenue;
                        }

                        (this.tournamentService as any).createTournament(tournamentData).subscribe({
                            next: (response: any) => {
                                this.saving = false;
                                this.successMessage = 'Tournament created successfully!';
                                this.errorMessage = '';
                                
                                // Show success message
                                this.errorHandlerService.handleSuccess('Tournament created successfully!');
                                
                                // Navigate to tournaments list after a short delay
                                setTimeout(() => {
                                    this.router.navigate(['/admin/tournaments']);
                                }, 1500);
                            },
                            error: (error: any) => {
                                this.saving = false;
                                console.error('Error creating tournament:', error);
                                this.errorMessage = error.error?.message || 'Failed to create tournament. Please try again.';
                                this.successMessage = '';
                                
                                // Show error message
                                this.errorHandlerService.handleApiError(error, 'Tournament Creation');
                            }
                        });
                    } else {
                        this.saving = false;
                        this.errorMessage = validationResult.errors && Array.isArray(validationResult.errors) ? validationResult.errors.join(', ') : 'Validation failed';
                        // Show warnings if any (keep these as toasts since they're informational)
                        if (validationResult.warnings && Array.isArray(validationResult.warnings) && validationResult.warnings.length > 0) {
                            this.errorHandlerService.handleWarning(validationResult.warnings.join(', '));
                        }
                    }
                },
                error: (error: any) => {
                    this.saving = false;
                    this.errorMessage = error.message || 'Failed to validate tournament';
                }
            });
        } else {
            this.errorMessage = 'Please fill in all required fields correctly';
        }
    }

    resetForm(): void {
        this.tournamentForm.reset();
        this.errorMessage = '';
        this.successMessage = '';
    }

    cancel(): void {
        this.router.navigate(['/admin/tournaments']);
    }

    retryLoading(): void {
        this.errorMessage = '';
        this.ngOnInit();
    }


    /**
     * Load round-robin configuration if the format is round-robin
     */
    loadRoundRobinConfigIfNeeded(formatId: string | null): void {
        const progressionControl = this.tournamentForm.get('progressionOption');

        if (!formatId) return;
        
        const selectedFormat = this.formats.find(f => f.id === formatId);
        if (selectedFormat?.name === 'Round Robin') {
            this.tournamentConfigService.getRoundRobinConfig().subscribe({
                next: (roundRobinConfig: any) => {
                    this.roundRobinConfig = roundRobinConfig;
                    this.progressionTypes = roundRobinConfig.progressionTypes?.filter((p: TournamentProgressionOption) => p.isActive)
                        .sort((a: TournamentProgressionOption, b: TournamentProgressionOption) => a.name.localeCompare(b.name)) || [];

                    // Load group advancement settings
                    this.advancementModels = roundRobinConfig.groupAdvancementSettings?.advancementModels?.filter((m: any) => m.isActive)
                        .sort((a: any, b: any) => a.name.localeCompare(b.name)) || [];
                    this.eliminationBracketSizes = roundRobinConfig.groupAdvancementSettings?.eliminationBracketSize?.filter((e: any) => e.isActive)
                        .sort((a: any, b: any) => a.name.localeCompare(b.name)) || [];

                    // Load combined advancement settings
                    this.teamsToAdvance = roundRobinConfig.combinedAdvancementSettings?.numOfTeamsToAdvanceOverall?.filter((t: any) => t.isActive)
                        .sort((a: any, b: any) => a.name.localeCompare(b.name)) || [];
                    this.combinedEliminationBracketSizes = roundRobinConfig.combinedAdvancementSettings?.eliminationBracketSize?.filter((e: any) => e.isActive)
                        .sort((a: any, b: any) => a.name.localeCompare(b.name)) || [];

                    // Make progression option required for round-robin formats
                    progressionControl?.setValidators(Validators.required);
                    progressionControl?.updateValueAndValidity();
                },
                error: (error: any) => {
                    console.error('Error loading round-robin config:', error);
                    this.progressionTypes = [];
                    progressionControl?.clearValidators();
                    progressionControl?.updateValueAndValidity();
                }
            });
        } else {
            // Clear round-robin config and progression types for non-round-robin formats
            this.roundRobinConfig = null;
            this.progressionTypes = [];
            // Remove required validation for non-round-robin formats
            progressionControl?.clearValidators();
            progressionControl?.setValue(null);
            progressionControl?.updateValueAndValidity();
        }
    }

    /**
     * Check if the selected format is a round-robin format
     */
    isRoundRobinFormat(): boolean {
        const selectedFormatId = this.tournamentForm.get('format')?.value;
        if (!selectedFormatId) return false;
        
        const selectedFormat = this.formats.find(f => f.id === selectedFormatId);
        return selectedFormat?.name === 'Round Robin';
    }

    /**
     * Check if the selected progression option is group-based elimination
     */
    isGroupBasedElimination(): boolean {
        const selectedProgression = this.tournamentForm.get('progressionOption')?.value;
        return selectedProgression === 'group-based';
    }

    /**
     * Check if the selected progression option is combined elimination
     */
    isCombinedElimination(): boolean {
        const selectedProgression = this.tournamentForm.get('progressionOption')?.value;
        return selectedProgression === 'combined';
    }

    /**
     * Update validation for group advancement settings based on progression option
     */
    updateGroupAdvancementValidation(progressionOption: any): void {
        const eliminationBracketSizeControl = this.tournamentForm.get('eliminationBracketSize');
        const teamsToAdvanceControl = this.tournamentForm.get('teamsToAdvance');

        if (progressionOption === 'group-based') {
            // Make fields required for group-based elimination
            eliminationBracketSizeControl?.setValidators(Validators.required);
            teamsToAdvanceControl?.clearValidators();
        } else if (progressionOption === 'combined') {
            // Make fields required for combined elimination
            teamsToAdvanceControl?.setValidators(Validators.required);
            eliminationBracketSizeControl?.setValidators(Validators.required);
        } else {
            // Clear validation for other progression types but don't clear the values
            eliminationBracketSizeControl?.clearValidators();
            teamsToAdvanceControl?.clearValidators();
        }

        eliminationBracketSizeControl?.updateValueAndValidity();
        teamsToAdvanceControl?.updateValueAndValidity();
    }

    /**
     * Validate that the group configuration makes sense
     * Teams per group = maxParticipants / 2 / noOfGroups
     */
    private validateGroupConfiguration(): void {
        const maxParticipants = this.tournamentForm.get('maxParticipants')?.value;
        const noOfGroups = this.tournamentForm.get('noOfGroups')?.value;

        if (maxParticipants && noOfGroups) {
            const teamsPerGroup = Math.floor(maxParticipants / 2 / noOfGroups);
            if (teamsPerGroup < 1) {
                this.tournamentForm.get('noOfGroups')?.setErrors({
                    invalidGroupConfig: {
                        message: `With ${maxParticipants} participants and ${noOfGroups} groups, each group would have less than 1 team. Please reduce the number of groups or increase participants.`
                    }
                });
            } else {
                this.tournamentForm.get('noOfGroups')?.setErrors(null);
            }
        }
    }

    /**
     * Calculate teams per group for display
     */
    getTeamsPerGroup(): number {
        const maxParticipants = this.tournamentForm.get('maxParticipants')?.value;
        const noOfGroups = this.tournamentForm.get('noOfGroups')?.value;

        if (maxParticipants && noOfGroups) {
            return Math.floor(maxParticipants / 2 / noOfGroups);
        }
        return 0;
    }

    /**
     * Calculate teams to advance per group based on bracket size
     */
    getTeamsToAdvancePerGroup(): number {
        const maxParticipants = this.tournamentForm.get('maxParticipants')?.value;
        const noOfGroups = this.tournamentForm.get('noOfGroups')?.value;

        if (!maxParticipants || !noOfGroups) {
            return 0;
        }

        // Calculate teams per group for the round-robin phase
        const teamsPerGroup = Math.floor(maxParticipants / 2 / noOfGroups);
        return teamsPerGroup;
    }

    getTeamsAdvancingToElimination(): number {
        const eliminationBracketSize = this.tournamentForm.get('eliminationBracketSize')?.value;
        if (!eliminationBracketSize || !this.roundRobinConfig) {
            return 0;
        }

        // Find the bracket size configuration from the round-robin config
        const bracketConfig = this.roundRobinConfig.groupAdvancementSettings.eliminationBracketSize.find(
            (bracket: any) => bracket.id === eliminationBracketSize
        );

        if (!bracketConfig) {
            return 0;
        }

        return bracketConfig.teams;
    }

    getTeamsAdvancingPerGroup(): number {
        const teamsToAdvance = this.tournamentForm.get('teamsToAdvance')?.value;
        if (!teamsToAdvance) {
            return 0;
        }
        
        const teamsToAdvanceConfig = this.teamsToAdvance.find(t => t.id === teamsToAdvance);
        return teamsToAdvanceConfig?.teams || 0;
    }

    getTotalTeamsAdvancingToElimination(): number {
        const noOfGroups = this.tournamentForm.get('noOfGroups')?.value;
        const teamsAdvancingPerGroup = this.getTeamsAdvancingPerGroup();

        if (!noOfGroups || !teamsAdvancingPerGroup) {
            return 0;
        }

        return noOfGroups * teamsAdvancingPerGroup;
    }

    getTeamsAdvancingToPlate(): number {
        const maxParticipants = this.tournamentForm.get('maxParticipants')?.value;
        const noOfGroups = this.tournamentForm.get('noOfGroups')?.value;
        const eliminationBracketSize = this.tournamentForm.get('eliminationBracketSize')?.value;

        if (!maxParticipants || !noOfGroups || !eliminationBracketSize || !this.roundRobinConfig) {
            return 0;
        }

        // Calculate total teams in the tournament
        const totalTeams = Math.floor(maxParticipants / 2);

        // Find the bracket size configuration from the round-robin config
        const bracketConfig = this.roundRobinConfig.groupAdvancementSettings.eliminationBracketSize.find(
            (bracket: any) => bracket.id === eliminationBracketSize
        );

        if (!bracketConfig) {
            return 0;
        }

        // For trophy/plate model:
        // - bracketConfig.teams represents teams advancing to trophy
        // - remaining teams go to plate
        const teamsAdvancingToTrophy = bracketConfig.teams;
        const teamsAdvancingToPlate = totalTeams - teamsAdvancingToTrophy;

        return teamsAdvancingToPlate;
    }



    /**
     * Custom validator to ensure maxParticipants is even (for teams of 2)
     */
    private evenNumberValidator() {
        return (control: any) => {
            const value = control.value;
            if (value && value % 2 !== 0) {
                return {
                    oddNumber: {
                        message: 'Max participants must be an even number for teams of 2'
                    }
                };
            }
            return null;
        };
    }

    /**
     * Find the matching venue object from the venues array
     */
    private findMatchingVenue(tournamentVenue: Venue | undefined): Venue | null {
        if (!tournamentVenue || !tournamentVenue.id) {
            return null;
        }

        // Find venue by ID
        const matchingVenue = this.venues.find(venue => venue.id === tournamentVenue.id);
        return matchingVenue || null;
    }

    shouldShowVenueSelection(): boolean {
        const venueTypeId = this.tournamentForm.get('venueType')?.value;
        if (!venueTypeId) return false;
        
        // Find the venue type object by ID
        const venueType = this.venueTypes.find(vt => vt.id === venueTypeId);
        return venueType?.name === 'Single Venue';
    }

    private updateRoundRobinValidation(format: string): void {
        const noOfGroupsControl = this.tournamentForm.get('noOfGroups');
        const teamsToAdvancePerGroupControl = this.tournamentForm.get('teamsToAdvancePerGroup');
        
        if (this.isRoundRobinFormat()) {
            noOfGroupsControl?.setValidators([Validators.required]);
            teamsToAdvancePerGroupControl?.setValidators([Validators.required]);
        } else {
            noOfGroupsControl?.clearValidators();
            teamsToAdvancePerGroupControl?.clearValidators();
            noOfGroupsControl?.setValue(null);
            teamsToAdvancePerGroupControl?.setValue(null);
        }
        
        noOfGroupsControl?.updateValueAndValidity();
        teamsToAdvancePerGroupControl?.updateValueAndValidity();
    }

    /**
     * Format a Date object to YYYY-MM-DD string to avoid timezone issues
     */
    private formatDateOnly(date: Date): string {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }
}
