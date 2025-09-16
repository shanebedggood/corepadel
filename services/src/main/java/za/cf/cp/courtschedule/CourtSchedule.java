package za.cf.cp.courtschedule;

import com.fasterxml.jackson.annotation.JsonProperty;
import io.quarkus.hibernate.orm.panache.PanacheEntityBase;
import jakarta.persistence.*;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "court_schedules", schema = "core")
public class CourtSchedule extends PanacheEntityBase {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "schedule_id")
    @JsonProperty("id")
    public UUID scheduleId;

    @Column(name = "club_id", nullable = false)
    @JsonProperty("clubId")
    public UUID clubId;

    @Column(name = "start_date", nullable = false)
    @JsonProperty("startDate")
    public LocalDate startDate;

    @Column(name = "end_date", nullable = false)
    @JsonProperty("endDate")
    public LocalDate endDate;

    @OneToMany(mappedBy = "schedule", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.EAGER)
    @OrderBy("dayOfWeek ASC, timeSlot ASC")
    @JsonProperty("scheduleDays")
    public List<CourtScheduleDay> days = new ArrayList<>();

    // Lifecycle methods removed; timestamps no longer tracked
}


