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
import { combineLatest, catchError, of, map, switchMap } from 'rxjs';
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
import { MessageService } from 'primeng/api';
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

    // Group advancement settings
    advancementModels: any[] = [];
    eliminationBracketSizes: any[] = [];

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
        private messageService: MessageService
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
            progressionOption: [null], // Will be conditionally required
            advancementModel: [null], // Will be conditionally required
            eliminationBracketSize: [null], // Will be conditionally required
            maxParticipants: [null, [Validators.required, Validators.min(2), this.evenNumberValidator()]],
            noOfGroups: [null, [Validators.required, Validators.min(1)]],
            entryFee: [null, [Validators.required, Validators.min(0)]]
        });

        // Watch for venue type changes to update venue field validation
        this.tournamentForm.get('venueType')?.valueChanges.subscribe(venueType => {
            const venueControl = this.tournamentForm.get('venue');
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
        });

        // Watch for progression option changes to show/hide group advancement settings
        this.tournamentForm.get('progressionOption')?.valueChanges.subscribe(progressionOption => {
            this.updateGroupAdvancementValidation(progressionOption);
        });
    }

    ngOnInit(): void {
        // Load all data in a single Observable chain within injection context
        runInInjectionContext(this.injector, () => {
            this.loading = true;
            // Load tournament config and venues in parallel
            const configObs = this.tournamentConfigService.getTournamentConfig();
            const venuesObs = this.venueService.getVenues();

            combineLatest({ config: configObs, venues: venuesObs }).pipe(
                map(({ config, venues }) => {
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
            const processedFormValue = {
                ...formValue,
                maxParticipants: formValue.maxParticipants ? Number(formValue.maxParticipants) : null,
                noOfGroups: formValue.noOfGroups ? Number(formValue.noOfGroups) : null,
                entryFee: formValue.entryFee ? Number(formValue.entryFee) : null
            };

            // Use Firebase function to validate tournament and calculate status
            (this.tournamentService as any).validateTournamentConfig(processedFormValue).subscribe({
                next: (validationResult: any) => {
                    if (validationResult.isValid) {
                        // Get current user's club
                        this.authService.getCurrentUserClub().subscribe({
                            next: (club: any) => {
                                if (!club) {
                                    this.saving = false;
                                    this.errorMessage = 'No club found for current user';
                                    return;
                                }

                                // Get current user
                                this.authService.user$.pipe(take(1)).subscribe({
                                    next: (user: any) => {
                                        if (!user) {
                                            this.saving = false;
                                            this.errorMessage = 'No user found';
                                            return;
                                        }

                                        const tournamentData = {
                                            ...processedFormValue,
                                            clubId: club.id!,
                                            userId: user.uid,
                                            status: validationResult.calculatedStatus || this.statuses.find(s => s.id === 'draft'),
                            
                                            
                                        };

                                        (this.tournamentService as any).createTournament(tournamentData).subscribe({
                                            next: (tournamentId: any) => {
                                                // Create groups for the tournament
                                                const maxParticipants = processedFormValue.maxParticipants;
                                                const noOfGroups = processedFormValue.noOfGroups;
                                                const tournamentVenue = processedFormValue.venue;

                                                (this.tournamentService as any).createTournamentGroups(tournamentId, maxParticipants, noOfGroups, tournamentVenue).subscribe({
                                                    next: (groups: any) => {
                                                        this.saving = false;
                                                        const groupCount = groups && Array.isArray(groups) ? groups.length : 0;
                                                        this.successMessage = `Tournament created successfully with ${groupCount} groups!`;
                                                        this.errorMessage = '';
                                                        this.messageService.add({
                                                            life: 3000, // Show toast for 3 seconds
                                                            severity: 'success',
                                                            summary: 'Success',
                                                            detail: `Tournament created successfully with ${groupCount} groups!`
                                                        });
                                                        // Navigate back to tournament list after successful creation
                                                        setTimeout(() => {
                                                            this.router.navigate(['/admin/tournaments']).then(() => {
                                                            }).catch((error) => {
                                                                console.error('Navigation failed:', error);
                                                            });
                                                        }, 1000); // Small delay to ensure toast is shown
                                                    },
                                                    error: (groupError: any) => {
                                                        console.error('Error creating groups:', groupError);
                                                        this.saving = false;
                                                        this.errorMessage = `Tournament created but failed to create groups: ${groupError.message}`;
                                                        this.messageService.add({
                                                            life: 3000, // Show toast for 3 seconds
                                                            severity: 'warn',
                                                            summary: 'Partial Success',
                                                            detail: 'Tournament created but groups creation failed. You can create groups manually.'
                                                        });
                                                        // Navigate back to tournament list even if groups creation failed
                                                        setTimeout(() => {
                                                            this.router.navigate(['/admin/tournaments']).then(() => {                                                                
                                                            }).catch((error) => {
                                                                console.error('Navigation failed (partial success):', error);
                                                            });
                                                        }, 1000); // Small delay to ensure toast is shown
                                                    }
                                                });
                                            },
                                            error: (error: any) => {
                                                console.error('Error creating tournament:', error);
                                                this.saving = false;
                                                this.errorMessage = error.message || 'Failed to create tournament';
                                                this.messageService.add({
                                                    life: 0, // Make toast sticky
                                                    severity: 'error',
                                                    summary: 'Error',
                                                    detail: error.message || 'Failed to create tournament'
                                                });
                                            }
                                        });
                                    },
                                    error: (error: any) => {
                                        console.error('Error getting current user:', error);
                                        this.saving = false;
                                        this.errorMessage = 'Failed to get current user';
                                    }
                                });
                            },
                            error: (error: any) => {
                                console.error('Error getting current user club:', error);
                                this.saving = false;
                                this.errorMessage = 'Failed to get current user club';
                            }
                        });
                    } else {
                        this.saving = false;
                        this.errorMessage = validationResult.errors && Array.isArray(validationResult.errors) ? validationResult.errors.join(', ') : 'Validation failed';
                        // Show warnings if any (keep these as toasts since they're informational)
                        if (validationResult.warnings && Array.isArray(validationResult.warnings) && validationResult.warnings.length > 0) {
                            this.messageService.add({
                                severity: 'warn',
                                summary: 'Warning',
                                detail: validationResult.warnings.join(', '),
                                life: 0 // Make toast sticky
                            });
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
    loadRoundRobinConfigIfNeeded(format: TournamentFormat | null): void {
        const progressionControl = this.tournamentForm.get('progressionOption');

        if (format && format.id === 'round_robin') {
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
        const selectedFormat = this.tournamentForm.get('format')?.value;
        return selectedFormat && selectedFormat.id === 'round_robin';
    }

    /**
     * Check if the selected progression option is group-based elimination
     */
    isGroupBasedElimination(): boolean {
        const selectedProgression = this.tournamentForm.get('progressionOption')?.value;
        return selectedProgression && selectedProgression.id === 'group_based_elimination';
    }

    /**
     * Update validation for group advancement settings based on progression option
     */
    updateGroupAdvancementValidation(progressionOption: any): void {
        const advancementModelControl = this.tournamentForm.get('advancementModel');
        const eliminationBracketSizeControl = this.tournamentForm.get('eliminationBracketSize');

        if (progressionOption && progressionOption.id === 'group_based_elimination') {
            // Make fields required for group-based elimination
            advancementModelControl?.setValidators(Validators.required);
            eliminationBracketSizeControl?.setValidators(Validators.required);
        } else {
            // Clear validation for other progression types but don't clear the values
            advancementModelControl?.clearValidators();
            eliminationBracketSizeControl?.clearValidators();
            // Don't clear the values:
            // advancementModelControl?.setValue(null);
            // Don't clear the values:
            // eliminationBracketSizeControl?.setValue(null);
        }

        advancementModelControl?.updateValueAndValidity();
        eliminationBracketSizeControl?.updateValueAndValidity();
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
            (bracket: any) => bracket.id === eliminationBracketSize.id
        );

        if (!bracketConfig) {
            return 0;
        }

        return bracketConfig.teams;
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
            (bracket: any) => bracket.id === eliminationBracketSize.id
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

    getAdvancementModel(): string {
        const advancementModel = this.tournamentForm.get('advancementModel')?.value;
        return advancementModel?.name || '';
    }

    isTrophyPlateModel(): boolean {
        const advancementModel = this.tournamentForm.get('advancementModel')?.value;
        return advancementModel?.id === 'trophy_plate';
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
}
