import { CommonModule } from "@angular/common";
import { Component, OnInit, OnDestroy, Injector, ChangeDetectorRef, runInInjectionContext, ViewChild } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { Observable, Subject, of, throwError, forkJoin, timeout, take, switchMap, from } from 'rxjs';
import { map, catchError, finalize, takeUntil, tap } from 'rxjs/operators';
import { ButtonModule } from 'primeng/button';
import { TournamentService, Tournament, TournamentGroup, TournamentTeam, TournamentMatch } from '../../../../services/tournament.service';
import { TournamentConfigService } from '../../../../services/tournament-config.service';
import { VenueService, Venue } from '../../../../services/venue.service';
import { FirebaseAuthService } from '../../../../services/firebase-auth.service';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { MessageModule } from 'primeng/message';
import { MessageService, ConfirmationService } from 'primeng/api';
import { PageHeaderComponent } from '../../../../layout/component/page-header.component';
import { TournamentParticipantsComponent } from '../tournament-participants/tournament-participants.component';
import { TournamentDetailsComponent } from '../tournament-details/tournament-details.component';
import { TournamentGroupsComponent } from '../tournament-groups/tournament-groups.component';
import { TournamentMatchesComponent } from '../tournament-matches/tournament-matches.component';
import { TournamentStandingsComponent } from '../tournament-standings/tournament-standings.component';

import { TabsModule } from "primeng/tabs";

// Define interfaces locally since TournamentService has formatting issues
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

interface TournamentPlayer {
    uid: string;
    email: string;
    displayName: string;
    firstName?: string;
    lastName?: string;
    mobile?: string;
}

interface BreadcrumbItem {
    label: string;
    routerLink?: string;
    route?: string;
    icon?: string;
}

@Component({
    selector: 'app-edit-tournament',
    standalone: true,
    imports: [
    CommonModule,
    ButtonModule,
    ToastModule,
    ConfirmDialogModule,
    MessageModule,
    TabsModule,
    PageHeaderComponent,
    TournamentParticipantsComponent,
    TournamentDetailsComponent,
    TournamentGroupsComponent,
    TournamentMatchesComponent,
    TournamentStandingsComponent
],
    providers: [ConfirmationService, MessageService],
    templateUrl: './edit-tournament.component.html',
    styleUrls: ['./edit-tournament.component.scss']
})
export class EditTournamentComponent implements OnInit, OnDestroy {
    // Core properties
    tournamentId: string = '';
    tournament: Tournament | null = null;
    loading: boolean = false;
    errorMessage: string = '';
    successMessage: string = '';
    isAdmin: boolean = false;

    // Configuration data
    tournamentConfig: TournamentConfig | null = null;
    roundRobinConfig: RoundRobinConfig | null = null;
    venues: Venue[] = [];

    // Breadcrumbs
    breadcrumbs: BreadcrumbItem[] = [
        { label: 'Tournaments', routerLink: '/admin/tournaments' },
        { label: 'Edit Tournament', route: 'current' }
    ];

    // Groups data (for coordination between components)
    groups: (TournamentGroup & { venue?: Venue; teamCount?: number })[] = [];
    teams: { [groupId: string]: TournamentTeam[] } = {};
    matches: TournamentMatch[] = [];
    participants: any[] = [];

    // Private properties
    private destroy$ = new Subject<void>();
    regeneratingGroups: boolean = false;

    @ViewChild(TournamentGroupsComponent) private tournamentGroupsComponent!: TournamentGroupsComponent;

    constructor(
        private tournamentService: TournamentService,
        private tournamentConfigService: TournamentConfigService,
        private venueService: VenueService,
        private authService: FirebaseAuthService,
        private route: ActivatedRoute,
        private router: Router,
        private confirmationService: ConfirmationService,
        private messageService: MessageService,
        private injector: Injector,
        private cdr: ChangeDetectorRef
    ) {}

    ngOnInit(): void {
        this.tournamentId = this.route.snapshot.paramMap.get('id') || '';

        if (!this.tournamentId) {
            console.error('No tournament ID found in route, navigating back');
            this.router.navigate(['/admin/tournaments']);
            return;
        }

        // Check authentication status
        this.authService.userProfile$.pipe(
            takeUntil(this.destroy$)
        ).subscribe((profile: any) => {
            if (!profile) {
                console.error('User not authenticated');
                this.errorMessage = 'You must be logged in to edit tournaments';
                return;
            }
            
            // Check if user is admin
            this.authService.userProfile$.pipe(
                takeUntil(this.destroy$)
            ).subscribe(profile => {
                this.isAdmin = profile?.roles.includes('admin') || false;
                if (!this.isAdmin) {
                    console.error('User is not an admin');
                    this.errorMessage = 'You must be an admin to edit tournaments';
                    return;
                }

                this.loadInitialData();
            });
        });

        // After loading the tournament, also load participants
        this.loadParticipants();
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }

    private loadInitialData(): void {
        this.loading = true;
        this.errorMessage = '';

        // Load data sequentially to avoid forkJoin issues
        this.loadTournament().pipe(
            takeUntil(this.destroy$)
        ).subscribe({
            next: (tournament: Tournament | null) => {
                this.tournament = tournament;
                
                // Load config after tournament
                this.loadTournamentConfig().pipe(
                    takeUntil(this.destroy$)
                ).subscribe({
                    next: (config: TournamentConfig) => {
                        this.tournamentConfig = config;
                        
                        // Load round robin config after tournament config
                        this.loadRoundRobinConfig().pipe(
                            takeUntil(this.destroy$)
                        ).subscribe({
                            next: (roundRobinConfig: RoundRobinConfig) => {
                                this.roundRobinConfig = roundRobinConfig;
                                
                                // Load venues after round robin config
                                this.loadVenues().pipe(
                                    takeUntil(this.destroy$)
                                ).subscribe({
                                    next: (venues: Venue[]) => {
                                        this.venues = venues;
                                        
                                        // All data loaded, set loading to false
                                        this.loading = false;
                                        
                                        // Load groups after all data is loaded
                                        if (this.tournament) {
                                            this.loadGroups();
                                        }
                                    },
                                    error: (error: any) => {
                                        this.errorMessage = 'Failed to load venues';
                                        this.loading = false;
                                    }
                                });
                            },
                            error: (error: any) => {
                                console.warn('Failed to load round robin config, continuing without it:', error);
                                // Continue without round robin config
                                this.loadVenues().pipe(
                                    takeUntil(this.destroy$)
                                ).subscribe({
                                    next: (venues: Venue[]) => {
                                        this.venues = venues;
                                        this.loading = false;
                                        if (this.tournament) {
                                            this.loadGroups();
                                        }
                                    },
                                    error: (error: any) => {
                                        this.errorMessage = 'Failed to load venues';
                                        this.loading = false;
                                    }
                                });
                            }
                        });
                    },
                    error: (error: any) => {
                        this.errorMessage = 'Failed to load tournament config';
                        this.loading = false;
                    }
                });
            },
            error: (error: any) => {
                this.errorMessage = 'Failed to load tournament';
                this.loading = false;
            }
        });
    }

    private loadTournament(): Observable<Tournament | null> {
        return this.tournamentService.getTournamentObservable(this.tournamentId).pipe(
            catchError(error => {
                console.error('Error loading tournament:', error);
                return throwError(() => error);
            })
        );
    }

    private loadTournamentConfig(): Observable<TournamentConfig> {
        return this.tournamentConfigService.getTournamentConfig().pipe(
            tap(config => {
                this.tournamentConfig = config;
            }),
            catchError(error => {
                console.error('Error loading tournament config:', error);
                return throwError(() => error);
            })
        );
    }

    private loadRoundRobinConfig(): Observable<RoundRobinConfig> {
        return this.tournamentConfigService.getRoundRobinConfig().pipe(
            tap(config => {
                this.roundRobinConfig = config;
            }),
            catchError(error => {
                console.error('Error loading round-robin config:', error);
                return throwError(() => error);
            })
        );
    }

    private loadVenues(): Observable<Venue[]> {
        return this.venueService.getVenues().pipe(
            map(venues => {
                this.venues = venues;
                return venues;
            }),
            catchError(error => {
                return throwError(() => error);
            })
        );
    }

    // Navigation methods
    goBack(): void {
        this.router.navigate(['/admin/tournaments']);
    }

    // Event handlers for component coordination
    onGroupsUpdated(): void {
        // Reload groups data when groups are updated
        this.loadGroups();
    }

    onTeamsUpdated(): void {
        // Reload groups to get updated team counts
        this.loadGroups();
    }

    onMatchesUpdated(): void {
        // Refresh matches after they are updated
        this.loadMatches();
        // Force change detection to update standings
        this.cdr.detectChanges();
    }

    onStandingsUpdated(): void {
        // Handle standings updates if needed
    }

    // Tournament details event handlers
    onTournamentSaved(tournament: Tournament): void {
        if (!this.tournamentId) return;
        // Check if maxParticipants or noOfGroups has changed
        const oldMax = this.tournament?.maxParticipants;
        const oldGroups = this.tournament?.noOfGroups;
        const newMax = tournament.maxParticipants;
        const newGroups = tournament.noOfGroups;
        const shouldRegenerateGroups = oldMax !== newMax || oldGroups !== newGroups;

        this.tournamentService.updateTournament(this.tournamentId, tournament).subscribe({
            next: () => {
                this.tournament = tournament;
                this.messageService.add({
                    severity: 'success',
                    summary: 'Success',
                    detail: 'Tournament updated successfully'
                });
                if (shouldRegenerateGroups) {
                    this.tournamentService.deleteAllTournamentGroups(this.tournamentId).subscribe(() => {
                        this.tournamentService.createTournamentGroups(
                            this.tournamentId,
                            Number(tournament.maxParticipants) || 0,
                            Number(tournament.noOfGroups) || 0,
                            tournament.venue
                        ).subscribe(() => {
                            this.loadGroups();
                        });
                    });
                }
                setTimeout(() => {
                    this.router.navigate(['/admin/tournaments']);
                }, 1000);
            },
            error: (error) => {
                this.messageService.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: error?.message || 'Failed to update tournament'
                });
            }
        });
    }

    onTournamentCancelled(): void {
        this.messageService.add({
            severity: 'info',
            summary: 'Cancelled',
            detail: 'Tournament changes cancelled'
        });
    }

    onTournamentReset(): void {
        this.messageService.add({
            severity: 'info',
            summary: 'Reset',
            detail: 'Tournament form reset'
        });
    }

    private loadGroups(): void {
        if (!this.tournament) return;

        this.tournamentService.getTournamentGroupsWithVenues(this.tournament.id!, this.venues).pipe(
            takeUntil(this.destroy$)
        ).subscribe({
            next: (groups) => {
                this.groups = groups;
                // Load teams for all groups after groups are loaded
                this.loadAllTeams();
            },
            error: (error) => {
                console.error('Error loading groups:', error);
                this.messageService.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: 'Failed to load tournament groups'
                });
            }
        });
    }

    private loadAllTeams(): void {
        if (!this.tournament) return;

        // Load teams for all groups
        const groupIds = this.groups.map(group => group.id!);
        const teamObservables = groupIds.map(groupId => 
            this.tournamentService.getTournamentTeams(this.tournament!.id!, groupId)
        );

        if (teamObservables.length === 0) {
            this.loadMatches();
            return;
        }

        forkJoin(teamObservables).pipe(
            takeUntil(this.destroy$)
        ).subscribe({
            next: (teamsArrays) => {
                // Convert array of team arrays to object with groupId as key
                this.teams = {};
                groupIds.forEach((groupId, index) => {
                    this.teams[groupId] = teamsArrays[index];
                });
                // Load matches after teams are loaded
                this.loadMatches();
            },
            error: (error) => {
                console.error('Error loading teams:', error);
                this.messageService.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: 'Failed to load tournament teams'
                });
            }
        });
    }

    private loadMatches(): void {
        if (!this.tournament) return;

        this.tournamentService.getAllTournamentMatches(this.tournament.id!).pipe(
            takeUntil(this.destroy$)
        ).subscribe({
            next: (matches) => {
                this.matches = matches;
            },
            error: (error) => {
                console.error('Error loading matches:', error);
                this.messageService.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: 'Failed to load tournament matches'
                });
            }
        });
    }

    regenerateGroups(): void {
        if (!this.tournamentId || !this.tournament) return;
        this.confirmationService.confirm({
            message: 'Are you sure you want to regenerate all groups? This will delete all existing groups and teams.',
            header: 'Regenerate Groups',
            icon: 'pi pi-exclamation-triangle',
            accept: () => {
                this.regeneratingGroups = true;
                this.tournamentService.deleteAllTournamentGroups(this.tournamentId).subscribe({
                    next: () => {
                        this.tournamentService.createTournamentGroups(
                            this.tournamentId,
                            Number(this.tournament?.maxParticipants) || 0,
                            Number(this.tournament?.noOfGroups) || 0,
                            this.tournament?.venue || undefined
                        ).subscribe({
                            next: () => {
                                this.loadGroups();
                                this.messageService.add({
                                    severity: 'success',
                                    summary: 'Groups Regenerated',
                                    detail: 'Tournament groups have been regenerated.'
                                });
                                this.regeneratingGroups = false;
                            },
                            error: () => { this.regeneratingGroups = false; }
                        });
                    },
                    error: () => { this.regeneratingGroups = false; }
                });
            }
        });
    }

    autoCreateTeams(): void {
        if (this.tournamentGroupsComponent) {
            this.tournamentGroupsComponent.autoCreateTeams();
        } else {
            this.messageService.add({
                severity: 'warn',
                summary: 'Component Not Ready',
                detail: 'The groups component is not yet available. Please try again in a moment.'
            });
        }
    }

    // Utility methods
    getTeamName(teamId: string | undefined): string {
        if (!teamId) return 'Unknown Team';
        
        for (const group of this.groups) {
            // This would need to be implemented based on how teams are stored
            // For now, return a placeholder
            return 'Team ' + teamId;
        }
        return 'Unknown Team';
    }

    getGroupName(groupId: string | undefined): string {
        if (!groupId) return 'Unknown Group';
        
        const group = this.groups.find(g => g.id === groupId);
        return group ? group.name : 'Unknown Group';
    }

    public loadParticipants(): void {
        if (!this.tournamentId) return;
        this.tournamentService.getTournamentParticipants(this.tournamentId).pipe(
            take(1)
        ).subscribe({
            next: (participants) => {
                this.participants = participants && Array.isArray(participants) ? participants : [];
            },
            error: (error) => {
                console.error('Error loading participants:', error);
                this.participants = [];
            }
        });
}
} 