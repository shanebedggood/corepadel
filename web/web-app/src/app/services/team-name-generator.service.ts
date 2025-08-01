import { Injectable } from '@angular/core';
import { uniqueNamesGenerator, Config, names, colors, animals, languages, starWars } from '@joaomoreno/unique-names-generator';

export interface TeamNameConfig {
  style: 'sports' | 'fantasy' | 'geographic' | 'colorful' | 'mixed';
  includeNumber?: boolean;
  separator?: string;
}

@Injectable({
  providedIn: 'root'
})
export class TeamNameGeneratorService {

  private usedNames = new Set<string>();

  /**
   * Generate a unique team name based on the specified style
   */
  generateTeamName(config: TeamNameConfig = { style: 'sports' }): string {
    let name: string;
    let attempts = 0;
    const maxAttempts = 50;

    do {
      name = this.generateNameByStyle(config);
      attempts++;
    } while (this.usedNames.has(name) && attempts < maxAttempts);

    // If we've used too many names, clear the set to allow reuse
    if (attempts >= maxAttempts) {
      this.usedNames.clear();
      name = this.generateNameByStyle(config);
    }

    this.usedNames.add(name);
    return name;
  }

  /**
   * Generate multiple unique team names
   */
  generateTeamNames(count: number, config: TeamNameConfig = { style: 'sports' }): string[] {
    const names: string[] = [];
    for (let i = 0; i < count; i++) {
      names.push(this.generateTeamName(config));
    }
    return names;
  }

  /**
   * Clear the used names cache
   */
  clearUsedNames(): void {
    this.usedNames.clear();
  }

  /**
   * Add a name to the used names set (useful when loading existing teams)
   */
  markNameAsUsed(name: string): void {
    this.usedNames.add(name);
  }

  private generateNameByStyle(config: TeamNameConfig): string {
    const separator = config.separator || ' ';
    
    switch (config.style) {
      case 'sports':
        return this.generateSportsName(separator, config.includeNumber);
      case 'fantasy':
        return this.generateFantasyName(separator, config.includeNumber);
      case 'geographic':
        return this.generateGeographicName(separator, config.includeNumber);
      case 'colorful':
        return this.generateColorfulName(separator, config.includeNumber);
      case 'mixed':
        return this.generateMixedName(separator, config.includeNumber);
      default:
        return this.generateSportsName(separator, config.includeNumber);
    }
  }

  private generateSportsName(separator: string, includeNumber?: boolean): string {
    const sportsConfig: Config = {
      dictionaries: [names, animals],
      separator,
      length: 2
    };
    
    let name = uniqueNamesGenerator(sportsConfig);
    
    if (includeNumber) {
      name += ` ${Math.floor(Math.random() * 100) + 1}`;
    }
    
    return name;
  }

  private generateFantasyName(separator: string, includeNumber?: boolean): string {
    const fantasyConfig: Config = {
      dictionaries: [starWars, animals],
      separator,
      length: 2
    };
    
    let name = uniqueNamesGenerator(fantasyConfig);
    
    if (includeNumber) {
      name += ` ${Math.floor(Math.random() * 100) + 1}`;
    }
    
    return name;
  }

  private generateGeographicName(separator: string, includeNumber?: boolean): string {
    const geoConfig: Config = {
      dictionaries: [languages, animals],
      separator,
      length: 2
    };
    
    let name = uniqueNamesGenerator(geoConfig);
    
    if (includeNumber) {
      name += ` ${Math.floor(Math.random() * 100) + 1}`;
    }
    
    return name;
  }

  private generateColorfulName(separator: string, includeNumber?: boolean): string {
    const colorConfig: Config = {
      dictionaries: [colors, animals],
      separator,
      length: 2
    };
    
    let name = uniqueNamesGenerator(colorConfig);
    
    if (includeNumber) {
      name += ` ${Math.floor(Math.random() * 100) + 1}`;
    }
    
    return name;
  }

  private generateMixedName(separator: string, includeNumber?: boolean): string {
    const mixedConfig: Config = {
      dictionaries: [names, colors, animals],
      separator,
      length: 2
    };
    
    let name = uniqueNamesGenerator(mixedConfig);
    
    if (includeNumber) {
      name += ` ${Math.floor(Math.random() * 100) + 1}`;
    }
    
    return name;
  }

  /**
   * Get available team name styles
   */
  getAvailableStyles(): { value: string; label: string; description: string }[] {
    return [
      { 
        value: 'sports', 
        label: 'Sports', 
        description: 'Classic sports team names (e.g., "Swift Eagles", "Mighty Lions")' 
      },
      { 
        value: 'fantasy', 
        label: 'Fantasy', 
        description: 'Fantasy-inspired names (e.g., "Luke Skywalker Dragons", "Yoda Phoenix")' 
      },
      { 
        value: 'geographic', 
        label: 'Geographic', 
        description: 'Language-based names (e.g., "Spanish Tigers", "French Eagles")' 
      },
      { 
        value: 'colorful', 
        label: 'Colorful', 
        description: 'Color-based names (e.g., "Red Lions", "Blue Eagles")' 
      },
      { 
        value: 'mixed', 
        label: 'Mixed', 
        description: 'Combination of names, colors, and animals (e.g., "John Red Lions", "Sarah Blue Eagles")' 
      }
    ];
  }
} 