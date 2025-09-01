import { CommonModule } from "@angular/common";
import { Component, OnInit, Injector, runInInjectionContext } from "@angular/core";
import { Router } from "@angular/router";
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { BadgeModule } from 'primeng/badge';
import { TooltipModule } from 'primeng/tooltip';
import { PaginatorModule } from 'primeng/paginator';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ToastModule } from 'primeng/toast';
import { MessageModule } from 'primeng/message';
import { ConfirmationService } from 'primeng/api';
import { MessageService } from 'primeng/api';
import { Tournament, TournamentService, TournamentStatus } from '../../../../services/tournament.service';
import { TournamentConfigService } from '../../../../services/tournament-config.service';
import { FirebaseAuthService } from '../../../../services/firebase-auth.service';
import { Observable, catchError, of, map, combineLatest, switchMap, filter, take } from 'rxjs';
import { PageHeaderComponent, BreadcrumbItem } from '../../../../layout/component/page-header.component';

@Component({
    selector: 'app-tournaments',
    standalone: true,
    imports: [
        CommonModule,
        ButtonModule,
        TableModule,
        BadgeModule,
        TooltipModule,
        PaginatorModule,
        ConfirmDialogModule,
        ToastModule,
        MessageModule,
        PageHeaderComponent
    ],
    providers: [ConfirmationService, MessageService],
    templateUrl: './tournaments.component.html',
    styles: []
})
export class TournamentsComponent implements OnInit {
    tournaments: Tournament[] = [];
    selectedTournament: Tournament | null = null;
    loading: boolean = false;
    saving: boolean = false;
    layout: 'grid' | 'list' = 'grid';
    isAdmin: boolean = false;
    private dataLoaded: boolean = false;

    // Page header configuration
    breadcrumbs: BreadcrumbItem[] = [
        { label: 'Tournaments', icon: 'pi pi-trophy' }
    ];

    constructor(
        private tournamentService: TournamentService,
        private tournamentConfigService: TournamentConfigService,
        private authService: FirebaseAuthService,
        private router: Router,
        private injector: Injector,
        private confirmationService: ConfirmationService,
        private messageService: MessageService
    ) { }

    ngOnInit(): void {
        // Wait for authentication state to be properly initialized before loading data
        this.authService.isAuthenticated$.pipe(
            filter(isAuthenticated => isAuthenticated !== null),
            take(1)
        ).subscribe(() => {
            if (!this.dataLoaded) {
                this.dataLoaded = true;
                // Load all data in a single Observable chain within injection context
                runInInjectionContext(this.injector, () => {
                    this.loadInitialDataChain().subscribe({
                        next: (result) => {
                            // Data loading completed successfully
                        },
                        error: (error) => {
                            console.error('TournamentsComponent data loading error:', error);
                            this.dataLoaded = false; // Reset flag on error
                        }
                    });
                });
            }
        });
    }

    /**
     * Main data loading chain that orchestrates all data loading in the correct order
     */
    loadInitialDataChain(): Observable<any> {
        this.loading = true;
        // Load tournaments and admin status in parallel using combineLatest instead of forkJoin
        return combineLatest({
            tournaments: this.loadTournaments(),
            adminStatus: this.checkAdminStatus()
        }).pipe(
            map((result: { tournaments: Tournament[], adminStatus: boolean }) => {
                const { tournaments, adminStatus } = result;
                this.tournaments = tournaments;
                this.isAdmin = adminStatus;
                this.loading = false;
                return true;
            }),
            catchError(error => {
                console.error('Error in data loading chain: ', error);
                this.loading = false;
                return of(false);
            })
        );
    }

    /**
     * Load tournaments data
     */
    loadTournaments(): Observable<Tournament[]> {
        return combineLatest({
            tournaments: this.tournamentService.getTournaments(),
            config: this.tournamentConfigService.getTournamentConfig()
        }).pipe(
            switchMap(({ tournaments, config }) => {
                // If no tournaments, return empty array immediately
                if (tournaments.length === 0) {
                    return of([]);
                }
                
                // Create a map of statuses for quick lookup
                const statusMap = new Map<string, TournamentStatus>();
                config.statuses.forEach(status => {
                    statusMap.set(status.id, status);
                });
                
                // For each tournament, get the participant count
                const tournamentObservables = tournaments.map(tournament => 
                    this.tournamentService.getTournamentParticipants(tournament.id!).pipe(
                        map(participants => ({
                            ...tournament,
                            currentParticipants: participants.length,
                            status: this.tournamentService.calculateTournamentStatus(tournament, {
                                ...config,
                                lastUpdated: config.lastUpdated instanceof Date ? config.lastUpdated.toISOString() : config.lastUpdated
                            })
                        })),
                        catchError(error => {
                            console.error(`Error loading participants for tournament ${tournament.id}:`, error);
                            return of({
                                ...tournament,
                                currentParticipants: 0,
                                status: this.tournamentService.calculateTournamentStatus(tournament, {
                                    ...config,
                                    lastUpdated: config.lastUpdated instanceof Date ? config.lastUpdated.toISOString() : config.lastUpdated
                                })
                            });
                        })
                    )
                );
                
                return combineLatest(tournamentObservables);
            }),
            catchError(error => {
                console.error('Error loading tournaments: ', error);
                return of([]);
            })
        );
    }

    /**
     * Check admin status
     */
    checkAdminStatus(): Observable<boolean> {
        return this.authService.userProfile$.pipe(
            map(profile => profile?.roles.includes('admin') || false),
            catchError(error => {
                console.error('Error checking admin status: ', error);
                return of(false);
            })
        );
    }

    /**
     * Refresh tournament statuses manually
     */
    refreshTournaments(): void {
        this.loadInitialDataChain().subscribe({
            next: () => {
                this.messageService.add({
                    life: 0, // Make toast sticky
                    severity: 'success',
                    summary: 'Success',
                    detail: 'Tournament statuses updated successfully'
                });
            },
            error: (error) => {
                console.error('Error refreshing tournaments:', error);
                this.messageService.add({
                    life: 0, // Make toast sticky
                    severity: 'error',
                    summary: 'Error',
                    detail: 'Failed to refresh tournament statuses'
                });
            }
        });
    }

    setLayout(layout: 'grid' | 'list') {
        this.layout = layout;
    }

    navigateToCreate(): void {
        // Navigate based on current role
        if (this.isAdmin) {
            this.router.navigate(['/admin/create-tournament']);
        } else {
            this.router.navigate(['/player/tournaments']);
        }
    }

    viewTournament(tournament: Tournament): void {
        // Navigate based on current role
        if (this.isAdmin) {
            this.router.navigate(['/admin/edit-tournament', tournament.id]);
        } else {
            this.router.navigate(['/player/standings', tournament.id!]);
        }
    }

    registerForTournament(tournament: Tournament): void {
        // this.router.navigate(['/app/tournament', tournament.id, 'register']);
    }

    cancelTournament(tournament: Tournament, event: Event): void {
        event.stopPropagation(); // Prevent row click
        this.confirmationService.confirm({
            message: `Are you sure you want to cancel the tournament "${tournament.name}"? This action cannot be undone.`,
            header: 'Cancel Tournament',
            icon: 'pi pi-exclamation-triangle',
            accept: () => {
                this.saving = true;
                // Get the cancelled status from config
                this.tournamentConfigService.getTournamentConfig().pipe(
                    map(config => {
                        const cancelledStatus = config.statuses.find(s => s.id === 'cancelled');
                        if (!cancelledStatus) {
                            throw new Error('Cancelled status not found in configuration');
                        }
                        return cancelledStatus;
                    }),
                    switchMap(cancelledStatus => this.tournamentService.updateTournamentStatus(tournament.id!, cancelledStatus))
                ).subscribe({
                    next: () => {
                        this.saving = false;
                        this.messageService.add({
                            life: 0, // Make toast sticky
                            severity: 'success',
                            summary: 'Success',
                            detail: 'Tournament cancelled successfully!'
                        });
                        // Reload tournaments to show updated status
                        this.loadTournaments().subscribe(tournaments => {
                            this.tournaments = tournaments;
                        });
                    },
                    error: (error: any) => {
                        console.error('Error cancelling tournament:', error);
                        this.saving = false;
                        this.messageService.add({
                            life: 0, // Make toast sticky
                            severity: 'error',
                            summary: 'Error',
                            detail: error.message || 'Failed to cancel tournament'
                        });
                    }
                });
            }
        });
    }

    deleteTournament(tournament: Tournament, event: Event): void {
        event.stopPropagation(); // Prevent row click
        this.confirmationService.confirm({
            message: `Are you sure you want to delete the tournament "${tournament.name}"? This action cannot be undone and will remove all associated data.`,
            header: 'Delete Tournament',
            icon: 'pi pi-exclamation-triangle',
            accept: () => {
                this.saving = true;
                this.tournamentService.deleteTournament(tournament.id!).subscribe({
                    next: () => {
                        this.saving = false;
                        this.messageService.add({
                            life: 0, // Make toast sticky
                            severity: 'success',
                            summary: 'Success',
                            detail: 'Tournament deleted successfully!'
                        });
                        // Remove from local array
                        this.tournaments = this.tournaments.filter(t => t.id !== tournament.id);
                    },
                    error: (error: any) => {
                        console.error('Error deleting tournament:', error);
                        this.saving = false;
                        this.messageService.add({
                            life: 0, // Make toast sticky
                            severity: 'error',
                            summary: 'Error',
                            detail: error.message || 'Failed to delete tournament'
                        });
                    }
                });
            }
        });
    }

    getStatusName(tournament: Tournament): string {
        return (tournament as any).status?.name || 'Unknown';
    }

    getStatusColor(tournament: Tournament): string {
        return (tournament as any).status?.color || '#6b7280';
    }

    getStatusTextColor(tournament: Tournament): string {
        return (tournament as any).status?.textColor || '#ffffff';
    }

    getStatusId(tournament: Tournament): string {
        return tournament.status?.id || '';
    }

    /**
     * Format date in local format
     */
    formatLocalDate(date: Date | string | undefined): string {
        if (!date) return '';
        
        const dateObj = typeof date === 'string' ? new Date(date) : date;
        
        // Check if date is valid
        if (isNaN(dateObj.getTime())) return '';
        
        // Format using South African locale
        return dateObj.toLocaleDateString('en-ZA', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    }

    /**
     * Format date range in local format
     */
    formatDateRange(startDate: Date | string | undefined, endDate: Date | string | undefined): string {
        const start = this.formatLocalDate(startDate);
        const end = this.formatLocalDate(endDate);
        
        if (!start || !end) return '';
        
        return `${start} - ${end}`;
    }


} 
