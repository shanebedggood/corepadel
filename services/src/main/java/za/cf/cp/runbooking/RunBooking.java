package za.cf.cp.runbooking;

import com.fasterxml.jackson.annotation.JsonProperty;
import io.quarkus.hibernate.orm.panache.PanacheEntityBase;
import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.UUID;

/**
 * RunBooking entity representing 5AM run bookings stored in PostgreSQL.
 * Maps to the 'run_booking' table in the database.
 */
@Entity
@Table(name = "run_booking", schema = "core")
public class RunBooking extends PanacheEntityBase {
    
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "booking_id")
    @JsonProperty("booking_id")
    public UUID bookingId;
    
    @Column(name = "firebase_uid", nullable = false)
    @JsonProperty("user_id")
    public String firebaseUid;
    
    @Column(name = "user_name", nullable = false)
    @JsonProperty("user_name")
    public String userName;
    
    @Column(name = "booking_date", nullable = false)
    @JsonProperty("booking_date")
    public LocalDate bookingDate;
    
    @Column(name = "booking_time", nullable = false)
    @JsonProperty("booking_time")
    public LocalTime bookingTime = LocalTime.of(5, 0); // Always 5:00 AM
    
    @Column(name = "created_at")
    @JsonProperty("created_at")
    public LocalDateTime createdAt;
    
    @Column(name = "updated_at")
    @JsonProperty("updated_at")
    public LocalDateTime updatedAt;
    
    // Default constructor required by JPA
    public RunBooking() {}
    
    // Constructor with essential fields
    public RunBooking(String firebaseUid, String userName, LocalDate bookingDate) {
        this.firebaseUid = firebaseUid;
        this.userName = userName;
        this.bookingDate = bookingDate;
        this.bookingTime = LocalTime.of(5, 0); // Always 5:00 AM
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }
    
    // Constructor with all fields
    public RunBooking(String firebaseUid, String userName, LocalDate bookingDate, 
                     LocalTime bookingTime, LocalDateTime createdAt, LocalDateTime updatedAt) {
        this.firebaseUid = firebaseUid;
        this.userName = userName;
        this.bookingDate = bookingDate;
        this.bookingTime = bookingTime != null ? bookingTime : LocalTime.of(5, 0);
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
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
    
    public String getUserName() {
        return userName;
    }
    
    public void setUserName(String userName) {
        this.userName = userName;
    }
    
    public LocalDate getBookingDate() {
        return bookingDate;
    }
    
    public void setBookingDate(LocalDate bookingDate) {
        this.bookingDate = bookingDate;
    }
    
    public LocalTime getBookingTime() {
        return bookingTime;
    }
    
    public void setBookingTime(LocalTime bookingTime) {
        this.bookingTime = bookingTime != null ? bookingTime : LocalTime.of(5, 0);
    }
    
    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
    
    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
    
    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }
    
    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
    
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }
    
    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
    
    @Override
    public String toString() {
        return "RunBooking{" +
                "bookingId=" + bookingId +
                ", firebaseUid='" + firebaseUid + '\'' +
                ", userName='" + userName + '\'' +
                ", bookingDate=" + bookingDate +
                ", bookingTime=" + bookingTime +
                ", createdAt=" + createdAt +
                ", updatedAt=" + updatedAt +
                '}';
    }
}
