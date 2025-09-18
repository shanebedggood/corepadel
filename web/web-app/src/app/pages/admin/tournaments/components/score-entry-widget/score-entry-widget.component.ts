import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { CardModule } from 'primeng/card';
import { InputNumberModule } from 'primeng/inputnumber';
import { DialogModule } from 'primeng/dialog';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { SelectModule } from 'primeng/select';
import { TooltipModule } from 'primeng/tooltip';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { TournamentService, Tournament, TournamentMatch, TournamentTeam } from '../../../../../services/tournament.service';
import { Observable, Subscription, combineLatest, map, of } from 'rxjs';

interface MatchWithTeams extends TournamentMatch {
    team1?: TournamentTeam;
    team2?: TournamentTeam;
    tournament?: Tournament;
    canEditScore?: boolean;
}

@Component({
    selector: 'app-score-entry-widget',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        ButtonModule,
        TableModule,
        CardModule,
        InputNumberModule,
        DialogModule,
        ToastModule,
        SelectModule,
        TooltipModule,
        ProgressSpinnerModule
    ],
    providers: [MessageService],
    templateUrl: './score-entry-widget.component.html',
    styles: []
})
export class ScoreEntryWidgetComponent implements OnInit, OnDestroy {
    tournaments: Tournament[] = [];
    selectedTournamentId: string | null = null;
    matches: MatchWithTeams[] = [];
    loading = false;
    saving = false;
    showScoreDialog = false;
    editingMatch: MatchWithTeams | null = null;
    private subscriptions: Subscription[] = [];

    matchStatusOptions = [
        { label: 'Scheduled', value: 'scheduled' },
        { label: 'In Progress', value: 'in_progress' },
        { label: 'Completed', value: 'completed' },
        { label: 'Cancelled', value: 'cancelled' }
    ];

    constructor(
        private tournamentService: TournamentService,
        private messageService: MessageService
    ) { }

    ngOnInit() {
        this.loadTournaments();
    }

    ngOnDestroy() {
        this.subscriptions.forEach(sub => sub.unsubscribe());
    }

    loadTournaments() {
        this.loading = true;
        const sub = this.tournamentService.getTournaments().subscribe({
            next: (tournaments: Tournament[]) => {
                this.tournaments = tournaments;
                this.loading = false;
            },
            error: (error: any) => {
                console.error('Error loading tournaments:', error);
                this.messageService.add({
                    life: 0, // Make toast sticky
                    severity: 'error',
                    summary: 'Error',
                    detail: 'Failed to load tournaments'
                });
                this.loading = false;
            }
        });
        this.subscriptions.push(sub);
    }

    onTournamentChange() {
        if (this.selectedTournamentId) {
            this.loadMatches();
        } else {
            this.matches = [];
        }
    }

    loadMatches() {
        if (!this.selectedTournamentId) return;

        this.loading = true;
        const sub = this.tournamentService.getAllTournamentMatches(this.selectedTournamentId).subscribe({
            next: (matches: any) => {
                // Enrich matches with team and tournament data
                this.enrichMatches(matches);
                this.loading = false;
            },
            error: (error: any) => {
                console.error('Error loading matches:', error);
                this.messageService.add({
                    life: 0, // Make toast sticky
                    severity: 'error',
                    summary: 'Error',
                    detail: 'Failed to load matches'
                });
                this.loading = false;
            }
        });
        this.subscriptions.push(sub);
    }

    private enrichMatches(matches: TournamentMatch[]) {
        // Get all teams for this tournament
        const sub = this.tournamentService.getAllTournamentTeams(this.selectedTournamentId!).subscribe({
            next: (allTeams: TournamentTeam[][]) => {
                const flattenedTeams = allTeams.flat();
                const tournament = this.tournaments.find((t: Tournament) => t.id === this.selectedTournamentId);

                this.matches = matches.map(match => {
                    const team1 = flattenedTeams.find((t: TournamentTeam) => t.id === match.team1Id);
                    const team2 = flattenedTeams.find((t: TournamentTeam) => t.id === match.team2Id);
                    const canEditScore = this.canEditScore(match);

                    return {
                        ...match,
                        team1,
                        team2,
                        tournament,
                        canEditScore
                    } as MatchWithTeams;
                });
            },
            error: (error: any) => {
                console.error('Error loading teams:', error);
            }
        });
        this.subscriptions.push(sub);
    }

    private canEditScore(match: TournamentMatch): boolean {
        if (!match.scheduledTime) return false;

        const now = new Date();
        let scheduledTime: Date | null = null;

        if (match.scheduledTime instanceof Date) {
            scheduledTime = match.scheduledTime;
        } else if (match.scheduledTime && typeof (match.scheduledTime as any).toDate === 'function') {
            scheduledTime = (match.scheduledTime as any).toDate();
        }

        if (!scheduledTime) return false;

        return now >= scheduledTime;
    }

    openScoreDialog(match: MatchWithTeams) {
        if (!match.canEditScore) {
            this.messageService.add({
                life: 0, // Make toast sticky
                severity: 'warn',
                summary: 'Cannot Edit',
                detail: 'Scores can only be entered after the scheduled match time'
            });
            return;
        }

        this.editingMatch = { ...match };
        this.showScoreDialog = true;
    }

    closeScoreDialog() {
        this.showScoreDialog = false;
        this.editingMatch = null;
    }

    getWinnerName(): string {
        if (!this.editingMatch) return '';

        const { team1Score, team2Score, team1, team2 } = this.editingMatch;

        if (team1Score === undefined || team2Score === undefined) return 'TBD';
        if (team1Score === team2Score) return 'Draw';
        if (team1Score > team2Score) return team1?.name || 'Team 1';
        return team2?.name || 'Team 2';
    }

    saveScore() {
        if (!this.editingMatch) return;

        this.saving = true;

        // Determine winner
        let winnerId: string | undefined;
        if (this.editingMatch.team1Score !== undefined && this.editingMatch.team2Score !== undefined) {
            if (this.editingMatch.team1Score > this.editingMatch.team2Score) {
                winnerId = this.editingMatch.team1Id;
            } else if (this.editingMatch.team2Score > this.editingMatch.team1Score) {
                winnerId = this.editingMatch.team2Id;
            }
        }

        const updates = {
            team1Score: this.editingMatch.team1Score,
            team2Score: this.editingMatch.team2Score,
            winnerId,
            status: this.editingMatch.status
        };

        const sub = (this.tournamentService as any).updateMatch(
            this.editingMatch.tournamentId,
            this.editingMatch.groupId!,
            this.editingMatch.id!,
            updates
        ).subscribe({
            next: () => {
                this.messageService.add({
                    life: 0, // Make toast sticky
                    severity: 'success',
                    summary: 'Success',
                    detail: 'Match score updated successfully'
                });

                // Update the match in the local array
                const index = this.matches.findIndex(m => m.id === this.editingMatch!.id);
                if (index !== -1) {
                    this.matches[index] = { ...this.editingMatch! };
                }

                this.closeScoreDialog();
                this.saving = false;
            },
            error: (error: any) => {
                console.error('Error updating match score:', error);
                this.messageService.add({
                    life: 0, // Make toast sticky
                    severity: 'error',
                    summary: 'Error',
                    detail: 'Failed to update match score'
                });
                this.saving = false;
            }
        });
        this.subscriptions.push(sub);
    }

    getStatusBadgeClass(status: string): string {
        switch (status) {
            case 'scheduled': return 'bg-blue-100 text-blue-800';
            case 'in_progress': return 'bg-yellow-100 text-yellow-800';
            case 'completed': return 'bg-green-100 text-green-800';
            case 'cancelled': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    }

    getStatusLabel(status: string): string {
        switch (status) {
            case 'scheduled': return 'Scheduled';
            case 'in_progress': return 'In Progress';
            case 'completed': return 'Completed';
            case 'cancelled': return 'Cancelled';
            default: return status;
        }
    }

    getScheduledTimeDisplay(): string {
        if (!this.editingMatch) return 'Not scheduled';
        
        const scheduledTime = (this.editingMatch as any).scheduledTime;
        if (!scheduledTime) return 'Not scheduled';
        
        if (scheduledTime instanceof Date) {
            return scheduledTime.toLocaleDateString('en-US', { 
                month: 'short', 
                day: '2-digit', 
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        }
        
        return 'Not scheduled';
    }
}
