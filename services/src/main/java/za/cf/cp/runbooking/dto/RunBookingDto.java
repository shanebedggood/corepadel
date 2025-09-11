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
    
    @JsonProperty("created_at")
    private String createdAt;
    
    @JsonProperty("updated_at")
    private String updatedAt;
    
    // Default constructor
    public RunBookingDto() {}
    
    // Constructor with all fields
    public RunBookingDto(String bookingId, String userId, String userName, 
                        String bookingDate, String bookingTime, 
                        String createdAt, String updatedAt) {
        this.bookingId = bookingId;
        this.userId = userId;
        this.userName = userName;
        this.bookingDate = bookingDate;
        this.bookingTime = bookingTime;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
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
    
    public String getCreatedAt() {
        return createdAt;
    }
    
    public void setCreatedAt(String createdAt) {
        this.createdAt = createdAt;
    }
    
    public String getUpdatedAt() {
        return updatedAt;
    }
    
    public void setUpdatedAt(String updatedAt) {
        this.updatedAt = updatedAt;
    }
    
    @Override
    public String toString() {
        return "RunBookingDto{" +
                "bookingId='" + bookingId + '\'' +
                ", userId='" + userId + '\'' +
                ", userName='" + userName + '\'' +
                ", bookingDate='" + bookingDate + '\'' +
                ", bookingTime='" + bookingTime + '\'' +
                ", createdAt='" + createdAt + '\'' +
                ", updatedAt='" + updatedAt + '\'' +
                '}';
    }
}
