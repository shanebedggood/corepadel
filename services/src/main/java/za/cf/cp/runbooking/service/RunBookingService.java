package za.cf.cp.runbooking.service;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import za.cf.cp.runbooking.RunBooking;
import za.cf.cp.runbooking.RunBookingRepository;
import za.cf.cp.runbooking.dto.RunBookingDto;
import za.cf.cp.runbooking.dto.RunSlotDto;

import java.time.LocalDate;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

/**
 * Service layer for RunBooking business logic.
 * Handles 5AM run booking operations.
 */
@ApplicationScoped
public class RunBookingService {
    
    @Inject
    RunBookingRepository runBookingRepository;
    
    private static final LocalTime RUN_TIME = LocalTime.of(5, 0); // Always 5:00 AM
    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd");
    
    /**
     * Create a new run booking
     * @param bookingDto Booking data
     * @return Created booking
     * @throws IllegalArgumentException if booking already exists or date is invalid
     */
    @Transactional
    public RunBooking createBooking(RunBookingDto bookingDto) {
        // Validate input
        if (bookingDto.getUserId() == null || bookingDto.getUserId().trim().isEmpty()) {
            throw new IllegalArgumentException("User ID is required");
        }
        if (bookingDto.getUserName() == null || bookingDto.getUserName().trim().isEmpty()) {
            throw new IllegalArgumentException("User name is required");
        }
        if (bookingDto.getBookingDate() == null || bookingDto.getBookingDate().trim().isEmpty()) {
            throw new IllegalArgumentException("Booking date is required");
        }
        
        // Parse and validate date
        LocalDate bookingDate;
        try {
            bookingDate = LocalDate.parse(bookingDto.getBookingDate(), DATE_FORMATTER);
        } catch (Exception e) {
            throw new IllegalArgumentException("Invalid date format. Expected yyyy-MM-dd");
        }
        
        // Check if it's a weekday
        if (!isWeekday(bookingDate)) {
            throw new IllegalArgumentException("Bookings are only allowed on weekdays");
        }
        
        // Check if user already has a booking for this date
        if (runBookingRepository.existsByFirebaseUidAndBookingDate(bookingDto.getUserId(), bookingDate)) {
            throw new IllegalArgumentException("User already has a booking for this date");
        }
        
        // Create new booking
        RunBooking booking = new RunBooking(
            bookingDto.getUserId(),
            bookingDto.getUserName().trim(),
            bookingDate
        );
        
        // Save to database
        runBookingRepository.persist(booking);
        
        return booking;
    }
    
    /**
     * Cancel a run booking
     * @param bookingId Booking ID to cancel
     * @param userId User ID (for security validation)
     * @return true if booking was cancelled
     * @throws IllegalArgumentException if booking not found or user doesn't own it
     */
    @Transactional
    public boolean cancelBooking(UUID bookingId, String userId) {
        Optional<RunBooking> bookingOpt = runBookingRepository.findByBookingId(bookingId);
        
        if (bookingOpt.isEmpty()) {
            throw new IllegalArgumentException("Booking not found");
        }
        
        RunBooking booking = bookingOpt.get();
        
        // Security check: ensure user owns this booking
        if (!booking.getFirebaseUid().equals(userId)) {
            throw new IllegalArgumentException("You can only cancel your own bookings");
        }
        
        // Delete the booking
        return runBookingRepository.deleteByBookingId(bookingId);
    }
    
    /**
     * Get all bookings for a specific month
     * @param year Year
     * @param month Month (1-12)
     * @param userId Current user ID (to check if they have bookings)
     * @return List of run slots for the month
     */
    public List<RunSlotDto> getBookingsForMonth(int year, int month, String userId) {
        // Get all bookings for the month
        List<RunBooking> bookings = runBookingRepository.findByMonth(year, month);
        
        // Group bookings by date
        Map<LocalDate, List<RunBooking>> bookingsByDate = bookings.stream()
            .collect(Collectors.groupingBy(RunBooking::getBookingDate));
        
        // Generate all weekdays for the month
        List<LocalDate> weekdays = generateWeekdaysForMonth(year, month);
        
        // Create RunSlotDto for each weekday
        return weekdays.stream()
            .map(date -> {
                List<RunBooking> dateBookings = bookingsByDate.getOrDefault(date, new ArrayList<>());
                
                // Check if current user has a booking for this date
                boolean isBookedByUser = dateBookings.stream()
                    .anyMatch(booking -> booking.getFirebaseUid().equals(userId));
                
                // Get user's booking ID if they have one
                Optional<String> userBookingId = dateBookings.stream()
                    .filter(booking -> booking.getFirebaseUid().equals(userId))
                    .map(booking -> booking.getBookingId().toString())
                    .findFirst();
                
                // Convert bookings to DTOs
                List<RunBookingDto> bookingDtos = dateBookings.stream()
                    .map(this::convertToDto)
                    .collect(Collectors.toList());
                
                return new RunSlotDto(
                    date.format(DATE_FORMATTER),
                    RUN_TIME.format(DateTimeFormatter.ofPattern("HH:mm")),
                    bookingDtos,
                    isBookedByUser,
                    userBookingId.orElse(null)
                );
            })
            .collect(Collectors.toList());
    }
    
    /**
     * Get user's bookings within a date range
     * @param userId User ID
     * @param startDate Start date (yyyy-MM-dd)
     * @param endDate End date (yyyy-MM-dd)
     * @return List of user's bookings
     */
    public List<RunBookingDto> getUserBookings(String userId, String startDate, String endDate) {
        LocalDate start = LocalDate.parse(startDate, DATE_FORMATTER);
        LocalDate end = LocalDate.parse(endDate, DATE_FORMATTER);
        
        List<RunBooking> bookings = runBookingRepository.findByFirebaseUidAndBookingDateBetween(userId, start, end);
        
        return bookings.stream()
            .map(this::convertToDto)
            .collect(Collectors.toList());
    }
    
    /**
     * Check if a date is a weekday
     * @param date Date to check
     * @return true if it's a weekday (Monday-Friday)
     */
    private boolean isWeekday(LocalDate date) {
        int dayOfWeek = date.getDayOfWeek().getValue();
        return dayOfWeek >= 1 && dayOfWeek <= 5; // Monday = 1, Friday = 5
    }
    
    /**
     * Generate all weekdays for a given month
     * @param year Year
     * @param month Month (1-12)
     * @return List of weekdays in the month
     */
    private List<LocalDate> generateWeekdaysForMonth(int year, int month) {
        List<LocalDate> weekdays = new ArrayList<>();
        LocalDate firstDay = LocalDate.of(year, month, 1);
        LocalDate lastDay = firstDay.withDayOfMonth(firstDay.lengthOfMonth());
        
        for (LocalDate date = firstDay; !date.isAfter(lastDay); date = date.plusDays(1)) {
            if (isWeekday(date)) {
                weekdays.add(date);
            }
        }
        
        return weekdays;
    }
    
    /**
     * Convert RunBooking entity to DTO
     * @param booking Entity to convert
     * @return DTO representation
     */
    private RunBookingDto convertToDto(RunBooking booking) {
        return new RunBookingDto(
            booking.getBookingId().toString(),
            booking.getFirebaseUid(),
            booking.getUserName(),
            booking.getBookingDate().format(DATE_FORMATTER),
            booking.getBookingTime().format(DateTimeFormatter.ofPattern("HH:mm"))
        );
    }
}
