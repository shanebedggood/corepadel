package za.cf.cp.courtschedule.service;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.transaction.Transactional;
import za.cf.cp.courtschedule.CourtSchedule;
import za.cf.cp.courtschedule.CourtScheduleDay;
import za.cf.cp.courtschedule.CourtBooking;
import za.cf.cp.courtschedule.AvailableSlot;
import za.cf.cp.courtschedule.dto.CreateCourtScheduleRequest;

import java.time.LocalDate;
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
            day.courtCount = d.courtCount > 0 ? d.courtCount : 1; // Default to 1 if not provided or invalid
            day.persist();
            schedule.days.add(day);
        }

        return schedule;
    }

    public List<CourtSchedule> getAllSchedules() {
        return CourtSchedule.listAll();
    }

    public List<AvailableSlot> getAvailableSlots(String clubId, String startDate, String endDate) {
        var availableSlots = new ArrayList<AvailableSlot>();
        
        try {
            // Parse date range
            var start = LocalDate.parse(startDate);
            var end = LocalDate.parse(endDate);
            var clubUuid = UUID.fromString(clubId);
            
            // Get all active schedules for the club
            var schedules = CourtSchedule.list("clubId = ?1 AND startDate <= ?2 AND endDate >= ?3", 
                clubUuid, end, start);
            
            // Early return if no schedules found
            if (schedules.isEmpty()) {
                return availableSlots;
            }
            
            for (var schedule : schedules) {
                var courtSchedule = (CourtSchedule) schedule;
                
                // Load the schedule days (they might be lazy loaded)
                courtSchedule.days.size(); // Force loading of the collection
                
                // For each day in the date range
                for (var date = start; !date.isAfter(end); date = date.plusDays(1)) {
                    int dayOfWeek = date.getDayOfWeek().getValue() % 7; // Convert to 0-6 (Sunday=0)
                    
                    // Find schedule days that match this day of week
                    for (var day : courtSchedule.days) {
                        if (day.dayOfWeek == dayOfWeek) {
                            // Check if this date falls within the schedule date range
                            if (!date.isBefore(courtSchedule.startDate) && !date.isAfter(courtSchedule.endDate)) {
                                
                                // Get existing bookings for this date and time slot
                                List<CourtBooking> existingBookings = CourtBooking.<CourtBooking>list(
                                    "venueId = ?1 AND bookingDate = ?2 AND timeSlot = ?3 AND status = 'confirmed'",
                                    day.venueId, date, day.timeSlot
                                );

                                // Create available slot
                                var slot = new AvailableSlot();
                                slot.date = date;
                                slot.timeSlot = day.timeSlot;
                                slot.gameDuration = day.gameDuration;
                                slot.scheduleId = courtSchedule.scheduleId;
                                slot.venueId = day.venueId;
                                slot.venueName = "Venue " + day.venueId; // TODO: Get actual venue name
                                slot.totalCourts = day.courtCount;
                                slot.availableCourts = day.courtCount - existingBookings.size();
                                slot.bookings = existingBookings;
                                slot.isBookedByUser = false; // TODO: Check if current user has booking
                                slot.userBookingId = null;
                                
                                // Only add if there are available courts
                                if (slot.availableCourts > 0) {
                                    availableSlots.add(slot);
                                }
                            }
                        }
                    }
                }
            }
            
        } catch (Exception e) {
            System.err.println("Error calculating available slots: " + e.getMessage());
            e.printStackTrace();
        }

        return availableSlots;
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
        // No updatedAt tracking anymore

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
            day.courtCount = d.courtCount > 0 ? d.courtCount : 1; // Default to 1 if not provided or invalid
            day.persist();
        }

        // Don't persist the schedule again, just return it
        // The transaction will handle the persistence automatically
        return schedule;
    }
}
