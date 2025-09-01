import { Component, Input, Output, EventEmitter, OnInit, OnDestroy, ChangeDetectorRef, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { SelectModule } from 'primeng/select';
import { AccordionModule } from 'primeng/accordion';
import { PopoverModule } from 'primeng/popover';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ToastModule } from 'primeng/toast';
import { MessageModule } from 'primeng/message';
import { TooltipModule } from 'primeng/tooltip';
import { RippleModule } from 'primeng/ripple';
import { ConfirmationService, MessageService } from 'primeng/api';
import { Observable, of, forkJoin, take } from 'rxjs';
import { map, switchMap, catchError, finalize } from 'rxjs/operators';
import { DialogModule } from 'primeng/dialog';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { HttpClient } from '@angular/common/http';

import { TournamentService, Tournament, TournamentParticipant, TournamentGroup, TournamentTeam, TournamentPlayer } from '../../../../services/tournament.service';
import { VenueService, Venue } from '../../../../services/venue.service';
import { FirebaseAuthService } from '../../../../services/firebase-auth.service';
import { UserProfile } from '../../../../models/user-profile';
import { TeamEditorComponent, TeamEditorData } from '../team-editor/team-editor.component';



@Component({
    selector: 'app-tournament-groups',
    standalone: true,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        AccordionModule,
        ButtonModule,
        InputTextModule,
        InputNumberModule,
        SelectModule,
        PopoverModule,
        TooltipModule,
        ConfirmDialogModule,
        ToastModule,
        MessageModule,
        RippleModule,
        TeamEditorComponent,
        DialogModule // Add DialogModule for p-dialog
    ],
    providers: [MessageService],
    templateUrl: './tournament-groups.component.html',
    styleUrls: ['./tournament-groups.component.scss']
})
export class TournamentGroupsComponent implements OnInit, OnDestroy {
    @Input() venues: Venue[] = [];
    @Input() tournament: Tournament | undefined;
    @Input() participants: TournamentParticipant[] = [];

    isAdmin: boolean = false;

    @Output() groupsUpdated = new EventEmitter<void>();
    @Output() teamsUpdated = new EventEmitter<void>();

    groups: (TournamentGroup & { venue?: Venue; teamCount?: number })[] = [];
    teams: { [groupId: string]: TournamentTeam[] } = {};
    activeGroupId: string = '';
    loading: boolean = false;
    isMobile: boolean = false;

    // Group editing
    editingGroup: TournamentGroup | null = null;
    groupForm!: FormGroup;

    // Team editing
    editingTeam: TournamentTeam | null = null;
    teamForm!: FormGroup;
    selectedPlayers: UserProfile[] = [];
    currentGroupForTeam: TournamentGroup | null = null;
    playerSearchState = {
        loading: false,
        searchTerm: '',
        hasSearched: false
    };

    // Shared Team Editor
    showTeamEditor: boolean = false;
    teamEditorData: TeamEditorData | null = null;

    showEditDialog: boolean = false;
    saving: boolean = false;
    regeneratingGroups: boolean = false;

    constructor(
        private tournamentService: TournamentService,
        private venueService: VenueService,
        private fb: FormBuilder,
        private confirmationService: ConfirmationService,
        private messageService: MessageService,
        private cdr: ChangeDetectorRef,
        private authService: FirebaseAuthService, // NEW: inject auth service
        private breakpointObserver: BreakpointObserver,
        private http: HttpClient
    ) {
        this.initializeForms();
    }

    ngOnInit(): void {
        this.breakpointObserver.observe([
            Breakpoints.XSmall,
            Breakpoints.Small
        ]).pipe(map((result: any) => result.matches)).subscribe((isMobile: boolean) => {
            this.isMobile = isMobile;
        });

        this.loadGroups().subscribe();
        // NEW: check admin status
        this.authService.userProfile$.pipe(take(1)).subscribe(profile => {
            const isAdmin = profile?.roles.includes('admin') || false;
            this.isAdmin = isAdmin;
        });
    }

    ngOnDestroy(): void {
        // Cleanup if needed
    }

    private initializeForms(): void {
        this.groupForm = this.fb.group({
            name: ['', Validators.required],
            maxTeams: [{ value: 0, disabled: true }, [Validators.required, Validators.min(1)]],
            venueId: [null]
        });

        this.teamForm = this.fb.group({
            name: ['', Validators.required],
            player1: [null, Validators.required],
            player2: [null]
        });
    }

    loadGroups(): Observable<any> {
        if (!this.tournament?.id) return of(null);
    
        this.loading = true;
        return this.tournamentService.getTournamentGroupsWithVenues(this.tournament.id, this.venues).pipe(
            switchMap(groups => {
                if (groups.length === 0) {
                    this.groups = [];
                    this.teams = {};
                    return of(null);
                }
    
                const teamObservables = groups.map(group =>
                    this.tournamentService.getTournamentTeams(this.tournament!.id!, group.id!).pipe(
                        map(teams => ({ groupId: group.id!, teams: teams })),
                        catchError(error => {
                            console.error(`Error loading teams for group ${group.id}:`, error);
                            return of({ groupId: group.id!, teams: [] });
                        })
                    )
                );
    
                return forkJoin(teamObservables).pipe(
                    map(groupWithTeamsArray => {
                        const teamsMap: { [groupId: string]: TournamentTeam[] } = {};
                        groupWithTeamsArray.forEach(item => {
                            teamsMap[item.groupId] = item.teams;
                        });
                        this.teams = teamsMap;
    
                        this.groups = groups.map(group => ({
                            ...group,
                            teamCount: this.teams[group.id!]?.length || 0
                        }));
                        

    
                        return this.groups;
                    })
                );
            }),
            catchError(error => {
                console.error('Error loading groups:', error);
                this.messageService.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: 'Failed to load groups'
                });
                return of(null);
            }),
            finalize(() => {
                this.loading = false;
            })
        );
    }

    // Group management methods
    startEditGroup(group: TournamentGroup, event: Event, popover: any): void {
        this.editingGroup = { ...group };
        this.groupForm.patchValue({
            name: group.name,
            maxTeams: group.maxTeams,
            venueId: group.venueId
        });
        popover.show(event);
    }

    cancelEditGroup(popover: any): void {
        this.editingGroup = null;
        this.groupForm.reset();
        popover.hide();
    }

    // When opening the edit dialog, set showEditDialog = true
    editGroup(group: TournamentGroup): void {
        this.editingGroup = group;
        this.showEditDialog = true;
        this.groupForm.patchValue({
            name: group.name,
            maxTeams: group.maxTeams,
            venueId: group.venueId
        });
    }

    closeEditDialog(): void {
        this.showEditDialog = false;
        this.editingGroup = null;
    }

    onEditDialogVisibleChange(visible: boolean): void {
        // Method for handling dialog visibility changes
    }

    testLoadVenues(): void {
        // Method for testing venue loading (can be removed if no longer needed)
    }

    saveGroup(): void {
        if (this.groupForm.valid && this.editingGroup) {
            this.saving = true;
            const formValue = this.groupForm.value;
            this.tournamentService.updateTournamentGroup(
                this.tournament?.id!,
                this.editingGroup.id!,
                formValue
            ).subscribe({
                next: () => {
                    this.messageService.add({
                        severity: 'success',
                        summary: 'Success',
                        detail: 'Group updated successfully!'
                    });
                    this.editingGroup = null;
                    this.groupForm.reset();
                    this.showEditDialog = false;
                    this.saving = false;
                    this.loadGroups().subscribe();
                    this.groupsUpdated.emit();
                },
                error: (error: any) => {
                    console.error('Error saving group:', error);
                    this.messageService.add({
                        severity: 'error',
                        summary: 'Error',
                        detail: error.message || 'Failed to save group'
                    });
                    this.saving = false;
                }
            });
        }
    }

    deleteGroup(group: TournamentGroup): void {
        this.confirmationService.confirm({
            message: `Are you sure you want to delete group "${group.name}"?`,
            header: 'Delete Group',
            icon: 'pi pi-exclamation-triangle',
            accept: () => {
                this.tournamentService.deleteTournamentGroup(this.tournament?.id!, group.id!).subscribe({
                    next: () => {
                        this.messageService.add({
                            severity: 'success',
                            summary: 'Success',
                            detail: 'Group deleted successfully!'
                        });
                        this.loadGroups().subscribe();
                        this.groupsUpdated.emit();
                    },
                    error: (error: any) => {
                        console.error('Error deleting group:', error);
                        this.messageService.add({
                            severity: 'error',
                            summary: 'Error',
                            detail: error.message || 'Failed to delete group'
                        });
                    }
                });
            }
        });
    }

    // Team management methods
    openAddTeamDialog(group: TournamentGroup): void {
        this.teamEditorData = {
            groupId: group.id!,
            tournamentId: this.tournament?.id!,
            maxPlayers: 2,
            participants: this.participants
        };
        this.showTeamEditor = true;
    }

    openEditTeamDialog(team: TournamentTeam, group: TournamentGroup): void {
        this.teamEditorData = {
            team: team,
            groupId: group.id!,
            tournamentId: this.tournament?.id!,
            maxPlayers: 2,
            participants: this.participants
        };
        this.showTeamEditor = true;
    }

    cancelTeamEdit(popover: any): void {
        this.editingTeam = null;
        this.currentGroupForTeam = null;
        this.selectedPlayers = [];
        this.teamForm.reset();
        popover.hide();
    }

    saveTeam(popover?: any): void {
        if (this.teamForm.valid && this.currentGroupForTeam) {
            const formValue = this.teamForm.value;
            const teamPlayers: TournamentPlayer[] = [];

            if (formValue.player1) {
                teamPlayers.push(formValue.player1);
            }
            if (formValue.player2) {
                teamPlayers.push(formValue.player2);
            }



            const teamData = {
                tournamentId: this.tournament?.id,
                groupId: (this.currentGroupForTeam as any).id!,
                name: formValue.name,
                players: teamPlayers,
                playerUids: teamPlayers.map(p => p.uid)
            };

            if (this.editingTeam) {
                // Update existing team
                (this.tournamentService as any).updateTournamentTeam(
                    this.tournament?.id,
                    this.editingTeam.id!,
                    teamData
                ).subscribe({
                    next: () => {
                        this.messageService.add({
                            severity: 'success',
                            summary: 'Success',
                            detail: 'Team updated successfully!'
                        });
                        this.finalizeTeamSave(popover);
                    },
                    error: (error: any) => {
                        console.error('Error updating team:', error);
                        this.messageService.add({
                            severity: 'error',
                            summary: 'Error',
                            detail: error.message || 'Failed to update team'
                        });
                    }
                });
            } else {
                // Create new team
                (this.tournamentService as any).createTournamentTeam(teamData).subscribe({
                    next: () => {
                        this.messageService.add({
                            severity: 'success',
                            summary: 'Success',
                            detail: 'Team created successfully!'
                        });
                        this.finalizeTeamSave(popover);
                    },
                    error: (error: any) => {
                        console.error('Error creating team:', error);
                        this.messageService.add({
                            severity: 'error',
                            summary: 'Error',
                            detail: error.message || 'Failed to create team'
                        });
                    }
                });
            }
        }
    }

    private finalizeTeamSave(popover?: any): void {
        this.editingTeam = null;
        this.currentGroupForTeam = null;
        this.selectedPlayers = [];
        this.teamForm.reset();
        if (popover) {
            popover.hide();
        }
        
        // Reload teams for the current group
        if (this.currentGroupForTeam && (this.currentGroupForTeam as any).id) {
            // Re-load all groups and teams to ensure data consistency
            this.loadGroups().subscribe();
        }
        
        this.teamsUpdated.emit();
    }

    deleteTeam(team: TournamentTeam, group: TournamentGroup): void {
        this.confirmationService.confirm({
            message: `Are you sure you want to delete team "${team.name}"?`,
            header: 'Delete Team',
            icon: 'pi pi-exclamation-triangle',
            accept: () => {
                (this.tournamentService as any).deleteTournamentTeam(this.tournament?.id, team.id!).subscribe({
                    next: () => {
                        this.messageService.add({
                            severity: 'success',
                            summary: 'Success',
                            detail: 'Team deleted successfully!'
                        });
                        // Re-load all groups and teams
                        this.loadGroups().subscribe();
                        this.teamsUpdated.emit();
                    },
                    error: (error: any) => {
                        console.error('Error deleting team:', error);
                        this.messageService.add({
                            severity: 'error',
                            summary: 'Error',
                            detail: error.message || 'Failed to delete team'
                        });
                    }
                });
            }
        });
    }

    loadAvailablePlayers(): void {
        // This method is no longer needed as players are loaded from participants
        // in the team editor component
    }

    getPlayerNames(team: TournamentTeam): string {
        return team.players.map(p => p.displayName).join(', ');
    }

    getCurrentTeamCount(groupId: string): number {
        return this.teams[groupId]?.length || 0;
    }

    isGroupFull(groupId: string): boolean {
        const group = this.groups.find(g => g.id === groupId);
        if (!group) return false;
        return this.getCurrentTeamCount(groupId) >= group.maxTeams;
    }

    shouldShowVenueSelection(): boolean {
        // Show venue selection at group level ONLY for Multiple Venues tournaments
        // For Single Venue tournaments, venue is selected at tournament level
        return this.tournament?.venueType?.name === 'Multiple Venues';
    }

    getGroupNames(): string {
        return this.groups.map(g => g.name).join(', ');
    }

    getTeamCounts(): string {
        const totalTeams = this.groups.reduce((acc, group) => acc + (group.teamCount || 0), 0);
        return `${totalTeams}`;
    }

    hasExistingTeams(): boolean {
        return Object.values(this.teams).some(groupTeams => groupTeams && groupTeams.length > 0);
    }

    getTeamCombinedRating(team: TournamentTeam): number {
        if (!team.players || team.players.length === 0) {
            return 0;
        }

        const totalRating = team.players.reduce((sum, player) => {
            return sum + (player.rating || 0);
        }, 0);

        return Math.round(totalRating / team.players.length);
    }

    hasIncompleteTeam(team: TournamentTeam): boolean {
        return !team.players || team.players.length < 2;
    }

    getGroupVenueName(group: TournamentGroup): string {
        if (!group.venueId || !this.venues || this.venues.length === 0) {
            return '';
        }
        const venue = this.venues.find(v => v.id === group.venueId);
        return venue ? venue.name : '';
    }



    // Team Editor Event Handlers
    onTeamSaved(team: TournamentTeam): void {
        this.showTeamEditor = false;
        this.teamEditorData = null;
        
        // Reload teams for the group
        // Re-load all groups and teams to ensure data consistency
        this.loadGroups().subscribe(() => {
            this.teamsUpdated.emit();
        });
    }

    onTeamCancelled(): void {
        this.showTeamEditor = false;
        this.teamEditorData = null;
    }

    onTeamEditorVisibleChange(visible: boolean): void {
        this.showTeamEditor = visible;
        if (!visible) {
            this.teamEditorData = null;
        }
    }

    autoCreateTeams(): void {
        if (!this.tournament || !this.groups.length || !this.participants.length) {
            this.messageService.add({
                severity: 'error',
                summary: 'Error',
                detail: 'Missing tournament, groups, or participants.'
            });
            return;
        }
        // 1. Filter participants with ratings, sort by rating
        const participants = [...this.participants]
            .filter(p => typeof p.rating === 'number')
            .sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0));
        
        if (participants.length < 2) {
            this.messageService.add({
                severity: 'warn',
                summary: 'Cannot Create Teams',
                detail: 'At least two participants must have a rating to auto-create teams.'
            });
            return;
        }

        if (participants.length % 2 !== 0) {
            this.messageService.add({
                severity: 'warn',
                summary: 'Odd Number of Participants',
                detail: 'There is an odd number of rated participants. The last participant will not be assigned to a team.'
            });
        }
        // 2. Pair participants to minimize rating difference (greedy: best with worst)
        const teams: { players: any[]; combinedRating: number }[] = [];
        let left = 0, right = participants.length - 1;
        while (left < right) {
            const p1 = participants[left];
            const p2 = participants[right];
            teams.push({
                players: [p1, p2],
                combinedRating: (p1.rating || 0) + (p2.rating || 0)
            });
            left++;
            right--;
        }
        // 3. Shuffle teams
        for (let i = teams.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [teams[i], teams[j]] = [teams[j], teams[i]];
        }
        // 4. Assign teams to groups in round-robin
        const groupIds = this.groups.map(g => g.id).filter((id): id is string => !!id);
        const teamCreations = teams.map((team, idx) => {
            const groupId = groupIds[idx % groupIds.length];
            const teamName = `Team ${idx + 1}`;
            if (!this.tournament?.id) return of(null);
            return this.tournamentService.createTournamentTeam(
                this.tournament.id,
                groupId,
                teamName,
                team.players
            ).pipe(
                // If error, continue
                catchError((err: any) => {
                    this.messageService.add({
                        severity: 'error',
                        summary: 'Error Creating Team',
                        detail: err.message || 'Failed to create team.'
                    });
                    return of(null);
                })
            );
        });
        // 5. Run all creations in parallel
        forkJoin(teamCreations).subscribe({
            next: () => {
                this.messageService.add({
                    severity: 'success',
                    summary: 'Teams Created',
                    detail: 'Teams have been auto-created and assigned to groups.'
                });
                this.loadGroups().subscribe(() => {
                    this.groupsUpdated.emit();
                    this.teamsUpdated.emit();
                });
            },
            error: (err) => {
                this.messageService.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: err.message || 'Failed to auto-create teams.'
                });
            }
        });
    }

    regenerateGroups(): void {
        if (!this.tournament?.id || !this.tournament.maxParticipants || !this.getNoOfGroups()) return;
        this.confirmationService.confirm({
            message: 'Are you sure you want to regenerate all groups? This will delete all existing groups and teams.',
            header: 'Regenerate Groups',
            icon: 'pi pi-exclamation-triangle',
            accept: () => {
                this.regeneratingGroups = true;
                // Close the confirmation dialog immediately
                this.confirmationService.close();
                
                this.tournamentService.deleteAllTournamentGroups(this.tournament!.id!).subscribe({
                    next: () => {
                        this.tournamentService.createTournamentGroups(
                            this.tournament!.id!,
                            this.tournament!.maxParticipants!,
                            this.getNoOfGroups()!,
                            this.tournament!.venue || undefined
                        ).subscribe({
                            next: () => {
                                this.loadGroups().subscribe(() => {
                                    this.groupsUpdated.emit();
                                    this.regeneratingGroups = false;
                                    this.messageService.add({
                                        severity: 'success',
                                        summary: 'Groups Regenerated',
                                        detail: 'Tournament groups have been regenerated.'
                                    });
                                });
                            },
                            error: (error) => {
                                this.regeneratingGroups = false;
                                this.messageService.add({
                                    severity: 'error',
                                    summary: 'Error',
                                    detail: 'Failed to create tournament groups.'
                                });
                            }
                        });
                    },
                    error: (error) => {
                        this.regeneratingGroups = false;
                        this.messageService.add({
                            severity: 'error',
                            summary: 'Error',
                            detail: 'Failed to delete existing groups.'
                        });
                    }
                });
            },
            reject: () => {
                // User clicked No - ensure dialog closes
                this.confirmationService.close();
            }
        });
    }



    private getNoOfGroups(): number | undefined {
        if (this.tournament?.tournamentType === 'ROUND_ROBIN') {
            return (this.tournament as any).noOfGroups;
        }
        return undefined;
    }
} 