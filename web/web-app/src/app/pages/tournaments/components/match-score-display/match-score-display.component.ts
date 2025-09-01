import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TournamentMatch } from '../../../../services/tournament.service';

@Component({
  selector: 'app-match-score-display',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (match) {
      <div class="match-score-display">
        <div class="score-sets">
          <div class="score-set">
            <div class="set-score">
              @for (score of getTeam1ScoresArray(); track $index) {
                <span class="score-number">{{ score }}</span>
              }
              <span class="trophy-placeholder" [class.has-trophy]="getWinner() === 'team1'">
                @if (getWinner() === 'team1') {
                  <span class="bg-yellow-400 text-surface-600 rounded-full w-8 h-8 flex items-center justify-center shadow-sm">
                    <i class="pi pi-trophy text-md"></i>
                  </span>
                }
              </span>
            </div>
            @if (getCompletedSets().length > 1) {
              <div class="set-separator">—</div>
            }
            @if (getCompletedSets().length > 1) {
              <div class="set-score">
                @for (score of getTeam2ScoresArray(); track $index) {
                  <span class="score-number">{{ score }}</span>
                }
                <span class="trophy-placeholder" [class.has-trophy]="getWinner() === 'team2'">
                  @if (getWinner() === 'team2') {
                    <span class="bg-yellow-400 text-surface-600 rounded-full w-8 h-8 flex items-center justify-center shadow-md">
                      <i class="pi pi-trophy text-md"></i>
                    </span>
                  }
                </span>
              </div>
            }
          </div>
        </div>
        @if (getCompletedSets().length === 0) {
          <div class="no-score">
            No score
          </div>
        }
      </div>
    }
  `,
  styles: [`
    .match-score-display {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.25rem;
    }

    .score-sets {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.5rem;
    }

    .score-set {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.25rem;
    }

    .set-score {
      display: flex;
      gap: 0.25rem;
      align-items: center;
      justify-content: center;
      min-height: 2rem;
    }

    .score-number {
      font-family: monospace;
      font-weight: 600;
      font-size: 1rem;
      color: #1f2937;
      text-align: center;
      border: 2px solid #d1d5db;
      border-radius: 6px;
      padding: 0.375rem;
      background-color: #f9fafb;
      width: 2rem;
      height: 2rem;
      display: flex;
      align-items: center;
      justify-content: center;
      line-height: 1;
    }

    .set-separator {
      color: #6b7280;
      font-size: 0.75rem;
      font-weight: normal;
      height: 1rem;
      display: flex;
      align-items: center;
    }

    .no-score {
      color: #6b7280;
      font-size: 1.0 rem;
      text-align: left;
    }

    .trophy-placeholder {
      width: 2rem;
      height: 2rem;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-left: 0.25rem;
    }


  `]
})
export class MatchScoreDisplayComponent {
  @Input() match!: TournamentMatch;

  getCompletedSets(): Array<{team1: number, team2: number}> {
    const sets = [
      { team1: this.match.team1Set1, team2: this.match.team2Set1 },
      { team1: this.match.team1Set2, team2: this.match.team2Set2 },
      { team1: this.match.team1Set3, team2: this.match.team2Set3 }
    ];

    return sets.filter(set => 
      set.team1 !== null && 
      set.team1 !== undefined &&
      set.team2 !== null && 
      set.team2 !== undefined &&
      !(set.team1 === 0 && set.team2 === 0)
    ) as Array<{team1: number, team2: number}>;
  }

  getTeam1Scores(): string {
    const sets = this.getCompletedSets();
    return sets.map(set => set.team1).join(' ');
  }

  getTeam2Scores(): string {
    const sets = this.getCompletedSets();
    return sets.map(set => set.team2).join(' ');
  }

  getTeam1ScoresDisplay(): string {
    const sets = this.getCompletedSets();
    return sets.map(set => set.team1).join(' ');
  }

  getTeam2ScoresDisplay(): string {
    const sets = this.getCompletedSets();
    return sets.map(set => set.team2).join(' ');
  }

  getTeam1ScoresArray(): number[] {
    const sets = this.getCompletedSets();
    return sets.map(set => set.team1);
  }

  getTeam2ScoresArray(): number[] {
    const sets = this.getCompletedSets();
    return sets.map(set => set.team2);
  }

  getWinner(): 'team1' | 'team2' | null {
    const sets = this.getCompletedSets();
    
    if (sets.length === 0) {
      return null;
    }

    const team1Wins = sets.filter(set => set.team1 > set.team2).length;
    const team2Wins = sets.filter(set => set.team2 > set.team1).length;

    if (team1Wins > team2Wins && team1Wins >= 2) {
      return 'team1';
    } else if (team2Wins > team1Wins && team2Wins >= 2) {
      return 'team2';
    }

    return null;
  }
} 