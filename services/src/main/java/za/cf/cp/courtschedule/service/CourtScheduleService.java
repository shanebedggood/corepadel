package za.cf.cp.courtschedule.service;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.transaction.Transactional;
import za.cf.cp.courtschedule.CourtSchedule;
import za.cf.cp.courtschedule.CourtScheduleDay;
import za.cf.cp.courtschedule.dto.CreateCourtScheduleRequest;

import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@ApplicationScoped
public class CourtScheduleService {

    @Transactional
    public CourtSchedule create(CreateCourtScheduleRequest req) {
        CourtSchedule schedule = new CourtSchedule();
        schedule.clubId = UUID.fromString(req.clubId);
        schedule.startDate = req.startDate;
        schedule.endDate = req.endDate;

        schedule.persist();

        schedule.days = new ArrayList<>();
        for (var d : req.scheduleDays) {
            CourtScheduleDay day = new CourtScheduleDay();
            day.schedule = schedule;
            day.dayOfWeek = d.dayOfWeek;
            day.venueId = UUID.fromString(d.venueId);
            day.timeSlot = LocalTime.parse(d.timeSlot);
            day.gameDuration = d.gameDuration;
            day.persist();
            schedule.days.add(day);
        }

        return schedule;
    }

    public List<CourtSchedule> getAllSchedules() {
        return CourtSchedule.listAll();
    }

    @Transactional
    public CourtSchedule update(UUID scheduleId, CreateCourtScheduleRequest req) {
        // Find the existing schedule
        CourtSchedule schedule = CourtSchedule.findById(scheduleId);
        if (schedule == null) {
            throw new IllegalArgumentException("Schedule not found with id: " + scheduleId);
        }

        // Update basic fields
        schedule.clubId = UUID.fromString(req.clubId);
        schedule.startDate = req.startDate;
        schedule.endDate = req.endDate;
        schedule.updatedAt = java.time.LocalDateTime.now();

        // Delete existing schedule days from database
        CourtScheduleDay.delete("schedule.scheduleId = ?1", scheduleId);

        // Create new schedule days
        for (var d : req.scheduleDays) {
            CourtScheduleDay day = new CourtScheduleDay();
            day.schedule = schedule;
            day.dayOfWeek = d.dayOfWeek;
            day.venueId = UUID.fromString(d.venueId);
            day.timeSlot = LocalTime.parse(d.timeSlot);
            day.gameDuration = d.gameDuration;
            day.persist();
        }

        // Don't persist the schedule again, just return it
        // The transaction will handle the persistence automatically
        return schedule;
    }
}


