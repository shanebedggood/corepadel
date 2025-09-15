package za.cf.cp.courtschedule;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;
import io.quarkus.hibernate.orm.panache.PanacheEntityBase;
import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.UUID;

@Entity
@Table(name = "court_schedule_days", schema = "core")
public class CourtScheduleDay extends PanacheEntityBase {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "schedule_day_id")
    public UUID scheduleDayId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "schedule_id", nullable = false)
    @JsonIgnore
    public CourtSchedule schedule;

    @Column(name = "day_of_week", nullable = false)
    @JsonProperty("dayOfWeek")
    public int dayOfWeek; // 0..6

    @Column(name = "venue_id", nullable = false)
    @JsonProperty("venueId")
    public UUID venueId;

    @Column(name = "time_slot", nullable = false)
    @JsonProperty("timeSlot")
    public LocalTime timeSlot;

    @Column(name = "game_duration", nullable = false)
    @JsonProperty("gameDuration")
    public int gameDuration; // minutes

    @Column(name = "created_at")
    public LocalDateTime createdAt;

    @Column(name = "updated_at")
    public LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}


