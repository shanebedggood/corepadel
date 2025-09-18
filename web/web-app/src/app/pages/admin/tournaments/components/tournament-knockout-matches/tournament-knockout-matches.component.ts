import { CommonModule } from '@angular/common';
import { Component, Input, OnInit, OnChanges, SimpleChanges, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';

// PrimeNG Modules
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { TooltipModule } from 'primeng/tooltip';
import { MessageModule } from 'primeng/message';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { DatePickerModule } from 'primeng/datepicker';

// Services
import { TournamentService, Tournament, TournamentMatch, TournamentTeam, TournamentGroup } from '../../../../../services/tournament.service';
import { VenueService, Venue } from '../../../../../services/venue.service';

// Components
import { MatchScoreDisplayComponent } from '../match-score-display/match-score-display.component';

@Component({
    selector: 'app-tournament-knockout-matches',
    standalone: true,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        FormsModule,
        ButtonModule,
        TableModule,
        DialogModule,
        InputTextModule,
        TooltipModule,
        MessageModule,
        ToastModule,
        DatePickerModule,
        MatchScoreDisplayComponent
    ],
    templateUrl: './tournament-knockout-matches.component.html',
    styleUrls: ['./tournament-knockout-matches.component.scss']
})
export class TournamentKnockoutMatchesComponent implements OnInit, OnChanges, OnDestroy {
    @Input() tournament: Tournament | null = null;
    @Input() groups: TournamentGroup[] = [];
    @Input() teams: { [groupId: string]: TournamentTeam[] } = {};
    @Input() venues: Venue[] = [];
    @Input() matches: TournamentMatch[] = []; // Input for group stage matches

    knockoutMatches: TournamentMatch[] = [];
    loading: boolean = false;
    error: string | null = null;
    generatingBracket: boolean = false;
    generatingNextRound: boolean = false;

    // Edit match dialog
    showEditDialog: boolean = false;
    editingMatch: TournamentMatch | null = null;
    matchForm: FormGroup;

    // Schedule edit dialog
    showScheduleDialog: boolean = false;
    scheduleForm: FormGroup;

    // Filters
    filterPhase: string = '';
    filterStatus: string = '';
    filterDate: Date | null = null;

    // Mobile view detection
    isMobileView: boolean = false;

    private destroy$ = new Subject<void>();

    constructor(
        private tournamentService: TournamentService,
        private venueService: VenueService,
        private fb: FormBuilder,
        private messageService: MessageService
    ) {
        this.matchForm = this.fb.group({
            team1Set1: [null, [Validators.min(0), Validators.max(7)]],
            team1Set2: [null, [Validators.min(0), Validators.max(7)]],
            team1Set3: [null, [Validators.min(0), Validators.max(7)]],
            team2Set1: [null, [Validators.min(0), Validators.max(7)]],
            team2Set2: [null, [Validators.min(0), Validators.max(7)]],
            team2Set3: [null, [Validators.min(0), Validators.max(7)]]
        }, { validators: this.scoreValidation });

        this.scheduleForm = this.fb.group({
            scheduledTime: ['']
        });

        this.checkMobileView();
        window.addEventListener('resize', () => this.checkMobileView());
    }

    ngOnInit(): void {
        if (this.tournament?.id) {
            this.loadKnockoutMatches();
        }
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes['tournament'] && this.tournament?.id) {
            this.loadKnockoutMatches();
        }
        // React to changes in matches to update knockout bracket generation logic
        if (changes['matches']) {
            // The canGenerateKnockoutBracket() method will now work correctly
            // since getAllGroupMatches() will return the actual group matches
        }
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
        window.removeEventListener('resize', () => this.checkMobileView());
    }

    private checkMobileView(): void {
        this.isMobileView = window.innerWidth < 768;
    }

    loadKnockoutMatches(): void {
        if (!this.tournament?.id) return;

        this.loading = true;
        this.error = null;

        this.tournamentService.getKnockoutMatches(this.tournament.id)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (matches) => {
                    this.knockoutMatches = matches;
                    this.loading = false;
                },
                error: (error) => {
                    console.error('Error loading knockout matches:', error);
                    this.error = 'Failed to load knockout matches';
                    this.loading = false;
                }
            });
    }

    generateKnockoutBracket(): void {
        if (!this.tournament?.id) return;

        this.generatingBracket = true;
        this.tournamentService.generateKnockoutBracket(this.tournament.id)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (response) => {
                    this.messageService.add({
                        severity: 'success',
                        summary: 'Success',
                        detail: 'Knockout bracket generated successfully'
                    });
                    this.loadKnockoutMatches();
                    this.generatingBracket = false;
                },
                error: (error) => {
                    console.error('Error generating knockout bracket:', error);
                    this.messageService.add({
                        severity: 'error',
                        summary: 'Error',
                        detail: 'Failed to generate knockout bracket'
                    });
                    this.generatingBracket = false;
                }
            });
    }

    generateNextRound(): void {
        if (!this.tournament?.id) return;

        this.generatingNextRound = true;
        this.tournamentService.generateNextKnockoutRound(this.tournament.id)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (response) => {
                    this.messageService.add({
                        severity: 'success',
                        summary: 'Success',
                        detail: 'Next round generated successfully'
                    });
                    this.loadKnockoutMatches();
                    this.generatingNextRound = false;
                },
                error: (error) => {
                    console.error('Error generating next round:', error);
                    this.messageService.add({
                        severity: 'error',
                        summary: 'Error',
                        detail: 'Failed to generate next round'
                    });
                    this.generatingNextRound = false;
                }
            });
    }

    canGenerateKnockoutBracket(): boolean {
        if (!this.tournament?.id) return false;
        
        // Check if all group matches are completed
        const allGroupMatches = this.getAllGroupMatches();
        if (allGroupMatches.length === 0) return false;
        
        const allCompleted = allGroupMatches.every(match => match.status === 'completed');
        return allCompleted && this.knockoutMatches.length === 0;
    }

    canGenerateNextRound(): boolean {
        if (!this.tournament?.id || this.knockoutMatches.length === 0) return false;
        
        // Find the highest round
        const maxRound = Math.max(...this.knockoutMatches.map(m => m.round));
        
        // Check if all matches in the highest round are completed
        const currentRoundMatches = this.knockoutMatches.filter(m => m.round === maxRound);
        const allCompleted = currentRoundMatches.every(match => match.status === 'completed');
        
        // Only allow if there are at least 2 winners and not already at the final
        return allCompleted && currentRoundMatches.length >= 2;
    }

    getCurrentRound(): number {
        if (this.knockoutMatches.length === 0) return 0;
        return Math.max(...this.knockoutMatches.map(m => m.round));
    }

    getAllGroupMatches(): TournamentMatch[] {
        // Filter to only include group stage matches
        return this.matches.filter(match => match.phase === 'group' || !match.phase);
    }

    getCompletedGroupMatchesCount(): number {
        return this.getAllGroupMatches().filter(match => match.status === 'completed').length;
    }

    getFilteredMatches(): TournamentMatch[] {
        return this.knockoutMatches.filter(match => {
            const phaseMatch = !this.filterPhase || match.phase.toLowerCase().includes(this.filterPhase.toLowerCase());
            const statusMatch = !this.filterStatus || match.status === this.filterStatus;
            const dateMatch = !this.filterDate || (match.scheduledTime && (() => {
                const selected = this.filterDate as Date;
                const selectedYmd = new Date(selected as any).toISOString().split('T')[0];
                const matchYmd = new Date(match.scheduledTime as any).toISOString().split('T')[0];
                return selectedYmd === matchYmd;
            })());
            return phaseMatch && statusMatch && dateMatch;
        });
    }

    clearFilters(): void {
        this.filterPhase = '';
        this.filterStatus = '';
        this.filterDate = null;
    }

    getMatchStats() {
        const total = this.knockoutMatches.length;
        const scheduled = this.knockoutMatches.filter(m => m.status === 'scheduled').length;
        const inProgress = this.knockoutMatches.filter(m => m.status === 'in_progress').length;
        const completed = this.knockoutMatches.filter(m => m.status === 'completed').length;
        const cancelled = this.knockoutMatches.filter(m => m.status === 'cancelled').length;

        return { total, scheduled, inProgress, completed, cancelled };
    }

    getTeamName(teamId: string): string {
        for (const groupTeams of Object.values(this.teams)) {
            const team = groupTeams.find(t => t.id === teamId);
            if (team) {
                return team.name || `Team ${team.id}`;
            }
        }
        return `Team ${teamId}`;
    }

    getTeamPlayerNames(teamId: string): string {
        for (const groupTeams of Object.values(this.teams)) {
            const team = groupTeams.find(t => t.id === teamId);
            if (team && team.players && team.players.length > 0) {
                return team.players.map(p => p.displayName || `${p.firstName || ''} ${p.lastName || ''}`.trim() || p.email || 'Unknown Player').join(', ');
            }
        }
        return '';
    }

    getVenueName(venueId: string | null, groupId: string | null): string {
        if (venueId) {
            const venue = this.venues.find(v => v.id === venueId);
            return venue ? venue.name : 'Unknown Venue';
        }
        return 'Not assigned';
    }

    getPhaseTitle(phase: string): string {
        switch (phase) {
            case 'quarterfinal':
                return 'Quarterfinals';
            case 'semifinal':
                return 'Semifinals';
            case 'final':
                return 'Final';
            default:
                if (phase.startsWith('round_')) {
                    const roundNum = phase.split('_')[1];
                    return `Round ${roundNum}`;
                }
                return phase.charAt(0).toUpperCase() + phase.slice(1);
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

    getStatusLabel(status: string): string {
        return status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
    }

    getMatchRowClass(match: TournamentMatch): string {
        if (match.status === 'completed') {
            return 'bg-green-50';
        } else if (match.status === 'in_progress') {
            return 'bg-yellow-50';
        } else if (match.status === 'cancelled') {
            return 'bg-red-50';
        }
        return '';
    }

    getMatchCardClass(match: TournamentMatch): string {
        if (match.status === 'completed') {
            return 'border-green-200 bg-green-50';
        } else if (match.status === 'in_progress') {
            return 'border-yellow-200 bg-yellow-50';
        } else if (match.status === 'cancelled') {
            return 'border-red-200 bg-red-50';
        }
        return '';
    }

    isWinner(match: TournamentMatch, teamId: string): boolean {
        if (match.status !== 'completed') return false;
        const team1Score = match.team1Score ?? 0;
        const team2Score = match.team2Score ?? 0;
        return ((teamId === match.team1Id && team1Score > team2Score) ||
                (teamId === match.team2Id && team2Score > team1Score));
    }

    formatDate(dateString: string | Date): string {
        const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
        return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }

    startEditMatch(event: any): void {
        const match = event.data || event;
        this.editingMatch = match;
        this.matchForm.patchValue({
            team1Set1: match.team1Set1,
            team1Set2: match.team1Set2,
            team1Set3: match.team1Set3,
            team2Set1: match.team2Set1,
            team2Set2: match.team2Set2,
            team2Set3: match.team2Set3
        });
        this.showEditDialog = true;
    }

    startEditSchedule(match: TournamentMatch, event: Event): void {
        event.stopPropagation();
        this.editingMatch = match;
        this.scheduleForm.patchValue({
            scheduledTime: match.scheduledTime ? new Date(match.scheduledTime).toISOString().slice(0, 16) : ''
        });
        this.showScheduleDialog = true;
    }

    saveMatch(): void {
        if (!this.editingMatch || !this.matchForm.valid) return;

        const formValue = this.matchForm.value;
        const updatedMatch: TournamentMatch = {
            ...this.editingMatch,
            team1Set1: formValue.team1Set1,
            team1Set2: formValue.team1Set2,
            team1Set3: formValue.team1Set3,
            team2Set1: formValue.team2Set1,
            team2Set2: formValue.team2Set2,
            team2Set3: formValue.team2Set3,
            team1Score: this.calculateTotalScore(formValue.team1Set1, formValue.team1Set2, formValue.team1Set3),
            team2Score: this.calculateTotalScore(formValue.team2Set1, formValue.team2Set2, formValue.team2Set3),
            status: this.determineMatchStatus(formValue) as 'scheduled' | 'in_progress' | 'completed' | 'cancelled'
        };

        this.tournamentService.updateMatchScore(updatedMatch.id || '', updatedMatch)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: () => {
                    this.messageService.add({
                        severity: 'success',
                        summary: 'Success',
                        detail: 'Match score updated successfully'
                    });
                    this.cancelEditMatch();
                    this.loadKnockoutMatches();
                },
                error: (error: any) => {
                    console.error('Error updating match:', error);
                    this.messageService.add({
                        severity: 'error',
                        summary: 'Error',
                        detail: 'Failed to update match score'
                    });
                }
            });
    }

    saveSchedule(): void {
        if (!this.editingMatch || !this.scheduleForm.valid) return;

        const formValue = this.scheduleForm.value;
        const updates = {
            scheduledTime: formValue.scheduledTime ? new Date(formValue.scheduledTime) : undefined
        };

        this.tournamentService.updateMatchScore(this.editingMatch.id || '', updates)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: () => {
                    this.messageService.add({
                        severity: 'success',
                        summary: 'Success',
                        detail: 'Match schedule updated successfully'
                    });
                    this.cancelEditSchedule();
                    this.loadKnockoutMatches();
                },
                error: (error: any) => {
                    console.error('Error updating schedule:', error);
                    this.messageService.add({
                        severity: 'error',
                        summary: 'Error',
                        detail: 'Failed to update match schedule'
                    });
                }
            });
    }

    cancelEditMatch(): void {
        this.showEditDialog = false;
        this.editingMatch = null;
        this.matchForm.reset();
    }

    cancelEditSchedule(): void {
        this.showScheduleDialog = false;
        this.editingMatch = null;
        this.scheduleForm.reset();
    }

    private calculateTotalScore(set1: number | null, set2: number | null, set3: number | null): number {
        const scores = [set1, set2, set3].filter(score => score !== null && score !== undefined) as number[];
        return scores.reduce((total, score) => total + score, 0);
    }

    private determineMatchStatus(formValue: any): string {
        const hasScores = [formValue.team1Set1, formValue.team1Set2, formValue.team1Set3,
                          formValue.team2Set1, formValue.team2Set2, formValue.team2Set3]
                          .some(score => score !== null && score !== undefined);
        
        return hasScores ? 'completed' : 'scheduled';
    }

    private scoreValidation(form: FormGroup) {
        const team1Set1 = form.get('team1Set1')?.value;
        const team1Set2 = form.get('team1Set2')?.value;
        const team1Set3 = form.get('team1Set3')?.value;
        const team2Set1 = form.get('team2Set1')?.value;
        const team2Set2 = form.get('team2Set2')?.value;
        const team2Set3 = form.get('team2Set3')?.value;

        const errors: string[] = [];

        // Check if at least one set has scores
        const hasAnyScores = [team1Set1, team1Set2, team1Set3, team2Set1, team2Set2, team2Set3]
            .some(score => score !== null && score !== undefined);

        if (!hasAnyScores) {
            return null; // No scores entered yet, that's fine
        }

        // Check each set
        const sets = [
            { team1: team1Set1, team2: team2Set1, setNum: 1 },
            { team1: team1Set2, team2: team2Set2, setNum: 2 },
            { team1: team1Set3, team2: team2Set3, setNum: 3 }
        ];

        for (const set of sets) {
            if (set.team1 !== null && set.team1 !== undefined && set.team2 !== null && set.team2 !== undefined) {
                // Both scores provided for this set
                if (set.team1 === set.team2) {
                    errors.push(`Set ${set.setNum}: Scores cannot be equal`);
                }
                if (set.team1 < 0 || set.team1 > 7 || set.team2 < 0 || set.team2 > 7) {
                    errors.push(`Set ${set.setNum}: Scores must be between 0 and 7`);
                }
            } else if ((set.team1 !== null && set.team1 !== undefined) || (set.team2 !== null && set.team2 !== undefined)) {
                // Only one score provided for this set
                errors.push(`Set ${set.setNum}: Both teams must have scores or leave both empty`);
            }
        }

        // Check if match is complete (need at least 2 sets with different winners)
        const completedSets = sets.filter(set => 
            set.team1 !== null && set.team1 !== undefined && 
            set.team2 !== null && set.team2 !== undefined
        );

        if (completedSets.length > 0) {
            const team1Wins = completedSets.filter(set => set.team1 > set.team2).length;
            const team2Wins = completedSets.filter(set => set.team2 > set.team1).length;

            if (team1Wins === team2Wins && completedSets.length >= 2) {
                errors.push('Match must have a winner (at least 2 sets with different winners)');
            }
        }

        return errors.length > 0 ? { scoreValidation: errors } : null;
    }

    getFormWinner(): string {
        if (!this.editingMatch) return '';

        const formValue = this.matchForm.value;
        const sets = [
            { team1: formValue.team1Set1, team2: formValue.team2Set1 },
            { team1: formValue.team1Set2, team2: formValue.team2Set2 },
            { team1: formValue.team1Set3, team2: formValue.team2Set3 }
        ];

        const completedSets = sets.filter(set => 
            set.team1 !== null && set.team1 !== undefined && 
            set.team2 !== null && set.team2 !== undefined
        );

        if (completedSets.length < 2) return '';

        const team1Wins = completedSets.filter(set => set.team1 > set.team2).length;
        const team2Wins = completedSets.filter(set => set.team2 > set.team1).length;

        if (team1Wins > team2Wins) {
            return this.getTeamName(this.editingMatch.team1Id);
        } else if (team2Wins > team1Wins) {
            return this.getTeamName(this.editingMatch.team2Id);
        }

        return '';
    }
}
