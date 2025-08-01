package za.cf.cp.tournament;

import com.fasterxml.jackson.annotation.JsonProperty;
import io.quarkus.hibernate.orm.panache.PanacheEntityBase;
import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.UUID;

/**
 * TournamentParticipant entity representing tournament participants stored in PostgreSQL.
 * Maps to the 'tournament_participant' table in the database.
 * This table stores the relationship between tournaments and users.
 * User details are stored in the 'users' table.
 */
@Entity
@Table(name = "tournament_participant", schema = "core")
public class TournamentParticipant extends PanacheEntityBase {
    
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    @Column(name = "participant_id")
    @JsonProperty("participant_id")
    public UUID participantId;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "tournament_id", nullable = false)
    public Tournament tournament;
    
    @Column(name = "user_id", nullable = false)
    @JsonProperty("user_id")
    public String userId;
    
    @Column(name = "added_by", nullable = false)
    @JsonProperty("added_by")
    public String addedBy;
    
    // Default constructor required by JPA
    public TournamentParticipant() {}
    
    // Constructor with essential fields
    public TournamentParticipant(Tournament tournament, String userId, String addedBy) {
        this.tournament = tournament;
        this.userId = userId;
        this.addedBy = addedBy;
    }
    
    // Getters and setters
    public UUID getParticipantId() {
        return participantId;
    }
    
    public void setParticipantId(UUID participantId) {
        this.participantId = participantId;
    }
    
    public Tournament getTournament() {
        return tournament;
    }
    
    public void setTournament(Tournament tournament) {
        this.tournament = tournament;
    }
    
    public String getUserId() {
        return userId;
    }
    
    public void setUserId(String userId) {
        this.userId = userId;
    }
    
    public String getAddedBy() {
        return addedBy;
    }
    
    public void setAddedBy(String addedBy) {
        this.addedBy = addedBy;
    }
    
    @Override
    public String toString() {
        return "TournamentParticipant{" +
                "participantId=" + participantId +
                ", tournamentId=" + (tournament != null ? tournament.getTournamentId() : null) +
                ", userId='" + userId + '\'' +
                ", addedBy='" + addedBy + '\'' +
                '}';
    }
} 