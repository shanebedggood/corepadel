import { CommonModule } from "@angular/common";
import { Component, OnInit, Injector, runInInjectionContext } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { map, combineLatest, Observable, catchError, of, switchMap, tap } from 'rxjs';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { BadgeModule } from 'primeng/badge';
import { CardModule } from 'primeng/card';
import { DividerModule } from 'primeng/divider';
import { TooltipModule } from 'primeng/tooltip';
import { TabsModule } from 'primeng/tabs';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { DialogModule } from 'primeng/dialog';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { MessageModule } from 'primeng/message';
import { MessageService } from 'primeng/api';
import { TournamentService, Tournament, TournamentMatch, TournamentTeam, TournamentGroup } from '../../../../../services/tournament.service';
import { VenueService, Venue } from '../../../../../services/venue.service';
import { FormsModule } from "@angular/forms";

interface MatchWithTeams extends TournamentMatch {
    team1?: TournamentTeam;
    team2?: TournamentTeam;
    group?: TournamentGroup;
    venue?: Venue;
}

@Component({
    selector: 'app-match-schedule',
    standalone: true,
    imports: [
        CommonModule,
        ButtonModule,
        TableModule,
        BadgeModule,
        CardModule,
        DividerModule,
        TooltipModule,
        TabsModule,
        InputTextModule,
        SelectModule,
        DialogModule,
        ConfirmDialogModule,
        ToastModule,
        MessageModule,
        FormsModule
    ],
    providers: [ConfirmationService, MessageService],
    templateUrl: './match-schedule.component.html',
    styleUrls: ['../../../../../shared/styles/container.styles.scss']
})
export class MatchScheduleComponent implements OnInit {
    tournamentId: string = '';
    tournament: Tournament | null = null;
    loading: boolean = false;
    matches: MatchWithTeams[] = [];
    groups: TournamentGroup[] = [];
    venues: Venue[] = [];
    teams: TournamentTeam[] = [];

    // Filter properties
    selectedGroup: string | null = null;
    selectedStatus: string | null = null;
    selectedRound: number | null = null;

    // Edit match properties
    editingMatch: MatchWithTeams | null = null;
    showEditDialog: boolean = false;

    constructor(
        private tournamentService: TournamentService,
        private venueService: VenueService,
        private route: ActivatedRoute,
        private router: Router,
        private confirmationService: ConfirmationService,
        private messageService: MessageService,
        private injector: Injector
    ) { }

    ngOnInit(): void {
        this.tournamentId = this.route.snapshot.paramMap.get('id') || '';

        if (!this.tournamentId) {
            this.router.navigate(['/admin/tournaments']);
            return;
        }

        this.loadData();
    }

    loadData(): void {
        this.loading = true;

        // First, load tournament, groups, venues, and teams
        combineLatest({
            tournament: this.tournamentService.getTournamentObservable(this.tournamentId),
            groups: this.tournamentService.getTournamentGroups(this.tournamentId),
            venues: this.venueService.getVenues(),
            allTeams: this.tournamentService.getAllTournamentTeams(this.tournamentId),
            matches: this.tournamentService.getTournamentMatches(this.tournamentId)
        }).pipe(
            map(({ tournament, groups, venues, allTeams, matches }) => {
                this.tournament = tournament;
                this.groups = groups;
                this.venues = venues;

                // Flatten all teams from all groups
                const flattenedTeams = allTeams.flat();
                this.teams = flattenedTeams;

                // Enrich matches with team and group data
                this.matches = matches.map(match => {
                    const team1 = flattenedTeams.find(t => t.id === match.team1Id);
                    const team2 = flattenedTeams.find(t => t.id === match.team2Id);
                    const group = this.groups.find(g => g.id === match.groupId);
                    const venue = this.venues.find(v => v.id === match.venueId);

                    return {
                        ...match,
                        team1,
                        team2,
                        group,
                        venue
                    } as MatchWithTeams;
                });

                this.loading = false;
                return true;
            }),
            catchError(error => {
                console.error('Error loading match schedule data:', error);
                this.loading = false;
                this.messageService.add({
                    life: 0, // Make toast sticky
                    severity: 'error',
                    summary: 'Error',
                    detail: 'Failed to load match schedule'
                });
                return of(false);
            })
        ).subscribe();
    }

    getFilteredMatches(): MatchWithTeams[] {
        let filtered = this.matches;

        if (this.selectedGroup) {
            filtered = filtered.filter(match => match.groupId === this.selectedGroup);
        }

        if (this.selectedStatus) {
            filtered = filtered.filter(match => match.status === this.selectedStatus);
        }

        if (this.selectedRound) {
            filtered = filtered.filter(match => match.round === this.selectedRound);
        }

        return filtered.sort((a, b) => {
            // Sort by round, then by group name
            if (a.round !== b.round) return a.round - b.round;
            if (a.group?.name !== b.group?.name) return (a.group?.name || '').localeCompare(b.group?.name || '');
            return 0; // No secondary sort needed
        });
    }

    getStatusBadgeClass(status: string): string {
        switch (status) {
            case 'scheduled':
                return 'p-badge-warning';
            case 'in_progress':
                return 'p-badge-info';
            case 'completed':
                return 'p-badge-success';
            case 'cancelled':
                return 'p-badge-danger';
            default:
                return 'p-badge-secondary';
        }
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
                return 'Unknown';
        }
    }

    getMatchScore(match: MatchWithTeams): string {
        if (match.team1Score !== undefined && match.team2Score !== undefined) {
            return `${match.team1Score} - ${match.team2Score}`;
        }
        return 'TBD';
    }

    getMatchWinner(match: MatchWithTeams): string {
        if (match.winnerId) {
            if (match.winnerId === match.team1Id) {
                return match.team1?.name || 'Team 1 (ID: ' + match.team1Id + ')';
            } else {
                return match.team2?.name || 'Team 2 (ID: ' + match.team2Id + ')';
            }
        }
        return 'TBD';
    }

    getTeam1Id(match: MatchWithTeams): string {
        return (match as any).team1Id || 'Unknown';
    }

    getTeam2Id(match: MatchWithTeams): string {
        return (match as any).team2Id || 'Unknown';
    }

    editMatch(match: MatchWithTeams): void {
        this.editingMatch = { ...match };
        this.showEditDialog = true;
    }

    saveMatch(): void {
        if (!this.editingMatch) return;

        (this.tournamentService as any).updateMatch(
            this.tournamentId,
            this.editingMatch.groupId!,
            this.editingMatch.id!,
            {
                status: this.editingMatch.status,
                team1Score: this.editingMatch.team1Score,
                team2Score: this.editingMatch.team2Score,
                winnerId: this.editingMatch.winnerId,
                scheduledTime: this.editingMatch.scheduledTime ? this.formatDateTimeOnly(new Date(this.editingMatch.scheduledTime)) : undefined,
                venueId: this.editingMatch.venueId
            } as any
        ).subscribe({
            next: () => {
                this.messageService.add({
                    life: 0, // Make toast sticky
                    severity: 'success',
                    summary: 'Success',
                    detail: 'Match updated successfully'
                });

                // Update the match in the local array
                const index = this.matches.findIndex(m => m.id === this.editingMatch!.id);
                if (index !== -1) {
                    this.matches[index] = { ...this.editingMatch! };
                }

                this.showEditDialog = false;
                this.editingMatch = null;
            },
            error: (error: any) => {
                console.error('Error updating match:', error);
                this.messageService.add({
                    life: 0, // Make toast sticky
                    severity: 'error',
                    summary: 'Error',
                    detail: 'Failed to update match'
                });
            }
        });
    }

    cancelEdit(): void {
        this.showEditDialog = false;
        this.editingMatch = null;
    }

    deleteMatch(match: MatchWithTeams): void {
        this.confirmationService.confirm({
            message: `Are you sure you want to delete this match? This action cannot be undone.`,
            header: 'Delete Match',
            icon: 'pi pi-exclamation-triangle',
            accept: () => {
                (this.tournamentService as any).deleteGroupMatches(this.tournamentId, match.groupId!).subscribe({
                    next: () => {
                        this.messageService.add({
                            life: 0, // Make toast sticky
                            severity: 'success',
                            summary: 'Success',
                            detail: 'Match deleted successfully'
                        });

                        // Remove the match from the local array
                        this.matches = this.matches.filter(m => m.id !== match.id);
                    },
                    error: (error: any) => {
                        console.error('Error deleting match:', error);
                        this.messageService.add({
                            life: 0, // Make toast sticky
                            severity: 'error',
                            summary: 'Error',
                            detail: 'Failed to delete match'
                        });
                    }
                });
            }
        });
    }

    clearFilters(): void {
        this.selectedGroup = null;
        this.selectedStatus = null;
        this.selectedRound = null;
    }

    getMatchStats(): { total: number; scheduled: number; inProgress: number; completed: number; cancelled: number } {
        const now = new Date();
        const matchDuration = 90; // 90 minutes match duration
        const stats = {
            total: this.matches.length,
            scheduled: 0,
            inProgress: 0,
            completed: 0,
            cancelled: 0
        };

        this.matches.forEach(match => {
            switch (match.status) {
                case 'scheduled':
                    // A match is scheduled if it has a scheduled time in the future
                    if (!match.scheduledTime) {
                        stats.scheduled++;
                    } else {
                        let scheduledTime: Date | null = null;
                        if (match.scheduledTime instanceof Date) {
                            scheduledTime = match.scheduledTime;
                        } else if (match.scheduledTime && typeof (match.scheduledTime as any).toDate === 'function') {
                            scheduledTime = (match.scheduledTime as any).toDate();
                        }
                        
                        if (scheduledTime) {
                            if (now < scheduledTime) {
                                stats.scheduled++;
                            } else {
                                const matchEndTime = new Date(scheduledTime.getTime() + (matchDuration * 60 * 1000));
                                if (now <= matchEndTime) {
                                    stats.inProgress++;
                                } else {
                                    stats.completed++;
                                }
                            }
                        } else {
                            stats.scheduled++;
                        }
                    }
                    break;
                case 'in_progress':
                    stats.inProgress++;
                    break;
                case 'completed':
                    stats.completed++;
                    break;
                case 'cancelled':
                    stats.cancelled++;
                    break;
            }
        });

        return stats;
    }

    getUniqueRounds(): number[] {
        const rounds = [...new Set(this.matches.map(match => match.round))];
        return rounds.sort((a, b) => a - b);
    }

    getRoundOptions(): { label: string; value: number }[] {
        return this.getUniqueRounds().map(r => ({ label: 'Round ' + r, value: r }));
    }

    goBack(): void {
        this.router.navigate(['/admin/edit-tournament', this.tournamentId], { queryParams: { tab: 'groups' } });
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