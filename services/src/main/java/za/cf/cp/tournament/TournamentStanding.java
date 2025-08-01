package za.cf.cp.tournament;

import io.quarkus.hibernate.orm.panache.PanacheEntityBase;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import java.util.UUID;
import java.util.List;

@Entity
@Table(name = "tournament_standings", schema = "core")
public class TournamentStanding extends PanacheEntityBase {
    
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    @Column(name = "standing_id")
    public UUID standingId;
    
    @NotNull
    @Column(name = "tournament_id")
    public String tournamentId;
    
    @NotNull
    @Column(name = "group_id")
    public String groupId;
    
    @NotNull
    @Column(name = "team_id")
    public String teamId;
    
    @Column(name = "matches_played")
    public Integer matchesPlayed = 0;
    
    @Column(name = "matches_won")
    public Integer matchesWon = 0;
    
    @Column(name = "matches_lost")
    public Integer matchesLost = 0;
    
    @Column(name = "matches_drawn")
    public Integer matchesDrawn = 0;
    
    @Column(name = "goals_for")
    public Integer goalsFor = 0;
    
    @Column(name = "goals_against")
    public Integer goalsAgainst = 0;
    
    @Column(name = "goal_difference")
    public Integer goalDifference = 0;
    
    @Column(name = "points")
    public Integer points = 0;
    
    @Column(name = "position")
    public Integer position = 0;
    
    // Helper method to calculate goal difference
    public void calculateGoalDifference() {
        this.goalDifference = this.goalsFor - this.goalsAgainst;
    }
    
    // Helper method to calculate total matches
    public void calculateMatchesPlayed() {
        this.matchesPlayed = this.matchesWon + this.matchesLost + this.matchesDrawn;
    }
    
    // Helper method to calculate points (3 for win, 1 for draw, 0 for loss)
    public void calculatePoints() {
        this.points = (this.matchesWon * 3) + this.matchesDrawn;
    }
    
    // Static method to find standings by tournament and group
    public static List<TournamentStanding> findByTournamentAndGroup(String tournamentId, String groupId) {
        return find("tournamentId = ?1 and groupId = ?2", tournamentId, groupId).list();
    }
    
    // Static method to find standings by tournament
    public static List<TournamentStanding> findByTournament(String tournamentId) {
        return find("tournamentId", tournamentId).list();
    }
    
    // Static method to find standing by tournament, group, and team
    public static TournamentStanding findByTournamentGroupAndTeam(String tournamentId, String groupId, String teamId) {
        return find("tournamentId = ?1 and groupId = ?2 and teamId = ?3", tournamentId, groupId, teamId).firstResult();
    }
} 