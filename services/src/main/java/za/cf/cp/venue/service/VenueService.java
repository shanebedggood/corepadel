package za.cf.cp.venue.service;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.transaction.Transactional;
import za.cf.cp.venue.Venue;
import za.cf.cp.venue.Address;
import za.cf.cp.venue.dto.VenueDto;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * Service for managing venue operations.
 */
@ApplicationScoped
public class VenueService {

    /**
     * Get all venues.
     */
    @Transactional
    public List<VenueDto> getAllVenues() {
        List<Venue> venues = Venue.listAll();
        return venues.stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    /**
     * Get venue by ID.
     */
    @Transactional
    public VenueDto getVenueById(String venueId) {
        Venue venue = Venue.findById(UUID.fromString(venueId));
        return venue != null ? convertToDto(venue) : null;
    }

    /**
     * Create a new venue.
     */
    @Transactional
    public VenueDto createVenue(VenueDto venueDto) {
        Venue venue = convertToEntity(venueDto);
        venue.persist();
        return convertToDto(venue);
    }

    /**
     * Update an existing venue.
     */
    @Transactional
    public VenueDto updateVenue(String venueId, VenueDto venueDto) {
        Venue venue = Venue.findById(UUID.fromString(venueId));
        if (venue == null) {
            return null;
        }

        // Update fields
        venue.name = venueDto.name;
        venue.website = venueDto.website;
        venue.facilities = venueDto.facilities;
        
        // Update address if provided
        if (venueDto.address != null) {
            if (venue.address == null) {
                venue.address = new Address();
            }
            venue.address.street = venueDto.address.street;
            venue.address.suburb = venueDto.address.suburb;
            venue.address.city = venueDto.address.city;
            venue.address.province = venueDto.address.province;
            venue.address.postalCode = venueDto.address.postalCode;
            venue.address.country = venueDto.address.country;
        }
        
        venue.persist();
        return convertToDto(venue);
    }

    /**
     * Delete a venue.
     */
    @Transactional
    public boolean deleteVenue(String venueId) {
        Venue venue = Venue.findById(UUID.fromString(venueId));
        if (venue == null) {
            return false;
        }
        venue.delete();
        return true;
    }

    /**
     * Convert Venue entity to DTO.
     */
    public VenueDto convertToDto(Venue venue) {
        if (venue == null) {
            return null;
        }

        VenueDto dto = new VenueDto();
        dto.id = venue.venueId.toString();
        dto.name = venue.name;
        dto.website = venue.website;
        dto.facilities = venue.facilities;
        
        if (venue.address != null) {
            dto.address = new VenueDto.AddressDto();
            dto.address.street = venue.address.street;
            dto.address.suburb = venue.address.suburb;
            dto.address.city = venue.address.city;
            dto.address.province = venue.address.province;
            dto.address.postalCode = venue.address.postalCode;
            dto.address.country = venue.address.country;
        }
        

        
        return dto;
    }

    /**
     * Convert DTO to Venue entity.
     */
    public Venue convertToEntity(VenueDto dto) {
        if (dto == null) {
            return null;
        }

        Venue venue = new Venue();
        if (dto.id != null) {
            venue.venueId = UUID.fromString(dto.id);
        }
        venue.name = dto.name;
        venue.website = dto.website;
        venue.facilities = dto.facilities;
        
        if (dto.address != null) {
            venue.address = new Address();
            venue.address.street = dto.address.street;
            venue.address.suburb = dto.address.suburb;
            venue.address.city = dto.address.city;
            venue.address.province = dto.address.province;
            venue.address.postalCode = dto.address.postalCode;
            venue.address.country = dto.address.country;
        }
        
        return venue;
    }
} 