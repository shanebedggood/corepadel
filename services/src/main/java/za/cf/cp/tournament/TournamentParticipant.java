package za.cf.cp.tournament;

import com.fasterxml.jackson.annotation.JsonProperty;
import io.quarkus.hibernate.orm.panache.PanacheEntityBase;
import jakarta.persistence.*;
import java.util.UUID;

/**
 * TournamentParticipant entity representing tournament participants stored in PostgreSQL.
 * Maps to the 'tournament_participant' table in the database.
 * This table stores the relationship between tournaments and users.
 * User details are stored in the 'users' table.
 * Uses firebase_uid as the user identifier.
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
    
    @Column(name = "firebase_uid", nullable = false)
    @JsonProperty("firebase_uid")
    public String firebaseUid;
    
    @Column(name = "added_by", nullable = false)
    @JsonProperty("added_by")
    public String addedBy;
    
    // Default constructor required by JPA
    public TournamentParticipant() {}
    
    // Constructor with essential fields
    public TournamentParticipant(Tournament tournament, String firebaseUid, String addedBy) {
        this.tournament = tournament;
        this.firebaseUid = firebaseUid;
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
    
    public String getFirebaseUid() {
        return firebaseUid;
    }
    
    public void setFirebaseUid(String firebaseUid) {
        this.firebaseUid = firebaseUid;
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
                ", firebaseUid='" + firebaseUid + '\'' +
                ", addedBy='" + addedBy + '\'' +
                '}';
    }
} 