package za.cf.cp.courtschedule;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.UUID;

public class AvailableSlot {
    @JsonProperty("date")
    public LocalDate date; // YYYY-MM-DD format
    
    @JsonProperty("timeSlot")
    public LocalTime timeSlot; // HH:MM format
    
    @JsonProperty("gameDuration")
    public int gameDuration;
    
    @JsonProperty("scheduleId")
    public UUID scheduleId;
    
    @JsonProperty("venueId")
    public UUID venueId;
    
    @JsonProperty("venueName")
    public String venueName;
    
    @JsonProperty("availableCourts")
    public int availableCourts;
    
    @JsonProperty("totalCourts")
    public int totalCourts;
    
    @JsonProperty("bookings")
    public List<CourtBooking> bookings;
    
    @JsonProperty("isBookedByUser")
    public boolean isBookedByUser;
    
    @JsonProperty("userBookingId")
    public UUID userBookingId;
    
    public AvailableSlot() {}
    
    public AvailableSlot(LocalDate date, LocalTime timeSlot, int gameDuration, UUID scheduleId, UUID venueId, 
                        String venueName, int totalCourts, List<CourtBooking> bookings) {
        this.date = date;
        this.timeSlot = timeSlot;
        this.gameDuration = gameDuration;
        this.scheduleId = scheduleId;
        this.venueId = venueId;
        this.venueName = venueName;
        this.totalCourts = totalCourts;
        this.bookings = bookings;
        this.availableCourts = totalCourts - (bookings != null ? bookings.size() : 0);
        this.isBookedByUser = false; // This would be set based on user context
        this.userBookingId = null;
    }
}
