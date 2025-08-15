import { Component, Input, OnInit, OnDestroy, Output, EventEmitter, ViewChild, ElementRef, AfterViewInit, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, FormsModule, Validators } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { InputGroupModule } from 'primeng/inputgroup';
import { CardModule } from 'primeng/card';
import { TableModule } from 'primeng/table';
import { BadgeModule } from 'primeng/badge';
import { DialogModule } from 'primeng/dialog';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ToastModule } from 'primeng/toast';
import { MessageModule } from 'primeng/message';
import { TooltipModule } from 'primeng/tooltip';
import { RippleModule } from 'primeng/ripple';
import { AutoFocusModule } from 'primeng/autofocus';
import { ConfirmationService, MessageService } from 'primeng/api';
import { Subject, takeUntil } from 'rxjs';
import { MultiSelectModule } from 'primeng/multiselect';

import { TournamentService, TournamentPlayer, Tournament, TournamentParticipant } from '../../../../services/tournament.service';
import { FirebaseAuthService } from '../../../../services/firebase-auth.service';
import { UserProfile } from '../../../../models/user-profile';
import { UserService, User } from '../../../../services/user.service';

@Component({
    selector: 'app-tournament-participants',
    standalone: true,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        FormsModule,
        ButtonModule,
        InputTextModule,
        InputGroupModule,
        CardModule,
        TableModule,
        BadgeModule,
        DialogModule,
        ConfirmDialogModule,
        ToastModule,
        MessageModule,
        TooltipModule,
        RippleModule,
        AutoFocusModule,
        MultiSelectModule
    ],
    providers: [ConfirmationService, MessageService],
    templateUrl: './tournament-participants.component.html',
    styles: []
})
export class TournamentParticipantsComponent implements OnInit, OnDestroy, AfterViewInit, OnChanges {
    @Input() tournament: Tournament | undefined;
    @Input() participants: TournamentParticipant[] = [];
    @Output() participantsChanged = new EventEmitter<void>();

    // Add OnChanges to detect when participants input changes
    ngOnChanges(changes: SimpleChanges): void {
        if (changes['participants']) {
            this.updateParticipantCount();
        }
    }

    @ViewChild('searchInput') searchInput!: ElementRef;

    loading: boolean = false;
    searchLoading: boolean = false;
    showAddDialog: boolean = false;
    showRemoveDialog: boolean = false;
    selectedParticipant: TournamentParticipant | null = null;
    
    searchForm: FormGroup;
    currentUser: UserProfile | null = null;
    canAddMore: boolean = true;
    currentCount: number = 0;

    // Search properties
    searchResults: UserProfile[] = [];
    hasSearched: boolean = false;
    searchTerm: string = '';

    selectedUsers: UserProfile[] = [];

    private destroy$ = new Subject<void>();

    constructor(
        private tournamentService: TournamentService,
        private authService: FirebaseAuthService,
        private userService: UserService,
        private fb: FormBuilder,
        private confirmationService: ConfirmationService,
        private messageService: MessageService
    ) {
        this.searchForm = this.fb.group({
            searchTerm: ['', [Validators.required, Validators.minLength(3)]]
        });
    }

    ngOnInit(): void {
        this.loadCurrentUser();
        this.updateParticipantCount();
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }

    private loadCurrentUser(): void {
        this.authService.userProfile$.pipe(
            takeUntil(this.destroy$)
        ).subscribe((profile: any) => {
            this.currentUser = profile;
        });
    }



    private checkCanAddMore(): void {
        if (!this.tournament) {
            this.canAddMore = false;
            return;
        }
        const previousCanAddMore = this.canAddMore;
        this.canAddMore = this.currentCount < this.tournament.maxParticipants;
        
        // If we just reached the maximum participants and the dialog is open, close it
        if (previousCanAddMore && !this.canAddMore && this.showAddDialog) {
            this.closeAddDialog();
            this.messageService.add({
                severity: 'info',
                summary: 'Tournament Full',
                detail: 'All tournament slots have been filled. The add player dialog has been closed.'
            });
        }
    }

    searchPlayers(): void {
        const searchTerm = this.searchForm.get('searchTerm')?.value?.trim();
        
        if (!searchTerm || searchTerm.length < 3) {
            this.messageService.add({
                severity: 'warn',
                summary: 'Search',
                detail: 'Please enter at least 3 characters to search.'
            });
            return;
        }

        this.searchLoading = true;
        this.searchResults = [];
        this.hasSearched = false;

        this.userService.searchUsers(searchTerm).pipe(
            takeUntil(this.destroy$)
        ).subscribe({
            next: (users: User[]) => {
                // Convert User objects to UserProfile format
                this.searchResults = users.map(user => ({
                    user_id: user.user_id, // Use the actual database UUID if available
                    firebase_uid: user.firebase_uid,
                    email: user.email,
                    display_name: user.display_name || `${user.first_name || ''} ${user.last_name || ''}`.trim() || user.email,
                    first_name: user.first_name || '',
                    last_name: user.last_name || '',
                    username: user.display_name || `${user.first_name || ''} ${user.last_name || ''}`.trim() || user.email,
                    roles: ['player'],
                    email_verified: true,
                    mobile: user.mobile || '',
                    rating: user.rating || 1.0,
                    profile_picture: user.profile_picture,
                }));

                // Filter out users who are already participants
                const participantUids = this.participants.map(p => p.uid);
                this.searchResults = this.searchResults.filter(user => 
                    !participantUids.includes(user.firebase_uid)
                );

                this.hasSearched = true;
                this.searchLoading = false;
            },
            error: (error) => {
                console.error('Error searching users:', error);
                this.messageService.add({
                    severity: 'error',
                    summary: 'Search Error',
                    detail: 'Failed to search for users. Please try again.'
                });
                this.searchLoading = false;
            }
        });
    }

    onSearch(): void {
        this.searchPlayers();
    }

    addSelectedParticipants(): void {
        // TODO: Implement adding participants with PostgreSQL backend
        console.warn('Adding participants not yet implemented with PostgreSQL backend');
        this.messageService.add({
            severity: 'warn',
            summary: 'Not Implemented',
            detail: 'Adding participants is not yet available with the new backend.'
        });
    }

    addParticipant(player: UserProfile): void {
        if (!this.tournament?.id || !this.currentUser) return;
        
        const tournamentId = this.tournament!.id; // Store to avoid undefined issues

        // Get the user's actual rating from the database
                    this.userService.getUserByFirebaseUid(player.firebase_uid).pipe(
            takeUntil(this.destroy$)
        ).subscribe({
            next: (userFromDb: any) => {
                const participant: TournamentPlayer = {
                    uid: player.firebase_uid,
                    email: player.email || '',
                    displayName: player.display_name || player.email || '',
                    firstName: player.first_name,
                    lastName: player.last_name,
                    rating: userFromDb?.rating || player.rating || 0
                };

                this.tournamentService.addTournamentParticipant(tournamentId, participant, this.currentUser?.firebase_uid || '').pipe(
                    takeUntil(this.destroy$)
                ).subscribe({
                    next: () => {
                        this.messageService.add({
                            severity: 'success',
                            summary: 'Player Added',
                            detail: `${participant.displayName} has been added to the tournament.`
                        });
                        this.participantsChanged.emit();
                        // Clear search field and results instead of closing dialog
                        this.clearSearchField();
                    },
                    error: (error) => {
                        console.error('Error adding participant:', error);
                        this.messageService.add({
                            severity: 'error',
                            summary: 'Error',
                            detail: 'Failed to add player to tournament.'
                        });
                    }
                });
            },
            error: (error) => {
                console.error('Error fetching user rating:', error);
                // Fallback to using the rating from the player object
                const participant: TournamentPlayer = {
                    uid: player.firebase_uid || '',
                    email: player.email || '',
                    displayName: player.display_name || player.email || '',
                    firstName: player.first_name,
                    lastName: player.last_name,
                    rating: player.rating || 0
                };

                this.tournamentService.addTournamentParticipant(tournamentId, participant, this.currentUser?.firebase_uid || '').pipe(
                    takeUntil(this.destroy$)
                ).subscribe({
                    next: () => {
                        this.messageService.add({
                            severity: 'success',
                            summary: 'Player Added',
                            detail: `${participant.displayName} has been added to the tournament.`
                        });
                        this.participantsChanged.emit();
                        // Clear search field and results instead of closing dialog
                        this.clearSearchField();
                    },
                    error: (error) => {
                        console.error('Error adding player:', error);
                        this.messageService.add({
                            severity: 'error',
                            summary: 'Error',
                            detail: 'Failed to add player to tournament.'
                        });
                    }
                });
            }
        });
    }

    removeParticipant(participant: TournamentParticipant): void {
        this.confirmationService.confirm({
            message: `Are you sure you want to remove ${participant.displayName || participant.email} from the tournament?`,
            header: 'Remove Participant',
            icon: 'pi pi-exclamation-triangle',
            accept: () => {
                if (!this.tournament?.id || !participant.id) {
                    this.messageService.add({
                        severity: 'error',
                        summary: 'Error',
                        detail: 'Missing tournament or participant information.'
                    });
                    return;
                }

                this.tournamentService.removeTournamentParticipant(this.tournament.id, participant.id).pipe(
                    takeUntil(this.destroy$)
                ).subscribe({
                    next: () => {
                        this.messageService.add({
                            severity: 'success',
                            summary: 'Player Removed',
                            detail: `${participant.displayName || participant.email} has been removed from the tournament.`
                        });
                        this.participantsChanged.emit();
                    },
                    error: (error) => {
                        console.error('Error removing player:', error);
                        this.messageService.add({
                            severity: 'error',
                            summary: 'Error',
                            detail: 'Failed to remove player from tournament.'
                        });
                    }
                });
            }
        });
    }

    openAddDialog(): void {
        this.showAddDialog = true;
    }

    onDialogShow(): void {
        // Focus the search input after dialog is fully shown
        setTimeout(() => {
            if (this.searchInput) {
                this.searchInput.nativeElement.focus();
            }
        }, 300);
    }

    ngAfterViewInit(): void {
        // Required for AfterViewInit interface
    }

    closeAddDialog(): void {
        this.showAddDialog = false;
        this.searchResults = [];
        this.hasSearched = false;
        this.searchTerm = '';
        this.searchForm.reset();
    }

    clearSearchField(): void {
        this.searchResults = [];
        this.hasSearched = false;
        this.searchTerm = '';
        this.searchForm.reset();
        // Focus the search input for the next search
        setTimeout(() => {
            if (this.searchInput) {
                this.searchInput.nativeElement.focus();
            }
        }, 100);
    }

    getRemainingSlots(): number {
        if (!this.tournament) return 0;
        return Math.max(0, this.tournament.maxParticipants - this.currentCount);
    }

    getProgressPercentage(): number {
        if (!this.tournament) return 0;
        return (this.currentCount / this.tournament.maxParticipants) * 100;
    }

    getProgressColor(): string {
        if (!this.tournament) return 'bg-green-500';
        return this.currentCount >= this.tournament.maxParticipants ? 'bg-green-500' : 'bg-red-500';
    }

    private updateParticipantCount(): void {
        this.currentCount = this.participants.length;
        this.checkCanAddMore();
    }

    // TrackBy method for better performance
    trackByPlayerUid(index: number, player: UserProfile): string {
        return player.firebase_uid || `player-${index}`;
    }
} 