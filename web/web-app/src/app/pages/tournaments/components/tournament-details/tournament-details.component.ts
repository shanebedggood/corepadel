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
import { TournamentService, Tournament } from '../../../../services/tournament.service';
import { VenueService, Venue } from '../../../../services/venue.service';

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

    private destroy$ = new Subject<void>();

    constructor(
        private fb: FormBuilder,
        private tournamentService: TournamentService,
        private venueService: VenueService
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
            progressionOption: [null],
            advancementModel: [null],
            eliminationBracketSize: [null],
            maxParticipants: [null, [Validators.required, Validators.min(2), this.evenNumberValidator()]],
            noOfGroups: [null, [Validators.required, Validators.min(1)]],
            entryFee: [null, [Validators.required, Validators.min(0)]]
        });
    }

    ngOnInit(): void {
        this.setupFormSubscriptions();
    }

    ngOnChanges(changes: SimpleChanges): void {
        // Check if tournament data has changed
        if (changes['tournament'] && changes['tournament'].currentValue) {
            this.populateDropdownData();
            this.populateForm();
        }
        
        // Check if config data has changed
        if (changes['tournamentConfig'] && changes['tournamentConfig'].currentValue) {
            this.populateDropdownData();
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
        });

        this.tournamentForm.get('noOfGroups')?.valueChanges.pipe(
            takeUntil(this.destroy$)
        ).subscribe(() => {
            this.validateGroupConfiguration();
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
            this.progressionTypes = this.roundRobinConfig.progressionTypes.filter(p => p.isActive);
            this.advancementModels = this.roundRobinConfig.groupAdvancementSettings.advancementModels;
            this.eliminationBracketSizes = this.roundRobinConfig.groupAdvancementSettings.eliminationBracketSize.filter(b => b.isActive);
        }
    }

    private populateForm(): void {
        if (!this.tournament) return;

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
            venue: this.findMatchingVenue(this.tournament.venue)?.id,
            progressionOption: this.tournament.progressionOption?.id,
            advancementModel: this.tournament.advancementModel?.id,
            eliminationBracketSize: this.tournament.eliminationBracketSize?.id,
            maxParticipants: this.tournament.maxParticipants,
            noOfGroups: this.tournament.noOfGroups,
            entryFee: this.tournament.entryFee
        });
    }

    private findMatchingVenue(tournamentVenue: Venue | undefined): Venue | null {
        if (!tournamentVenue || !this.venues) return null;
        return this.venues.find(v => v.id === tournamentVenue.id) || null;
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

            const tournamentData: Tournament = {
                ...this.tournament!,
                name: formValue.name,
                description: formValue.description,
                startDate: formValue.startDate,
                endDate: formValue.endDate,
                registrationStartDate: formValue.registrationStartDate,
                registrationEndDate: formValue.registrationEndDate,
                format: format,
                category: category,
                registrationType: registrationType,
                venueType: venueType,
                venue: venue,
                progressionOption: progressionOption || undefined,
                advancementModel: advancementModel || undefined,
                eliminationBracketSize: eliminationBracketSize || undefined,
                maxParticipants: Number(formValue.maxParticipants),
                noOfGroups: Number(formValue.noOfGroups),
                entryFee: Number(formValue.entryFee)
            };
            
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

    private validateGroupConfiguration(): void {
        const maxParticipants = this.tournamentForm.get('maxParticipants')?.value;
        const noOfGroups = this.tournamentForm.get('noOfGroups')?.value;

        if (maxParticipants && noOfGroups) {
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
        const format = this.tournamentForm.get('format')?.value;
        return format === 'round_robin';
    }

    isGroupBasedElimination(): boolean {
        const format = this.tournamentForm.get('format')?.value;
        const progressionOption = this.tournamentForm.get('progressionOption')?.value;
        return format === 'round_robin' && progressionOption === 'group_based_elimination';
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

        const bracketConfig = this.roundRobinConfig.groupAdvancementSettings.eliminationBracketSize.find(
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
        const bracketConfig = this.roundRobinConfig.groupAdvancementSettings.eliminationBracketSize.find(
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
        return advancementModel === 'trophy_plate';
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
} 