package za.cf.cp.courtschedule.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonProperty;
import java.time.LocalDate;
import java.util.List;

public class CreateCourtScheduleRequest {
    @JsonProperty("id")
    public String id; // Optional, for updates

    @JsonProperty("clubId")
    public String clubId; // Changed to String to match frontend

    @JsonProperty("startDate")
    @JsonFormat(pattern = "yyyy-MM-dd")
    public LocalDate startDate;

    @JsonProperty("endDate")
    @JsonFormat(pattern = "yyyy-MM-dd")
    public LocalDate endDate;

    @JsonProperty("scheduleDays")
    public List<Day> scheduleDays;

    // createdAt/updatedAt removed from request payload

    public static class Day {
        @JsonProperty("dayOfWeek")
        public int dayOfWeek;
        @JsonProperty("venueId")
        public String venueId; // Changed to String to match frontend
        @JsonProperty("timeSlot")
        public String timeSlot; // HH:mm
        @JsonProperty("gameDuration")
        public int gameDuration;
        @JsonProperty("courtCount")
        public int courtCount = 1; // Number of courts available for this time slot
        
        @Override
        public String toString() {
            return "Day{dayOfWeek=" + dayOfWeek + ", venueId='" + venueId + "', timeSlot='" + timeSlot + "', gameDuration=" + gameDuration + ", courtCount=" + courtCount + "}";
        }
    }
    
    @Override
    public String toString() {
        return "CreateCourtScheduleRequest{id='" + id + "', clubId='" + clubId + "', startDate=" + startDate + ", endDate=" + endDate + ", scheduleDays=" + scheduleDays + "}";
    }
}


