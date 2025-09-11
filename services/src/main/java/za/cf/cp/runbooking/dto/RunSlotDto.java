package za.cf.cp.runbooking.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.List;

/**
 * Data Transfer Object for RunSlot.
 * Represents a time slot with all its bookings.
 */
public class RunSlotDto {
    
    @JsonProperty("date")
    private String date; // YYYY-MM-DD format
    
    @JsonProperty("time")
    private String time; // HH:MM format (always 05:00)
    
    @JsonProperty("bookings")
    private List<RunBookingDto> bookings;
    
    @JsonProperty("is_booked_by_user")
    private boolean isBookedByUser;
    
    @JsonProperty("user_booking_id")
    private String userBookingId;
    
    // Default constructor
    public RunSlotDto() {}
    
    // Constructor with all fields
    public RunSlotDto(String date, String time, List<RunBookingDto> bookings, 
                     boolean isBookedByUser, String userBookingId) {
        this.date = date;
        this.time = time;
        this.bookings = bookings;
        this.isBookedByUser = isBookedByUser;
        this.userBookingId = userBookingId;
    }
    
    // Getters and setters
    public String getDate() {
        return date;
    }
    
    public void setDate(String date) {
        this.date = date;
    }
    
    public String getTime() {
        return time;
    }
    
    public void setTime(String time) {
        this.time = time;
    }
    
    public List<RunBookingDto> getBookings() {
        return bookings;
    }
    
    public void setBookings(List<RunBookingDto> bookings) {
        this.bookings = bookings;
    }
    
    public boolean isBookedByUser() {
        return isBookedByUser;
    }
    
    public void setBookedByUser(boolean isBookedByUser) {
        this.isBookedByUser = isBookedByUser;
    }
    
    public String getUserBookingId() {
        return userBookingId;
    }
    
    public void setUserBookingId(String userBookingId) {
        this.userBookingId = userBookingId;
    }
    
    @Override
    public String toString() {
        return "RunSlotDto{" +
                "date='" + date + '\'' +
                ", time='" + time + '\'' +
                ", bookings=" + (bookings != null ? bookings.size() : 0) + " bookings" +
                ", isBookedByUser=" + isBookedByUser +
                ", userBookingId='" + userBookingId + '\'' +
                '}';
    }
}
