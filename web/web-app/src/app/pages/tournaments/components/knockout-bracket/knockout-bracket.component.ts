import { Component, Input, Output, EventEmitter, OnInit, OnChanges, SimpleChanges, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { DatePickerModule } from 'primeng/datepicker';
import { SelectModule } from 'primeng/select';
import { MessageModule } from 'primeng/message';
import { TooltipModule } from 'primeng/tooltip';
import { ToastModule } from 'primeng/toast';
import { TournamentService, TournamentMatch } from '../../../../services/tournament.service';
import { ErrorHandlerService } from '../../../../services/error-handler.service';
import { MatchScoreDialogComponent } from '../shared/match-score-dialog/match-score-dialog.component';
import { KnockoutScoreDisplayComponent } from '../knockout-score-display/knockout-score-display.component';
import { Venue } from '../../../../services/venue.service';
import { Tournament, TournamentTeam } from '../../../../services/tournament.service';

@Component({
    selector: 'app-knockout-bracket',
    standalone: true,
    imports: [
        CommonModule, 
        CardModule, 
        ButtonModule, 
        DialogModule, 
        InputTextModule, 
        DatePickerModule, 
        SelectModule, 
        MessageModule, 
        TooltipModule,
        ToastModule,
        ReactiveFormsModule,
        MatchScoreDialogComponent,
        KnockoutScoreDisplayComponent
    ],
    templateUrl: './knockout-bracket.component.html',
    styleUrls: ['./knockout-bracket.component.scss']
})
export class KnockoutBracketComponent implements OnInit, OnChanges {
    @Input() tournament: Tournament | undefined;
    @Input() teams: { [groupId: string]: TournamentTeam[] } = {};
    @Input() venues: Venue[] = [];
    @Input() matches: TournamentMatch[] = [];
    @Output() matchesUpdated = new EventEmitter<void>();

    knockoutMatches: TournamentMatch[] = [];
    loading: boolean = false;
    error: string | null = null;
    generatingBracket: boolean = false;
    
    // Match editing
    editingMatch: TournamentMatch | null = null;
    showEditDialog: boolean = false;
    matchForm: FormGroup;

    // Schedule editing
    showScheduleDialog: boolean = false;
    
    // Shared score dialog
    showScoreDialog: boolean = false;
    scheduleForm: FormGroup;

    // Organized matches by phase
    quarterfinals: TournamentMatch[] = [];
    semifinals: TournamentMatch[] = [];
    finals: TournamentMatch[] = [];
    otherRounds: { [phase: string]: TournamentMatch[] } = {};

    constructor(
        private tournamentService: TournamentService,
        private fb: FormBuilder,
        private errorHandlerService: ErrorHandlerService,
        private cdr: ChangeDetectorRef
    ) {
        this.matchForm = this.fb.group({
            team1Score: ['', [Validators.min(0)]],
            team2Score: ['', [Validators.min(0)]],
            team1Set1: ['', [Validators.min(0)]],
            team2Set1: ['', [Validators.min(0)]],
            team1Set2: ['', [Validators.min(0)]],
            team2Set2: ['', [Validators.min(0)]],
            team1Set3: ['', [Validators.min(0)]],
            team2Set3: ['', [Validators.min(0)]]
        });

        this.scheduleForm = this.fb.group({
            scheduledTime: [''],
            venueId: ['']
        });
    }

    ngOnInit(): void {
        this.loadKnockoutMatches();
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes['tournament'] && this.tournament?.id) {
            this.loadKnockoutMatches();
        }
    }

    private loadKnockoutMatches(): void {
        if (!this.tournament?.id) return;

        this.loading = true;
        this.error = null;

        this.tournamentService.getKnockoutMatches(this.tournament.id).subscribe({
            next: (matches) => {
                // Check if the final match still has null scores after the update
                const finalMatch = matches.find(m => m.phase === 'final');
                const semifinalMatch = matches.find(m => m.phase === 'semifinal');                
                this.knockoutMatches = matches;
                this.organizeMatchesByPhase();
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
            .subscribe({
                next: (response) => {
                    this.errorHandlerService.handleSuccess('Knockout bracket generated successfully');
                    this.loadKnockoutMatches();
                    this.matchesUpdated.emit();
                    this.generatingBracket = false;
                },
                error: (error) => {
                    console.error('Error generating knockout bracket:', error);
                    this.errorHandlerService.handleApiError(error, 'Knockout Bracket Generation');
                    this.generatingBracket = false;
                }
            });
    }

    generateNextRound(): void {
        if (!this.tournament?.id) return;

        this.generatingBracket = true;
        this.tournamentService.generateNextKnockoutRound(this.tournament.id)
            .subscribe({
                next: (response) => {
                    this.errorHandlerService.handleSuccess(`${this.getNextRoundName()} generated successfully`);
                    this.loadKnockoutMatches();
                    this.matchesUpdated.emit();
                    this.generatingBracket = false;
                },
                error: (error) => {
                    console.error('Error generating next round:', error);
                    this.errorHandlerService.handleApiError(error, 'Next Round Generation');
                    this.generatingBracket = false;
                }
            });
    }

    canGenerateKnockoutBracket(): boolean {
        if (!this.tournament || !this.matches) return false;
        
        // Check if all group stage matches are completed
        const groupMatches = this.matches.filter(match => match.phase === 'group');
        const completedGroupMatches = groupMatches.filter(match => match.status === 'completed');
        
        return groupMatches.length > 0 && groupMatches.length === completedGroupMatches.length;
    }

    canGenerateNextRound(): boolean {
        if (!this.tournament || this.knockoutMatches.length === 0) return false;
        
        // Check if semifinals are completed and final doesn't exist yet
        if (this.semifinals.length > 0 && this.finals.length === 0) {
            const semifinalCompleted = this.semifinals.every(match => match.status === 'completed');
            if (semifinalCompleted) return true;
        }
        
        // Check if quarterfinals are completed and semifinals don't exist yet
        if (this.quarterfinals.length > 0 && this.semifinals.length === 0) {
            const quarterfinalCompleted = this.quarterfinals.every(match => match.status === 'completed');
            if (quarterfinalCompleted) return true;
        }
        
        // Check other rounds
        for (const phase of Object.keys(this.otherRounds)) {
            const roundMatches = this.otherRounds[phase];
            if (roundMatches.length > 0) {
                const roundCompleted = roundMatches.every(match => match.status === 'completed');
                if (roundCompleted) {
                    // Check if next round doesn't exist yet
                    const nextPhase = this.getNextPhaseName(phase);
                    if (nextPhase && !this.hasPhaseMatches(nextPhase)) {
                        return true;
                    }
                }
            }
        }
        
        return false;
    }

    private getNextPhaseName(currentPhase: string): string | null {
        if (currentPhase === 'quarterfinal') return 'semifinal';
        if (currentPhase === 'semifinal') return 'final';
        
        const match = currentPhase.match(/round-(\d+)/);
        if (match) {
            const roundNum = parseInt(match[1]);
            return `round-${roundNum + 1}`;
        }
        
        return null;
    }

    private hasPhaseMatches(phase: string): boolean {
        if (phase === 'quarterfinal') return this.quarterfinals.length > 0;
        if (phase === 'semifinal') return this.semifinals.length > 0;
        if (phase === 'final') return this.finals.length > 0;
        return this.otherRounds[phase] && this.otherRounds[phase].length > 0;
    }

    getCurrentRound(): string | null {
        // Determine the current round based on existing matches
        // Check in reverse order (finals first, then semifinals, etc.)
        
        // Check finals first
        if (this.finals.length > 0) {
            const finalCompleted = this.finals.every(match => match.status === 'completed');
            if (!finalCompleted) return 'final';
        }
        
        // Check semifinals
        if (this.semifinals.length > 0) {
            const semifinalCompleted = this.semifinals.every(match => match.status === 'completed');
            if (!semifinalCompleted) return 'semifinal';
        }
        
        // Check quarterfinals
        if (this.quarterfinals.length > 0) {
            const quarterfinalCompleted = this.quarterfinals.every(match => match.status === 'completed');
            if (!quarterfinalCompleted) return 'quarterfinal';
        }
        
        // Check other rounds (in reverse order)
        const otherPhases = Object.keys(this.otherRounds).sort().reverse();
        for (const phase of otherPhases) {
            const roundMatches = this.otherRounds[phase];
            const roundCompleted = roundMatches.every(match => match.status === 'completed');
            if (!roundCompleted) return phase;
        }
        
        return null;
    }

    getNextRoundName(): string {
        const currentRound = this.getCurrentRound();
        
        // If no current round, determine what to generate next
        if (!currentRound) {
            // If semifinals exist and are completed, generate final
            if (this.semifinals.length > 0 && this.semifinals.every(match => match.status === 'completed')) {
                return 'Final';
            }
            // If quarterfinals exist and are completed, generate semifinal
            if (this.quarterfinals.length > 0 && this.quarterfinals.every(match => match.status === 'completed')) {
                return 'Semifinal';
            }
            // Check other rounds
            for (const phase of Object.keys(this.otherRounds)) {
                const roundMatches = this.otherRounds[phase];
                if (roundMatches.length > 0 && roundMatches.every(match => match.status === 'completed')) {
                    const match = phase.match(/round-(\d+)/);
                    if (match) {
                        const roundNum = parseInt(match[1]);
                        return `Round ${roundNum + 1}`;
                    }
                }
            }
            return 'Next Round';
        }
        
        // If there is a current round, determine the next round
        if (currentRound === 'quarterfinal') return 'Semifinal';
        if (currentRound === 'semifinal') return 'Final';
        
        // For other rounds, increment the round number
        const match = currentRound.match(/round-(\d+)/);
        if (match) {
            const roundNum = parseInt(match[1]);
            return `Round ${roundNum + 1}`;
        }
        
        return 'Next Round';
    }

    private organizeMatchesByPhase(): void {
        this.quarterfinals = this.knockoutMatches.filter(match => match.phase === 'quarterfinal');
        this.semifinals = this.knockoutMatches.filter(match => match.phase === 'semifinal');
        this.finals = this.knockoutMatches.filter(match => match.phase === 'final');
        
        // Organize other rounds (like round_1, round_2, etc.)
        this.otherRounds = {};
        const otherPhases = this.knockoutMatches
            .filter(match => !['quarterfinal', 'semifinal', 'final'].includes(match.phase))
            .map(match => match.phase);
        
        const uniquePhases = [...new Set(otherPhases)];
        uniquePhases.forEach(phase => {
            this.otherRounds[phase] = this.knockoutMatches.filter(match => match.phase === phase);
        });
    }

    getTeamName(teamId: string): string {
        for (const groupTeams of Object.values(this.teams)) {
            const team = groupTeams.find(t => t.id === teamId);
            if (team) {
                return team.name;
            }
        }
        return 'Unknown Team';
    }

    getTeamPlayerNames(teamId: string): string {
        for (const groupTeams of Object.values(this.teams)) {
            const team = groupTeams.find(t => t.id === teamId);
            if (team && team.players && team.players.length > 0) {
                return team.players.map(player => player.displayName || player.email || 'Unknown Player').join(', ');
            }
        }
        return '';
    }

    getMatchStatusClass(status: string): string {
        switch (status) {
            case 'completed':
                return 'match-completed';
            case 'in_progress':
                return 'match-in-progress';
            case 'scheduled':
                return 'match-scheduled';
            case 'cancelled':
                return 'match-cancelled';
            default:
                return 'match-scheduled';
        }
    }

    getMatchStatusIcon(status: string): string {
        switch (status) {
            case 'completed':
                return 'pi pi-check-circle';
            case 'in_progress':
                return 'pi pi-clock';
            case 'scheduled':
                return 'pi pi-calendar';
            case 'cancelled':
                return 'pi pi-times-circle';
            default:
                return 'pi pi-calendar';
        }
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
                return phase.charAt(0).toUpperCase() + phase.slice(1);
        }
    }

    hasMatches(): boolean {
        return this.knockoutMatches.length > 0;
    }

    getOtherRoundPhases(): string[] {
        return Object.keys(this.otherRounds);
    }

    // Match management methods
    startEditMatch(match: TournamentMatch): void {
        this.editingMatch = { ...match };
        this.showScoreDialog = true;
    }

    startEditSchedule(match: TournamentMatch, event: Event): void {
        event.stopPropagation(); // Prevent row click
        this.editingMatch = { ...match };
        
        // Convert scheduledTime to datetime-local format
        let scheduledTime = '';
        if (match.scheduledTime) {
            const date = new Date(match.scheduledTime);
            scheduledTime = date.toISOString().slice(0, 16); // Format: YYYY-MM-DDTHH:MM
        }
        
        this.scheduleForm.patchValue({
            scheduledTime: scheduledTime,
            venueId: match.venueId || ''
        });
        this.showScheduleDialog = true;
    }

    cancelEditMatch(): void {
        this.editingMatch = null;
        this.matchForm.reset();
        this.showEditDialog = false;
    }

    onScoreDialogSave(event: any): void {
        if (!event || !event.matchId) {
            console.error('Invalid save event received:', event);
            this.errorHandlerService.handleApiError(
                { message: 'Invalid save event received' }, 
                'Match Score Update'
            );
            return;
        }
        
        // Log the specific match being updated
        const matchBeingUpdated = this.knockoutMatches.find(m => m.id === event.matchId);
        
        // HTTP client is working (we can see it making requests), so proceed directly with match update
        this.tournamentService.updateMatchScore(event.matchId, event.updates).subscribe({
            next: (response) => {
                // Check if this was a final match and log a warning
                if (matchBeingUpdated?.phase === 'final') {
                    console.warn('⚠️ FINAL MATCH UPDATE - This should be working but might not persist in database');
                }
                
                this.errorHandlerService.handleSuccess('Match score updated successfully');
                this.editingMatch = null;
                this.showScoreDialog = false;
                // Force UI update by reloading matches and triggering change detection
                this.loadKnockoutMatches();
                this.matchesUpdated.emit();
                
                // Force change detection multiple times to ensure UI updates
                this.cdr.detectChanges();
                setTimeout(() => {
                    this.cdr.detectChanges();
                }, 100);
            },
            error: (error) => {
                console.error('Error updating match score:', error);
                console.error('Error details:', {
                    matchId: event.matchId,
                    matchPhase: matchBeingUpdated?.phase,
                    updates: event.updates,
                    error: error
                });
                this.errorHandlerService.handleApiError(error, 'Match Score Update');
            }
        });
    }

    onScoreDialogCancel(): void {
        this.editingMatch = null;
        this.showScoreDialog = false;
    }

    cancelEditSchedule(): void {
        this.editingMatch = null;
        this.scheduleForm.reset();
        this.showScheduleDialog = false;
    }

    saveMatch(): void {
        if (this.matchForm.valid && this.editingMatch && this.editingMatch.id) {
            const formValue = this.matchForm.value;
            const updates = {
                team1Score: formValue.team1Score ? parseInt(formValue.team1Score) : undefined,
                team2Score: formValue.team2Score ? parseInt(formValue.team2Score) : undefined,
                team1Set1: formValue.team1Set1 ? parseInt(formValue.team1Set1) : undefined,
                team2Set1: formValue.team2Set1 ? parseInt(formValue.team2Set1) : undefined,
                team1Set2: formValue.team1Set2 ? parseInt(formValue.team1Set2) : undefined,
                team2Set2: formValue.team2Set2 ? parseInt(formValue.team2Set2) : undefined,
                team1Set3: formValue.team1Set3 ? parseInt(formValue.team1Set3) : undefined,
                team2Set3: formValue.team2Set3 ? parseInt(formValue.team2Set3) : undefined,
                status: this.determineMatchStatus(formValue.team1Score, formValue.team2Score) as 'scheduled' | 'in_progress' | 'completed' | 'cancelled'
            };
            
            this.tournamentService.updateMatchScore(this.editingMatch.id, updates).subscribe({
                next: () => {
                    this.errorHandlerService.handleSuccess('Match score updated successfully');
                    this.editingMatch = null;
                    this.matchForm.reset();
                    this.showEditDialog = false;
                    this.loadKnockoutMatches();
                    this.matchesUpdated.emit();
                    this.cdr.detectChanges();
                },
                error: (error) => {
                    this.errorHandlerService.handleApiError(error, 'Match Score Update');
                }
            });
        }
    }

    saveSchedule(): void {
        if (this.editingMatch && this.editingMatch.id) {
            const formValue = this.scheduleForm.value;
            const updates = {
                scheduledTime: formValue.scheduledTime ? new Date(formValue.scheduledTime) : undefined,
                venueId: formValue.venueId || undefined
            };
            
            this.tournamentService.updateMatchScore(this.editingMatch.id, updates).subscribe({
                next: () => {
                    this.errorHandlerService.handleSuccess('Match schedule updated successfully');
                    this.editingMatch = null;
                    this.scheduleForm.reset();
                    this.showScheduleDialog = false;
                    this.loadKnockoutMatches();
                    this.matchesUpdated.emit();
                    this.cdr.detectChanges();
                },
                error: (error) => {
                    this.errorHandlerService.handleApiError(error, 'Match Schedule Update');
                }
            });
        }
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

    private determineMatchStatus(team1Score: string, team2Score: string): string {
        if (team1Score && team2Score && team1Score !== '' && team2Score !== '') {
            return 'completed';
        } else if (team1Score || team2Score) {
            return 'in_progress';
        } else {
            return 'scheduled';
        }
    }

    getVenueName(venueId: string | undefined): string {
        if (!venueId) return 'Not assigned';
        const venue = this.venues.find(v => v.id === venueId);
        return venue ? venue.name : 'Not assigned';
    }

    formatDate(date: string | Date | null | undefined): string {
        if (!date) return 'Not scheduled';
        const dateObj = typeof date === 'string' ? new Date(date) : date;
        return dateObj.toLocaleDateString() + ' ' + dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }


    canEditMatch(match: TournamentMatch): boolean {
        // For knockout matches, always allow editing (scores and scheduling)
        // Users should be able to edit completed matches to correct scores
        return true;
    }
}
