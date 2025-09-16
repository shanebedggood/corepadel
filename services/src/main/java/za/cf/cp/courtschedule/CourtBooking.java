package za.cf.cp.courtschedule;

import com.fasterxml.jackson.annotation.JsonProperty;
import io.quarkus.hibernate.orm.panache.PanacheEntityBase;
import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.UUID;

/**
 * CourtBooking entity representing court bookings stored in PostgreSQL.
 * Maps to the 'court_bookings' table in the database.
 */
@Entity
@Table(name = "court_bookings", schema = "core")
public class CourtBooking extends PanacheEntityBase {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "booking_id")
    @JsonProperty("id")
    public UUID bookingId;

    @Column(name = "schedule_id", nullable = false)
    @JsonProperty("scheduleId")
    public UUID scheduleId;

    @Column(name = "firebase_uid", nullable = false)
    @JsonProperty("userId")
    public String firebaseUid;

    @Column(name = "venue_id", nullable = false)
    @JsonProperty("venueId")
    public UUID venueId;

    @Column(name = "booking_date", nullable = false)
    @JsonProperty("date")
    public LocalDate bookingDate;

    @Column(name = "time_slot", nullable = false)
    @JsonProperty("timeSlot")
    public LocalTime timeSlot;

    @Column(name = "game_duration", nullable = false)
    @JsonProperty("gameDuration")
    public int gameDuration;

    @Column(name = "court_number")
    @JsonProperty("courtNumber")
    public Integer courtNumber; // Optional - which specific court

    @Column(name = "team_number")
    @JsonProperty("teamNumber")
    public Integer teamNumber; // Team number: 1 or 2 (padel has 2 teams of 2 players each)

    @Column(name = "status", nullable = false)
    @JsonProperty("status")
    public String status = "confirmed"; // confirmed, cancelled, completed

    // Default constructor required by JPA
    public CourtBooking() {
    }

    // Constructor with essential fields
    public CourtBooking(UUID scheduleId, String firebaseUid, UUID venueId,
            LocalDate bookingDate, LocalTime timeSlot, int gameDuration) {
        this.scheduleId = scheduleId;
        this.firebaseUid = firebaseUid;
        this.venueId = venueId;
        this.bookingDate = bookingDate;
        this.timeSlot = timeSlot;
        this.gameDuration = gameDuration;
        this.status = "confirmed";
    }

    // Getters and setters
    public UUID getBookingId() {
        return bookingId;
    }

    public void setBookingId(UUID bookingId) {
        this.bookingId = bookingId;
    }

    public String getFirebaseUid() {
        return firebaseUid;
    }

    public void setFirebaseUid(String firebaseUid) {
        this.firebaseUid = firebaseUid;
    }

    public UUID getScheduleId() {
        return scheduleId;
    }

    public void setScheduleId(UUID scheduleId) {
        this.scheduleId = scheduleId;
    }

    public UUID getVenueId() {
        return venueId;
    }

    public void setVenueId(UUID venueId) {
        this.venueId = venueId;
    }

    public LocalDate getBookingDate() {
        return bookingDate;
    }

    public void setBookingDate(LocalDate bookingDate) {
        this.bookingDate = bookingDate;
    }

    public LocalTime getTimeSlot() {
        return timeSlot;
    }

    public void setTimeSlot(LocalTime timeSlot) {
        this.timeSlot = timeSlot;
    }

    public int getGameDuration() {
        return gameDuration;
    }

    public void setGameDuration(int gameDuration) {
        this.gameDuration = gameDuration;
    }

    public Integer getCourtNumber() {
        return courtNumber;
    }

    public void setCourtNumber(Integer courtNumber) {
        this.courtNumber = courtNumber;
    }

    public Integer getTeamNumber() {
        return teamNumber;
    }

    public void setTeamNumber(Integer teamNumber) {
        this.teamNumber = teamNumber;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }
    
    @Override
    public String toString() {
        return "CourtBooking{" +
                "bookingId=" + bookingId +
                ", scheduleId=" + scheduleId +
                ", firebaseUid='" + firebaseUid + '\'' +
                ", venueId=" + venueId +
                ", bookingDate=" + bookingDate +
                ", timeSlot=" + timeSlot +
                ", gameDuration=" + gameDuration +
                ", courtNumber=" + courtNumber +
                ", teamNumber=" + teamNumber + 
                ", status='" + status + '\'' +
                '}';
    }
}
