import { Component, Input, Output, EventEmitter, OnInit, OnDestroy, ChangeDetectorRef, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { Observable, of, forkJoin } from 'rxjs';
import { map, switchMap, catchError } from 'rxjs/operators';

// PrimeNG imports
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { SelectModule } from 'primeng/select';
import { DialogModule } from 'primeng/dialog';
import { ConfirmationService } from 'primeng/api';
import { MessageService } from 'primeng/api';
import { TooltipModule } from 'primeng/tooltip';
import { TableModule } from 'primeng/table';
import { DatePickerModule } from 'primeng/datepicker';

// Services
import { Tournament, TournamentService, TournamentMatch, TournamentGroup, TournamentTeam, TournamentPlayer } from '../../../../../services/tournament.service';
import { MatchScoreDialogComponent } from '../shared/match-score-dialog/match-score-dialog.component';
import { VenueService, Venue } from '../../../../../services/venue.service';
import { MatchScoreDisplayComponent } from '../match-score-display/match-score-display.component';

interface MatchStats {
    total: number;
    scheduled: number;
    inProgress: number;
    completed: number;
    cancelled: number;
}

interface MatchGenerationStatus {
    success: boolean;
    message: string;
}

@Component({
    selector: 'app-tournament-matches',
    standalone: true,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        FormsModule,
        ButtonModule,
        InputTextModule,
        InputNumberModule,
        SelectModule,
        DatePickerModule,
        DialogModule,
        TooltipModule,
        SelectModule,
        TableModule,
        MatchScoreDisplayComponent,
        MatchScoreDialogComponent
    ],
    providers: [MessageService],
    templateUrl: './tournament-matches.component.html',
    styleUrls: ['./tournament-matches.component.scss']
})
export class TournamentMatchesComponent implements OnInit, OnDestroy, OnChanges {
    @Input() tournament: Tournament | undefined;
    @Input() groups: TournamentGroup[] = [];
    @Input() teams: { [groupId: string]: TournamentTeam[] } = {};
    @Input() matches: TournamentMatch[] = [];
    @Input() venues: Venue[] = [];

    @Output() matchesUpdated = new EventEmitter<void>();

    // Remove redundant data loading - now received from parent
    // matches: TournamentMatch[] = [];
    // teams: { [groupId: string]: TournamentTeam[] } = {};
    loading: boolean = false;
    generatingMatches: boolean = false;
    clearingMatches: boolean = false;
    matchGenerationStatus: MatchGenerationStatus | null = null;



    // Match editing
    editingMatch: TournamentMatch | null = null;
    showEditDialog: boolean = false;
    matchForm!: FormGroup;

    // Schedule editing
    showScheduleDialog: boolean = false;
    scheduleForm!: FormGroup;
    
    // Shared score dialog
    showScoreDialog: boolean = false;

    // Responsive view
    isMobileView: boolean = false;

    // Simple filters
    filterRound: string = '';
    filterGroup: string = '';
    filterVenue: string = '';
    filterStatus: string = '';
    filterDate: Date | null = null;





    constructor(
        private tournamentService: TournamentService,
        private fb: FormBuilder,
        private confirmationService: ConfirmationService,
        private messageService: MessageService,
        private cdr: ChangeDetectorRef
    ) {
        this.initializeForms();
    }

    ngOnInit(): void {
        // Check if mobile view
        this.checkMobileView();

        // Listen for window resize events
        window.addEventListener('resize', () => {
            this.checkMobileView();
        });
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes['groups'] && this.groups && this.groups.length > 0) {
            // Use teams data passed from parent instead of loading independently
            if (this.teams && Object.keys(this.teams).length > 0) {
                // Teams data is already available from parent
            }
        }

        if (changes['matches'] && this.matches) {
            // Matches data is already available from parent
        }
    }

    ngOnDestroy(): void {
        // Cleanup if needed
        window.removeEventListener('resize', () => {
            this.checkMobileView();
        });
    }

    private checkMobileView(): void {
        this.isMobileView = window.innerWidth < 1024; // Desktop breakpoint
        this.cdr.detectChanges();
    }

    private initializeForms(): void {
        this.matchForm = this.fb.group({
            team1Set1: [null, [Validators.min(0), Validators.max(7)]],
            team2Set1: [null, [Validators.min(0), Validators.max(7)]],
            team1Set2: [null, [Validators.min(0), Validators.max(7)]],
            team2Set2: [null, [Validators.min(0), Validators.max(7)]],
            team1Set3: [null, [Validators.min(0), Validators.max(7)]],
            team2Set3: [null, [Validators.min(0), Validators.max(7)]]
        });

        this.scheduleForm = this.fb.group({
            scheduledTime: [null]
        });

        // Add custom validators for score validation
        this.matchForm.valueChanges.subscribe(() => {
            this.validateScores();
        });
    }

    private validateScores(): void {
        const formValue = this.matchForm.value;
        const errors: string[] = [];

        // Check for valid set scores (must be 6 or 7, or 0 if not played)
        const sets = [
            { set: 1, team1: formValue.team1Set1, team2: formValue.team2Set1 },
            { set: 2, team1: formValue.team1Set2, team2: formValue.team2Set2 },
            { set: 3, team1: formValue.team1Set3, team2: formValue.team2Set3 }
        ];

        sets.forEach(({ set, team1, team2 }) => {
            if (team1 !== null && team2 !== null) {
                // Both scores entered
                if (team1 < 6 && team2 < 6) {
                    errors.push(`Set ${set}: At least one team must score 6 or more points`);
                }
                if (team1 === 6 && team2 === 6) {
                    errors.push(`Set ${set}: Cannot be a tie at 6-6. One team must win 7-6 or 8-6`);
                }
                if (team1 > 7 || team2 > 7) {
                    errors.push(`Set ${set}: Maximum score is 7 points`);
                }
                if (team1 === 7 && team2 === 7) {
                    errors.push(`Set ${set}: Cannot be a tie at 7-7`);
                }
            } else if ((team1 !== null && team2 === null) || (team1 === null && team2 !== null)) {
                // Only one score entered
                errors.push(`Set ${set}: Both teams must have scores or both must be empty`);
            }
        });

        // Check match result logic
        const completedSets = sets.filter(s => s.team1 !== null && s.team2 !== null);
        if (completedSets.length > 0) {
            const team1Wins = completedSets.filter(s => s.team1 > s.team2).length;
            const team2Wins = completedSets.filter(s => s.team2 > s.team1).length;

            if (completedSets.length === 2 && team1Wins === 1 && team2Wins === 1) {
                errors.push('Match requires a third set to determine the winner');
            }
        }

        // Update form validity
        if (errors.length > 0) {
            this.matchForm.setErrors({ scoreValidation: errors });
        } else {
            this.matchForm.setErrors(null);
        }
    }

    loadMatches(): void {
        if (!this.tournament?.id) return;

        this.loading = true;

        
        this.tournamentService.getAllTournamentMatches(this.tournament.id).pipe(
            map((matches: any) => {
                this.matches = matches as TournamentMatch[];
                this.loading = false;
                return matches;
            }),
            catchError(error => {
                console.error('Error loading matches:', error);
                this.messageService.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: 'Failed to load matches'
                });
                this.loading = false;
                return of([]);
            })
        ).subscribe();
    }

    loadAllTeams(): Observable<any> {
        if (!this.tournament?.id || !this.groups || this.groups.length === 0) {
    
            return of(null);
        }

        const teamObservables = this.groups.map(group =>
            this.tournamentService.getTournamentTeams(this.tournament!.id!, group.id!).pipe(
                map(teams => ({ groupId: group.id!, teams: teams })),
                catchError(error => {
                    console.error(`Error loading teams for group ${group.id}:`, error);
                    return of({ groupId: group.id!, teams: [] });
                })
            )
        );

        return forkJoin(teamObservables).pipe(
            map(groupWithTeamsArray => {
                const teamsMap: { [groupId: string]: TournamentTeam[] } = {};
                groupWithTeamsArray.forEach(item => {
                    teamsMap[item.groupId] = item.teams;
                });
                this.teams = teamsMap;
                return this.teams;
            })
        );
    }

    loadTeamsForGroup(groupId: string): Observable<TournamentTeam[]> {
        if (!this.teams) {
            this.teams = {};
        }
        return this.tournamentService.getTournamentTeams(this.tournament?.id!, groupId).pipe(
            map((teams: any) => {
                this.teams[groupId] = teams as TournamentTeam[];
                return teams as TournamentTeam[];
            }),
            catchError((error: any) => {
                console.error(`Error loading teams for group ${groupId}:`, error);
                return of([] as TournamentTeam[]);
            })
        );
    }

    // Match generation methods
    canGenerateMatches(): boolean {
        // Check if groups exist and tournament is configured
        const hasValidConfiguration = this.groups.length > 0 && this.tournament?.maxParticipants! > 0 && this.getNoOfGroups()! > 0;

        // Check if group stage matches have already been generated
        const hasExistingGroupMatches = this.matches.some(match => match.phase === 'group' || !match.phase);

        // Can generate if configuration is valid AND no group stage matches exist yet
        return hasValidConfiguration && !hasExistingGroupMatches;
    }

    generateAllMatches(): void {
        if (!this.canGenerateMatches()) {
            this.messageService.add({
                severity: 'warn',
                summary: 'Warning',
                detail: 'Cannot generate matches. Please ensure groups and teams are configured.'
            });
            return;
        }

        this.generatingMatches = true;
        this.matchGenerationStatus = null;

        this.tournamentService.generateAllGroupMatches(this.tournament?.id!).subscribe({
            next: (result: any) => {
                this.generatingMatches = false;
                const totalMatches = result.reduce((acc: number, groupMatches: any[]) => acc + groupMatches.length, 0);
                this.matchGenerationStatus = {
                    success: true,
                    message: `Successfully generated ${totalMatches} matches`
                };
                this.messageService.add({
                    severity: 'success',
                    summary: 'Success',
                    detail: 'Matches generated successfully!'
                });
                this.matchesUpdated.emit();
            },
            error: (error: any) => {
                this.generatingMatches = false;
                this.matchGenerationStatus = {
                    success: false,
                    message: error.message || 'Failed to generate matches'
                };
                this.messageService.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: error.message || 'Failed to generate matches'
                });
            }
        });
    }

    refreshMatches(): void {
        this.loadMatches();
        this.messageService.add({
            severity: 'info',
            summary: 'Info',
            detail: 'Matches refreshed'
        });
    }

    hasMatchesInDatabase(): boolean {
        // Check if there are any group stage matches in the database
        return this.matches.some(match => match.phase === 'group' || !match.phase);
    }

    private getNoOfGroups(): number | undefined {
        if (this.tournament?.tournamentType === 'ROUND_ROBIN') {
            return (this.tournament as any).noOfGroups;
        }
        return undefined;
    }

    clearAllMatches(): void {
        this.confirmationService.confirm({
            message: 'Are you sure you want to delete all matches? This action cannot be undone.',
            header: 'Clear All Matches',
            icon: 'pi pi-exclamation-triangle',
            accept: () => {
                this.clearingMatches = true;
                this.tournamentService.deleteAllTournamentMatches(this.tournament?.id!).subscribe({
                    next: () => {
                        this.clearingMatches = false;
                        this.messageService.add({
                            severity: 'success',
                            summary: 'Success',
                            detail: 'All matches cleared successfully!'
                        });
                        this.matchesUpdated.emit();
                    },
                    error: (error: any) => {
                        this.clearingMatches = false;
                        console.error('Error clearing matches:', error);
                        this.messageService.add({
                            severity: 'error',
                            summary: 'Error',
                            detail: error.message || 'Failed to clear matches'
                        });
                    }
                });
            }
        });
    }



    // Filtering methods
    getFilteredMatches(): TournamentMatch[] {
        // First filter out knockout matches - only show group stage matches
        let filtered = this.matches.filter(match => {
            // Only include matches that are in the group phase
            return match.phase === 'group' || !match.phase;
        });

        // Filter by round
        if (this.filterRound && this.filterRound.trim() !== '') {
            filtered = filtered.filter(match => {
                return match.round.toString().includes(this.filterRound);
            });
        }

        // Filter by group
        if (this.filterGroup && this.filterGroup.trim() !== '') {
            filtered = filtered.filter(match => {
                const groupName = this.getGroupName(match.groupId || '');
                return groupName.toLowerCase().includes(this.filterGroup.toLowerCase());
            });
        }

        // Filter by venue
        if (this.filterVenue && this.filterVenue.trim() !== '') {
            filtered = filtered.filter(match => {
                const venueName = this.getVenueName(match.venueId, match.groupId);
                return venueName.toLowerCase().includes(this.filterVenue.toLowerCase());
            });
        }

        // Filter by status
        if (this.filterStatus && this.filterStatus.trim() !== '') {
            filtered = filtered.filter(match => match.status === this.filterStatus);
        }

        // Filter by date
        if (this.filterDate) {
            const selected = this.filterDate instanceof Date ? this.filterDate : new Date(this.filterDate as any);
            const selectedYmd = selected.toISOString().split('T')[0];
            filtered = filtered.filter(match => {
                if (!match.scheduledTime) return false;
                const matchYmd = new Date(match.scheduledTime as any).toISOString().split('T')[0];
                return matchYmd === selectedYmd;
            });
        }

        // Sort by round first, then by group
        return filtered.sort((a, b) => {
            // First sort by round
            if (a.round !== b.round) {
                return a.round - b.round;
            }

            // Then sort by group name
            const groupA = this.getGroupName(a.groupId || '');
            const groupB = this.getGroupName(b.groupId || '');
            return groupA.localeCompare(groupB);
        });
    }

    clearFilters(): void {
        this.filterRound = '';
        this.filterGroup = '';
        this.filterVenue = '';
        this.filterStatus = '';
        this.filterDate = null;
    }

    // Match editing methods
    startEditMatch(event: any): void {
        const match = event.data || event;
        this.editingMatch = { ...match };
        this.showScoreDialog = true;
    }

    startEditSchedule(match: TournamentMatch, event: Event): void {
        event.stopPropagation(); // Prevent row click
        this.editingMatch = { ...match };

        let scheduledTime: Date | null = null;
        if (match.scheduledTime) {
            scheduledTime = new Date(match.scheduledTime as any);
        }

        this.scheduleForm.patchValue({
            scheduledTime: scheduledTime
        });

        this.showScheduleDialog = true;
    }

    cancelEditSchedule(): void {
        this.editingMatch = null;
        this.scheduleForm.reset();
        this.showScheduleDialog = false;
    }

    saveSchedule(): void {
        if (this.editingMatch) {
            const formValue = this.scheduleForm.value;

            // Convert Date to a date-time string to avoid timezone issues
            let scheduledTime: string | undefined = undefined;
            if (formValue.scheduledTime) {
                const date: Date = new Date(formValue.scheduledTime);
                scheduledTime = this.formatDateTimeOnly(date);
            }

            const matchData: any = {
                scheduledTime: scheduledTime
            };

            this.tournamentService.updateMatchScore(
                this.editingMatch.id!,
                matchData
            ).subscribe({
                next: () => {
                    this.messageService.add({
                        severity: 'success',
                        summary: 'Success',
                        detail: 'Match schedule updated successfully!'
                    });
                    this.editingMatch = null;
                    this.scheduleForm.reset();
                    this.showScheduleDialog = false;
                    this.loadMatches();
                    this.matchesUpdated.emit();
                },
                error: (error: any) => {
                    console.error('Error updating match schedule:', error);
                    this.messageService.add({
                        severity: 'error',
                        summary: 'Error',
                        detail: error.message || 'Failed to update match schedule'
                    });
                }
            });
        }
    }

    cancelEditMatch(): void {
        this.editingMatch = null;
        this.matchForm.reset();
        this.showEditDialog = false;
    }

    onScoreDialogSave(event: any): void {
        this.tournamentService.updateMatchScore(event.matchId, event.updates).subscribe({
            next: () => {
                this.messageService.add({
                    severity: 'success',
                    summary: 'Success',
                    detail: 'Match score updated successfully'
                });
                this.editingMatch = null;
                this.showScoreDialog = false;
                this.loadMatches();
                this.matchesUpdated.emit();
                this.cdr.detectChanges();
            },
            error: (error) => {
                this.messageService.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: 'Failed to update match score'
                });
            }
        });
    }

    onScoreDialogCancel(): void {
        this.editingMatch = null;
        this.showScoreDialog = false;
    }

    saveMatch(): void {
        if (this.matchForm.valid && this.editingMatch) {
            const formValue = this.matchForm.value;

            // Calculate winner based on scores
            const sets = [
                { team1: formValue.team1Set1, team2: formValue.team2Set1 },
                { team1: formValue.team1Set2, team2: formValue.team2Set2 },
                { team1: formValue.team1Set3, team2: formValue.team2Set3 }
            ];

            const completedSets = sets.filter(s => s.team1 !== null && s.team2 !== null);
            let winnerId: string | undefined = undefined;

            if (completedSets.length > 0) {
                const team1Wins = completedSets.filter(s => s.team1! > s.team2!).length;
                const team2Wins = completedSets.filter(s => s.team2! > s.team1!).length;

                if (team1Wins > team2Wins && team1Wins >= 2) {
                    winnerId = this.editingMatch.team1Id || undefined;
                } else if (team2Wins > team1Wins && team2Wins >= 2) {
                    winnerId = this.editingMatch.team2Id || undefined;
                }
            }

            const matchData = {
                team1Set1: formValue.team1Set1,
                team2Set1: formValue.team2Set1,
                team1Set2: formValue.team1Set2,
                team2Set2: formValue.team2Set2,
                team1Set3: formValue.team1Set3,
                team2Set3: formValue.team2Set3,
                winnerId: winnerId
            };

            this.tournamentService.updateMatchScore(
                this.editingMatch.id!,
                matchData
            ).subscribe({
                next: () => {
                    this.messageService.add({
                        severity: 'success',
                        summary: 'Success',
                        detail: 'Match updated successfully!'
                    });
                    this.editingMatch = null;
                    this.matchForm.reset();
                    this.showEditDialog = false;
                    this.loadMatches();
                    this.matchesUpdated.emit();
                },
                error: (error: any) => {
                    console.error('Error updating match:', error);
                    this.messageService.add({
                        severity: 'error',
                        summary: 'Error',
                        detail: error.message || 'Failed to update match'
                    });
                }
            });
        }
    }

    deleteMatch(match: TournamentMatch): void {
        this.confirmationService.confirm({
            message: `Are you sure you want to delete this match?`,
            header: 'Delete Match',
            icon: 'pi pi-exclamation-triangle',
            accept: () => {
                this.tournamentService.deleteTournamentMatch(this.tournament?.id!, match.groupId || '', match.id!).subscribe({
                    next: () => {
                        this.messageService.add({
                            severity: 'success',
                            summary: 'Success',
                            detail: 'Match deleted successfully!'
                        });
                        this.loadMatches();
                        this.matchesUpdated.emit();
                    },
                    error: (error: any) => {
                        console.error('Error deleting match:', error);
                        this.messageService.add({
                            severity: 'error',
                            summary: 'Error',
                            detail: error.message || 'Failed to delete match'
                        });
                    }
                });
            }
        });
    }

    // Utility methods
    getTeamName(teamId: string | undefined): string {
        if (!teamId) return 'Unknown Team';

        for (const groupId in this.teams) {
            const team = this.teams[groupId].find(t => t.id === teamId);
            if (team) {
                return team.name;
            }
        }
        return 'Unknown Team';
    }

    getTeamPlayerNames(teamId: string | undefined): string {
        if (!teamId) return '';

        for (const groupId in this.teams) {
            const team = this.teams[groupId].find(t => t.id === teamId);
            if (team && team.players && team.players.length > 0) {
                return team.players.map(player => player.displayName || player.email || 'Unknown Player').join(', ');
            }
        }
        return '';
    }

    getGroupName(groupId: string): string {
        const group = this.groups.find(g => g.id === groupId);
        return group ? group.name : 'Unknown Group';
    }

    getVenueName(venueId?: string, groupId?: string): string {
        // 1. Try match's venueId
        if (venueId) {
            const venue = this.venues.find(v => v.id === venueId);
            if (venue) return venue.name;
        }
        // 2. Try group's venueId
        if (groupId) {
            const group = this.groups.find(g => g.id === groupId);
            if (group && group.venueId) {
                const venue = this.venues.find(v => v.id === group.venueId);
                if (venue) return venue.name;
            }
        }
        // 3. Try tournament's venueId
        if (this.tournament && (this.tournament as any).venueId) {
            const venue = this.venues.find(v => v.id === (this.tournament as any).venueId);
            if (venue) return venue.name;
        }
        // 4. Fallback
        return 'No venue';
    }

    getStatusLabel(status: string): string {
        switch (status) {
            case 'scheduled':
                return 'Scheduled';
            case 'in_progress':
                return 'In Progress';
            case 'completed':
                return 'Completed';
            case 'cancelled':
                return 'Cancelled';
            default:
                return status;
        }
    }

    getStatusClass(status: string): string {
        switch (status) {
            case 'scheduled':
                return 'status-scheduled';
            case 'in_progress':
                return 'status-in-progress';
            case 'completed':
                return 'status-completed';
            case 'cancelled':
                return 'status-cancelled';
            default:
                return '';
        }
    }

    getStatusBadgeClass(status: string): string {
        switch (status) {
            case 'scheduled':
                return 'bg-blue-100 text-blue-800';
            case 'in_progress':
                return 'bg-yellow-100 text-yellow-800';
            case 'completed':
                return 'bg-green-100 text-green-800';
            case 'cancelled':
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    }

    formatDate(date: Date | string | undefined): string {
        if (!date) return 'Not scheduled';
        const dateObj = new Date(date);
        return dateObj.toLocaleDateString() + ' ' + dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }

    getScoreDisplay(match: TournamentMatch): string {
        if (match.team1Score === undefined || match.team2Score === undefined) return 'No score';
        return `${match.team1Score} - ${match.team2Score}`;
    }

    getMatchResult(match: TournamentMatch): { winner: string | null; sets: string[]; isComplete: boolean } {
        const sets = [
            { set: 1, team1: match.team1Set1, team2: match.team2Set1 },
            { set: 2, team1: match.team1Set2, team2: match.team2Set2 },
            { set: 3, team1: match.team1Set3, team2: match.team2Set3 }
        ];

        const completedSets = sets.filter(s => s.team1 !== null && s.team2 !== null);
        const setResults = completedSets.map(s => `${s.team1!}-${s.team2!}`);

        let winner = null;
        let isComplete = false;

        if (completedSets.length > 0) {
            const team1Wins = completedSets.filter(s => s.team1! > s.team2!).length;
            const team2Wins = completedSets.filter(s => s.team2! > s.team1!).length;

            if (team1Wins > team2Wins) {
                winner = this.getTeamName(match.team1Id);
                isComplete = team1Wins >= 2;
            } else if (team2Wins > team1Wins) {
                winner = this.getTeamName(match.team2Id);
                isComplete = team2Wins >= 2;
            }
        }

        return { winner, sets: setResults, isComplete };
    }

    getScoreSummary(match: TournamentMatch): string {
        const result = this.getMatchResult(match);

        if (result.sets.length === 0) {
            return 'No score entered';
        }

        return result.sets.join(', ');
    }

    getScoreNumbers(match: TournamentMatch): string {
        const result = this.getMatchResult(match);

        if (result.sets.length === 0) {
            return '';
        }

        return result.sets.join(', ');
    }

    getWinnerTeamId(match: TournamentMatch): string | undefined {
        // Use the match.winnerId property directly, which is consistent with isWinner method
        return match.winnerId;
    }

    getTeam1Score(match: TournamentMatch): string {
        const sets = [
            { team1: match.team1Set1, team2: match.team2Set1 },
            { team1: match.team1Set2, team2: match.team2Set2 },
            { team1: match.team1Set3, team2: match.team2Set3 }
        ];

        const completedSets = sets.filter(s =>
            s.team1 !== null && s.team2 !== null &&
            !(s.team1 === 0 && s.team2 === 0)
        );
        return completedSets.map(s => s.team1).join(' ');
    }

    getTeam2Score(match: TournamentMatch): string {
        const sets = [
            { team1: match.team1Set1, team2: match.team2Set1 },
            { team1: match.team1Set2, team2: match.team2Set2 },
            { team1: match.team1Set3, team2: match.team2Set3 }
        ];

        const completedSets = sets.filter(s =>
            s.team1 !== null && s.team2 !== null &&
            !(s.team1 === 0 && s.team2 === 0)
        );
        return completedSets.map(s => s.team2).join(' ');
    }

    getSet1Score(match: TournamentMatch): string {
        if (match.team1Set1 !== null && match.team2Set1 !== null &&
            !(match.team1Set1 === 0 && match.team2Set1 === 0)) {
            return `${match.team1Set1} ${match.team2Set1}`;
        }
        return '';
    }

    getSet2Score(match: TournamentMatch): string {
        if (match.team1Set2 !== null && match.team2Set2 !== null &&
            !(match.team1Set2 === 0 && match.team2Set2 === 0)) {
            return `${match.team1Set2} ${match.team2Set2}`;
        }
        return '';
    }

    getSet3Score(match: TournamentMatch): string {
        if (match.team1Set3 !== null && match.team2Set3 !== null &&
            !(match.team1Set3 === 0 && match.team2Set3 === 0)) {
            return `${match.team1Set3} ${match.team2Set3}`;
        }
        return '';
    }

    getFormScoreSummary(): string {
        if (!this.matchForm) return '';

        const formValue = this.matchForm.value;
        const sets = [
            { set: 1, team1: formValue.team1Set1, team2: formValue.team2Set1 },
            { set: 2, team1: formValue.team1Set2, team2: formValue.team2Set2 },
            { set: 3, team1: formValue.team1Set3, team2: formValue.team2Set3 }
        ];

        const completedSets = sets.filter(s => s.team1 !== null && s.team2 !== null);
        const setResults = completedSets.map(s => `${s.team1}-${s.team2}`);

        if (setResults.length === 0) {
            return '';
        }

        const team1Wins = completedSets.filter(s => s.team1! > s.team2!).length;
        const team2Wins = completedSets.filter(s => s.team2! > s.team1!).length;

        if (team1Wins > team2Wins && team1Wins >= 2) {
            return `${this.getTeamName(this.editingMatch?.team1Id)} wins ${setResults.join(', ')}`;
        } else if (team2Wins > team1Wins && team2Wins >= 2) {
            return `${this.getTeamName(this.editingMatch?.team2Id)} wins ${setResults.join(', ')}`;
        }

        return `In progress: ${setResults.join(', ')}`;
    }

    getFormWinner(): string | null {
        if (!this.matchForm || !this.editingMatch) return null;

        const formValue = this.matchForm.value;
        const sets = [
            { set: 1, team1: formValue.team1Set1, team2: formValue.team2Set1 },
            { set: 2, team1: formValue.team1Set2, team2: formValue.team2Set2 },
            { set: 3, team1: formValue.team1Set3, team2: formValue.team2Set3 }
        ];

        const completedSets = sets.filter(s => s.team1 !== null && s.team1 !== undefined && s.team2 !== null && s.team2 !== undefined);
        
        if (completedSets.length === 0) {
            return null;
        }

        const team1Wins = completedSets.filter(s => s.team1! > s.team2!).length;
        const team2Wins = completedSets.filter(s => s.team2! > s.team1!).length;

        if (team1Wins > team2Wins && team1Wins >= 2) {
            return this.getTeamName(this.editingMatch.team1Id);
        } else if (team2Wins > team1Wins && team2Wins >= 2) {
            return this.getTeamName(this.editingMatch.team2Id);
        }

        return null; // No winner yet
    }

    get teamsLoaded(): boolean {
        return Object.keys(this.teams).length > 0;
    }

    // New methods for card-based layout
    getMatchesByRound(): { round: number; matches: TournamentMatch[] }[] {
        const filteredMatches = this.getFilteredMatches();
        const matchesByRound: { [round: number]: TournamentMatch[] } = {};

        filteredMatches.forEach(match => {
            if (!matchesByRound[match.round]) {
                matchesByRound[match.round] = [];
            }
            matchesByRound[match.round].push(match);
        });

        return Object.keys(matchesByRound).map(round => ({
            round: parseInt(round),
            matches: matchesByRound[parseInt(round)].sort((a, b) => {
                // Sort matches by group name, then by team names
                const groupA = this.getGroupName(a.groupId || '');
                const groupB = this.getGroupName(b.groupId || '');

                if (groupA !== groupB) {
                    return groupA.localeCompare(groupB);
                }

                // If same group, sort by team names
                const team1A = this.getTeamName(a.team1Id);
                const team1B = this.getTeamName(b.team1Id);
                return team1A.localeCompare(team1B);
            })
        })).sort((a, b) => a.round - b.round);
    }

    getMatchCardClass(match: TournamentMatch): string {
        switch (match.status) {
            case 'completed':
                return 'bg-green-50 border-green-200';
            case 'in_progress':
                return 'bg-yellow-50 border-yellow-200';
            case 'cancelled':
                return 'bg-red-50 border-red-200';
            default:
                return '';
        }
    }

    getMatchRowClass(match: TournamentMatch): string {
        switch (match.status) {
            case 'completed':
                return 'bg-green-50 hover:bg-green-100';
            case 'in_progress':
                return 'bg-yellow-50 hover:bg-yellow-100';
            case 'cancelled':
                return 'bg-red-50 hover:bg-red-100';
            default:
                return '';
        }
    }

    isWinner(match: TournamentMatch, teamId: string | undefined): boolean {
        return match.winnerId === teamId;
    }

    getAllTeams(): TournamentTeam[] {
        const allTeams: TournamentTeam[] = [];
        Object.values(this.teams).forEach(groupTeams => {
            allTeams.push(...groupTeams);
        });
        return allTeams;
    }

    getAllMatchesSorted(): TournamentMatch[] {
        const filteredMatches = this.getFilteredMatches();
        
        return filteredMatches.sort((a, b) => {
            // First sort by round
            if (a.round !== b.round) {
                return a.round - b.round;
            }

            // Then sort by group name
            const groupA = this.getGroupName(a.groupId || '');
            const groupB = this.getGroupName(b.groupId || '');

            if (groupA !== groupB) {
                return groupA.localeCompare(groupB);
            }

            // Finally sort by team names
            const team1A = this.getTeamName(a.team1Id);
            const team1B = this.getTeamName(b.team1Id);
            return team1A.localeCompare(team1B);
        });
    }

    getMatchStats(): { total: number; scheduled: number; inProgress: number; completed: number; cancelled: number } {
        const matches = this.getFilteredMatches();
        const now = new Date();
        const matchDuration = 90; // 90 minutes match duration

        return {
            total: matches.length,
            scheduled: matches.filter(m => {
                // A match is scheduled if it has a scheduled time in the future and status is scheduled
                if (m.status !== 'scheduled') return false;
                if (!m.scheduledTime) return true; // If no scheduled time, consider it scheduled

                let scheduledTime: Date | null = null;
                if (m.scheduledTime instanceof Date) {
                    scheduledTime = m.scheduledTime;
                } else if (m.scheduledTime && typeof (m.scheduledTime as any).toDate === 'function') {
                    scheduledTime = (m.scheduledTime as any).toDate();
                }

                return scheduledTime ? now < scheduledTime : true;
            }).length,
            inProgress: matches.filter(m => {
                // A match is in progress if:
                // 1. Status is explicitly 'in_progress', OR
                // 2. Status is 'scheduled' and current time is within the match window (scheduled time to scheduled time + 90 mins)
                if (m.status === 'in_progress') return true;
                if (m.status === 'scheduled' && m.scheduledTime) {
                    let scheduledTime: Date | null = null;
                    if (m.scheduledTime instanceof Date) {
                        scheduledTime = m.scheduledTime;
                    } else if (m.scheduledTime && typeof (m.scheduledTime as any).toDate === 'function') {
                        scheduledTime = (m.scheduledTime as any).toDate();
                    }

                    if (scheduledTime) {
                        const matchEndTime = new Date(scheduledTime.getTime() + (matchDuration * 60 * 1000));
                        return now >= scheduledTime && now <= matchEndTime;
                    }
                }
                return false;
            }).length,
            completed: matches.filter(m => {
                // A match is completed if:
                // 1. Status is explicitly 'completed', OR
                // 2. Has scores entered (indicating the match was played), OR
                // 3. Status is 'scheduled' and current time is past the match window (scheduled time + 90 mins)
                if (m.status === 'completed') return true;
                
                // Check if match has scores entered
                const hasScores = (m.team1Set1 !== null && m.team1Set1 !== undefined && m.team2Set1 !== null && m.team2Set1 !== undefined) ||
                                 (m.team1Set2 !== null && m.team1Set2 !== undefined && m.team2Set2 !== null && m.team2Set2 !== undefined) ||
                                 (m.team1Set3 !== null && m.team1Set3 !== undefined && m.team2Set3 !== null && m.team2Set3 !== undefined);
                if (hasScores) return true;
                
                if (m.status === 'scheduled' && m.scheduledTime) {
                    let scheduledTime: Date | null = null;
                    if (m.scheduledTime instanceof Date) {
                        scheduledTime = m.scheduledTime;
                    } else if (m.scheduledTime && typeof (m.scheduledTime as any).toDate === 'function') {
                        scheduledTime = (m.scheduledTime as any).toDate();
                    }

                    if (scheduledTime) {
                        const matchEndTime = new Date(scheduledTime.getTime() + (matchDuration * 60 * 1000));
                        return now > matchEndTime;
                    }
                }
                return false;
            }).length,
            cancelled: matches.filter(m => m.status === 'cancelled').length
        };
    }

    /**
     * Format a Date object to YYYY-MM-DDTHH:mm string to avoid timezone issues
     */
    private formatDateTimeOnly(date: Date): string {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        return `${year}-${month}-${day}T${hours}:${minutes}`;
    }

} 