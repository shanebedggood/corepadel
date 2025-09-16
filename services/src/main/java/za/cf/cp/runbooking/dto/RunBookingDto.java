package za.cf.cp.runbooking.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

/**
 * Data Transfer Object for RunBooking.
 * Used for API communication.
 */
public class RunBookingDto {
    
    @JsonProperty("booking_id")
    private String bookingId;
    
    @JsonProperty("user_id")
    private String userId;
    
    @JsonProperty("user_name")
    private String userName;
    
    @JsonProperty("booking_date")
    private String bookingDate; // YYYY-MM-DD format
    
    @JsonProperty("booking_time")
    private String bookingTime; // HH:MM format
    
    // Default constructor
    public RunBookingDto() {}
    
    // Constructor with all fields
    public RunBookingDto(String bookingId, String userId, String userName, 
                        String bookingDate, String bookingTime) {
        this.bookingId = bookingId;
        this.userId = userId;
        this.userName = userName;
        this.bookingDate = bookingDate;
        this.bookingTime = bookingTime;
    }
    
    // Getters and setters
    public String getBookingId() {
        return bookingId;
    }
    
    public void setBookingId(String bookingId) {
        this.bookingId = bookingId;
    }
    
    public String getUserId() {
        return userId;
    }
    
    public void setUserId(String userId) {
        this.userId = userId;
    }
    
    public String getUserName() {
        return userName;
    }
    
    public void setUserName(String userName) {
        this.userName = userName;
    }
    
    public String getBookingDate() {
        return bookingDate;
    }
    
    public void setBookingDate(String bookingDate) {
        this.bookingDate = bookingDate;
    }
    
    public String getBookingTime() {
        return bookingTime;
    }
    
    public void setBookingTime(String bookingTime) {
        this.bookingTime = bookingTime;
    }
    
    // Timestamp accessors removed
    
    @Override
    public String toString() {
        return "RunBookingDto{" +
                "bookingId='" + bookingId + '\'' +
                ", userId='" + userId + '\'' +
                ", userName='" + userName + '\'' +
                ", bookingDate='" + bookingDate + '\'' +
                ", bookingTime='" + bookingTime + '\'' +
                '}';
    }
}
