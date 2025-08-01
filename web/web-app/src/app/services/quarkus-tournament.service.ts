import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { environment } from '../../environments/environment';

// Tournament Types - matching the existing interface structure
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
}

export interface TournamentGroup {
    id?: string;
    tournamentId: string;
    name: string;
    maxTeams: number;
    currentTeams: number;
    venueId?: string;
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
    venue?: any; // Venue object from venue service
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
export class QuarkusTournamentService {
    private readonly apiUrl = environment.quarkusApiUrl;

    constructor(private http: HttpClient) {}

    /**
     * Get all tournaments
     */
    getTournaments(): Observable<Tournament[]> {
        return this.http.get<Tournament[]>(`${this.apiUrl}/tournaments`).pipe(
            map(tournaments => (tournaments || []).map(tournament => ({
                ...tournament,
                startDate: new Date(tournament.startDate),
                endDate: new Date(tournament.endDate),
                registrationStartDate: tournament.registrationStartDate ? new Date(tournament.registrationStartDate) : undefined,
                registrationEndDate: tournament.registrationEndDate ? new Date(tournament.registrationEndDate) : undefined
            }))),
            catchError(error => {
                console.error('Error fetching tournaments from Quarkus:', error);
                return throwError(() => error);
            })
        );
    }

    /**
     * Get tournament by ID
     */
    getTournamentById(id: string): Observable<Tournament | null> {
        return this.http.get<Tournament>(`${this.apiUrl}/tournaments/${id}`).pipe(
            map(tournament => ({
                ...tournament,
                startDate: new Date(tournament.startDate),
                endDate: new Date(tournament.endDate),
                registrationStartDate: tournament.registrationStartDate ? new Date(tournament.registrationStartDate) : undefined,
                registrationEndDate: tournament.registrationEndDate ? new Date(tournament.registrationEndDate) : undefined
            })),
            catchError(error => {
                console.error('Error fetching tournament from Quarkus:', error);
                return of(null);
            })
        );
    }

    /**
     * Create a new tournament
     */
    createTournament(tournament: Omit<Tournament, 'id'>): Observable<string> {
        return this.http.post<{id: string}>(`${this.apiUrl}/tournaments`, tournament).pipe(
            map(response => response.id),
            catchError(error => {
                console.error('Error creating tournament in Quarkus:', error);
                return throwError(() => error);
            })
        );
    }

    /**
     * Update a tournament
     */
    updateTournament(id: string, updates: Partial<Tournament>): Observable<void> {
        return this.http.put<void>(`${this.apiUrl}/tournaments/${id}`, updates).pipe(
            catchError(error => {
                console.error('Error updating tournament in Quarkus:', error);
                return throwError(() => error);
            })
        );
    }

    /**
     * Delete a tournament
     */
    deleteTournament(id: string): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/tournaments/${id}`).pipe(
            catchError(error => {
                console.error('Error deleting tournament in Quarkus:', error);
                return throwError(() => error);
            })
        );
    }

    /**
     * Get tournaments by club ID
     */
    getTournamentsByClubId(clubId: string): Observable<Tournament[]> {
        return this.http.get<Tournament[]>(`${this.apiUrl}/tournaments/club/${clubId}`).pipe(
            map(tournaments => (tournaments || []).map(tournament => ({
                ...tournament,
                startDate: new Date(tournament.startDate),
                endDate: new Date(tournament.endDate),
                registrationStartDate: tournament.registrationStartDate ? new Date(tournament.registrationStartDate) : undefined,
                registrationEndDate: tournament.registrationEndDate ? new Date(tournament.registrationEndDate) : undefined
            }))),
            catchError(error => {
                console.error('Error fetching tournaments by club from Quarkus:', error);
                return throwError(() => error);
            })
        );
    }

    /**
     * Get tournaments by user ID
     */
    getTournamentsByUserId(userId: string): Observable<Tournament[]> {
        return this.http.get<Tournament[]>(`${this.apiUrl}/tournaments/user/${userId}`).pipe(
            map(tournaments => (tournaments || []).map(tournament => ({
                ...tournament,
                startDate: new Date(tournament.startDate),
                endDate: new Date(tournament.endDate),
                registrationStartDate: tournament.registrationStartDate ? new Date(tournament.registrationStartDate) : undefined,
                registrationEndDate: tournament.registrationEndDate ? new Date(tournament.registrationEndDate) : undefined
            }))),
            catchError(error => {
                console.error('Error fetching tournaments by user from Quarkus:', error);
                return throwError(() => error);
            })
        );
    }

    /**
     * Get tournament configuration
     */
    getTournamentConfig(): Observable<TournamentConfig> {
        return this.http.get<TournamentConfig>(`${this.apiUrl}/tournament-config`).pipe(
            catchError(error => {
                console.error('Error fetching tournament config from Quarkus:', error);
                return throwError(() => error);
            })
        );
    }

    /**
     * Get round robin configuration
     */
    getRoundRobinConfig(): Observable<any> {
        return this.http.get<any>(`${this.apiUrl}/tournament-config/round-robin`).pipe(
            catchError(error => {
                console.error('Error fetching round-robin config from Quarkus:', error);
                return throwError(() => error);
            })
        );
    }

    /**
     * Get tournament participants
     */
    getTournamentParticipants(tournamentId: string): Observable<TournamentPlayer[]> {
        return this.http.get<any[]>(`${this.apiUrl}/tournaments/${tournamentId}/participants`).pipe(
            map(participants => (participants || []).map(participant => ({
                id: participant.id,
                tournamentId: participant.tournamentId,
                uid: participant.uid,
                email: participant.email,
                displayName: participant.displayName,
                firstName: participant.firstName,
                lastName: participant.lastName,
                mobile: participant.mobile,
                rating: participant.rating,
                addedBy: participant.addedBy
            }))),
            catchError(error => {
                console.error('Error fetching tournament participants from Quarkus:', error);
                return throwError(() => error);
            })
        );
    }

    /**
     * Add tournament participant
     */
    addTournamentParticipant(tournamentId: string, player: TournamentPlayer, addedBy: string): Observable<void> {
        const participantData = {
            ...player,
            addedBy
        };
        return this.http.post<void>(`${this.apiUrl}/tournaments/${tournamentId}/participants`, participantData).pipe(
            catchError(error => {
                console.error('Error adding tournament participant in Quarkus:', error);
                return throwError(() => error);
            })
        );
    }

    /**
     * Remove tournament participant
     */
    removeTournamentParticipant(tournamentId: string, participantId: string): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/tournaments/${tournamentId}/participants/${participantId}`).pipe(
            catchError(error => {
                console.error('Error removing tournament participant in Quarkus:', error);
                return throwError(() => error);
            })
        );
    }

    /**
     * Get tournament groups
     */
    getTournamentGroups(tournamentId: string): Observable<TournamentGroup[]> {
        return this.http.get<TournamentGroup[]>(`${this.apiUrl}/tournaments/${tournamentId}/groups`).pipe(
            map(groups => (groups || []).map(group => ({
                ...group
            }))),
            catchError(error => {
                console.error('Error fetching tournament groups from Quarkus:', error);
                return throwError(() => error);
            })
        );
    }

    /**
     * Create tournament groups
     */
    createTournamentGroups(tournamentId: string, maxParticipants: number, noOfGroups: number, venue?: any): Observable<any> {
        const groupData = {
            maxParticipants,
            noOfGroups,
            venue
        };
        return this.http.post<any>(`${this.apiUrl}/tournaments/${tournamentId}/groups`, groupData).pipe(
            catchError(error => {
                console.error('Error creating tournament groups in Quarkus:', error);
                return throwError(() => error);
            })
        );
    }

    /**
     * Update tournament group
     */
    updateTournamentGroup(tournamentId: string, groupId: string, groupData: any): Observable<TournamentGroup> {
        return this.http.put<TournamentGroup>(`${this.apiUrl}/tournaments/${tournamentId}/groups/${groupId}`, groupData).pipe(
            map(group => ({
                ...group
            })),
            catchError(error => {
                console.error('Error updating tournament group in Quarkus:', error);
                return throwError(() => error);
            })
        );
    }

    /**
     * Delete tournament group
     */
    deleteTournamentGroup(tournamentId: string, groupId: string): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/tournaments/${tournamentId}/groups/${groupId}`).pipe(
            catchError(error => {
                console.error('Error deleting tournament group in Quarkus:', error);
                return throwError(() => error);
            })
        );
    }

    /**
     * Get tournament teams
     */
    getTournamentTeams(tournamentId: string, groupId: string): Observable<TournamentTeam[]> {
        return this.http.get<TournamentTeam[]>(`${this.apiUrl}/tournaments/${tournamentId}/groups/${groupId}/teams`).pipe(
            map(teams => (teams || []).map(team => ({
                ...team
            }))),
            catchError(error => {
                console.error('Error fetching tournament teams from Quarkus:', error);
                return throwError(() => error);
            })
        );
    }

    /**
     * Get all tournament teams
     */
    getAllTournamentTeams(tournamentId: string): Observable<TournamentTeam[][]> {
        return this.http.get<TournamentTeam[][]>(`${this.apiUrl}/tournaments/${tournamentId}/teams`).pipe(
            map(teamsArray => (teamsArray || []).map(teams => (teams || []).map(team => ({
                ...team
            })))),
            catchError(error => {
                console.error('Error fetching all tournament teams from Quarkus:', error);
                return throwError(() => error);
            })
        );
    }

    /**
     * Create tournament team
     */
    createTournamentTeam(tournamentId: string, groupId: string, name: string, players: TournamentPlayer[]): Observable<TournamentTeam> {
        const teamData = {
            name,
            players,
            playerUids: players.map(p => p.uid)
        };
        return this.http.post<TournamentTeam>(`${this.apiUrl}/tournaments/${tournamentId}/groups/${groupId}/teams`, teamData).pipe(
            map(team => ({
                ...team
            })),
            catchError(error => {
                console.error('Error creating tournament team in Quarkus:', error);
                return throwError(() => error);
            })
        );
    }

    /**
     * Update tournament team
     */
    updateTournamentTeam(tournamentId: string, groupId: string, teamId: string, teamData: any): Observable<TournamentTeam> {
        return this.http.put<TournamentTeam>(`${this.apiUrl}/tournaments/${tournamentId}/groups/${groupId}/teams/${teamId}`, teamData).pipe(
            map(team => ({
                ...team
            })),
            catchError(error => {
                console.error('Error updating tournament team in Quarkus:', error);
                return throwError(() => error);
            })
        );
    }

    /**
     * Get tournament matches
     */
    getTournamentMatches(tournamentId: string): Observable<TournamentMatch[]> {
        return this.http.get<TournamentMatch[]>(`${this.apiUrl}/tournaments/${tournamentId}/matches`).pipe(
            map(matches => (matches || []).map(match => ({
                ...match,
                scheduledTime: match.scheduledTime ? new Date(match.scheduledTime) : undefined
            }))),
            catchError(error => {
                console.error('Error fetching tournament matches from Quarkus:', error);
                return throwError(() => error);
            })
        );
    }

    /**
     * Get all tournament matches
     */
    getAllTournamentMatches(tournamentId: string): Observable<TournamentMatch[]> {
        return this.getTournamentMatches(tournamentId);
    }

    /**
     * Update match score
     */
    updateMatchScore(matchId: string, updates: Partial<TournamentMatch>): Observable<void> {
        return this.http.put<void>(`${this.apiUrl}/tournaments/matches/${matchId}`, updates).pipe(
            catchError(error => {
                console.error('Error updating match score in Quarkus:', error);
                return throwError(() => error);
            })
        );
    }

    /**
     * Delete all tournament groups
     */
    deleteAllTournamentGroups(tournamentId: string): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/tournaments/${tournamentId}/groups`).pipe(
            catchError(error => {
                console.error('Error deleting all tournament groups in Quarkus:', error);
                return throwError(() => error);
            })
        );
    }

    /**
     * Health check
     */
    healthCheck(): Observable<string> {
        return this.http.get<string>(`${this.apiUrl}/health`, { responseType: 'text' as 'json' }).pipe(
            catchError(error => {
                console.error('Error checking health:', error);
                return throwError(() => error);
            })
        );
    }

    /**
     * Delete a tournament match
     */
    deleteTournamentMatch(tournamentId: string, groupId: string, matchId: string): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/tournaments/${tournamentId}/groups/${groupId}/matches/${matchId}`).pipe(
            catchError(error => {
                console.error('Error deleting tournament match:', error);
                return throwError(() => error);
            })
        );
    }

    /**
     * Generate all group matches for a tournament
     */
    generateAllGroupMatches(tournamentId: string): Observable<TournamentMatch[]> {
        return this.http.post<TournamentMatch[]>(`${this.apiUrl}/tournaments/${tournamentId}/matches/generate`, {})
            .pipe(
                map(response => response),
                catchError(error => {
                    console.error('Error generating group matches:', error);
                    return throwError(() => new Error('Failed to generate group matches'));
                })
            );
    }

    // ==================== TOURNAMENT STANDINGS ====================

    /**
     * Get standings for a tournament group.
     */
    getTournamentStandings(tournamentId: string, groupId: string): Observable<TournamentStanding[]> {
        return this.http.get<TournamentStanding[]>(`${this.apiUrl}/tournaments/${tournamentId}/groups/${groupId}/standings`)
            .pipe(
                map(response => response),
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
        return this.http.get<TournamentStanding[]>(`${this.apiUrl}/tournaments/${tournamentId}/standings`)
            .pipe(
                map(response => response),
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
        return this.http.post<void>(`${this.apiUrl}/tournaments/${tournamentId}/groups/${groupId}/standings/calculate`, {})
            .pipe(
                map(response => response),
                catchError(error => {
                    console.error('Error calculating standings:', error);
                    return throwError(() => new Error('Failed to calculate standings'));
                })
            );
    }
} 