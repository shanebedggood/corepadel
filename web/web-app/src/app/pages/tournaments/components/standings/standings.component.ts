import { CommonModule } from "@angular/common";
import { Component, OnInit, Injector, runInInjectionContext } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { BadgeModule } from 'primeng/badge';
import { CardModule } from 'primeng/card';
import { DividerModule } from 'primeng/divider';
import { TooltipModule } from 'primeng/tooltip';
import { MessageModule } from 'primeng/message';
import { TournamentService, Tournament, TournamentGroup, TournamentTeam } from '../../../../services/tournament.service';
import { VenueService, Venue } from '../../../../services/venue.service';
import { FirebaseAuthService } from '../../../../services/firebase-auth.service';
import { Observable, combineLatest, map, catchError, of, switchMap, tap, forkJoin } from 'rxjs';
import { PageHeaderComponent, BreadcrumbItem } from '../../../../layout/component/page-header.component';

interface TeamStanding {
    team: TournamentTeam;
    played: number;
    won: number;
    drawn: number;
    lost: number;
    goalsFor: number;
    goalsAgainst: number;
    goalDifference: number;
    points: number;
    position: number;
}

interface GroupStanding {
    id: string; // Unique identifier for tracking
    group: TournamentGroup & { venue?: Venue };
    standings: TeamStanding[];
}

@Component({
    selector: 'app-standings',
    standalone: true,
    imports: [
        CommonModule,
        ButtonModule,
        TableModule,
        BadgeModule,
        CardModule,
        DividerModule,
        TooltipModule,
        MessageModule,
        PageHeaderComponent
    ],
    templateUrl: './standings.component.html',
    styles: []
})
export class StandingsComponent implements OnInit {
    tournamentId: string = '';
    tournament: Tournament | null = null;
    loading: boolean = false;
    errorMessage: string = '';
    groupStandings: GroupStanding[] = [];
    venues: Venue[] = [];

    // Page header configuration
    breadcrumbs: BreadcrumbItem[] = [
        { label: 'Tournaments', route: '/admin/tournaments', icon: 'pi pi-trophy' },
        { label: 'Standings' }
    ];

    constructor(
        private tournamentService: TournamentService,
        private venueService: VenueService,
        private authService: FirebaseAuthService,
        private route: ActivatedRoute,
        private router: Router,
        private injector: Injector
    ) { }

    ngOnInit(): void {
        this.tournamentId = this.route.snapshot.paramMap.get('tournamentId') || '';
        if (!this.tournamentId) {
            this.errorMessage = 'Tournament ID is required';
            return;
        }
        
        this.loadStandings();
    }

    private loadStandings(): void {
        this.loading = true;
        this.errorMessage = '';

        runInInjectionContext(this.injector, () => {
            combineLatest({
                tournament: this.tournamentService.getTournamentObservable(this.tournamentId),
                venues: this.venueService.getVenues()
            }).pipe(
                switchMap(({ tournament, venues }) => {
                    this.tournament = tournament;
                    this.venues = venues;

                    // Update breadcrumbs with tournament name
                    if (tournament) {
                        this.breadcrumbs = [
                            { label: 'Tournaments', route: '/admin/tournaments', icon: 'pi pi-trophy' },
                            { label: tournament.name, route: `/admin/edit-tournament/${tournament.id}` },
                            { label: 'Standings' }
                        ];
                    }

                    // Load groups and teams
                    return this.tournamentService.getTournamentGroups(this.tournamentId).pipe(
                        switchMap(groups => {
                            if (groups.length === 0) {
                                return of({ groups, teams: [] });
                            }

                            // Load teams for each group
                            const teamObservables = groups.map(group => {
                                return this.tournamentService.getTournamentTeams(this.tournamentId, group.id!).pipe(
                                    map(teams => teams || [])
                                );
                            });

                            return combineLatest(teamObservables).pipe(
                                map(teamArrays => ({ groups, teams: teamArrays }))
                            );
                        }),
                        map((groupsWithTeams: any) => ({ tournament, venues, groupsWithTeams }))
                    ).pipe(
                        catchError(error => {
                            console.error('Error in groups loading:', error);
                            return of({ tournament, venues, groupsWithTeams: { groups: [], teams: [] } });
                        })
                    );
                }),
                map(({ tournament, venues, groupsWithTeams }) => {
                    // Process groups and calculate standings
                    this.groupStandings = groupsWithTeams.groups.map((group: any, index: number) => {
                        const teams = groupsWithTeams.teams[index] || [];
                        const standings = this.calculateGroupStandings(teams);
                        return {
                            id: `group-standing-${group.id}-${index}`,
                            group: group,
                            standings: standings
                        };
                    });
                    return { tournament, venues, groupsWithTeams };
                }),
                catchError(error => {
                    console.error('Error loading standings: ', error);
                    this.errorMessage = 'Failed to load tournament standings';
                    return of(null);
                })
            ).subscribe({
                next: (result) => {
                    this.loading = false;
                },
                error: (error) => {
                    console.error('Error in standings loading:', error);
                    this.loading = false;
                    this.errorMessage = 'Failed to load tournament standings';
                }
            });
        });
    }

    private calculateGroupStandings(teams: TournamentTeam[]): TeamStanding[] {
        // For now, return mock data since we don't have matches yet
        // This will be replaced with actual match data when matches are implemented
        const initialStandings = teams.map((team, index) => ({
            team: team,
            played: 0,
            won: 0,
            drawn: 0,
            lost: 0,
            goalsFor: 0,
            goalsAgainst: 0,
            goalDifference: 0,
            points: 0,
            position: index + 1
        }));
        
        // Sort by points (descending), then goal difference, then goals for
        const sortedStandings = initialStandings.sort((a, b) => {
            if (b.points !== a.points) return b.points - a.points;
            if (b.goalDifference !== a.goalDifference) return b.goalDifference - a.goalDifference;
            return b.goalsFor - a.goalsFor;
        });
        
        // Ensure each standing has a unique position
        return sortedStandings.map((standing, index) => ({ ...standing, position: index + 1 }));
    }

    getPositionClass(position: number): string {
        if (position === 1) return 'bg-yellow-100 text-yellow-800 border-yellow-200';
        if (position === 2) return 'bg-gray-100 text-gray-800 border-gray-200';
        if (position === 3) return 'bg-orange-100 text-orange-800 border-orange-200';
        return 'bg-blue-100 text-blue-800 border-blue-200';
    }

    getPositionIcon(position: number): string {
        if (position === 1) return 'pi pi-star-fill';
        if (position === 2) return 'pi pi-star';
        if (position === 3) return 'pi pi-star';
        return 'pi pi-circle';
    }

    viewTournament(): void {
        this.router.navigate(['/admin/edit-tournament', this.tournamentId]);
    }

}
