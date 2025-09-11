package za.cf.cp.runbooking;

import io.quarkus.hibernate.orm.panache.PanacheRepository;
import jakarta.enterprise.context.ApplicationScoped;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * Repository interface for RunBooking entity.
 * Provides database operations for 5AM run bookings.
 */
@ApplicationScoped
public class RunBookingRepository implements PanacheRepository<RunBooking> {
    
    /**
     * Find all bookings for a specific user
     * @param firebaseUid User's Firebase UID
     * @return List of user's bookings
     */
    public List<RunBooking> findByFirebaseUid(String firebaseUid) {
        return find("firebaseUid", firebaseUid).list();
    }
    
    /**
     * Find all bookings for a specific date
     * @param bookingDate Date to search for
     * @return List of bookings for that date
     */
    public List<RunBooking> findByBookingDate(LocalDate bookingDate) {
        return find("bookingDate", bookingDate).list();
    }
    
    /**
     * Find a specific booking by user and date
     * @param firebaseUid User's Firebase UID
     * @param bookingDate Date of the booking
     * @return Optional containing the booking if found
     */
    public Optional<RunBooking> findByFirebaseUidAndBookingDate(String firebaseUid, LocalDate bookingDate) {
        return find("firebaseUid = ?1 and bookingDate = ?2", firebaseUid, bookingDate).firstResultOptional();
    }
    
    /**
     * Find all bookings within a date range
     * @param startDate Start date (inclusive)
     * @param endDate End date (inclusive)
     * @return List of bookings within the date range
     */
    public List<RunBooking> findByBookingDateBetween(LocalDate startDate, LocalDate endDate) {
        return find("bookingDate between ?1 and ?2", startDate, endDate).list();
    }
    
    /**
     * Find all bookings for a specific user within a date range
     * @param firebaseUid User's Firebase UID
     * @param startDate Start date (inclusive)
     * @param endDate End date (inclusive)
     * @return List of user's bookings within the date range
     */
    public List<RunBooking> findByFirebaseUidAndBookingDateBetween(String firebaseUid, LocalDate startDate, LocalDate endDate) {
        return find("firebaseUid = ?1 and bookingDate between ?2 and ?3", firebaseUid, startDate, endDate).list();
    }
    
    /**
     * Find all bookings for a specific month
     * @param year Year
     * @param month Month (1-12)
     * @return List of bookings for that month
     */
    public List<RunBooking> findByMonth(int year, int month) {
        LocalDate startDate = LocalDate.of(year, month, 1);
        LocalDate endDate = startDate.withDayOfMonth(startDate.lengthOfMonth());
        return findByBookingDateBetween(startDate, endDate);
    }
    
    /**
     * Check if a user has a booking for a specific date
     * @param firebaseUid User's Firebase UID
     * @param bookingDate Date to check
     * @return true if user has a booking for that date
     */
    public boolean existsByFirebaseUidAndBookingDate(String firebaseUid, LocalDate bookingDate) {
        return count("firebaseUid = ?1 and bookingDate = ?2", firebaseUid, bookingDate) > 0;
    }
    
    /**
     * Count bookings for a specific date
     * @param bookingDate Date to count bookings for
     * @return Number of bookings for that date
     */
    public long countByBookingDate(LocalDate bookingDate) {
        return count("bookingDate", bookingDate);
    }
    
    /**
     * Find a booking by ID
     * @param bookingId Booking ID to find
     * @return Optional containing the booking if found
     */
    public Optional<RunBooking> findByBookingId(UUID bookingId) {
        return find("bookingId", bookingId).firstResultOptional();
    }
    
    /**
     * Delete a booking by ID
     * @param bookingId Booking ID to delete
     * @return true if booking was deleted
     */
    public boolean deleteByBookingId(UUID bookingId) {
        return delete("bookingId", bookingId) > 0;
    }
    
    /**
     * Delete a booking by user and date
     * @param firebaseUid User's Firebase UID
     * @param bookingDate Date of the booking
     * @return true if booking was deleted
     */
    public boolean deleteByFirebaseUidAndBookingDate(String firebaseUid, LocalDate bookingDate) {
        return delete("firebaseUid = ?1 and bookingDate = ?2", firebaseUid, bookingDate) > 0;
    }
}
