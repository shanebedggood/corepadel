package za.cf.cp.tournament;

import com.fasterxml.jackson.annotation.JsonProperty;
import io.quarkus.hibernate.orm.panache.PanacheEntityBase;
import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.UUID;

/**
 * TournamentMatch entity representing tournament matches stored in PostgreSQL.
 * Maps to the 'tournament_match' table in the database.
 */
@Entity
@Table(name = "tournament_match", schema = "core")
public class TournamentMatch extends PanacheEntityBase {
    
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    @Column(name = "match_id")
    @JsonProperty("match_id")
    public UUID matchId;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "tournament_id", nullable = false)
    public Tournament tournament;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "group_id")
    public TournamentGroup group;
    
    @Column(name = "phase", nullable = false)
    public String phase; // 'group', 'quarterfinal', 'semifinal', 'final'
    
    @Column(name = "round", nullable = false)
    public Integer round;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "team1_id", nullable = false)
    @JsonProperty("team1_id")
    public TournamentTeam team1;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "team2_id", nullable = false)
    @JsonProperty("team2_id")
    public TournamentTeam team2;
    
    @Column(name = "team1_score")
    @JsonProperty("team1_score")
    public Integer team1Score;
    
    @Column(name = "team2_score")
    @JsonProperty("team2_score")
    public Integer team2Score;
    
    @Column(name = "team1_set1")
    @JsonProperty("team1_set1")
    public Integer team1Set1;
    
    @Column(name = "team2_set1")
    @JsonProperty("team2_set1")
    public Integer team2Set1;
    
    @Column(name = "team1_set2")
    @JsonProperty("team1_set2")
    public Integer team1Set2;
    
    @Column(name = "team2_set2")
    @JsonProperty("team2_set2")
    public Integer team2Set2;
    
    @Column(name = "team1_set3")
    @JsonProperty("team1_set3")
    public Integer team1Set3;
    
    @Column(name = "team2_set3")
    @JsonProperty("team2_set3")
    public Integer team2Set3;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "winner_id")
    @JsonProperty("winner_id")
    public TournamentTeam winner;
    
    @Column(name = "status", nullable = false)
    public String status = "scheduled"; // 'scheduled', 'in_progress', 'completed', 'cancelled'
    
    @Column(name = "scheduled_time")
    @JsonProperty("scheduled_time")
    public LocalDateTime scheduledTime;
    
    @Column(name = "venue_id")
    @JsonProperty("venue_id")
    public String venueId;
    

    
    // Default constructor required by JPA
    public TournamentMatch() {}
    
    // Constructor with essential fields
    public TournamentMatch(Tournament tournament, String phase, Integer round, 
                          TournamentTeam team1, TournamentTeam team2) {
        this.tournament = tournament;
        this.phase = phase;
        this.round = round;
        this.team1 = team1;
        this.team2 = team2;
    }
    
    // Getters and setters
    public UUID getMatchId() {
        return matchId;
    }
    
    public void setMatchId(UUID matchId) {
        this.matchId = matchId;
    }
    
    public Tournament getTournament() {
        return tournament;
    }
    
    public void setTournament(Tournament tournament) {
        this.tournament = tournament;
    }
    
    public TournamentGroup getGroup() {
        return group;
    }
    
    public void setGroup(TournamentGroup group) {
        this.group = group;
    }
    
    public String getPhase() {
        return phase;
    }
    
    public void setPhase(String phase) {
        this.phase = phase;
    }
    
    public Integer getRound() {
        return round;
    }
    
    public void setRound(Integer round) {
        this.round = round;
    }
    
    public TournamentTeam getTeam1() {
        return team1;
    }
    
    public void setTeam1(TournamentTeam team1) {
        this.team1 = team1;
    }
    
    public TournamentTeam getTeam2() {
        return team2;
    }
    
    public void setTeam2(TournamentTeam team2) {
        this.team2 = team2;
    }
    
    public Integer getTeam1Score() {
        return team1Score;
    }
    
    public void setTeam1Score(Integer team1Score) {
        this.team1Score = team1Score;
    }
    
    public Integer getTeam2Score() {
        return team2Score;
    }
    
    public void setTeam2Score(Integer team2Score) {
        this.team2Score = team2Score;
    }
    
    public Integer getTeam1Set1() {
        return team1Set1;
    }
    
    public void setTeam1Set1(Integer team1Set1) {
        this.team1Set1 = team1Set1;
    }
    
    public Integer getTeam2Set1() {
        return team2Set1;
    }
    
    public void setTeam2Set1(Integer team2Set1) {
        this.team2Set1 = team2Set1;
    }
    
    public Integer getTeam1Set2() {
        return team1Set2;
    }
    
    public void setTeam1Set2(Integer team1Set2) {
        this.team1Set2 = team1Set2;
    }
    
    public Integer getTeam2Set2() {
        return team2Set2;
    }
    
    public void setTeam2Set2(Integer team2Set2) {
        this.team2Set2 = team2Set2;
    }
    
    public Integer getTeam1Set3() {
        return team1Set3;
    }
    
    public void setTeam1Set3(Integer team1Set3) {
        this.team1Set3 = team1Set3;
    }
    
    public Integer getTeam2Set3() {
        return team2Set3;
    }
    
    public void setTeam2Set3(Integer team2Set3) {
        this.team2Set3 = team2Set3;
    }
    
    public TournamentTeam getWinner() {
        return winner;
    }
    
    public void setWinner(TournamentTeam winner) {
        this.winner = winner;
    }
    
    public String getStatus() {
        return status;
    }
    
    public void setStatus(String status) {
        this.status = status;
    }
    
    public LocalDateTime getScheduledTime() {
        return scheduledTime;
    }
    
    public void setScheduledTime(LocalDateTime scheduledTime) {
        this.scheduledTime = scheduledTime;
    }
    
    public String getVenueId() {
        return venueId;
    }
    
    public void setVenueId(String venueId) {
        this.venueId = venueId;
    }
    

    
    @Override
    public String toString() {
        return "TournamentMatch{" +
                "matchId=" + matchId +
                ", tournamentId=" + (tournament != null ? tournament.getTournamentId() : null) +
                ", groupId=" + (group != null ? group.getGroupId() : null) +
                ", phase='" + phase + '\'' +
                ", round=" + round +
                ", team1Id=" + (team1 != null ? team1.getTeamId() : null) +
                ", team2Id=" + (team2 != null ? team2.getTeamId() : null) +
                ", status='" + status + '\'' +
                '}';
    }
} 