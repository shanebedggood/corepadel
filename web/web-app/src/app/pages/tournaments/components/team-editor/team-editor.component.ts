import { Component, Input, Output, EventEmitter, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, FormsModule, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { MultiSelectModule } from 'primeng/multiselect';
import { DialogModule } from 'primeng/dialog';
import { ToastModule } from 'primeng/toast';
import { MessageModule } from 'primeng/message';
import { TooltipModule } from 'primeng/tooltip';
import { RippleModule } from 'primeng/ripple';
import { MessageService } from 'primeng/api';
import { Observable, Subject, combineLatest } from 'rxjs';
import { map, catchError, of } from 'rxjs';

import { TournamentService, TournamentTeam, TournamentPlayer, TournamentParticipant } from '../../../../services/tournament.service';
import { FirebaseAuthService } from '../../../../services/firebase-auth.service';
import { UserProfile } from '../../../../models/user-profile';


export interface TeamEditorData {
    team?: TournamentTeam;
    groupId: string;
    tournamentId: string;
    maxPlayers?: number;
    participants?: TournamentParticipant[];
}

@Component({
    selector: 'app-team-editor',
    standalone: true,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        FormsModule,
        ButtonModule,
        InputTextModule,
        MultiSelectModule,
        DialogModule,
        ToastModule,
        MessageModule,
        TooltipModule,
        RippleModule
    ],
    providers: [MessageService],
    templateUrl: './team-editor.component.html',
    styleUrls: ['./team-editor.component.scss']
})
export class TeamEditorComponent implements OnInit, OnDestroy {
    @Input() set visible(value: boolean) {
        this._visible = value;

        // If the dialog is becoming visible and we have data, load the team data
        if (value && this._data) {
            setTimeout(() => this.loadTeamData(), 0);
        } else if (!value) {
            // If the dialog is closing, reset the form
            this.resetForm();
        }
    }
    get visible(): boolean {
        return this._visible;
    }
    private _visible: boolean = false;

    @Input() set data(value: TeamEditorData | null) {
        this._data = value;

        // If the dialog is visible and we have data, load the team data immediately
        if (this._visible && value) {
            setTimeout(() => this.loadTeamData(), 0);
        }
    }
    get data(): TeamEditorData | null {
        return this._data;
    }
    private _data: TeamEditorData | null = null;

    @Output() visibleChange = new EventEmitter<boolean>();
    @Output() teamSaved = new EventEmitter<TournamentTeam>();
    @Output() teamCancelled = new EventEmitter<void>();

    // Internal available players array
    availablePlayers: UserProfile[] = [];

    // Selected player to add (for the add player dropdown)
    selectedPlayerToAdd: string | null = null;

    // Track if we're in edit mode to handle player display differently
    private isEditMode = false;

    // Cache for current players to prevent unnecessary array recreation
    private _currentPlayersCache: UserProfile[] = [];
    private _lastPlayerUids: string[] = [];

    teamForm!: FormGroup;
    loading: boolean = false;
    saving: boolean = false;

    // Player search state (kept for compatibility but not used)
    playerSearchState = {
        loading: false,
        searchTerm: '',
        hasSearched: false
    };



    private destroy$ = new Subject<void>();

    constructor(
        private fb: FormBuilder,
        private tournamentService: TournamentService,
        private authService: FirebaseAuthService,
        private messageService: MessageService,
        private cdr: ChangeDetectorRef
    ) {
        this.initializeForm();
    }

    ngOnInit(): void {
        // Component initialization
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }

    private initializeForm(): void {
        this.teamForm = this.fb.group({
            name: ['', [Validators.required, Validators.minLength(2)]],
            players: [[], [Validators.required]]
        });
    }

    onVisibleChange(visible: boolean): void {
        this._visible = visible;
        this.visibleChange.emit(visible);
    }

    private loadTeamData(): void {
        if (!this.data) {
            return;
        }

        // Load available players from participants
        this.loadAvailablePlayersFromParticipants();

        if (this.data.team) {
            // Editing existing team
            const team = this.data.team;
            const playerUids = team.players?.map(p => p.uid) || [];

            // Ensure form is initialized
            if (!this.teamForm) {
                this.initializeForm();
            }

            // Patch the form with team data
            this.teamForm.patchValue({
                name: team.name,
                players: playerUids
            });


        } else {
            // Creating new team
            this.teamForm.patchValue({
                name: '',
                players: []
            });
        }
    }

    private loadAvailablePlayersFromParticipants(): void {
        if (!this.data?.participants) {
            this.availablePlayers = [];
            return;
        }

        let availablePlayers = this.data.participants.map(participant => ({
            firebase_uid: participant.uid,
            email: participant.email,
            display_name: participant.displayName || `${participant.firstName || ''} ${participant.lastName || ''}`.trim() || participant.email,
            first_name: participant.firstName || '',
            last_name: participant.lastName || '',
            username: participant.displayName || `${participant.firstName || ''} ${participant.lastName || ''}`.trim() || participant.email,
            roles: ['player'],
            email_verified: true,
            mobile: participant.mobile || '',
            rating: participant.rating || 1.0,
            profile_picture: undefined
        }));

        // If editing a team, ensure current team players are included in available players
        if (this.data.team && this.data.team.players) {
            const currentPlayerUids = this.data.team.players.map(p => p.uid);
            const availablePlayerUids = availablePlayers.map(p => p.firebase_uid);

            // Add team players that are not already in available players
            this.data.team.players.forEach(teamPlayer => {
                if (!availablePlayerUids.includes(teamPlayer.uid)) {
                    availablePlayers.push({
                        firebase_uid: teamPlayer.uid,
                        email: teamPlayer.email,
                        display_name: teamPlayer.displayName || `${teamPlayer.firstName || ''} ${teamPlayer.lastName || ''}`.trim() || teamPlayer.email,
                        first_name: teamPlayer.firstName || '',
                        last_name: teamPlayer.lastName || '',
                        username: teamPlayer.displayName || `${teamPlayer.firstName || ''} ${teamPlayer.lastName || ''}`.trim() || teamPlayer.email,
                        roles: ['player'],
                        email_verified: true,
                        mobile: teamPlayer.mobile || '',
                        rating: teamPlayer.rating || 1.0,
                        profile_picture: undefined
                    });
                }
            });

            // Check if any current team players are no longer in participants
            const removedPlayers = currentPlayerUids.filter(uid =>
                !this.data!.participants!.some(p => p.uid === uid)
            );

            if (removedPlayers.length > 0) {
                this.messageService.add({
                    severity: 'warn',
                    summary: 'Players Removed',
                    detail: `Some team players are no longer tournament participants and will be removed from the team.`
                });

                // Update the team data to remove players that are no longer participants
                this.data.team.players = this.data.team.players.filter(player =>
                    this.data!.participants!.some(p => p.uid === player.uid)
                );
            }
        }

        this.availablePlayers = availablePlayers;
        // Clear cache when available players change
        this._currentPlayersCache = [];
        this._lastPlayerUids = [];
    }

    private resetForm(): void {
        this.teamForm.reset();
        this.selectedPlayerToAdd = null;
        this.saving = false;
        // Clear cache when form is reset
        this._currentPlayersCache = [];
        this._lastPlayerUids = [];
    }

    generateRandomTeamName(): void {
        // Generate a simple sequential team name
        const teamName = `Team ${Math.floor(Math.random() * 1000) + 1}`;
        this.teamForm.patchValue({ name: teamName });
    }



    saveTeam(): void {
        if (!this.teamForm.valid || !this.data) {
            this.messageService.add({
                severity: 'error',
                summary: 'Validation Error',
                detail: 'Please fill in all required fields correctly'
            });
            return;
        }

        const formValue = this.teamForm.value;
        const selectedPlayerUids = formValue.players || [];

        if (!this.availablePlayers) {
            this.messageService.add({
                severity: 'error',
                summary: 'Error',
                detail: 'Available players not loaded. Please try again.'
            });
            return;
        }

        // Get the full player objects from the selected UIDs
        const teamPlayers: TournamentPlayer[] = selectedPlayerUids.map((uid: string) => {
            const player = this.availablePlayers.find(p => p.firebase_uid === uid);
            if (!player) {
                throw new Error(`Player with UID ${uid} not found`);
            }
            return {
                uid: player.firebase_uid,
                email: player.email,
                displayName: player.display_name || `${player.first_name || ''} ${player.last_name || ''}`.trim() || player.email,
                firstName: player.first_name,
                lastName: player.last_name
            };
        });

        this.saving = true;

        // Check if any player is already in another team (only for new players, not existing team members)
        const currentTeam = this.data.team;
        const newPlayerUids = currentTeam && currentTeam.players ?
            selectedPlayerUids.filter((uid: string) => !currentTeam.players!.some(p => p.uid === uid)) :
            selectedPlayerUids;

        if (newPlayerUids.length === 0) {
            // No new players, just save the team
            this.performTeamSave(teamPlayers, formValue);
            return;
        }

        // Check if new players are already in other teams
        let checkedPlayers = 0;
        let hasConflict = false;
        const subscriptions: any[] = [];

        for (const uid of newPlayerUids) {
            const player = teamPlayers.find(p => p.uid === uid);
            if (!player) continue;

            const subscription = this.tournamentService.isPlayerInTournament(this.data!.tournamentId, uid).subscribe({
                next: (isInTournament: boolean) => {
                    checkedPlayers++;

                    if (isInTournament) {
                        hasConflict = true;
                        this.messageService.add({
                            severity: 'error',
                            summary: 'Error',
                            detail: `${player.displayName} is already registered in another team`
                        });
                        this.saving = false;
                        // Unsubscribe all subscriptions
                        subscriptions.forEach(sub => sub.unsubscribe());
                        return;
                    }

                    // If all players have been checked and no conflicts, save the team
                    if (checkedPlayers === newPlayerUids.length && !hasConflict) {
                        this.performTeamSave(teamPlayers, formValue);
                        // Unsubscribe all subscriptions
                        subscriptions.forEach(sub => sub.unsubscribe());
                    }
                },
                error: (error: any) => {
                    console.error('Error checking player:', error);
                    this.messageService.add({
                        severity: 'error',
                        summary: 'Error',
                        detail: 'Failed to verify player availability'
                    });
                    this.saving = false;
                    // Unsubscribe all subscriptions
                    subscriptions.forEach(sub => sub.unsubscribe());
                }
            });
            subscriptions.push(subscription);
        }

        // If no new players to check, save immediately
        if (newPlayerUids.length === 0) {
            this.performTeamSave(teamPlayers, formValue);
        }
    }

    private performTeamSave(teamPlayers: TournamentPlayer[], formValue: any): void {
        if (!this.data) return;

        const teamData = {
            name: formValue.name,
            players: teamPlayers
        };

        if (this.data.team) {
            // Update existing team
            const subscription = (this.tournamentService as any).updateTournamentTeam(
                this.data.tournamentId,
                this.data.groupId,
                this.data.team.id!,
                teamData
            ).subscribe({
                next: (updatedTeam: TournamentTeam) => {
                    this.messageService.add({
                        severity: 'success',
                        summary: 'Success',
                        detail: 'Team updated successfully'
                    });
                    this.teamSaved.emit(updatedTeam);
                    this.onVisibleChange(false);
                    subscription.unsubscribe();
                },
                error: (error: any) => {
                    console.error('Error updating team:', error);
                    this.messageService.add({
                        severity: 'error',
                        summary: 'Error',
                        detail: 'Failed to update team'
                    });
                    this.saving = false;
                    subscription.unsubscribe();
                }
            });
        } else {
            // Create new team
            const subscription = (this.tournamentService as any).createTournamentTeam(
                this.data.tournamentId,
                this.data.groupId,
                teamData
            ).subscribe({
                next: (newTeam: TournamentTeam) => {
                    this.messageService.add({
                        severity: 'success',
                        summary: 'Success',
                        detail: 'Team created successfully'
                    });
                    this.teamSaved.emit(newTeam);
                    this.onVisibleChange(false);
                    subscription.unsubscribe();
                },
                error: (error: any) => {
                    console.error('Error creating team:', error);
                    this.messageService.add({
                        severity: 'error',
                        summary: 'Error',
                        detail: 'Failed to create team'
                    });
                    this.saving = false;
                    subscription.unsubscribe();
                }
            });
        }
    }

    cancel(): void {
        this.teamCancelled.emit();
        this.onVisibleChange(false);
    }



    getAvailablePlayersForSelection(): UserProfile[] {
        if (!this.availablePlayers) {
            return [];
        }

        // Return all available players (including current team players)
        // The add player logic will handle preventing duplicates
        return this.availablePlayers;
    }

    // Getter for available players to avoid repeated method calls
    get availablePlayersForSelection(): UserProfile[] {
        return this.availablePlayers || [];
    }

    get currentPlayers(): UserProfile[] {
        const playerUids = this.teamForm.get('players')?.value || [];

        if (!this.availablePlayers || this.availablePlayers.length === 0) {
            this._currentPlayersCache = [];
            this._lastPlayerUids = [];
            return [];
        }

        // Check if the player UIDs have changed
        const uidsChanged = this._lastPlayerUids.length !== playerUids.length ||
            !this._lastPlayerUids.every((uid, index) => uid === playerUids[index]);

        if (uidsChanged) {
            // Update cache only when necessary
            this._currentPlayersCache = this.availablePlayers.filter(player => 
                playerUids.includes(player.firebase_uid)
            );
            this._lastPlayerUids = [...playerUids];
        }

        return this._currentPlayersCache;
    }

    getCurrentPlayers(): UserProfile[] {
        return this.currentPlayers;
    }

    getCurrentPlayerCount(): number {
        return this.getCurrentPlayers().length;
    }

    isTeamFull(): boolean {
        const maxPlayers = this.data?.maxPlayers || 2; // Default to 2 players per team
        return this.getCurrentPlayerCount() >= maxPlayers;
    }

    trackByPlayerUid(index: number, player: UserProfile): string {
        return player.firebase_uid;
    }

    removePlayer(player: UserProfile): void {
        const currentPlayers = this.teamForm.get('players')?.value || [];
        const updatedPlayers = currentPlayers.filter((uid: string) => uid !== player.firebase_uid);
        this.teamForm.patchValue({ players: updatedPlayers });

        // Clear the selected player to add if it was the same player
        if (this.selectedPlayerToAdd === player.firebase_uid) {
            this.selectedPlayerToAdd = null;
        }
    }

    onPlayerSelected(event: any, multiselect: any): void {

        // Handle both single value and array values
        let selectedValue = event.value;
        if (Array.isArray(selectedValue) && selectedValue.length > 0) {
            selectedValue = selectedValue[0]; // Take the first item from the array
        }

        if (selectedValue) {
            this.selectedPlayerToAdd = selectedValue;
            this.addPlayer();
            // Close the dropdown after adding the player
            setTimeout(() => {
                multiselect.hide();
            }, 100);
        }
    }

    addPlayer(): void {
        if (!this.selectedPlayerToAdd) return;

        const currentPlayers = this.teamForm.get('players')?.value || [];

        if (currentPlayers.includes(this.selectedPlayerToAdd)) {
            this.messageService.add({
                severity: 'warn',
                summary: 'Player Already Added',
                detail: 'This player is already in the team.'
            });
            return;
        }

        const updatedPlayers = [...currentPlayers, this.selectedPlayerToAdd];

        // Update the form
        this.teamForm.patchValue({ players: updatedPlayers });

        // Mark the form control as dirty and touched
        this.teamForm.get('players')?.markAsDirty();
        this.teamForm.get('players')?.markAsTouched();

        // Clear the selection
        this.selectedPlayerToAdd = null;
    }

    get isEditing(): boolean {
        return !!(this.data?.team);
    }

    get dialogTitle(): string {
        return this.isEditing ? 'Edit Team' : 'Create Team';
    }

    get saveButtonText(): string {
        return this.isEditing ? 'Update Team' : 'Create Team';
    }
} 