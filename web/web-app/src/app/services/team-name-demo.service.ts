import { Injectable } from '@angular/core';
import { TeamNameGeneratorService, TeamNameConfig } from './team-name-generator.service';

@Injectable({
  providedIn: 'root'
})
export class TeamNameDemoService {

  constructor(private teamNameGenerator: TeamNameGeneratorService) {}

  /**
   * Generate sample team names for each style to demonstrate the variety
   */
  generateDemoNames(): { style: string; names: string[] }[] {
    const styles = ['sports', 'fantasy', 'geographic', 'colorful', 'mixed'];
    const results: { style: string; names: string[] }[] = [];

    styles.forEach(style => {
      const config: TeamNameConfig = { style: style as any };
      const names = this.teamNameGenerator.generateTeamNames(5, config);
      results.push({ style, names });
    });

    return results;
  }

  /**
   * Get a single demo name for each style
   */
  getSingleDemoNames(): { style: string; name: string }[] {
    const styles = ['sports', 'fantasy', 'geographic', 'colorful', 'mixed'];
    return styles.map(style => ({
      style,
      name: this.teamNameGenerator.generateTeamName({ style: style as any })
    }));
  }

  /**
   * Generate names with numbers included
   */
  generateNumberedDemoNames(): { style: string; names: string[] }[] {
    const styles = ['sports', 'fantasy', 'geographic', 'colorful', 'mixed'];
    const results: { style: string; names: string[] }[] = [];

    styles.forEach(style => {
      const config: TeamNameConfig = { 
        style: style as any, 
        includeNumber: true 
      };
      const names = this.teamNameGenerator.generateTeamNames(3, config);
      results.push({ style, names });
    });

    return results;
  }
} 