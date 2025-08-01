import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, map, of } from 'rxjs';
import { environment } from '../../environments/environment';

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

export interface TournamentConfig {
    formats: TournamentFormat[];
    statuses: TournamentStatus[];
    categories: TournamentCategory[];
    registrationTypes: TournamentRegistrationType[];
    venueTypes: TournamentVenueType[];
    lastUpdated: Date;
}

export interface RoundRobinConfig {
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

export interface TournamentCategory {
    id: string;
    name: string;
    description: string;
    isActive: boolean;
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

@Injectable({
    providedIn: 'root'
})
export class TournamentConfigService {
    
    constructor(private http: HttpClient) {}

    /**
     * Get complete tournament configuration from PostgreSQL backend
     * Falls back to Firebase if PostgreSQL is not available
     */
    getTournamentConfig(): Observable<TournamentConfig> {
        return this.http.get<TournamentConfig>(`${environment.quarkusApiUrl}/tournament-config`).pipe(
            map(config => ({
                ...config,
                lastUpdated: new Date(config.lastUpdated)
            })),
            catchError(error => {
                console.error('Error fetching tournament config from PostgreSQL:', error);
                // Return a default config for now - in production this would fallback to Firebase
                return of(this.getDefaultTournamentConfig());
            })
        );
    }

    /**
     * Get round-robin specific configuration from PostgreSQL backend
     * Falls back to Firebase if PostgreSQL is not available
     */
    getRoundRobinConfig(): Observable<RoundRobinConfig> {
        return this.http.get<RoundRobinConfig>(`${environment.quarkusApiUrl}/tournament-config/round-robin`).pipe(
            map(config => ({
                ...config,
                lastUpdated: new Date(config.lastUpdated)
            })),
            catchError(error => {
                console.error('Error fetching round-robin config from PostgreSQL:', error);
                // Return a default config for now - in production this would fallback to Firebase
                return of(this.getDefaultRoundRobinConfig());
            })
        );
    }

    /**
     * Health check for the tournament configuration service
     */
    healthCheck(): Observable<string> {
        return this.http.get(`${environment.quarkusApiUrl}/tournament-config/health`, { responseType: 'text' }).pipe(
            catchError(error => {
                console.error('Tournament config service health check failed:', error);
                return of('Service unavailable');
            })
        );
    }

    /**
     * Default tournament configuration for fallback
     */
    private getDefaultTournamentConfig(): TournamentConfig {
        return {
            formats: [
                {
                    id: 'single-elimination',
                    name: 'Single Elimination',
                    description: 'Teams are eliminated after one loss',
                    isActive: true,
                    maxParticipants: 64,
                    minParticipants: 4,
                    rules: ['Teams are eliminated after their first loss'],
                    category: 'Elimination'
                },
                {
                    id: 'round-robin',
                    name: 'Round Robin',
                    description: 'All teams compete against each other',
                    isActive: true,
                    maxParticipants: 16,
                    minParticipants: 3,
                    rules: ['Each team competes against every other team'],
                    category: 'Round Robin'
                }
            ],
            statuses: [
                {
                    id: 'draft',
                    name: 'Draft',
                    description: 'Tournament is being planned',
                    color: '#6b7280',
                    textColor: '#ffffff',
                    isActive: true,
                    order: 1
                },
                {
                    id: 'registration-open',
                    name: 'Registration Open',
                    description: 'Players can register',
                    color: '#4ade80',
                    textColor: '#374151',
                    isActive: true,
                    order: 2
                }
            ],
            categories: [
                {
                    id: 'mens',
                    name: 'Men\'s',
                    description: 'Men\'s teams competing',
                    isActive: true
                },
                {
                    id: 'womens',
                    name: 'Women\'s',
                    description: 'Women\'s teams competing',
                    isActive: true
                }
            ],
            registrationTypes: [
                {
                    id: 'individual',
                    name: 'Individual',
                    description: 'Players register individually',
                    isActive: true
                },
                {
                    id: 'team',
                    name: 'Team',
                    description: 'Players register as a team',
                    isActive: true
                }
            ],
            venueTypes: [
                {
                    id: 'single-venue',
                    name: 'Single Venue',
                    description: 'Tournament at a single venue',
                    isActive: true
                },
                {
                    id: 'multiple-venues',
                    name: 'Multiple Venues',
                    description: 'Tournament at multiple venues',
                    isActive: true
                }
            ],
            lastUpdated: new Date()
        };
    }

    /**
     * Default round-robin configuration for fallback
     */
    private getDefaultRoundRobinConfig(): RoundRobinConfig {
        return {
            progressionTypes: [
                {
                    id: 'group-based',
                    name: 'Group based elimination',
                    description: 'Elimination based on groups',
                    isActive: true
                },
                {
                    id: 'combined',
                    name: 'Combined elimination',
                    description: 'Elimination based on combined groups',
                    isActive: true
                }
            ],
            groupAdvancementSettings: {
                advancementModels: [
                    {
                        id: 'trophy-plate',
                        name: 'Trophy / Plate',
                        description: 'Top team to trophy, bottom to plate',
                        isActive: true
                    }
                ],
                eliminationBracketSize: [
                    {
                        id: 'final',
                        name: 'Final',
                        description: '2 teams advance to final',
                        teams: 2,
                        isActive: true
                    },
                    {
                        id: 'semi-finals',
                        name: 'Semi-finals',
                        description: '4 teams advance to semi-finals',
                        teams: 4,
                        isActive: true
                    }
                ]
            },
            combinedAdvancementSettings: {
                numOfTeamsToAdvanceOverall: [
                    {
                        id: '8',
                        name: '8',
                        description: '8 teams per group',
                        isActive: true
                    },
                    {
                        id: '4',
                        name: '4',
                        description: '4 teams per group',
                        isActive: true
                    }
                ],
                eliminationBracketSize: [
                    {
                        id: 'final',
                        name: 'Final',
                        description: '2 teams advance to final',
                        teams: 2,
                        isActive: true
                    },
                    {
                        id: 'semi-finals',
                        name: 'Semi-finals',
                        description: '4 teams advance to semi-finals',
                        teams: 4,
                        isActive: true
                    }
                ]
            },
            lastUpdated: new Date()
        };
    }
} 