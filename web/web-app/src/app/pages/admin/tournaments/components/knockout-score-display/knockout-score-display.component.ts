import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TournamentMatch } from '../../../../../services/tournament.service';

@Component({
  selector: 'app-knockout-score-display',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (match) {
      <div class="knockout-score-display">
        @if (getCompletedSets().length > 0) {
          <div class="score-table">
            <!-- Header Row -->
            <div class="score-row header-row">
              <div class="team-header"></div>
              @for (set of getCompletedSets(); track $index) {
                <div class="set-header">Set {{ $index + 1 }}</div>
              }
              <div class="winner-header"></div>
            </div>
            
            <!-- Team 1 Row -->
            <div class="score-row team1-row">
              <div class="team-label team1-label">
                <span class="team-name">{{ getTeamName(match.team1Id) }}</span>
              </div>
              @for (score of getTeam1ScoresArray(); track $index) {
                <div class="score-cell team1-score">{{ score }}</div>
              }
              <div class="winner-cell">
                @if (getWinner() === 'team1') {
                  <span class="bg-yellow-400 text-surface-600 rounded-full w-8 h-8 flex items-center justify-center shadow-sm">
                    <i class="pi pi-trophy text-md"></i>
                  </span>
                }
              </div>
            </div>
            
            <!-- Team 2 Row -->
            <div class="score-row team2-row">
              <div class="team-label team2-label">
                <span class="team-name">{{ getTeamName(match.team2Id) }}</span>
              </div>
              @for (score of getTeam2ScoresArray(); track $index) {
                <div class="score-cell team2-score">{{ score }}</div>
              }
              <div class="winner-cell">
                @if (getWinner() === 'team2') {
                  <span class="bg-yellow-400 text-surface-600 rounded-full w-8 h-8 flex items-center justify-center shadow-sm">
                    <i class="pi pi-trophy text-md"></i>
                  </span>
                }
              </div>
            </div>
          </div>
        } @else {
          <div class="no-score">
            No score
          </div>
        }
      </div>
    }
  `,
  styles: [`
    .knockout-score-display {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      text-align: center;
    }

    .score-table {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
      font-size: 0.75rem;
      min-width: 200px;
    }

    .score-row {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .header-row {
      font-weight: 600;
      color: #6b7280;
      margin-bottom: 0.25rem;
    }

    .team-header {
      width: 80px;
      text-align: left;
    }

    .set-header {
      width: 40px;
      text-align: center;
      font-weight: 600;
      color: #6b7280;
    }

    .winner-header {
      width: 40px;
      text-align: center;
    }

    .team-label {
      width: 80px;
      text-align: left;
      font-weight: 600;
      color: #1f2937;
    }

    .team-name {
      font-size: 0.75rem;
    }

    .score-cell {
      width: 40px;
      height: 30px;
      font-family: monospace;
      font-weight: 600;
      font-size: 0.875rem;
      color: #1f2937;
      text-align: center;
      border: 1px solid #d1d5db;
      border-radius: 4px;
      background-color: #f9fafb;
      display: flex;
      align-items: center;
      justify-content: center;
      line-height: 1;
    }

    .winner-cell {
      width: 40px;
      text-align: center;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .no-score {
      color: #6b7280;
      font-size: 0.875rem;
      text-align: center;
    }
  `]
})
export class KnockoutScoreDisplayComponent {
  @Input() match!: TournamentMatch;
  @Input() teams: any = {};
  @Input() getTeamName!: (teamId: string) => string;

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
