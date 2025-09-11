package za.cf.cp.tournament;

import com.fasterxml.jackson.annotation.JsonProperty;
import io.quarkus.hibernate.orm.panache.PanacheEntityBase;
import jakarta.persistence.*;
import java.util.List;
import java.util.UUID;
import java.util.ArrayList;

/**
 * TournamentTeam entity representing tournament teams stored in PostgreSQL.
 * Maps to the 'tournament_team' table in the database.
 * Uses firebase_uid for player references.
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
    
    @Column(name = "player1_firebase_uid", nullable = false)
    @JsonProperty("player1_firebase_uid")
    public String player1FirebaseUid;
    
    @Column(name = "player2_firebase_uid", nullable = true)
    @JsonProperty("player2_firebase_uid")
    public String player2FirebaseUid;

    @Column(name = "combined_rating")
    @JsonProperty("combined_rating")
    public Integer combinedRating;
    
    // Default constructor required by JPA
    public TournamentTeam() {}
    
    // Constructor with essential fields
    public TournamentTeam(Tournament tournament, String name, String player1FirebaseUid, String player2FirebaseUid, Integer combinedRating) {
        this.tournament = tournament;
        this.name = name;
        this.player1FirebaseUid = player1FirebaseUid;
        this.player2FirebaseUid = player2FirebaseUid;
        this.combinedRating = combinedRating;
    }
    
    // Helper methods to convert between List<String> and individual fields
    public List<String> getPlayerFirebaseUids() {
        List<String> uids = new ArrayList<>();
        if (player1FirebaseUid != null) {
            uids.add(player1FirebaseUid);
        }
        if (player2FirebaseUid != null) {
            uids.add(player2FirebaseUid);
        }
        return uids;
    }
    
    public void setPlayerFirebaseUids(List<String> playerFirebaseUids) {
        if (playerFirebaseUids != null && playerFirebaseUids.size() >= 1) {
            this.player1FirebaseUid = playerFirebaseUids.get(0);
        } else {
            this.player1FirebaseUid = null;
        }
        if (playerFirebaseUids != null && playerFirebaseUids.size() >= 2) {
            this.player2FirebaseUid = playerFirebaseUids.get(1);
        } else {
            this.player2FirebaseUid = null;
        }
    }
    
    // Legacy methods for backward compatibility
    public List<String> getPlayerUids() {
        return getPlayerFirebaseUids();
    }
    
    public void setPlayerUids(List<String> playerUids) {
        setPlayerFirebaseUids(playerUids);
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
    
    public String getPlayer1FirebaseUid() {
        return player1FirebaseUid;
    }
    
    public void setPlayer1FirebaseUid(String player1FirebaseUid) {
        this.player1FirebaseUid = player1FirebaseUid;
    }
    
    public String getPlayer2FirebaseUid() {
        return player2FirebaseUid;
    }
    
    public void setPlayer2FirebaseUid(String player2FirebaseUid) {
        this.player2FirebaseUid = player2FirebaseUid;
    }
    
    // Legacy getters for backward compatibility
    public String getPlayer1Uid() {
        return player1FirebaseUid;
    }
    
    public void setPlayer1Uid(String player1Uid) {
        this.player1FirebaseUid = player1Uid;
    }
    
    public String getPlayer2Uid() {
        return player2FirebaseUid;
    }
    
    public void setPlayer2Uid(String player2Uid) {
        this.player2FirebaseUid = player2Uid;
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
                ", player1FirebaseUid='" + player1FirebaseUid + '\'' +
                ", player2FirebaseUid='" + player2FirebaseUid + '\'' +
                '}';
    }
} 