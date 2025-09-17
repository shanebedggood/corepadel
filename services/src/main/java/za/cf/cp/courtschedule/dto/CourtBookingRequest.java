package za.cf.cp.courtschedule.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.UUID;

public class CourtBookingRequest {
    @JsonProperty("scheduleId")
    public String scheduleId;
    
    @JsonProperty("userId")
    public String userId;
    
    @JsonProperty("userName")
    public String userName;
    
    @JsonProperty("bookingDate")
    public LocalDate bookingDate;
    
    @JsonProperty("timeSlot")
    public LocalTime timeSlot;
    
    @JsonProperty("gameDuration")
    public int gameDuration;
    
    @JsonProperty("venueId")
    public UUID venueId;
    
    @JsonProperty("courtNumber")
    public Integer courtNumber;
    
    @JsonProperty("teamNumber")
    public Integer teamNumber; // Team number: 1 or 2 (padel has 2 teams of 2 players each)
    
    @JsonProperty("status")
    public String status = "confirmed";
    
    public CourtBookingRequest() {}
    
    public CourtBookingRequest(String scheduleId, String userId, String userName, 
                              LocalDate bookingDate, LocalTime timeSlot, int gameDuration,
                              UUID venueId, Integer courtNumber, Integer teamNumber) {
        this.scheduleId = scheduleId;
        this.userId = userId;
        this.userName = userName;
        this.bookingDate = bookingDate;
        this.timeSlot = timeSlot;
        this.gameDuration = gameDuration;
        this.venueId = venueId;
        this.courtNumber = courtNumber;
        this.teamNumber = teamNumber;
        this.status = "confirmed";
    }
}
