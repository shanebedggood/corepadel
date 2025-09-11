package za.cf.cp.club.service;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.transaction.Transactional;
import za.cf.cp.club.Club;
import za.cf.cp.club.ClubType;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * Service for managing club operations.
 */
@ApplicationScoped
public class ClubService {

    /**
     * Get all clubs.
     */
    @Transactional
    public List<Club> getAllClubs() {
        return Club.listAll();
    }
    
    /**
     * Get clubs by type.
     */
    @Transactional
    public List<Club> getClubsByType(ClubType type) {
        return Club.find("type", type).list();
    }

    /**
     * Get club by ID.
     */
    @Transactional
    public Optional<Club> getClubById(String clubId) {
        try {
            UUID id = UUID.fromString(clubId);
            return Club.findByIdOptional(id);
        } catch (IllegalArgumentException e) {
            return Optional.empty();
        }
    }

    /**
     * Create a new club.
     */
    @Transactional
    public Club createClub(Club club) {
        club.persist();
        return club;
    }

    /**
     * Update an existing club.
     */
    @Transactional
    public Optional<Club> updateClub(String clubId, Club clubData) {
        try {
            UUID id = UUID.fromString(clubId);
            Club club = Club.findById(id);
            if (club != null) {
                club.name = clubData.name;
                club.website = clubData.website;
                return Optional.of(club);
            }
            return Optional.empty();
        } catch (IllegalArgumentException e) {
            return Optional.empty();
        }
    }

    /**
     * Delete a club.
     */
    @Transactional
    public boolean deleteClub(String clubId) {
        try {
            UUID id = UUID.fromString(clubId);
            return Club.deleteById(id);
        } catch (IllegalArgumentException e) {
            return false;
        }
    }
} 