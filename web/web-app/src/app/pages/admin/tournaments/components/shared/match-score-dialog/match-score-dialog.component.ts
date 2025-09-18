import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { MessageModule } from 'primeng/message';
import { MessageService } from 'primeng/api';
import { TournamentMatch, TournamentService } from '../../../../../../services/tournament.service';

@Component({
  selector: 'app-match-score-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    DialogModule,
    ButtonModule,
    InputTextModule,
    MessageModule
  ],
  template: `
    <p-dialog 
        [(visible)]="visible" 
        [modal]="true" 
        [closable]="true"
        [draggable]="false"
        [resizable]="false"
        [style]="{width: '90vw', maxWidth: '450px'}"
        (onHide)="onCancel()">
        
        @if (match) {
            <div class="p-0">
                <div class="border-b border-gray-200 p-4 pb-3">
                    <div class="text-lg font-semibold text-gray-900 mb-4">Enter Match Score</div>
                    @if (showGroupInfo) {
                        <div class="text-xs text-gray-600 whitespace-nowrap overflow-hidden text-ellipsis mb-4">
                            {{ getGroupName(match.groupId || '') }} • {{ getVenueName(match.venueId, match.groupId) }}
                        </div>
                    }
                    
                    <!-- Match Card Layout -->
                    <div class="flex items-center justify-between">
                        <!-- Team 1 -->
                        <div class="text-center flex-1">
                            <div class="text-lg font-semibold text-gray-900 mb-1">{{ getTeamName(match.team1Id) }}</div>
                            <div class="text-sm text-gray-500">{{ getTeamPlayerNames(match.team1Id) }}</div>
                        </div>
                        
                        <!-- VS Badge -->
                        <div class="mx-4">
                            <span class="inline-flex items-center justify-center w-12 h-12 bg-gray-100 text-gray-600 rounded-full text-sm font-medium">
                                VS
                            </span>
                        </div>
                        
                        <!-- Team 2 -->
                        <div class="text-center flex-1">
                            <div class="text-lg font-semibold text-gray-900 mb-1">{{ getTeamName(match.team2Id) }}</div>
                            <div class="text-sm text-gray-500">{{ getTeamPlayerNames(match.team2Id) }}</div>
                        </div>
                    </div>
                </div>
                
                <form [formGroup]="matchForm" (ngSubmit)="onSave()" class="p-5 pt-4">
                    <div class="mb-5">
                        <label class="block text-md font-semibold text-gray-700 mb-3">Score</label>
                        <div class="space-y-3">
                            <!-- Header Row -->
                            <div class="score-grid grid gap-3 items-center">
                                <div class="text-sm font-semibold text-gray-500"></div>
                                <div class="text-center text-sm font-semibold text-gray-500" style="width: 60px;">Set 1</div>
                                <div class="text-center text-sm font-semibold text-gray-500" style="width: 60px;">Set 2</div>
                                <div class="text-center text-sm font-semibold text-gray-500" style="width: 60px;">Set 3</div>
                                <div class="text-sm font-semibold text-gray-500"></div>
                            </div>
                            
                            <!-- Team 1 Row -->
                            <div class="score-grid grid gap-3 items-center">
                                <div class="text-md font-semibold text-gray-900">{{ getTeamName(match.team1Id) }}</div>
                                <input type="number" pInputText formControlName="team1Set1" placeholder="0" min="0" max="7" 
                                       class="text-center p-1 border border-gray-300 rounded text-sm font-semibold">
                                <input type="number" pInputText formControlName="team1Set2" placeholder="0" min="0" max="7" 
                                       class="text-center p-1 border border-gray-300 rounded text-sm font-semibold">
                                <input type="number" pInputText formControlName="team1Set3" placeholder="0" min="0" max="7" 
                                       class="text-center p-1 border border-gray-300 rounded text-sm font-semibold">
                                <div class="flex justify-center">
                                    @if (getFormWinner() === getTeamName(match.team1Id)) {
                                        <span class="bg-yellow-400 text-surface-600 rounded-full w-8 h-8 flex items-center justify-center shadow-sm">
                                            <i class="pi pi-trophy text-md"></i>
                                        </span>
                                    }
                                </div>
                            </div>
                            
                            <!-- Team 2 Row -->
                            <div class="score-grid grid gap-3 items-center">
                                <div class="text-md font-semibold text-gray-900">{{ getTeamName(match.team2Id) }}</div>
                                <input type="number" pInputText formControlName="team2Set1" placeholder="0" min="0" max="7" 
                                       class="text-center p-1 border border-gray-300 rounded text-sm font-semibold">
                                <input type="number" pInputText formControlName="team2Set2" placeholder="0" min="0" max="7" 
                                       class="text-center p-1 border border-gray-300 rounded text-sm font-semibold">
                                <input type="number" pInputText formControlName="team2Set3" placeholder="0" min="0" max="7" 
                                       class="text-center p-1 border border-gray-300 rounded text-sm font-semibold">
                                <div class="flex justify-center">
                                    @if (getFormWinner() === getTeamName(match.team2Id)) {
                                        <span class="bg-yellow-400 text-surface-600 rounded-full w-8 h-8 flex items-center justify-center shadow-sm">
                                            <i class="pi pi-trophy text-md"></i>
                                        </span>
                                    }
                                </div>
                            </div>
                        </div>
                        
                        <!-- Score validation errors -->
                        @if (matchForm.errors && matchForm.errors['scoreValidation']) {
                            <div class="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                                @for (error of matchForm.errors['scoreValidation']; track $index) {
                                    <div class="flex items-center gap-2 text-red-800 text-sm mb-1 last:mb-0">
                                        <i class="pi pi-exclamation-triangle text-red-600"></i>
                                        {{ error }}
                                    </div>
                                }
                            </div>
                        }
                    </div>

                    <div class="flex justify-end gap-2">
                        <button pButton type="button" label="Cancel" class="p-button-text" (click)="onCancel()"></button>
                        <button pButton type="submit" label="Save" class="p-button-sm" [disabled]="!matchForm.valid"></button>
                    </div>
                </form>
            </div>
        }
    </p-dialog>
  `,
  styles: [`
    // Force perfect alignment
    ::ng-deep .p-dialog input[type="number"] {
        width: 60px !important;
        min-width: 60px !important;
        max-width: 60px !important;
        text-align: center !important;
    }
    
    // Ensure grid columns are exactly 60px
    .score-grid {
        grid-template-columns: 1fr 60px 60px 60px 40px !important;
    }
  `]
})
export class MatchScoreDialogComponent implements OnInit {
  @Input() visible: boolean = false;
  @Input() match: TournamentMatch | null = null;
  @Input() teams: { [groupId: string]: any[] } = {};
  @Input() venues: any[] = [];
  @Input() groups: any[] = [];
  @Input() showGroupInfo: boolean = true;
  
  @Output() save = new EventEmitter<any>();
  @Output() cancel = new EventEmitter<void>();
  @Output() visibleChange = new EventEmitter<boolean>();

  matchForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private messageService: MessageService
  ) {
    this.matchForm = this.fb.group({
      team1Score: ['', [Validators.min(0)]],
      team2Score: ['', [Validators.min(0)]],
      team1Set1: ['', [Validators.min(0)]],
      team2Set1: ['', [Validators.min(0)]],
      team1Set2: ['', [Validators.min(0)]],
      team2Set2: ['', [Validators.min(0)]],
      team1Set3: ['', [Validators.min(0)]],
      team2Set3: ['', [Validators.min(0)]]
    }, { validators: (form: FormGroup) => this.scoreValidator(form) });
  }

  ngOnInit() {
    if (this.match) {
      this.populateForm();
    }
  }

  ngOnChanges() {
    if (this.match) {
      this.populateForm();
    }
  }

  private populateForm() {
    if (!this.match) return;

    this.matchForm.patchValue({
      team1Score: this.match.team1Score || '',
      team2Score: this.match.team2Score || '',
      team1Set1: this.match.team1Set1 || '',
      team2Set1: this.match.team2Set1 || '',
      team1Set2: this.match.team1Set2 || '',
      team2Set2: this.match.team2Set2 || '',
      team1Set3: this.match.team1Set3 || '',
      team2Set3: this.match.team2Set3 || ''
    });
  }

  private scoreValidator(form: FormGroup) {
    const team1Set1 = form.get('team1Set1')?.value;
    const team2Set1 = form.get('team2Set1')?.value;
    const team1Set2 = form.get('team1Set2')?.value;
    const team2Set2 = form.get('team2Set2')?.value;
    const team1Set3 = form.get('team1Set3')?.value;
    const team2Set3 = form.get('team2Set3')?.value;

    const errors: string[] = [];

    // Check if at least one set is filled
    const hasSet1 = (team1Set1 !== '' && team1Set1 !== null) || (team2Set1 !== '' && team2Set1 !== null);
    const hasSet2 = (team1Set2 !== '' && team1Set2 !== null) || (team2Set2 !== '' && team2Set2 !== null);
    const hasSet3 = (team1Set3 !== '' && team1Set3 !== null) || (team2Set3 !== '' && team2Set3 !== null);

    if (!hasSet1 && !hasSet2 && !hasSet3) {
      return null; // No scores entered yet, that's okay
    }

    // Validate Set 1
    if (hasSet1) {
      if (team1Set1 === '' || team1Set1 === null || team2Set1 === '' || team2Set1 === null) {
        errors.push('Both teams must have scores for Set 1');
      } else {
        const set1Error = this.validateSetScore(team1Set1, team2Set1, 'Set 1');
        if (set1Error) errors.push(set1Error);
      }
    }

    // Validate Set 2
    if (hasSet2) {
      if (team1Set2 === '' || team1Set2 === null || team2Set2 === '' || team2Set2 === null) {
        errors.push('Both teams must have scores for Set 2');
      } else {
        const set2Error = this.validateSetScore(team1Set2, team2Set2, 'Set 2');
        if (set2Error) errors.push(set2Error);
      }
    }

    // Validate Set 3
    if (hasSet3) {
      if (team1Set3 === '' || team1Set3 === null || team2Set3 === '' || team2Set3 === null) {
        errors.push('Both teams must have scores for Set 3');
      } else {
        const set3Error = this.validateSetScore(team1Set3, team2Set3, 'Set 3');
        if (set3Error) errors.push(set3Error);
      }
    }

    // Check if Set 2 is filled but Set 1 is not
    if (hasSet2 && !hasSet1) {
      errors.push('Set 1 must be completed before Set 2');
    }

    // Check if Set 3 is filled but Set 2 is not
    if (hasSet3 && !hasSet2) {
      errors.push('Set 2 must be completed before Set 3');
    }

    return errors.length > 0 ? { scoreValidation: errors } : null;
  }

  private validateSetScore(score1: number, score2: number, setName: string): string | null {
    // Basic range check
    if (score1 < 0 || score1 > 7 || score2 < 0 || score2 > 7) {
      return `${setName} scores must be between 0 and 7`;
    }

    // Check for ties (not allowed except 6-6 which goes to tiebreak)
    if (score1 === score2 && score1 !== 6) {
      return `${setName} cannot be a tie (${score1}-${score2})`;
    }

    // Valid scores: 6-0, 6-1, 6-2, 6-3, 6-4, 7-5, 7-6 (tiebreak)
    // And their reverse: 0-6, 1-6, 2-6, 3-6, 4-6, 5-7, 6-7
    
    const maxScore = Math.max(score1, score2);
    const minScore = Math.min(score1, score2);
    
    // Check for invalid score combinations
    if (maxScore === 6) {
      // Standard set win: 6-0, 6-1, 6-2, 6-3, 6-4
      if (minScore > 4) {
        return `${setName} invalid score: ${score1}-${score2}. At 6-5, the set must continue to 7-5 or 6-6 (tiebreak)`;
      }
    } else if (maxScore === 7) {
      // Set won in tiebreak or extended set
      if (minScore === 6) {
        // 7-6 is valid (tiebreak)
        return null;
      } else if (minScore === 5) {
        // 7-5 is valid (extended set)
        return null;
      } else {
        return `${setName} invalid score: ${score1}-${score2}. 7-${minScore} is not a valid set score`;
      }
    } else {
      // Any other score is invalid
      return `${setName} invalid score: ${score1}-${score2}. Valid scores are 6-0 to 6-4, 7-5, or 7-6`;
    }

    return null; // Valid score
  }

  getFormWinner(): string {
    const formValue = this.matchForm.value;
    let team1Sets = 0;
    let team2Sets = 0;

    // Count sets won
    if (formValue.team1Set1 > formValue.team2Set1) team1Sets++;
    else if (formValue.team2Set1 > formValue.team1Set1) team2Sets++;

    if (formValue.team1Set2 > formValue.team2Set2) team1Sets++;
    else if (formValue.team2Set2 > formValue.team1Set2) team2Sets++;

    if (formValue.team1Set3 > formValue.team2Set3) team1Sets++;
    else if (formValue.team2Set3 > formValue.team1Set3) team2Sets++;

    if (team1Sets > team2Sets) {
      return this.getTeamName(this.match!.team1Id);
    } else if (team2Sets > team1Sets) {
      return this.getTeamName(this.match!.team2Id);
    }
    return '';
  }

  onSave() {
    if (this.matchForm.valid && this.match) {
      const formValue = this.matchForm.value;
      const updates = {
        team1Score: formValue.team1Score || 0,
        team2Score: formValue.team2Score || 0,
        team1Set1: formValue.team1Set1 || 0,
        team2Set1: formValue.team2Set1 || 0,
        team1Set2: formValue.team1Set2 || 0,
        team2Set2: formValue.team2Set2 || 0,
        team1Set3: formValue.team1Set3 || 0,
        team2Set3: formValue.team2Set3 || 0
      };
      
      this.save.emit({ matchId: this.match.id, updates });
    } else {
      // Form is invalid, show validation errors
      this.messageService.add({
        severity: 'error',
        summary: 'Invalid Scores',
        detail: 'Please check the score validation errors and correct them before saving.',
        life: 8000
      });
    }
  }

  onCancel() {
    this.matchForm.reset();
    this.visible = false;
    this.visibleChange.emit(false);
    this.cancel.emit();
  }

  getTeamName(teamId: string): string {
    for (const groupTeams of Object.values(this.teams)) {
      const team = groupTeams.find(t => t.id === teamId);
      if (team) return team.name;
    }
    return 'Unknown Team';
  }

  getTeamPlayerNames(teamId: string): string {
    if (!teamId) return '';

    for (const groupId in this.teams) {
      const team = this.teams[groupId].find(t => t.id === teamId);
      if (team && team.players && team.players.length > 0) {
        return team.players.map((player: any) => player.displayName || player.email || 'Unknown Player').join(', ');
      }
    }
    return '';
  }

  getGroupName(groupId: string): string {
    const group = this.groups.find(g => g.id === groupId);
    return group ? group.name : 'Unknown Group';
  }

  getVenueName(venueId: string | undefined, groupId: string | undefined): string {
    if (!venueId) return 'Not assigned';
    const venue = this.venues.find(v => v.id === venueId);
    return venue ? venue.name : 'Unknown venue';
  }
}
