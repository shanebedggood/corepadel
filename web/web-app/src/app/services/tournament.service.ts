import { Injectable } from '@angular/core';
import { Observable, of, catchError, throwError, map, combineLatest } from 'rxjs';
import { Venue } from './venue.service';
import { environment } from '../../environments/environment';
import { QuarkusTournamentService } from './quarkus-tournament.service';


// Tournament Configuration Types
export interface TournamentFormat {
    id: string;
    name: string;
    description: string;
    isActive: boolean;
    maxParticipants?: number;
    minParticipants?: number;
    rules?: string[];
    category?: string;
}

export interface TournamentStatus {
    id: string;
    name: string;
    description: string;
    color: string;
    textColor: string;
    isActive: boolean;
    order: number;
}

export interface TournamentCategory {
    id: string;
    name: string;
    description: string;
    isActive: boolean;
}

export interface TournamentRegistrationType {
    id: string;
    name: string;
    description: string;
    isActive: boolean;
}

export interface TournamentVenueType {
    id: string;
    name: string;
    description: string;
    isActive: boolean;
}

export interface TournamentProgressionOption {
    id: string;
    name: string;
    description: string;
    isActive: boolean;
}

export interface TournamentPlayer {
    uid: string;
    email: string;
    displayName?: string;
    firstName?: string;
    lastName?: string;
    mobile?: string;
    rating?: number;
}

export interface TournamentParticipant {
    id?: string;
    tournamentId: string;
    uid: string;
    email: string;
    displayName: string;
    firstName?: string;
    lastName?: string;
    mobile?: string;
    rating?: number;
    addedBy: string;
}

export interface TournamentTeam {
    id?: string;
    tournamentId: string;
    groupId: string;
    name: string;
    players: TournamentPlayer[];
    playerUids?: string[];
    combinedRating?: number;
}

export interface TournamentGroup {
    id?: string;
    tournamentId: string;
    name: string;
    maxTeams: number;
    currentTeams: number;
    venueId?: string;
}

export interface Club {
    id?: string;
    name: string;
    website?: string;
}

export interface TournamentMatch {
    id?: string;
    tournamentId: string;
    groupId?: string;
    phase: 'group' | 'quarterfinal' | 'semifinal' | 'final';
    round: number;
    team1Id: string;
    team2Id: string;
    team1Score?: number;
    team2Score?: number;
    team1Set1?: number;
    team2Set1?: number;
    team1Set2?: number;
    team2Set2?: number;
    team1Set3?: number;
    team2Set3?: number;
    winnerId?: string;
    status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
    scheduledTime?: Date;
    venueId?: string;
}

export interface TournamentStanding {
    id?: string;
    tournamentId: string;
    groupId: string;
    teamId: string;
    teamName?: string;
    matchesPlayed: number;
    matchesWon: number;
    matchesLost: number;
    matchesDrawn: number;
    goalsFor: number;
    goalsAgainst: number;
    goalDifference: number;
    points: number;
    position: number;
}

export interface Tournament {
    id?: string;
    name: string;
    description: string;
    startDate: Date;
    endDate: Date;
    registrationStartDate?: Date;
    registrationEndDate?: Date;
    venueType: TournamentVenueType;
    venue?: Venue;
    maxParticipants: number;
    currentParticipants?: number;
    entryFee: number;
    status: TournamentStatus;
    format: TournamentFormat;
    category: TournamentCategory;
    registrationType: TournamentRegistrationType;
    progressionOption?: TournamentProgressionOption;
    advancementModel?: any;
    eliminationBracketSize?: any;
    clubId: string;
    club?: Club;
    userId: string;
    noOfGroups?: number;
}

export interface TournamentConfig {
    formats: TournamentFormat[];
    statuses: TournamentStatus[];
    categories: TournamentCategory[];
    registrationTypes: TournamentRegistrationType[];
    venueTypes: TournamentVenueType[];
    lastUpdated: string;
}

@Injectable({
    providedIn: 'root'
})
export class TournamentService {
    
    constructor(
        private quarkusTournamentService: QuarkusTournamentService
    ) {}

    // Tournament Configuration Methods - Using PostgreSQL backend
    getTournamentConfig(): Observable<TournamentConfig> {
        return this.quarkusTournamentService.getTournamentConfig().pipe(
            catchError(error => {
                console.error('Error fetching tournament config from PostgreSQL:', error);
                return throwError(() => error);
            })
        );
    }

    getRoundRobinConfig(): Observable<any> {
        return this.quarkusTournamentService.getRoundRobinConfig().pipe(
            catchError(error => {
                console.error('Error fetching round-robin config from PostgreSQL:', error);
                return throwError(() => error);
            })
        );
    }

    // Tournament Methods - Using PostgreSQL backend
    getTournaments(): Observable<Tournament[]> {
        return this.quarkusTournamentService.getTournaments().pipe(
            catchError(error => {
                console.error('Error fetching tournaments from PostgreSQL:', error);
                return throwError(() => error);
            })
        );
    }

    getTournamentObservable(id: string): Observable<Tournament | null> {
        return this.quarkusTournamentService.getTournamentById(id).pipe(
            catchError(error => {
                console.error('Error fetching tournament from PostgreSQL:', error);
                return throwError(() => error);
            })
        );
    }

    createTournament(tournament: Omit<Tournament, 'id'>): Observable<string> {
        return this.quarkusTournamentService.createTournament(tournament).pipe(
            catchError(error => {
                console.error('Error creating tournament in PostgreSQL:', error);
                return throwError(() => error);
            })
        );
    }

    updateTournament(id: string, updates: Partial<Tournament>): Observable<void> {
        return this.quarkusTournamentService.updateTournament(id, updates).pipe(
            catchError(error => {
                console.error('Error updating tournament in PostgreSQL:', error);
                return throwError(() => error);
            })
        );
    }

    deleteTournament(id: string): Observable<void> {
        return this.quarkusTournamentService.deleteTournament(id).pipe(
            catchError(error => {
                console.error('Error deleting tournament in PostgreSQL:', error);
                return throwError(() => error);
            })
        );
    }

    // Placeholder methods for tournament participants, groups, teams, and matches
    // These will need to be implemented with PostgreSQL backend
    
    getTournamentParticipants(tournamentId: string): Observable<TournamentPlayer[]> {
        return this.quarkusTournamentService.getTournamentParticipants(tournamentId).pipe(
            catchError(error => {
                console.error('Error fetching tournament participants from PostgreSQL:', error);
                return throwError(() => error);
            })
        );
    }

    addTournamentParticipant(tournamentId: string, player: TournamentPlayer, addedBy: string): Observable<void> {
        return this.quarkusTournamentService.addTournamentParticipant(tournamentId, player, addedBy).pipe(
            catchError(error => {
                console.error('Error adding tournament participant in PostgreSQL:', error);
                return throwError(() => error);
            })
        );
    }

    removeTournamentParticipant(tournamentId: string, participantId: string): Observable<void> {
        return this.quarkusTournamentService.removeTournamentParticipant(tournamentId, participantId).pipe(
            catchError(error => {
                console.error('Error removing tournament participant in PostgreSQL:', error);
                return throwError(() => error);
            })
        );
    }

    getTournamentGroups(tournamentId: string): Observable<TournamentGroup[]> {
        return this.quarkusTournamentService.getTournamentGroups(tournamentId).pipe(
            catchError(error => {
                console.error('Error fetching tournament groups from PostgreSQL:', error);
                return throwError(() => error);
            })
        );
    }

    createTournamentGroups(tournamentId: string, maxParticipants: number, noOfGroups: number, venue?: any): Observable<any> {
        return this.quarkusTournamentService.createTournamentGroups(tournamentId, maxParticipants, noOfGroups, venue).pipe(
            catchError(error => {
                console.error('Error creating tournament groups in PostgreSQL:', error);
                return throwError(() => error);
            })
        );
    }

    updateTournamentGroup(tournamentId: string, groupId: string, groupData: any): Observable<TournamentGroup> {
        return this.quarkusTournamentService.updateTournamentGroup(tournamentId, groupId, groupData).pipe(
            catchError(error => {
                console.error('Error updating tournament group in PostgreSQL:', error);
                return throwError(() => error);
            })
        );
    }

    deleteTournamentGroup(tournamentId: string, groupId: string): Observable<void> {
        return this.quarkusTournamentService.deleteTournamentGroup(tournamentId, groupId).pipe(
            catchError(error => {
                console.error('Error deleting tournament group in PostgreSQL:', error);
                return throwError(() => error);
            })
        );
    }

    getTournamentTeams(tournamentId: string, groupId: string): Observable<TournamentTeam[]> {
        return this.quarkusTournamentService.getTournamentTeams(tournamentId, groupId).pipe(
            catchError(error => {
                console.error('Error fetching tournament teams from PostgreSQL:', error);
                return throwError(() => error);
            })
        );
    }

    getAllTournamentTeams(tournamentId: string): Observable<TournamentTeam[][]> {
        return this.quarkusTournamentService.getAllTournamentTeams(tournamentId).pipe(
            catchError(error => {
                console.error('Error fetching all tournament teams from PostgreSQL:', error);
                return throwError(() => error);
            })
        );
    }

    createTournamentTeam(tournamentId: string, groupId: string, name: string, players: TournamentPlayer[]): Observable<TournamentTeam> {
        return this.quarkusTournamentService.createTournamentTeam(tournamentId, groupId, name, players).pipe(
            catchError(error => {
                console.error('Error creating tournament team in PostgreSQL:', error);
                return throwError(() => error);
            })
        );
    }

    updateTournamentTeam(tournamentId: string, groupId: string, teamId: string, teamData: any): Observable<TournamentTeam> {
        return this.quarkusTournamentService.updateTournamentTeam(tournamentId, groupId, teamId, teamData).pipe(
            catchError(error => {
                console.error('Error updating tournament team in PostgreSQL:', error);
                return throwError(() => error);
            })
        );
    }

    getTournamentMatches(tournamentId: string): Observable<TournamentMatch[]> {
        return this.quarkusTournamentService.getTournamentMatches(tournamentId).pipe(
            catchError(error => {
                console.error('Error fetching tournament matches from PostgreSQL:', error);
                return throwError(() => error);
            })
        );
    }

    getAllTournamentMatches(tournamentId: string): Observable<TournamentMatch[]> {
        return this.quarkusTournamentService.getAllTournamentMatches(tournamentId).pipe(
            catchError(error => {
                console.error('Error fetching all tournament matches from PostgreSQL:', error);
                return throwError(() => error);
            })
        );
    }

    updateMatchScore(matchId: string, updates: Partial<TournamentMatch>): Observable<void> {
        return this.quarkusTournamentService.updateMatchScore(matchId, updates).pipe(
            catchError(error => {
                console.error('Error updating match score in PostgreSQL:', error);
                return throwError(() => error);
            })
        );
    }

    deleteAllTournamentGroups(tournamentId: string): Observable<void> {
        return this.quarkusTournamentService.deleteAllTournamentGroups(tournamentId).pipe(
            catchError(error => {
                console.error('Error deleting all tournament groups in PostgreSQL:', error);
                return throwError(() => error);
            })
        );
    }

    updateAllTournamentStatuses(): Observable<void> {
        // For now, handle status updates locally without backend call
        // This prevents the 500 error while we implement the backend endpoint
        return of(void 0);
    }

    /**
     * Validate tournament configuration and return validation results
     */
    validateTournamentConfig(tournamentData: any): Observable<any> {
        return combineLatest({
            config: this.getTournamentConfig(),
            roundRobinConfig: this.getRoundRobinConfig()
        }).pipe(
            map(({ config, roundRobinConfig }) => {
                const validationResult = this.validateTournamentConfigSettings(tournamentData, config, roundRobinConfig);
                const calculatedStatus = this.calculateTournamentStatus(tournamentData, config);
                
                return {
                    ...validationResult,
                    calculatedStatus
                };
            }),
            catchError(error => {
                console.error('Error validating tournament config:', error);
                return throwError(() => error);
            })
        );
    }

    /**
     * Validate tournament configuration settings
     */
    private validateTournamentConfigSettings(tournamentData: any, config: any, roundRobinConfig: any): any {
        const errors: string[] = [];
        const warnings: string[] = [];

        // Basic validation
        if (!tournamentData.name || tournamentData.name.trim() === '') {
            errors.push('Tournament name is required');
        }

        if (!tournamentData.description || tournamentData.description.trim() === '') {
            errors.push('Tournament description is required');
        }

        if (!tournamentData.startDate) {
            errors.push('Start date is required');
        }

        if (!tournamentData.endDate) {
            errors.push('End date is required');
        }

        if (tournamentData.startDate && tournamentData.endDate) {
            const startDate = new Date(tournamentData.startDate);
            const endDate = new Date(tournamentData.endDate);
            
            if (startDate > endDate) {
                errors.push('End date must be after start date');
            }
        }

        if (tournamentData.registrationStartDate && tournamentData.registrationEndDate && tournamentData.startDate) {
            const regStartDate = new Date(tournamentData.registrationStartDate);
            const regEndDate = new Date(tournamentData.registrationEndDate);
            const startDate = new Date(tournamentData.startDate);
            
            if (regStartDate >= regEndDate) {
                errors.push('Registration end date must be after registration start date');
            }
            
            if (regEndDate >= startDate) {
                errors.push('Registration must end before tournament starts');
            }
        }

        // Participant validation
        if (!tournamentData.maxParticipants || tournamentData.maxParticipants < 2) {
            errors.push('Maximum participants must be at least 2');
        }

        if (tournamentData.maxParticipants && tournamentData.maxParticipants % 2 !== 0) {
            errors.push('Maximum participants must be an even number (teams of 2)');
        }

        // Group validation
        if (tournamentData.noOfGroups && tournamentData.noOfGroups < 1) {
            errors.push('Number of groups must be at least 1');
        }

        if (tournamentData.maxParticipants && tournamentData.noOfGroups) {
            const teamsPerGroup = Math.floor(tournamentData.maxParticipants / 2 / tournamentData.noOfGroups);
            if (teamsPerGroup < 1) {
                errors.push(`Invalid configuration: ${tournamentData.maxParticipants} participants cannot be divided into ${tournamentData.noOfGroups} groups`);
            } else if (teamsPerGroup < 2) {
                warnings.push(`Each group will have only ${teamsPerGroup} team(s). Consider reducing the number of groups or increasing participants.`);
            }
        }

        // Format validation
        if (!tournamentData.format) {
            errors.push('Tournament format is required');
        } else {
            // Handle both object format (with .id) and string format (direct ID)
            const formatId = typeof tournamentData.format === 'string' ? tournamentData.format : tournamentData.format.id;
            const validFormat = config.formats?.find((f: any) => f.id === formatId && f.isActive);
            if (!validFormat) {
                errors.push('Invalid or inactive tournament format');
            }
        }

        // Category validation
        if (!tournamentData.category) {
            errors.push('Tournament category is required');
        } else {
            // Handle both object format (with .id) and string format (direct ID)
            const categoryId = typeof tournamentData.category === 'string' ? tournamentData.category : tournamentData.category.id;
            const validCategory = config.categories?.find((c: any) => c.id === categoryId && c.isActive);
            if (!validCategory) {
                errors.push('Invalid or inactive tournament category');
            }
        }

        // Registration type validation
        if (!tournamentData.registrationType) {
            errors.push('Registration type is required');
        } else {
            // Handle both object format (with .id) and string format (direct ID)
            const registrationTypeId = typeof tournamentData.registrationType === 'string' ? tournamentData.registrationType : tournamentData.registrationType.id;
            const validRegistrationType = config.registrationTypes?.find((r: any) => r.id === registrationTypeId && r.isActive);
            if (!validRegistrationType) {
                errors.push('Invalid or inactive registration type');
            }
        }

        // Venue type validation
        if (!tournamentData.venueType) {
            errors.push('Venue type is required');
        } else {
            // Handle both object format (with .id) and string format (direct ID)
            const venueTypeId = typeof tournamentData.venueType === 'string' ? tournamentData.venueType : tournamentData.venueType.id;
            const validVenueType = config.venueTypes?.find((v: any) => v.id === venueTypeId && v.isActive);
            if (!validVenueType) {
                errors.push('Invalid or inactive venue type');
            }
        }

        // Entry fee validation
        if (tournamentData.entryFee === undefined || tournamentData.entryFee === null) {
            errors.push('Entry fee is required');
        } else if (tournamentData.entryFee < 0) {
            errors.push('Entry fee cannot be negative');
        }

        // Progression option validation for round-robin format
        const formatId = typeof tournamentData.format === 'string' ? tournamentData.format : tournamentData.format?.id;
        if (formatId === 'round_robin') {
            if (!tournamentData.progressionOption) {
                errors.push('Progression option is required for round-robin format');
            } else {
                // Additional validation for group-based elimination
                const progressionOptionId = typeof tournamentData.progressionOption === 'string' ? tournamentData.progressionOption : tournamentData.progressionOption.id;
                if (progressionOptionId === 'group_based_elimination') {
                    if (!tournamentData.advancementModel) {
                        errors.push('Advancement model is required for group-based elimination');
                    }
                    if (!tournamentData.eliminationBracketSize) {
                        errors.push('Elimination bracket size is required for group-based elimination');
                    }
                }
            }
        }

        return {
            isValid: errors.length === 0,
            errors,
            warnings
        };
    }

    updateTournamentStatus(id: string, status: TournamentStatus): Observable<void> {
        return this.updateTournament(id, { status }).pipe(
            catchError(error => {
                console.error('Error updating tournament status in PostgreSQL:', error);
                return throwError(() => error);
            })
        );
    }

    // Additional methods needed by components
    getTournamentGroupsWithVenues(tournamentId: string, venues: Venue[]): Observable<(TournamentGroup & { venue?: Venue })[]> {
        return this.getTournamentGroups(tournamentId).pipe(
            map(groups => groups.map(group => ({
                ...group,
                venue: venues.find(v => v.id === group.venueId)
            })))
        );
    }



    generateAllGroupMatches(tournamentId: string): Observable<TournamentMatch[][]> {
        return this.quarkusTournamentService.generateAllGroupMatches(tournamentId).pipe(
            map(matches => {
                // Group matches by groupId for the expected return format
                const matchesByGroup: { [groupId: string]: TournamentMatch[] } = {};
                matches.forEach(match => {
                    if (match.groupId) {
                        if (!matchesByGroup[match.groupId]) {
                            matchesByGroup[match.groupId] = [];
                        }
                        matchesByGroup[match.groupId].push(match);
                    }
                });
                return Object.values(matchesByGroup);
            }),
            catchError(error => {
                console.error('Error generating group matches:', error);
                return throwError(() => error);
            })
        );
    }

    deleteAllTournamentMatches(tournamentId: string): Observable<void> {
        // TODO: Implement with PostgreSQL backend
        console.warn('deleteAllTournamentMatches not yet implemented with PostgreSQL');
        return of(void 0);
    }

    updateTournamentMatch(tournamentId: string, matchId: string, updates: Partial<TournamentMatch>): Observable<void> {
        return this.updateMatchScore(matchId, updates);
    }

    deleteTournamentMatch(tournamentId: string, groupId: string, matchId: string): Observable<void> {
        return this.quarkusTournamentService.deleteTournamentMatch(tournamentId, groupId, matchId);
    }

    /**
     * Check if a player is already registered in a team for this tournament
     */
    isPlayerInTournament(tournamentId: string, playerUid: string): Observable<boolean> {
        return this.getAllTournamentTeams(tournamentId).pipe(
            map(teamsArray => {
                // Flatten all teams from all groups
                const allTeams = teamsArray.flat();
                // Check if player is in any team
                return allTeams.some(team => 
                    team.players && team.players.some(player => player.uid === playerUid)
                );
            }),
            catchError(error => {
                console.error('Error checking if player is in tournament:', error);
                return of(false);
            })
        );
    }

    /**
     * Check if a player is a participant in this tournament
     */
    isPlayerParticipant(tournamentId: string, playerUid: string): Observable<boolean> {
        return this.getTournamentParticipants(tournamentId).pipe(
            map(participants => participants.some(p => p.uid === playerUid))
        );
    }

    // ==================== TOURNAMENT STANDINGS ====================

    /**
     * Get standings for a tournament group.
     */
    getTournamentStandings(tournamentId: string, groupId: string): Observable<TournamentStanding[]> {
        return this.quarkusTournamentService.getTournamentStandings(tournamentId, groupId).pipe(
            map((response: any) => response as TournamentStanding[]),
            catchError(error => {
                console.error('Error fetching tournament standings:', error);
                return throwError(() => new Error('Failed to fetch tournament standings'));
            })
        );
    }

    /**
     * Get all standings for a tournament.
     */
    getAllTournamentStandings(tournamentId: string): Observable<TournamentStanding[]> {
        return this.quarkusTournamentService.getAllTournamentStandings(tournamentId).pipe(
            map((response: any) => response as TournamentStanding[]),
            catchError(error => {
                console.error('Error fetching all tournament standings:', error);
                return throwError(() => new Error('Failed to fetch all tournament standings'));
            })
        );
    }

    /**
     * Calculate and update standings for a tournament group.
     */
    calculateStandings(tournamentId: string, groupId: string): Observable<void> {
        return this.quarkusTournamentService.calculateStandings(tournamentId, groupId).pipe(
            catchError(error => {
                console.error('Error calculating standings:', error);
                return throwError(() => new Error('Failed to calculate standings'));
            })
        );
    }

    // Utility methods
    calculateTournamentStatus(tournament: Tournament, config: TournamentConfig): TournamentStatus {
        const now = new Date();
        const startDate = tournament.startDate;
        const endDate = tournament.endDate;
        const registrationStartDate = tournament.registrationStartDate;
        const registrationEndDate = tournament.registrationEndDate;
        const maxParticipants = tournament.maxParticipants;
        const currentParticipants = tournament.currentParticipants || 0;

        // Find statuses in config
        const draftStatus = config.statuses.find(s => s.name === 'Draft');
        const registrationOpenStatus = config.statuses.find(s => s.name === 'Registration Open');
        const registrationClosedStatus = config.statuses.find(s => s.name === 'Registration Closed');
        const inProgressStatus = config.statuses.find(s => s.name === 'In Progress');
        const completedStatus = config.statuses.find(s => s.name === 'Completed');

        // Calculate status based on dates and participants
        if (endDate && now > endDate) {
            return completedStatus || tournament.status;
        }

        if (startDate && now >= startDate) {
            return inProgressStatus || tournament.status;
        }

        if (registrationEndDate && now >= registrationEndDate) {
            return registrationClosedStatus || tournament.status;
        }

        if (registrationStartDate && now >= registrationStartDate) {
            return registrationOpenStatus || tournament.status;
        }

        return draftStatus || tournament.status;
    }

    loadCompleteTournamentData(tournamentId: string, venues: Venue[]): Observable<{ tournament: Tournament | null; config: TournamentConfig; groups: (TournamentGroup & { venue?: Venue })[]; teams: TournamentTeam[][]; }> {
        return this.quarkusTournamentService.getTournamentById(tournamentId).pipe(
            map(tournament => {
                if (!tournament) {
                    return { tournament: null, config: {} as TournamentConfig, groups: [], teams: [] };
                }
                
                // TODO: Implement full data loading with PostgreSQL backend
                return { 
                    tournament, 
                    config: {} as TournamentConfig, 
                    groups: [], 
                    teams: [] 
                };
            }),
            catchError(error => {
                console.error('Error loading tournament data:', error);
                return of({ tournament: null, config: {} as TournamentConfig, groups: [], teams: [] });
            })
        );
    }
}
