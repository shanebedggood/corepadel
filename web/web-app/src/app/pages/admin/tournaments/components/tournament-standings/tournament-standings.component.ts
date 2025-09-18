import { Component, Input, OnChanges, SimpleChanges, OnInit, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { MessageService } from 'primeng/api';
import { TournamentService, TournamentStanding } from '../../../../../services/tournament.service';
import { Tournament, TournamentGroup, TournamentTeam, TournamentMatch } from '../../../../../services/tournament.service';

@Component({
    selector: 'app-tournament-standings',
    standalone: true,
    imports: [CommonModule, TableModule, ButtonModule],
    templateUrl: './tournament-standings.component.html',
    styleUrls: ['./tournament-standings.component.scss']
})
export class TournamentStandingsComponent implements OnInit, OnChanges {
    @Input() tournament: Tournament | undefined;
    @Input() groups: TournamentGroup[] = [];
    @Input() teams: { [groupId: string]: TournamentTeam[] } = {};
    @Input() matches: TournamentMatch[] = [];

    standings: { [groupId: string]: TournamentStanding[] } = {};
    loading: boolean = false;
    error: string | null = null;
    allGroupMatchesCompleted: boolean = false;

    constructor(
        private tournamentService: TournamentService,
        private messageService: MessageService
    ) {}

    ngOnInit(): void {
        this.loadStandings();
        this.checkGroupMatchCompletion();
    }

    ngOnChanges(changes: SimpleChanges): void {
        if ((changes['teams'] || changes['matches']) && this.teams && this.matches) {
            this.loadStandings();
            this.checkGroupMatchCompletion();
        }
    }

    private loadStandings(): void {
        if (!this.tournament?.id) return;

        this.loading = true;
        this.error = null;

        // Load standings for each group
        const groupIds = this.groups.map(group => group.id!);
        const standingsObservables = groupIds.map(groupId => 
            this.tournamentService.getTournamentStandings(this.tournament!.id!, groupId)
        );

        if (standingsObservables.length === 0) {
            this.loading = false;
            return;
        }

        // Use forkJoin to load all standings in parallel
        import('rxjs').then(rxjs => {
            rxjs.forkJoin(standingsObservables).subscribe({
                next: (standingsArrays: TournamentStanding[][]) => {
                    // Convert array of standings arrays to object with groupId as key
                    this.standings = {};
                    groupIds.forEach((groupId, index) => {
                        this.standings[groupId] = standingsArrays[index] || [];
                    });
                    this.loading = false;
                },
                error: (error: any) => {
                    console.error('Error loading standings:', error);
                    this.error = 'Failed to load standings';
                    this.loading = false;
                }
            });
        });
    }

    getStandingsForGroup(groupId: string): TournamentStanding[] {
        const standings = this.standings[groupId] || [];
        // Sort by position to ensure correct order (1st, 2nd, 3rd, etc.)
        const sortedStandings = standings.sort((a, b) => (a.position || 0) - (b.position || 0));
        
        // Ensure each standing has a unique position
        return sortedStandings.map((standing, index) => ({
            ...standing,
            position: index + 1
        }));
    }

    getGroupName(groupId: string): string {
        const group = this.groups.find(g => g.id === groupId);
        return group ? group.name : 'Unknown Group';
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

    getPositionClass(position: number): string {
        if (position === 1) return 'position-first';
        if (position === 2) return 'position-second';
        if (position === 3) return 'position-third';
        return 'position-other';
    }

    getPositionBadge(position: number): string {
        if (position === 1) return '🥇';
        if (position === 2) return '🥈';
        if (position === 3) return '🥉';
        return position.toString();
    }

    getGoalDifferenceClass(goalDifference: number): string {
        return goalDifference > 0 ? 'positive' : goalDifference < 0 ? 'negative' : 'neutral';
    }

    private checkGroupMatchCompletion(): void {
        if (!this.tournament?.id) return;

        this.tournamentService.areAllGroupMatchesCompleted(this.tournament.id).subscribe({
            next: (completed: boolean) => {
                this.allGroupMatchesCompleted = completed;
            },
            error: (error: any) => {
                this.allGroupMatchesCompleted = false;
            }
        });
    }


    getProgressionOptionId(): string {
        return (this.tournament as any)?.progressionOption?.id || 'Not set';
    }

} 