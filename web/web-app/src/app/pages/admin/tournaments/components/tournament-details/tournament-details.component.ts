import { Component, Input, Output, EventEmitter, OnInit, OnDestroy, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { InputGroupModule } from 'primeng/inputgroup';
import { InputGroupAddonModule } from 'primeng/inputgroupaddon';
import { InputNumberModule } from 'primeng/inputnumber';
import { DatePickerModule } from 'primeng/datepicker';
import { TextareaModule } from 'primeng/textarea';
import { SelectModule } from 'primeng/select';
import { MessageModule } from 'primeng/message';
import { RippleModule } from 'primeng/ripple';
import { Subject, takeUntil } from 'rxjs';

// Import interfaces from tournament service
import { TournamentService, Tournament, RoundType } from '../../../../../services/tournament.service';
import { VenueService, Venue } from '../../../../../services/venue.service';
import { FirebaseAuthService } from '../../../../../services/firebase-auth.service';

// Define interfaces locally (same as in edit-tournament)
interface TournamentFormat {
    id: string;
    name: string;
    description: string;
    isActive: boolean;
}

interface TournamentConfig {
    formats: TournamentFormat[];
    statuses: TournamentStatus[];
    categories: TournamentCategory[];
    registrationTypes: TournamentRegistrationType[];
    venueTypes: TournamentVenueType[];
    lastUpdated: Date;
}

interface TournamentStatus {
    id: string;
    name: string;
    description: string;
    color: string;
    textColor: string;
    isActive: boolean;
    order: number;
}

interface TournamentCategory {
    id: string;
    name: string;
    description: string;
    isActive: boolean;
}

interface TournamentRegistrationType {
    id: string;
    name: string;
    description: string;
    isActive: boolean;
}

interface TournamentVenueType {
    id: string;
    name: string;
    description: string;
    isActive: boolean;
}

interface TournamentProgressionOption {
    id: string;
    name: string;
    description: string;
    isActive: boolean;
}

interface RoundRobinConfig {
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



@Component({
    selector: 'app-tournament-details',
    standalone: true,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        ButtonModule,
        InputTextModule,
        InputGroupModule,
        InputGroupAddonModule,
        InputNumberModule,
        DatePickerModule,
        TextareaModule,
        SelectModule,
        MessageModule,
        RippleModule
    ],
    templateUrl: './tournament-details.component.html',
    styles: []
})
export class TournamentDetailsComponent implements OnInit, OnDestroy, OnChanges {
    @Input() tournament: Tournament | null = null;
    @Input() tournamentConfig: TournamentConfig | null = null;
    @Input() roundRobinConfig: RoundRobinConfig | null = null;
    @Input() venues: Venue[] = [];
    @Input() loading: boolean = false;
    @Input() saving: boolean = false;
    
    // Add showIcon property for date fields
    @Input() showIcon: boolean = true;
    
    @Output() saveTournament = new EventEmitter<Tournament>();
    @Output() cancelEdit = new EventEmitter<void>();
    @Output() resetForm = new EventEmitter<void>();
    @Output() formatChanged = new EventEmitter<TournamentFormat | null>();
    @Output() progressionOptionChanged = new EventEmitter<any>();
    @Output() venueTypeChanged = new EventEmitter<TournamentVenueType>();

    tournamentForm: FormGroup;
    errorMessage: string = '';
    successMessage: string = '';
    currencySymbol: string = 'R'; // Default to South African Rand

    // Formatted data for dropdowns
    formats: TournamentFormat[] = [];
    statuses: TournamentStatus[] = [];
    categories: TournamentCategory[] = [];
    registrationTypes: TournamentRegistrationType[] = [];
    venueTypes: TournamentVenueType[] = [];
    progressionTypes: TournamentProgressionOption[] = [];
    advancementModels: any[] = [];
    eliminationBracketSizes: any[] = [];
    adminClubs: any[] = []; // Clubs where user is admin
    
    // Group options for Round Robin format
    groupOptions: number[] = [2, 3, 4, 5, 6, 7, 8];
    teamsToAdvanceOptions: number[] = [1, 2, 4, 8];

    private destroy$ = new Subject<void>();

    constructor(
        private fb: FormBuilder,
        private tournamentService: TournamentService,
        private venueService: VenueService,
        private authService: FirebaseAuthService
    ) {
        this.tournamentForm = this.fb.group({
            name: ['', Validators.required],
            description: ['', Validators.required],
            startDate: [null, Validators.required],
            endDate: [null, Validators.required],
            registrationStartDate: [null],
            registrationEndDate: [null],
            format: [null, Validators.required],
            category: [null, Validators.required],
            registrationType: [null, Validators.required],
            venueType: [null, Validators.required],
            venue: [null],
            club: [null, Validators.required], // Club selection - required
            accessType: ['open', Validators.required], // Tournament access type - default to open
            progressionOption: [null],
            roundType: [null],
            advancementModel: [null],
            eliminationBracketSize: [null],
            maxParticipants: [null, [Validators.required, Validators.min(2)]],
            noOfGroups: [null, [Validators.required, Validators.min(1)]],
            teamsToAdvancePerGroup: [null, [Validators.required]],
            entryFee: [null, [Validators.required, Validators.min(0)]]
        });
    }

    /**
     * Load admin clubs for the current user
     */
    private loadAdminClubs(): void {
        this.authService.currentUser$.pipe(
            takeUntil(this.destroy$)
        ).subscribe(user => {
            if (user) {
                this.authService.getCachedUserAuthData(user.uid).pipe(
                    takeUntil(this.destroy$)
                ).subscribe({
                    next: (cachedData: any) => {
                        this.adminClubs = (cachedData.club_memberships?.filter((membership: any) => membership.is_admin) || [])
                            .sort((a: any, b: any) => a.club_name.localeCompare(b.club_name));
                    },
                    error: (error) => {
                        console.error('Error loading admin clubs:', error);
                        this.adminClubs = [];
                    }
                });
            }
        });
    }

    ngOnInit(): void {
        this.setupFormSubscriptions();
        this.loadAdminClubs();
        
        // Add a timeout to ensure form is populated after all data is loaded
        setTimeout(() => {
            if (this.tournament && this.venues && this.venues.length > 0) {
                this.populateForm();
            }
        }, 1000);
    }

    ngOnChanges(changes: SimpleChanges): void {
        // Check if tournament data has changed
        if (changes['tournament'] && changes['tournament'].currentValue) {
            this.populateDropdownData();
            // Only populate form if venues are available
            if (this.venues && this.venues.length > 0) {
                this.populateForm();
            }
        }
        
        // Check if config data has changed
        if (changes['tournamentConfig'] && changes['tournamentConfig'].currentValue) {
            this.populateDropdownData();
            if (this.tournament && this.venues && this.venues.length > 0) {
                this.populateForm();
            }
        }
        
        // Check if venues data has changed
        if (changes['venues'] && changes['venues'].currentValue) {
            if (this.tournament) {
                this.populateForm();
            }
        }
        
        // Check if roundRobinConfig has changed
        if (changes['roundRobinConfig'] && changes['roundRobinConfig'].currentValue) {
            this.populateDropdownData();
        }
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }

    private setupFormSubscriptions(): void {
        // Watch for format changes to load round-robin config when needed
        this.tournamentForm.get('format')?.valueChanges.pipe(
            takeUntil(this.destroy$)
        ).subscribe(format => {
            this.formatChanged.emit(format);
            this.updateRoundRobinValidation(format);
        });

        // Watch for progression option changes to show/hide group advancement settings
        this.tournamentForm.get('progressionOption')?.valueChanges.pipe(
            takeUntil(this.destroy$)
        ).subscribe(progressionOption => {
            this.progressionOptionChanged.emit(progressionOption);
            this.updateGroupAdvancementValidation(progressionOption);
        });

        // Watch for tournament venue type changes to update venue field validation
        this.tournamentForm.get('venueType')?.valueChanges.pipe(
            takeUntil(this.destroy$)
        ).subscribe(venueType => {
            this.venueTypeChanged.emit(venueType);
            this.updateGroupVenueValidation();
        });

        // Watch for maxParticipants and noOfGroups changes to validate group configuration
        this.tournamentForm.get('maxParticipants')?.valueChanges.pipe(
            takeUntil(this.destroy$)
        ).subscribe(() => {
            this.validateGroupConfiguration();
            this.validateTeamsToAdvance();
        });

        this.tournamentForm.get('noOfGroups')?.valueChanges.pipe(
            takeUntil(this.destroy$)
        ).subscribe(() => {
            this.validateGroupConfiguration();
            this.validateTeamsToAdvance();
        });

        // Watch for teamsToAdvancePerGroup changes to validate teams to advance
        this.tournamentForm.get('teamsToAdvancePerGroup')?.valueChanges.pipe(
            takeUntil(this.destroy$)
        ).subscribe(() => {
            this.validateTeamsToAdvance();
        });
    }

    private populateDropdownData(): void {
        if (this.tournamentConfig) {
            this.formats = this.tournamentConfig.formats.filter(f => f.isActive);
            this.statuses = this.tournamentConfig.statuses.filter(s => s.isActive);
            this.categories = this.tournamentConfig.categories.filter(c => c.isActive);
            this.registrationTypes = this.tournamentConfig.registrationTypes.filter(r => r.isActive);
            this.venueTypes = this.tournamentConfig.venueTypes.filter(v => v.isActive);
        }

        if (this.roundRobinConfig) {
            this.progressionTypes = this.roundRobinConfig.progressionTypes?.filter(p => p.isActive) || [];
            this.advancementModels = this.roundRobinConfig.groupAdvancementSettings?.advancementModels || [];
            this.eliminationBracketSizes = this.roundRobinConfig.groupAdvancementSettings?.eliminationBracketSize?.filter(b => b.isActive) || [];
        }
    }

    private populateForm(): void {
        if (!this.tournament) return;

        const matchingVenue = this.findMatchingVenue(this.tournament.venue);

        this.tournamentForm.patchValue({
            name: this.tournament.name,
            description: this.tournament.description,
            startDate: this.tournament.startDate,
            endDate: this.tournament.endDate,
            registrationStartDate: this.tournament.registrationStartDate,
            registrationEndDate: this.tournament.registrationEndDate,
            format: this.tournament.format?.id,
            category: this.tournament.category?.id,
            registrationType: this.tournament.registrationType?.id,
            venueType: this.tournament.venueType?.id,
            venue: matchingVenue?.id,
            club: this.tournament.clubId, // Set the club ID
            accessType: (this.tournament as any).accessType || 'open', // Set access type, default to open
            maxParticipants: this.tournament.maxParticipants,
            entryFee: this.tournament.entryFee,
            // Round Robin specific fields
            ...(this.isRoundRobinTournament() && {
                progressionOption: (this.tournament as any).progressionOption?.id,
                advancementModel: (this.tournament as any).advancementModel?.id,
                eliminationBracketSize: (this.tournament as any).eliminationBracketSize?.id,
                noOfGroups: (this.tournament as any).noOfGroups,
                teamsToAdvancePerGroup: (this.tournament as any).teamsToAdvancePerGroup,
                roundType: (this.tournament as any).roundType?.id,
            })
        });
        
        // Force update the venue field specifically
        if (matchingVenue) {
            this.tournamentForm.get('venue')?.setValue(matchingVenue.id);
        }
    }

    private findMatchingVenue(tournamentVenue: Venue | undefined): Venue | null {
        if (!tournamentVenue || !this.venues) {
            return null;
        }
        
        // Try exact ID match first
        let matchingVenue = this.venues.find(v => v.id === tournamentVenue.id);
        
        // If no exact match, try matching by name as fallback
        if (!matchingVenue && tournamentVenue.name) {
            matchingVenue = this.venues.find(v => v.name === tournamentVenue.name);
        }
        
        return matchingVenue || null;
    }

    onSave(): void {
        if (this.tournamentForm.valid) {
            const formValue = this.tournamentForm.value;
            
            // Convert ID values back to objects
            const format = this.findObjectById(this.formats, formValue.format);
            const category = this.findObjectById(this.categories, formValue.category);
            const registrationType = this.findObjectById(this.registrationTypes, formValue.registrationType);
            const venueType = this.findObjectById(this.venueTypes, formValue.venueType);
            const venue = this.findVenueById(formValue.venue);
            const progressionOption = this.findObjectById(this.progressionTypes, formValue.progressionOption);
            const advancementModel = this.findObjectById(this.advancementModels, formValue.advancementModel);
            const eliminationBracketSize = this.findObjectById(this.eliminationBracketSizes, formValue.eliminationBracketSize);

            if (!format || !category || !registrationType || !venueType) {
                console.error('Required tournament configuration missing');
                return;
            }

            // Get current user for firebaseUid
            const currentUser = this.authService.getCurrentUser();
            if (!currentUser) {
                this.errorMessage = 'User not authenticated. Please log in again.';
                return;
            }

            const baseTournamentData = {
                ...this.tournament!,
                name: formValue.name,
                description: formValue.description,
                startDate: formValue.startDate ? this.formatDateOnly(formValue.startDate) : formValue.startDate,
                endDate: formValue.endDate ? this.formatDateOnly(formValue.endDate) : formValue.endDate,
                registrationStartDate: formValue.registrationStartDate ? this.formatDateOnly(formValue.registrationStartDate) : formValue.registrationStartDate,
                registrationEndDate: formValue.registrationEndDate ? this.formatDateOnly(formValue.registrationEndDate) : formValue.registrationEndDate,
                format: format,
                category: category,
                registrationType: registrationType,
                venueType: venueType,
                venue: venue,
                maxParticipants: Number(formValue.maxParticipants),
                entryFee: Number(formValue.entryFee),
                tournamentType: this.isRoundRobinTournament() ? 'ROUND_ROBIN' : 'AMERICANO',
                firebaseUid: currentUser.uid
            };

            // Add Round Robin specific fields if applicable
            const tournamentData = this.isRoundRobinTournament() 
                ? {
                    ...baseTournamentData,
                    progressionOption: progressionOption || undefined,
                    advancementModel: advancementModel || undefined,
                    eliminationBracketSize: eliminationBracketSize || undefined,
                    noOfGroups: Number(formValue.noOfGroups),
                    teamsToAdvancePerGroup: Number(formValue.teamsToAdvancePerGroup),
                } as any
                : baseTournamentData;
            
            this.saveTournament.emit(tournamentData);
        }
    }

    private findObjectById<T extends { id: string }>(array: T[], id: string): T | null {
        if (!array || !id) return null;
        return array.find(item => item.id === id) || null;
    }

    private findVenueById(id: string): Venue | undefined {
        if (!this.venues || !id) return undefined;
        return this.venues.find(venue => venue.id === id);
    }

    onCancel(): void {
        this.cancelEdit.emit();
    }

    onReset(): void {
        this.resetForm.emit();
    }

    isRoundRobinTournament(): boolean {
        return this.tournament?.tournamentType === 'ROUND_ROBIN' || 
               (this.tournament?.format?.name?.toLowerCase() || '').includes('round robin');
    }

    private validateGroupConfiguration(): void {
        const maxParticipants = this.tournamentForm.get('maxParticipants')?.value;
        const noOfGroups = this.tournamentForm.get('noOfGroups')?.value;

        if (maxParticipants && noOfGroups && this.isRoundRobinTournament()) {
            const teamsPerGroup = Math.floor(maxParticipants / 2 / noOfGroups);
            if (teamsPerGroup < 1) {
                this.tournamentForm.get('noOfGroups')?.setErrors({
                    'invalidGroupConfig': {
                        message: `Invalid configuration: ${maxParticipants} participants cannot be divided into ${noOfGroups} groups`
                    }
                });
            } else {
                this.tournamentForm.get('noOfGroups')?.setErrors(null);
            }
        }
    }

    private validateTeamsToAdvance(): void {
        const maxParticipants = this.tournamentForm.get('maxParticipants')?.value;
        const noOfGroups = this.tournamentForm.get('noOfGroups')?.value;
        const teamsToAdvancePerGroup = this.tournamentForm.get('teamsToAdvancePerGroup')?.value;

        if (maxParticipants && noOfGroups && teamsToAdvancePerGroup && this.isRoundRobinTournament()) {
            const teamsPerGroup = Math.floor(maxParticipants / 2 / noOfGroups);
            if (teamsToAdvancePerGroup > teamsPerGroup) {
                this.tournamentForm.get('teamsToAdvancePerGroup')?.setErrors({
                    'invalidTeamsToAdvance': {
                        message: `Cannot advance ${teamsToAdvancePerGroup} teams when each group only has ${teamsPerGroup} teams`
                    }
                });
            } else {
                this.tournamentForm.get('teamsToAdvancePerGroup')?.setErrors(null);
            }
        }
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

    private updateGroupAdvancementValidation(progressionOption: any): void {
        const advancementModelControl = this.tournamentForm.get('advancementModel');
        const eliminationBracketSizeControl = this.tournamentForm.get('eliminationBracketSize');

        if (progressionOption === 'group_based_elimination') {
            advancementModelControl?.setValidators([Validators.required]);
            eliminationBracketSizeControl?.setValidators([Validators.required]);
        } else {
            advancementModelControl?.clearValidators();
            eliminationBracketSizeControl?.clearValidators();
        }

        advancementModelControl?.updateValueAndValidity();
        eliminationBracketSizeControl?.updateValueAndValidity();
    }

    private updateGroupVenueValidation(): void {
        const venueType = this.tournamentForm.get('venueType')?.value;
        const venueControl = this.tournamentForm.get('venue');

        if (venueType?.name === 'Single Venue') {
            venueControl?.setValidators([Validators.required]);
        } else {
            venueControl?.clearValidators();
        }

        venueControl?.updateValueAndValidity();
    }

    shouldShowVenueSelection(): boolean {
        const venueTypeId = this.tournamentForm.get('venueType')?.value;
        if (!venueTypeId) return false;
        
        // Find the venue type object by ID
        const venueType = this.venueTypes.find(vt => vt.id === venueTypeId);
        return venueType?.name === 'Single Venue';
    }

    shouldShowGroupAdvancementSettings(): boolean {
        const progressionOption = this.tournamentForm.get('progressionOption')?.value;
        return progressionOption === 'group_based_elimination';
    }

    isRoundRobinFormat(): boolean {
        const selectedFormatId = this.tournamentForm.get('format')?.value;
        if (!selectedFormatId) return false;
        
        const selectedFormat = this.formats.find(f => f.id === selectedFormatId);
        return selectedFormat?.name === 'Round Robin' || false;
    }

    isGroupBasedElimination(): boolean {
        const selectedFormatId = this.tournamentForm.get('format')?.value;
        const progressionOption = this.tournamentForm.get('progressionOption')?.value;
        
        if (!selectedFormatId) return false;
        const selectedFormat = this.formats.find(f => f.id === selectedFormatId);
        
        return selectedFormat?.name === 'Round Robin' && progressionOption === 'group-based';
    }

    getTeamsPerGroup(): number {
        const maxParticipants = this.tournamentForm.get('maxParticipants')?.value;
        const noOfGroups = this.tournamentForm.get('noOfGroups')?.value;

        if (maxParticipants && noOfGroups) {
            return Math.floor(maxParticipants / 2 / noOfGroups);
        }
        return 0;
    }

    getTeamsToAdvancePerGroup(): number {
        const maxParticipants = this.tournamentForm.get('maxParticipants')?.value;
        const noOfGroups = this.tournamentForm.get('noOfGroups')?.value;

        if (!maxParticipants || !noOfGroups) {
            return 0;
        }

        const teamsPerGroup = Math.floor(maxParticipants / 2 / noOfGroups);
        return teamsPerGroup;
    }

    getTeamsAdvancingToElimination(): number {
        const maxParticipants = this.tournamentForm.get('maxParticipants')?.value;
        const noOfGroups = this.tournamentForm.get('noOfGroups')?.value;
        const eliminationBracketSize = this.tournamentForm.get('eliminationBracketSize')?.value;

        if (!maxParticipants || !noOfGroups || !eliminationBracketSize || !this.roundRobinConfig) {
            return 0;
        }

        const bracketConfig = this.roundRobinConfig.groupAdvancementSettings?.eliminationBracketSize?.find(
            (bracket: any) => bracket.id === eliminationBracketSize
        );

        return bracketConfig?.teams || 0;
    }

    getTeamsAdvancingToPlate(): number {
        const maxParticipants = this.tournamentForm.get('maxParticipants')?.value;
        const noOfGroups = this.tournamentForm.get('noOfGroups')?.value;
        const eliminationBracketSize = this.tournamentForm.get('eliminationBracketSize')?.value;

        if (!maxParticipants || !noOfGroups || !eliminationBracketSize || !this.roundRobinConfig) {
            return 0;
        }

        const totalTeams = Math.floor(maxParticipants / 2);
        const bracketConfig = this.roundRobinConfig.groupAdvancementSettings?.eliminationBracketSize?.find(
            (bracket: any) => bracket.id === eliminationBracketSize
        );

        if (!bracketConfig) {
            return 0;
        }

        const teamsAdvancingToTrophy = bracketConfig.teams;
        const teamsAdvancingToPlate = totalTeams - teamsAdvancingToTrophy;

        return teamsAdvancingToPlate;
    }

    getAdvancementModel(): string {
        const advancementModel = this.tournamentForm.get('advancementModel')?.value;
        if (!advancementModel) return 'Not selected';
        
        const model = this.advancementModels.find(m => m.id === advancementModel);
        return model?.name || 'Not selected';
    }

    isTrophyPlateModel(): boolean {
        const advancementModel = this.tournamentForm.get('advancementModel')?.value;
        return advancementModel === 'trophy-plate';
    }

    private evenNumberValidator() {
        return (control: AbstractControl): ValidationErrors | null => {
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
     * Format a Date object to YYYY-MM-DD string to avoid timezone issues
     */
    private formatDateOnly(date: Date): string {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }

} 