package za.cf.cp.courtschedule.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonProperty;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

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

    @JsonProperty("createdAt")
    public String createdAt; // Optional

    @JsonProperty("updatedAt")
    public String updatedAt; // Optional

    public static class Day {
        @JsonProperty("dayOfWeek")
        public int dayOfWeek;
        @JsonProperty("venueId")
        public String venueId; // Changed to String to match frontend
        @JsonProperty("timeSlot")
        public String timeSlot; // HH:mm
        @JsonProperty("gameDuration")
        public int gameDuration;
        
        @Override
        public String toString() {
            return "Day{dayOfWeek=" + dayOfWeek + ", venueId='" + venueId + "', timeSlot='" + timeSlot + "', gameDuration=" + gameDuration + "}";
        }
    }
    
    @Override
    public String toString() {
        return "CreateCourtScheduleRequest{id='" + id + "', clubId='" + clubId + "', startDate=" + startDate + ", endDate=" + endDate + ", scheduleDays=" + scheduleDays + "}";
    }
}


