# Team Name Generator

This service provides improved team name generation for tournaments using the `@joaomoreno/unique-names-generator` library.

## Features

- **5 Different Name Styles**: Sports, Fantasy, Geographic, Colorful, and Mixed
- **Unique Name Tracking**: Prevents duplicate names within a session
- **Configurable Options**: Include numbers, custom separators
- **Safe Library**: Uses a well-maintained, popular npm package

## Usage

### Basic Usage

```typescript
import { TeamNameGeneratorService } from './team-name-generator.service';

constructor(private teamNameGenerator: TeamNameGeneratorService) {}

// Generate a random sports team name
const teamName = this.teamNameGenerator.generateTeamName({ style: 'sports' });

// Generate multiple names
const teamNames = this.teamNameGenerator.generateTeamNames(5, { style: 'fantasy' });
```

### Available Styles

1. **Sports** - Classic sports team names (e.g., "Swift Eagles", "Mighty Lions")
2. **Fantasy** - Fantasy-inspired names (e.g., "Luke Skywalker Dragons", "Yoda Phoenix")
3. **Geographic** - Language-based names (e.g., "Spanish Tigers", "French Eagles")
4. **Colorful** - Color-based names (e.g., "Red Lions", "Blue Eagles")
5. **Mixed** - Combination of names, colors, and animals (e.g., "John Red Lions", "Sarah Blue Eagles")

### Configuration Options

```typescript
interface TeamNameConfig {
  style: 'sports' | 'fantasy' | 'geographic' | 'colorful' | 'mixed';
  includeNumber?: boolean;  // Adds a random number (1-100)
  separator?: string;       // Custom separator between words
}
```

### Examples

```typescript
// Basic sports name
generateTeamName({ style: 'sports' })
// Output: "Swift Eagles"

// Fantasy name with number
generateTeamName({ style: 'fantasy', includeNumber: true })
// Output: "Luke Skywalker Dragons 42"

// Geographic name with custom separator
generateTeamName({ style: 'geographic', separator: '-' })
// Output: "Spanish-Tigers"

// Multiple names at once
generateTeamNames(3, { style: 'colorful' })
// Output: ["Red Lions", "Blue Eagles", "Green Tigers"]
```

## Integration

The service is integrated into:

- `TournamentService` - Main tournament service
- `TeamEditorComponent` - Team creation/editing dialog
- `AddTeamComponent` - Add team functionality
- `TournamentGroupsComponent` - Auto team creation

## Benefits Over Previous Implementation

1. **More Variety**: 5 different styles vs. 1 basic style
2. **Larger Dictionary**: Uses extensive word lists from the library
3. **Unique Tracking**: Prevents duplicate names
4. **Better Maintainability**: Uses a well-tested external library
5. **Configurable**: Multiple options for customization

## Library Details

- **Package**: `@joaomoreno/unique-names-generator`
- **Version**: 5.2.0
- **License**: MIT
- **Size**: ~808KB
- **Dependencies**: None
- **Last Updated**: December 2024

## Migration from Old System

The old system used hardcoded arrays:
```typescript
// OLD
const adjectives = ['Swift', 'Mighty', 'Elite', 'Dynamic', 'Powerful', 'Agile', 'Precise', 'Strategic'];
const nouns = ['Eagles', 'Lions', 'Tigers', 'Wolves', 'Sharks', 'Dragons', 'Phoenix', 'Warriors'];
```

The new system uses the library's extensive dictionaries and provides much more variety and uniqueness. 