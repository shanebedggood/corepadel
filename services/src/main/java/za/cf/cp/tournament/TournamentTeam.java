package za.cf.cp.tournament;

import com.fasterxml.jackson.annotation.JsonProperty;
import io.quarkus.hibernate.orm.panache.PanacheEntityBase;
import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.Arrays;
import java.util.ArrayList;

/**
 * TournamentTeam entity representing tournament teams stored in PostgreSQL.
 * Maps to the 'tournament_team' table in the database.
 */
@Entity
@Table(name = "tournament_team", schema = "core")
public class TournamentTeam extends PanacheEntityBase {
    
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    @Column(name = "team_id")
    @JsonProperty("team_id")
    public UUID teamId;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "tournament_id", nullable = false)
    public Tournament tournament;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "group_id")
    public TournamentGroup group;
    
    @Column(name = "name", nullable = false)
    public String name;
    
    @Column(name = "player1_uid", nullable = false)
    @JsonProperty("player1_uid")
    public String player1Uid;
    
    @Column(name = "player2_uid", nullable = true)
    @JsonProperty("player2_uid")
    public String player2Uid;

    @Column(name = "combined_rating")
    @JsonProperty("combined_rating")
    public Integer combinedRating;
    
    // Default constructor required by JPA
    public TournamentTeam() {}
    
    // Constructor with essential fields
    public TournamentTeam(Tournament tournament, String name, String player1Uid, String player2Uid, Integer combinedRating) {
        this.tournament = tournament;
        this.name = name;
        this.player1Uid = player1Uid;
        this.player2Uid = player2Uid;
        this.combinedRating = combinedRating;
    }
    
    // Helper methods to convert between List<String> and individual fields
    public List<String> getPlayerUids() {
        List<String> uids = new ArrayList<>();
        if (player1Uid != null) {
            uids.add(player1Uid);
        }
        if (player2Uid != null) {
            uids.add(player2Uid);
        }
        return uids;
    }
    
    public void setPlayerUids(List<String> playerUids) {
        if (playerUids != null && playerUids.size() >= 1) {
            this.player1Uid = playerUids.get(0);
        } else {
            this.player1Uid = null;
        }
        if (playerUids != null && playerUids.size() >= 2) {
            this.player2Uid = playerUids.get(1);
        } else {
            this.player2Uid = null;
        }
    }
    
    // Getters and setters
    public UUID getTeamId() {
        return teamId;
    }
    
    public void setTeamId(UUID teamId) {
        this.teamId = teamId;
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
    
    public String getName() {
        return name;
    }
    
    public void setName(String name) {
        this.name = name;
    }
    
    public String getPlayer1Uid() {
        return player1Uid;
    }
    
    public void setPlayer1Uid(String player1Uid) {
        this.player1Uid = player1Uid;
    }
    
    public String getPlayer2Uid() {
        return player2Uid;
    }
    
    public void setPlayer2Uid(String player2Uid) {
        this.player2Uid = player2Uid;
    }

    public Integer getCombinedRating() {
        return combinedRating;
    }

    public void setCombinedRating(Integer combinedRating) {
        this.combinedRating = combinedRating;
    }
    
    @Override
    public String toString() {
        return "TournamentTeam{" +
                "teamId=" + teamId +
                ", tournamentId=" + (tournament != null ? tournament.getTournamentId() : null) +
                ", groupId=" + (group != null ? group.getGroupId() : null) +
                ", name='" + name + '\'' +
                ", player1Uid='" + player1Uid + '\'' +
                ", player2Uid='" + player2Uid + '\'' +
                '}';
    }
} 