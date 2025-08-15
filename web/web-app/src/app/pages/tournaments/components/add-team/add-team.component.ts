import { CommonModule } from "@angular/common";
import { Component, OnInit, AfterViewInit, ChangeDetectorRef, HostListener, ViewChild, ElementRef } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { Observable, of, Subject, takeUntil, combineLatest } from 'rxjs';
import { map, switchMap, catchError } from 'rxjs/operators';
import { ButtonModule } from 'primeng/button';
import { TournamentService, TournamentGroup, TournamentTeam, TournamentPlayer } from '../../../../services/tournament.service';
import { FirebaseAuthService } from '../../../../services/firebase-auth.service';
import { UserProfile } from '../../../../models/user-profile';
import { FormBuilder, FormGroup, ReactiveFormsModule, FormsModule, Validators } from "@angular/forms";
import { InputTextModule } from 'primeng/inputtext';
import { InputGroupModule } from 'primeng/inputgroup';
import { InputNumberModule } from "primeng/inputnumber";
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { CardModule } from 'primeng/card';
import { DividerModule } from 'primeng/divider';
import { BadgeModule } from 'primeng/badge';
import { RippleModule } from 'primeng/ripple';
import { TooltipModule } from 'primeng/tooltip';
import { MessageModule } from 'primeng/message';

@Component({
    selector: 'app-add-team',
    standalone: true,
    imports: [
        CommonModule,
        ButtonModule,
        ReactiveFormsModule,
        FormsModule,
        InputTextModule,
        InputGroupModule,
        InputNumberModule,
        ConfirmDialogModule,
        ToastModule,
        CardModule,
        DividerModule,
        BadgeModule,
        RippleModule,
        TooltipModule,
        MessageModule
    ],
    providers: [ConfirmationService, MessageService],
    templateUrl: './add-team.component.html',
    styles: []
})
export class AddTeamComponent implements OnInit, AfterViewInit {
    tournamentId: string = '';
    groupId: string = '';
    teamId: string = '';
    group: TournamentGroup | null = null;
    editingTeam: TournamentTeam | null = null;
    isEditing: boolean = false;
    loading: boolean = false;
    teamForm: FormGroup;

    // Store all tournament teams for local checking
    allTournamentTeams: TournamentTeam[][] = [];

    // Search properties
    searchTerm: string = '';
    searchResults: UserProfile[] = [];
    searchLoading: boolean = false;
    hasSearched: boolean = false;

    // Selected players
    selectedPlayers: UserProfile[] = [];

    // ViewChild reference to search input
    @ViewChild('searchInput', { static: false }) searchInput!: ElementRef<HTMLInputElement>;

    // Team name for two-way binding
    private _teamName: string = '';

    get teamName(): string {
        return this._teamName;
    }

    set teamName(value: string) {
        this._teamName = value;
    }

    constructor(
        private tournamentService: TournamentService,
        private authService: FirebaseAuthService,
        private fb: FormBuilder,
        private route: ActivatedRoute,
        private router: Router,
        private confirmationService: ConfirmationService,
        private messageService: MessageService,
        private cdr: ChangeDetectorRef
    ) {
        this.teamForm = this.fb.group({
            name: ['', Validators.required]
        });
    }

    ngOnInit(): void {
        this.tournamentId = this.route.snapshot.paramMap.get('tournamentId') || '';
        this.groupId = this.route.snapshot.paramMap.get('groupId') || '';
        this.teamId = this.route.snapshot.paramMap.get('teamId') || '';

        if (!this.tournamentId || !this.groupId) {
            this.router.navigate(['/admin/tournaments']);
            return;
        }

        this.isEditing = !!this.teamId;

        // Do not set loading=true here
        this.loadInitialDataChain().subscribe();
    }

    ngAfterViewInit(): void {
        if (!this.isEditing) {
            this.generateRandomTeamName();
        }
    }

    /**
     * Main data loading chain that orchestrates all data loading in the correct order
     */
    loadInitialDataChain(): Observable<any> {
        // Do not set loading=true here
        return this.loadGroup().pipe(
            switchMap(group => {
                if (this.isEditing) {
                    return this.loadTeam().pipe(
                        map(team => {
                            this.loading = false;
                            return true;
                        })
                    );
                } else {
                    // No team name generation here
                    this.loading = false;
                    return of(true);
                }
            }),
            catchError(error => {
                console.error('Error in data loading chain:', error);
                this.loading = false;
                return of(false);
            })
        );
    }

    /**
     * Load group data
     */
    loadGroup(): Observable<TournamentGroup | null> {
        return (this.tournamentService as any).getTournamentGroups(this.tournamentId).pipe(
            map((groups: any) => {
                this.group = groups.find((g: TournamentGroup) => g.id === this.groupId) || null;

                if (!this.group) {
                    this.messageService.add({
                        life: 0, // Make toast sticky
                        severity: 'error',
                        summary: 'Error',
                        detail: 'Group not found'
                    });
                    this.router.navigate(['/admin/tournaments']);
                }
                return this.group;
            }),
            catchError(error => {
                console.error('Error loading group:', error);
                this.messageService.add({
                    life: 0, // Make toast sticky
                    severity: 'error',
                    summary: 'Error',
                    detail: 'Failed to load group'
                });
                return of(null);
            })
        );
    }

    /**
     * Load team data
     */
    loadTeam(): Observable<TournamentTeam | null> {
        if (!this.teamId) return of(null);

        return (this.tournamentService as any).getTournamentTeams(this.tournamentId, this.groupId).pipe(
            map((teams: any) => {
                this.editingTeam = teams.find((t: TournamentTeam) => t.id === this.teamId) || null;

                if (!this.editingTeam) {
                    this.messageService.add({
                        life: 0, // Make toast sticky
                        severity: 'error',
                        summary: 'Error',
                        detail: 'Team not found'
                    });
                    this.router.navigate(['/admin/tournaments']);
                    return null;
                }

                // Populate the form with existing team data
                this.teamForm.patchValue({
                    name: this.editingTeam.name
                });

                // Convert TournamentPlayer to UserProfile for selected players
                this.selectedPlayers = (this.editingTeam.players || []).map(player => ({
                    firebase_uid: player.uid,
                    email: player.email,
                    display_name: player.displayName || `${player.firstName || ''} ${player.lastName || ''}`.trim() || player.email,
                    first_name: player.firstName || '',
                    last_name: player.lastName || '',
                    username: player.displayName || `${player.firstName || ''} ${player.lastName || ''}`.trim() || player.email,
                    roles: ['player'],
                    email_verified: true,
                    mobile: '',
                    rating: 1.0,
                    profile_picture: undefined,
                }));

                return this.editingTeam;
            }),
            catchError(error => {
                console.error('Error loading team:', error);
                this.messageService.add({
                    life: 0, // Make toast sticky
                    severity: 'error',
                    summary: 'Error',
                    detail: 'Failed to load team'
                });
                return of(null);
            })
        );
    }

    searchPlayers(): void {
        const searchTerm = this.searchTerm.trim();

        // Require minimum 3 characters or a valid UID
        if (searchTerm.length < 3 && !this.isValidUid(searchTerm)) {
            this.searchResults = [];
            this.hasSearched = false;
            return;
        }

        // Prevent multiple simultaneous searches
        if (this.searchLoading) {
            return;
        }

        this.searchLoading = true;
        this.searchResults = [];

        // For now, show a message that player search is not yet implemented with Firebase
        this.searchLoading = false;
        this.messageService.add({
            life: 0, // Make toast sticky
            severity: 'warn',
            summary: 'Not Implemented',
            detail: 'Player search not yet implemented with Firebase Auth'
        });
    }

    private isValidUid(uid: string): boolean {
        // Firebase UIDs are typically 28 characters long and contain alphanumeric characters
        return /^[a-zA-Z0-9]{28}$/.test(uid);
    }

    canSearch(): boolean {
        const searchTerm = this.searchTerm.trim();
        return searchTerm.length >= 3 || this.isValidUid(searchTerm);
    }

    clearSearch(): void {
        this.searchTerm = '';
        this.searchResults = [];
        this.hasSearched = false;
    }

    selectPlayer(player: UserProfile): void {

                    if (this.selectedPlayers.some(sp => sp.firebase_uid === player.firebase_uid)) {
            this.messageService.add({
                life: 0, // Make toast sticky
                severity: 'warn',
                summary: 'Warning',
                detail: 'Player already selected'
            });
            return;
        }

        this.selectedPlayers.push(player);

        // Clear search results and search input
        this.searchResults = [];
        this.searchTerm = '';
        this.hasSearched = false;

        // Focus the search input for the next search
        this.focusSearchInput();
    }

    removePlayer(player: UserProfile): void {
        this.selectedPlayers = this.selectedPlayers.filter(p => p.firebase_uid !== player.firebase_uid);
        // If we have search results, refresh them to show the removed player again
        if (this.hasSearched && this.searchTerm.trim()) {
            this.searchPlayers();
        }
    }

    canSave(): boolean {
        return !!(this.teamName && this.teamName.trim() !== '' && this.selectedPlayers.length > 0);
    }

    saveTeam(): void {
        if (!this.canSave() || !this.group?.id) {
            return;
        }
        this.loading = true;

        // Use teamName property instead of form value
        const formValue = { name: this.teamName };

        // Convert selected players to TournamentPlayer format
        const teamPlayers: TournamentPlayer[] = this.selectedPlayers.map(player => ({
                            uid: player.firebase_uid,
            email: player.email,
            displayName: player.display_name || `${player.first_name || ''} ${player.last_name || ''}`.trim() || player.email,
            firstName: player.first_name,
            lastName: player.last_name
        }));

        // Check if any players are already in other teams or are participants
        // TODO: Restore player validation when TournamentService methods are properly implemented
        // This validation prevents duplicate players and ensures data integrity
        
        // TEMPORARY: Skip player checking and save directly
        this.performTeamSave(teamPlayers, formValue);
    }

    private performTeamSave(teamPlayers: TournamentPlayer[], formValue: any): void {

        if (this.isEditing) {
            // Update existing team
            (this.tournamentService as any).updateTournamentTeam(
                this.tournamentId,
                this.groupId,
                this.teamId,
                {
                    name: formValue.name,
                    players: teamPlayers
                }
            ).subscribe({
                next: () => {
                    this.finalizeTeamSave();
                },
                error: (error: any) => {
                    this.messageService.add({
                        life: 0, // Make toast sticky
                        severity: 'error',
                        summary: 'Error',
                        detail: error.message || 'Failed to update team'
                    });
                }
            });
        } else {
            // Create new team
            (this.tournamentService as any).createTournamentTeam(
                this.tournamentId,
                this.groupId,
                formValue.name,
                teamPlayers
            ).subscribe({
                next: () => {
                    this.finalizeTeamSave();
                },
                error: (error: any) => {
                    console.error('Error creating team:', error);
                    this.messageService.add({
                        life: 0, // Make toast sticky
                        severity: 'error',
                        summary: 'Error',
                        detail: error.message || 'Failed to create team'
                    });
                }
            });
        }
    }

    private finalizeTeamSave(): void {
        this.loading = false;
        // Navigate back to tournament edit page with groups tab active and the specific group expanded
        this.router.navigate(['/admin/edit-tournament', this.tournamentId], {
            queryParams: {
                tab: 'groups',
                expandedGroup: this.groupId
            }
        });
    }

    cancel(): void {
        this.router.navigate(['/admin/edit-tournament', this.tournamentId], {
            queryParams: {
                tab: 'groups',
                expandedGroup: this.groupId
            }
        });
    }

    generateRandomTeamName(): void {
        // Get the next available team number for this group
        this.tournamentService.getAllTournamentTeams(this.tournamentId).subscribe(teamsArray => {
            const groupTeams = teamsArray.find(group => group.some(team => team.groupId === this.groupId)) || [];
            const nextTeamNumber = groupTeams.length + 1;
            const teamName = `Team ${nextTeamNumber}`;
            this.teamName = teamName;
            this.teamForm.patchValue({ name: teamName });
        });
    }

    onTeamNameInput(event: any): void {
        this.teamName = event.target.value;
    }

    onSearchKeydown(event: Event): void {
        if ((event as KeyboardEvent).key === 'Enter') {
            event.preventDefault();
            if (this.canSearch()) {
                this.searchPlayers();
            }
        }
    }

    focusSearchInput(): void {
        // Use a timeout to ensure the input is rendered and visible before focusing
        setTimeout(() => {
            if (this.searchInput?.nativeElement) {
                this.searchInput.nativeElement.focus();
            }
        }, 100);
    }

    @HostListener('document:keydown.enter', ['$event'])
    onEnterKey(event: KeyboardEvent): void {
        // Only handle Enter key if the search input is not focused (to avoid double-triggering)
        if (this.canSave() && document.activeElement !== this.searchInput?.nativeElement) {
            this.saveTeam();
        }
    }

    // TrackBy function for ngFor to prevent rendering issues
    trackByPlayerUid(index: number, player: UserProfile): string {
        return player.firebase_uid;
    }
} 