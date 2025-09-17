package za.cf.cp.tournament.service;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.persistence.EntityManager;
import jakarta.transaction.Transactional;
import za.cf.cp.tournament.*;
import za.cf.cp.tournament.dto.*;
import za.cf.cp.tournament.TournamentParticipant;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.JsonNode;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.Map;
import java.util.stream.Collectors;
import java.util.Arrays;

/**
 * Service for managing tournament data.
 * Provides methods to retrieve and manage all tournament entities.
 */
@ApplicationScoped
public class TournamentService {
    
    @Inject
    EntityManager entityManager;
    
    @Inject
    TournamentConfigService tournamentConfigService;
    
    @Inject
    za.cf.cp.club.service.ClubService clubService;
    
    @Inject
    za.cf.cp.user.service.UserService userService;
    
    /**
     * Get all tournaments ordered by creation date (newest first).
     */
    @Transactional
    public List<TournamentDto> getAllTournaments() {
        try {
            List<Tournament> tournaments = Tournament.listAll();
            
            List<TournamentDto> dtos = new ArrayList<>();
            for (Tournament tournament : tournaments) {
                try {
                    TournamentDto dto = convertToDto(tournament);
                    dtos.add(dto);
                } catch (Exception e) {
                    System.err.println("Error converting tournament " + tournament.getTournamentId() + " to DTO: " + e.getMessage());
                    e.printStackTrace();
                }
            }
            
            return dtos;
        } catch (Exception e) {
            System.err.println("Error in getAllTournaments: " + e.getMessage());
            e.printStackTrace();
            throw e;
        }
    }
    
    /**
     * Get tournament by ID.
     */
    @Transactional
    public Optional<TournamentDto> getTournamentById(String id) {
        try {
            UUID tournamentId = UUID.fromString(id);
            Tournament tournament = Tournament.findById(tournamentId);
            if (tournament != null) {
                return Optional.of(convertToDto(tournament));
            }
            return Optional.empty();
        } catch (IllegalArgumentException e) {
            return Optional.empty();
        }
    }
    
    /**
     * Create a new tournament.
     */
    @Transactional
    public String createTournament(TournamentDto tournamentDto) {
        // Validate that the user is an admin of the club
        validateUserIsClubAdmin(tournamentDto.getFirebaseUid(), tournamentDto.getClubId());
        
        Tournament tournament = convertToEntity(tournamentDto);
        tournament.persist();
        return tournament.getTournamentId().toString();
    }
    
    /**
     * Update an existing tournament.
     */
    @Transactional
    public boolean updateTournament(String id, TournamentDto tournamentDto) {
        try {
            UUID tournamentId = UUID.fromString(id);
            Tournament tournament = Tournament.findById(tournamentId);
            if (tournament != null) {
                // Validate that the user is an admin of the club
                validateUserIsClubAdmin(tournamentDto.getFirebaseUid(), tournamentDto.getClubId());
                
                updateEntityFromDto(tournament, tournamentDto);
                return true;
            }
            return false;
        } catch (IllegalArgumentException e) {
            return false;
        }
    }
    
    /**
     * Delete a tournament.
     */
    @Transactional
    public boolean deleteTournament(String id) {
        try {
            UUID tournamentId = UUID.fromString(id);
            return Tournament.deleteById(tournamentId);
        } catch (IllegalArgumentException e) {
            return false;
        }
    }
    
    /**
     * Get tournaments by club ID.
     */
    @Transactional
    public List<TournamentDto> getTournamentsByClubId(String clubId) {
        List<Tournament> tournaments = Tournament.find("clubId", clubId).list();
        return tournaments.stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }
    
    /**
     * Get tournaments by user ID.
     */
    @Transactional
    public List<TournamentDto> getTournamentsByUserId(String userId) {
        List<Tournament> tournaments = Tournament.find("userId", userId).list();
        return tournaments.stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }
    
    /**
     * Convert Tournament entity to DTO.
     */
    private TournamentDto convertToDto(Tournament tournament) {
        try {
            // Create the appropriate DTO based on tournament type
            TournamentDto dto;
            if (tournament instanceof RoundRobinTournament) {
                dto = convertRoundRobinToDto((RoundRobinTournament) tournament);
            } else if (tournament instanceof AmericanoTournament) {
                dto = convertAmericanoToDto((AmericanoTournament) tournament);
            } else {
                // Fallback to base tournament DTO
                dto = new TournamentDto() {
                    @Override
                    public String getTournamentType() {
                        return "UNKNOWN";
                    }
                };
            }
            
            // Set common fields
            dto.setId(tournament.getTournamentId().toString());
            dto.setName(tournament.getName());
            dto.setDescription(tournament.getDescription());
            dto.setStartDate(tournament.getStartDate());
            dto.setEndDate(tournament.getEndDate());
            dto.setRegistrationStartDate(tournament.getRegistrationStartDate());
            dto.setRegistrationEndDate(tournament.getRegistrationEndDate());
            dto.setMaxParticipants(tournament.getMaxParticipants());
            dto.setCurrentParticipants(tournament.getCurrentParticipants());
            dto.setEntryFee(tournament.getEntryFee());
            dto.setClubId(tournament.getClubId());
            dto.setFirebaseUid(tournament.getFirebaseUid());
            dto.setVenueId(tournament.getVenueId());
            dto.setAccessType(tournament.getAccessType());
            
            // Add venue information if venueClub is provided
            if (tournament.getVenueClub() != null) {
                try {
                    za.cf.cp.club.Club venueClub = tournament.getVenueClub();
                    if (venueClub != null && venueClub.isVenue()) {
                        // Create a venue object that matches the frontend interface
                        Map<String, Object> venueObject = new HashMap<>();
                        venueObject.put("id", venueClub.getClubId().toString());
                        venueObject.put("name", venueClub.getName());
                        venueObject.put("website", venueClub.getWebsite());
                        venueObject.put("facilities", venueClub.getFacilities());
                        
                        // Add address information if available
                        if (venueClub.getAddress() != null) {
                            Map<String, Object> address = new HashMap<>();
                            address.put("street", venueClub.getAddress().street);
                            address.put("suburb", venueClub.getAddress().suburb);
                            address.put("city", venueClub.getAddress().city);
                            address.put("province", venueClub.getAddress().province);
                            address.put("postalCode", venueClub.getAddress().postalCode);
                            address.put("country", venueClub.getAddress().country);
                            venueObject.put("address", address);
                        }
                        
                        // Set the venue object in the DTO
                        dto.setVenue(venueObject);
                    }
                } catch (Exception e) {
                    System.err.println("Error loading venue for tournament " + tournament.getTournamentId() + ": " + e.getMessage());
                }
            }
        
            // Add club information
            if (tournament.getClubId() != null) {
                clubService.getClubById(tournament.getClubId()).ifPresent(club -> {
                    dto.setClub(new za.cf.cp.tournament.dto.ClubDto(club.getClubId().toString(), club.getName(), club.getWebsite()));
                });
            }
            
            // Convert related entities to DTOs
            if (tournament.getFormat() != null) {
                dto.setFormat(tournamentConfigService.convertFormatToDto(tournament.getFormat()));
            }
            if (tournament.getCategory() != null) {
                dto.setCategory(tournamentConfigService.convertCategoryToDto(tournament.getCategory()));
            }
            if (tournament.getRegistrationType() != null) {
                dto.setRegistrationType(tournamentConfigService.convertRegistrationTypeToDto(tournament.getRegistrationType()));
            }
            if (tournament.getStatus() != null) {
                dto.setStatus(tournamentConfigService.convertStatusToDto(tournament.getStatus()));
            }
            if (tournament.getVenueType() != null) {
                dto.setVenueType(tournamentConfigService.convertVenueTypeToDto(tournament.getVenueType()));
            }
            
            return dto;
        } catch (Exception e) {
            System.err.println("Error converting tournament " + tournament.getTournamentId() + " to DTO: " + e.getMessage());
            e.printStackTrace();
            throw e;
        }
    }
    
    /**
     * Convert RoundRobinTournament entity to DTO.
     */
    private RoundRobinTournamentDto convertRoundRobinToDto(RoundRobinTournament tournament) {
        RoundRobinTournamentDto dto = new RoundRobinTournamentDto();
        dto.setNoOfGroups(tournament.getNoOfGroups());
        
        // Convert Round Robin specific entities to DTOs
        if (tournament.getProgressionType() != null) {
            dto.setProgressionOption(tournamentConfigService.convertProgressionTypeToDto(tournament.getProgressionType()));
        }
        if (tournament.getTeamsToAdvance() != null) {
            dto.setTeamsToAdvance(tournament.getTeamsToAdvance());
        }
        
        return dto;
    }
    
    /**
     * Convert AmericanoTournament entity to DTO.
     */
    private AmericanoTournamentDto convertAmericanoToDto(AmericanoTournament tournament) {
        AmericanoTournamentDto dto = new AmericanoTournamentDto();
        dto.setMaxPlayersPerTeam(tournament.getMaxPlayersPerTeam());
        dto.setRotationInterval(tournament.getRotationInterval());
        dto.setPointsToWin(tournament.getPointsToWin());
        dto.setGamesPerRotation(tournament.getGamesPerRotation());
        
        return dto;
    }
    
    /**
     * Convert DTO to Tournament entity.
     */
    private Tournament convertToEntity(TournamentDto dto) {
        try {
            // Create the appropriate tournament entity based on type
            Tournament tournament;
            if (dto instanceof RoundRobinTournamentDto) {
                tournament = convertToRoundRobinEntity((RoundRobinTournamentDto) dto);
            } else if (dto instanceof AmericanoTournamentDto) {
                tournament = convertToAmericanoEntity((AmericanoTournamentDto) dto);
            } else {
                // Default to Round Robin for backward compatibility
                RoundRobinTournamentDto fallbackDto = new RoundRobinTournamentDto();
                // Copy essential fields from the original DTO to prevent null constraint violations
                fallbackDto.setFirebaseUid(dto.getFirebaseUid());
                fallbackDto.setClubId(dto.getClubId());
                fallbackDto.setName(dto.getName());
                fallbackDto.setDescription(dto.getDescription());
                fallbackDto.setStartDate(dto.getStartDate());
                fallbackDto.setEndDate(dto.getEndDate());
                fallbackDto.setMaxParticipants(dto.getMaxParticipants());
                fallbackDto.setCurrentParticipants(dto.getCurrentParticipants());
                fallbackDto.setEntryFee(dto.getEntryFee());
                tournament = convertToRoundRobinEntity(fallbackDto);
            }
            
            if (dto.getId() != null) {
                tournament.setTournamentId(UUID.fromString(dto.getId()));
            }
            tournament.setName(dto.getName());
            tournament.setDescription(dto.getDescription());
            tournament.setStartDate(dto.getStartDate());
            tournament.setEndDate(dto.getEndDate());
            tournament.setRegistrationStartDate(dto.getRegistrationStartDate());
            tournament.setRegistrationEndDate(dto.getRegistrationEndDate());
            tournament.setMaxParticipants(dto.getMaxParticipants());
            tournament.setCurrentParticipants(dto.getCurrentParticipants());
            tournament.setEntryFee(dto.getEntryFee());
            // Set club relationship if clubId is provided
            if (dto.getClubId() != null && !dto.getClubId().trim().isEmpty()) {
                String clubIdStr = dto.getClubId().trim();
                
                // Handle special case for "default-club-id" - this should be replaced with actual club ID
                if ("default-club-id".equals(clubIdStr)) {
                    throw new RuntimeException("Invalid club ID: 'default-club-id' is a placeholder. Please provide a valid club ID.");
                }
                
                try {
                    UUID clubId = UUID.fromString(clubIdStr);
                    za.cf.cp.club.Club club = za.cf.cp.club.Club.findById(clubId);
                    if (club != null) {
                        tournament.setClub(club);
                    } else {
                        throw new RuntimeException("Club not found with ID: " + clubId);
                    }
                } catch (IllegalArgumentException e) {
                    throw new RuntimeException("Invalid club ID format: '" + clubIdStr + "'. Expected a valid UUID format.", e);
                } catch (Exception e) {
                    throw new RuntimeException("Error setting club for tournament: " + e.getMessage(), e);
                }
            } else {
                throw new RuntimeException("Club ID is required but not provided or empty");
            }
            
            tournament.setFirebaseUid(dto.getFirebaseUid());
            
            // Set access type
            if (dto.getAccessType() != null && !dto.getAccessType().trim().isEmpty()) {
                tournament.setAccessType(dto.getAccessType());
            } else {
                tournament.setAccessType("open"); // Default to open
            }
            
            // Set venue club relationship if venueId is provided
            if (dto.getVenueId() != null) {
                try {
                    UUID venueId = UUID.fromString(dto.getVenueId());
                    za.cf.cp.club.Club venueClub = za.cf.cp.club.Club.findById(venueId);
                    if (venueClub != null && venueClub.isVenue()) {
                        tournament.setVenueClub(venueClub);
                    }
                } catch (Exception e) {
                    System.err.println("Error setting venue club for tournament: " + e.getMessage());
                }
            }
            
            // Set related entities if IDs are provided
            if (dto.getFormat() != null && dto.getFormat().getId() != null) {
                Format format = Format.findById(UUID.fromString(dto.getFormat().getId()));
                if (format == null) {
                    throw new RuntimeException("Format not found with ID: " + dto.getFormat().getId());
                }
                tournament.setFormat(format);
            }
            if (dto.getCategory() != null && dto.getCategory().getId() != null) {
                Category category = Category.findById(UUID.fromString(dto.getCategory().getId()));
                if (category == null) {
                    throw new RuntimeException("Category not found with ID: " + dto.getCategory().getId());
                }
                tournament.setCategory(category);
            }
            if (dto.getRegistrationType() != null && dto.getRegistrationType().getId() != null) {
                RegistrationType registrationType = RegistrationType.findById(UUID.fromString(dto.getRegistrationType().getId()));
                if (registrationType == null) {
                    throw new RuntimeException("RegistrationType not found with ID: " + dto.getRegistrationType().getId());
                }
                tournament.setRegistrationType(registrationType);
            }
            if (dto.getStatus() != null && dto.getStatus().getId() != null) {
                TournamentStatus status = TournamentStatus.findById(UUID.fromString(dto.getStatus().getId()));
                if (status == null) {
                    throw new RuntimeException("TournamentStatus not found with ID: " + dto.getStatus().getId());
                }
                tournament.setStatus(status);
            }
            if (dto.getVenueType() != null && dto.getVenueType().getId() != null) {
                VenueType venueType = VenueType.findById(UUID.fromString(dto.getVenueType().getId()));
                if (venueType == null) {
                    throw new RuntimeException("VenueType not found with ID: " + dto.getVenueType().getId());
                }
                tournament.setVenueType(venueType);
            }
            // Set related entities if IDs are provided
            if (dto.getFormat() != null && dto.getFormat().getId() != null) {
                Format format = Format.findById(UUID.fromString(dto.getFormat().getId()));
                if (format == null) {
                    throw new RuntimeException("Format not found with ID: " + dto.getFormat().getId());
                }
                tournament.setFormat(format);
            }
            if (dto.getCategory() != null && dto.getCategory().getId() != null) {
                Category category = Category.findById(UUID.fromString(dto.getCategory().getId()));
                if (category == null) {
                    throw new RuntimeException("Category not found with ID: " + dto.getCategory().getId());
                }
                tournament.setCategory(category);
            }
            if (dto.getRegistrationType() != null && dto.getRegistrationType().getId() != null) {
                RegistrationType registrationType = RegistrationType.findById(UUID.fromString(dto.getRegistrationType().getId()));
                if (registrationType == null) {
                    throw new RuntimeException("RegistrationType not found with ID: " + dto.getRegistrationType().getId());
                }
                tournament.setRegistrationType(registrationType);
            }
            if (dto.getStatus() != null && dto.getStatus().getId() != null) {
                TournamentStatus status = TournamentStatus.findById(UUID.fromString(dto.getStatus().getId()));
                if (status == null) {
                    throw new RuntimeException("TournamentStatus not found with ID: " + dto.getStatus().getId());
                }
                tournament.setStatus(status);
            }
            if (dto.getVenueType() != null && dto.getVenueType().getId() != null) {
                VenueType venueType = VenueType.findById(UUID.fromString(dto.getVenueType().getId()));
                if (venueType == null) {
                    throw new RuntimeException("VenueType not found with ID: " + dto.getVenueType().getId());
                }
                tournament.setVenueType(venueType);
            }
            
            return tournament;
        } catch (Exception e) {
            System.err.println("Error converting DTO to entity: " + e.getMessage());
            e.printStackTrace();
            throw e;
        }
    }
    
    /**
     * Convert RoundRobinTournamentDto to RoundRobinTournament entity.
     */
    private RoundRobinTournament convertToRoundRobinEntity(RoundRobinTournamentDto dto) {
        RoundRobinTournament tournament = new RoundRobinTournament();
        
        // Set Round Robin specific fields
        if (dto.getNoOfGroups() != null) {
            tournament.setNoOfGroups(dto.getNoOfGroups());
        }
        
        // Set Round Robin specific entities
        if (dto.getProgressionOption() != null && dto.getProgressionOption().getId() != null) {
            ProgressionType progressionType = ProgressionType.findById(UUID.fromString(dto.getProgressionOption().getId()));
            if (progressionType == null) {
                throw new RuntimeException("ProgressionType not found with ID: " + dto.getProgressionOption().getId());
            }
            tournament.setProgressionType(progressionType);
        }
        
        // Set teams to advance
        if (dto.getTeamsToAdvance() != null) {
            tournament.setTeamsToAdvance(dto.getTeamsToAdvance());
        }
        
        // Set the firebaseUid to prevent null constraint violation
        if (dto.getFirebaseUid() != null && !dto.getFirebaseUid().trim().isEmpty()) {
            tournament.setFirebaseUid(dto.getFirebaseUid());
        } else {
            System.err.println("Warning: firebaseUid is null or empty in RoundRobinTournamentDto");
        }
        
        return tournament;
    }
    
    /**
     * Convert AmericanoTournamentDto to AmericanoTournament entity.
     */
    private AmericanoTournament convertToAmericanoEntity(AmericanoTournamentDto dto) {
        AmericanoTournament tournament = new AmericanoTournament();
        
        // Set Americano specific fields
        if (dto.getMaxPlayersPerTeam() != null) {
            tournament.setMaxPlayersPerTeam(dto.getMaxPlayersPerTeam());
        }
        if (dto.getRotationInterval() != null) {
            tournament.setRotationInterval(dto.getRotationInterval());
        }
        if (dto.getPointsToWin() != null) {
            tournament.setPointsToWin(dto.getPointsToWin());
        }
        if (dto.getGamesPerRotation() != null) {
            tournament.setGamesPerRotation(dto.getGamesPerRotation());
        }
        
        // Set the firebaseUid to prevent null constraint violation
        if (dto.getFirebaseUid() != null && !dto.getFirebaseUid().trim().isEmpty()) {
            tournament.setFirebaseUid(dto.getFirebaseUid());
        } else {
            System.err.println("Warning: firebaseUid is null or empty in AmericanoTournamentDto");
        }
        
        return tournament;
    }
    
    /**
     * Update entity from DTO.
     */
    private void updateEntityFromDto(Tournament tournament, TournamentDto dto) {
        if (dto.getName() != null) tournament.setName(dto.getName());
        if (dto.getDescription() != null) tournament.setDescription(dto.getDescription());
        if (dto.getStartDate() != null) tournament.setStartDate(dto.getStartDate());
        if (dto.getEndDate() != null) tournament.setEndDate(dto.getEndDate());
        if (dto.getRegistrationStartDate() != null) tournament.setRegistrationStartDate(dto.getRegistrationStartDate());
        if (dto.getRegistrationEndDate() != null) tournament.setRegistrationEndDate(dto.getRegistrationEndDate());
        if (dto.getMaxParticipants() != null) tournament.setMaxParticipants(dto.getMaxParticipants());
        if (dto.getCurrentParticipants() != null) tournament.setCurrentParticipants(dto.getCurrentParticipants());
        if (dto.getEntryFee() != null) tournament.setEntryFee(dto.getEntryFee());
        // Set venue club relationship if venueId is provided
        if (dto.getVenueId() != null) {
            try {
                UUID venueId = UUID.fromString(dto.getVenueId());
                za.cf.cp.club.Club venueClub = za.cf.cp.club.Club.findById(venueId);
                if (venueClub != null && venueClub.isVenue()) {
                    tournament.setVenueClub(venueClub);
                }
            } catch (Exception e) {
                System.err.println("Error setting venue club for tournament: " + e.getMessage());
            }
        }
        
        // Update related entities if provided
        if (dto.getFormat() != null && dto.getFormat().getId() != null) {
            Format format = Format.findById(UUID.fromString(dto.getFormat().getId()));
            tournament.setFormat(format);
        }
        if (dto.getCategory() != null && dto.getCategory().getId() != null) {
            Category category = Category.findById(UUID.fromString(dto.getCategory().getId()));
            tournament.setCategory(category);
        }
        if (dto.getRegistrationType() != null && dto.getRegistrationType().getId() != null) {
            RegistrationType registrationType = RegistrationType.findById(UUID.fromString(dto.getRegistrationType().getId()));
            tournament.setRegistrationType(registrationType);
        }
        if (dto.getStatus() != null && dto.getStatus().getId() != null) {
            TournamentStatus status = TournamentStatus.findById(UUID.fromString(dto.getStatus().getId()));
            tournament.setStatus(status);
        }
        if (dto.getVenueType() != null && dto.getVenueType().getId() != null) {
            VenueType venueType = VenueType.findById(UUID.fromString(dto.getVenueType().getId()));
            tournament.setVenueType(venueType);
        }
        
        // Update tournament-specific fields based on type
        if (tournament instanceof RoundRobinTournament && dto instanceof RoundRobinTournamentDto) {
            updateRoundRobinFromDto((RoundRobinTournament) tournament, (RoundRobinTournamentDto) dto);
        } else if (tournament instanceof AmericanoTournament && dto instanceof AmericanoTournamentDto) {
            updateAmericanoFromDto((AmericanoTournament) tournament, (AmericanoTournamentDto) dto);
        }
    }
    
    /**
     * Update RoundRobinTournament from RoundRobinTournamentDto.
     */
    private void updateRoundRobinFromDto(RoundRobinTournament tournament, RoundRobinTournamentDto dto) {
        if (dto.getNoOfGroups() != null) {
            tournament.setNoOfGroups(dto.getNoOfGroups());
        }
        if (dto.getProgressionOption() != null && dto.getProgressionOption().getId() != null) {
            ProgressionType progressionType = ProgressionType.findById(UUID.fromString(dto.getProgressionOption().getId()));
            tournament.setProgressionType(progressionType);
        }

        if (dto.getTeamsToAdvance() != null) {
            tournament.setTeamsToAdvance(dto.getTeamsToAdvance());
        }
    }
    
    /**
     * Update AmericanoTournament from AmericanoTournamentDto.
     */
    private void updateAmericanoFromDto(AmericanoTournament tournament, AmericanoTournamentDto dto) {
        if (dto.getMaxPlayersPerTeam() != null) {
            tournament.setMaxPlayersPerTeam(dto.getMaxPlayersPerTeam());
        }
        if (dto.getRotationInterval() != null) {
            tournament.setRotationInterval(dto.getRotationInterval());
        }
        if (dto.getPointsToWin() != null) {
            tournament.setPointsToWin(dto.getPointsToWin());
        }
        if (dto.getGamesPerRotation() != null) {
            tournament.setGamesPerRotation(dto.getGamesPerRotation());
        }
    }

    // ==================== TOURNAMENT PARTICIPANTS ====================

    /**
     * Get tournament participants.
     */
    @Transactional
    public List<Object> getTournamentParticipants(String tournamentId) {
        try {
            // Validate tournament ID format
            if (tournamentId == null || tournamentId.trim().isEmpty()) {
                throw new IllegalArgumentException("Tournament ID cannot be null or empty");
            }
            
            UUID id;
            try {
                id = UUID.fromString(tournamentId);
            } catch (IllegalArgumentException e) {
                throw new IllegalArgumentException("Invalid tournament ID format: " + tournamentId);
            }
            
            // Check if tournament exists
            Tournament tournament = Tournament.findById(id);
            if (tournament == null) {
                return new ArrayList<>();
            }
            
            // Use a native query to join with the user table
            // Use LEFT JOIN to handle cases where user might not exist
            String query = """
                SELECT tp.participant_id, tp.tournament_id, tp.firebase_uid, tp.added_by,
                       u.firebase_uid, u.email, u.display_name, u.first_name, u.last_name, 
                       u.mobile, u.rating
                FROM core.tournament_participant tp
                LEFT JOIN core.user u ON tp.firebase_uid = u.firebase_uid
                WHERE tp.tournament_id = ?
                """;
            
            List<Object[]> results;
            try {
                results = entityManager.createNativeQuery(query)
                        .setParameter(1, id)
                        .getResultList();
            } catch (Exception e) {
                System.err.println("Database query error: " + e.getMessage());
                e.printStackTrace();
                throw new RuntimeException("Database query failed: " + e.getMessage(), e);
            }
                        
                            return results.stream().map(row -> {
                try {
                    Map<String, Object> participantDto = new HashMap<>();
                    participantDto.put("id", row[0] != null ? row[0].toString() : null); // participant_id
                    participantDto.put("tournamentId", tournamentId);
                    participantDto.put("uid", row[2]); // firebase_uid (from tp.firebase_uid)
                    participantDto.put("email", row[5]); // email
                    participantDto.put("displayName", row[6] != null ? row[6] : "Unknown User"); // display_name
                    participantDto.put("firstName", row[7]); // first_name
                    participantDto.put("lastName", row[8]); // last_name
                    participantDto.put("mobile", row[9]); // mobile
                    participantDto.put("rating", row[10] != null ? row[10] : 0); // rating
                    participantDto.put("addedBy", row[3]); // added_by
                    return participantDto;
                } catch (Exception e) {
                    System.err.println("Error processing participant row: " + e.getMessage());
                    e.printStackTrace();
                    throw new RuntimeException("Error processing participant data: " + e.getMessage(), e);
                }
            }).collect(Collectors.toList());
        } catch (Exception e) {
            throw new RuntimeException("Error retrieving tournament participants: " + e.getMessage(), e);
        }
    }

    /**
     * Add tournament participant.
     */
    @Transactional
    public void addTournamentParticipant(String tournamentId, Object participantData) {
        try {
            // Find the tournament
            Tournament tournament = Tournament.findById(UUID.fromString(tournamentId));
            if (tournament == null) {
                throw new RuntimeException("Tournament not found: " + tournamentId);
            }

            // Parse participant data from JSON
            ObjectMapper mapper = new ObjectMapper();
            JsonNode jsonNode = mapper.valueToTree(participantData);
            
            // Check if participant already exists
            String uid = jsonNode.get("uid").asText();
            long existingCount = TournamentParticipant.count("tournament.tournamentId = ?1 and firebaseUid = ?2", UUID.fromString(tournamentId), uid);
            if (existingCount > 0) {
                throw new RuntimeException("Participant already exists in tournament");
            }
            
            // Create new participant
            TournamentParticipant participant = new TournamentParticipant();
            participant.tournament = tournament;
            participant.firebaseUid = uid;
            participant.addedBy = jsonNode.get("addedBy").asText();

            participant.persist();
        } catch (Exception e) {
            throw new RuntimeException("Error adding tournament participant: " + e.getMessage(), e);
        }
    }

    /**
     * Remove tournament participant.
     */
    @Transactional
    public void removeTournamentParticipant(String tournamentId, String participantId) {
        try {
            UUID participantUuid = UUID.fromString(participantId);
            TournamentParticipant participant = TournamentParticipant.findById(participantUuid);
            
            if (participant == null) {
                throw new RuntimeException("Participant not found: " + participantId);
            }
            
            // Verify the participant belongs to the specified tournament
            if (!participant.tournament.getTournamentId().toString().equals(tournamentId)) {
                throw new RuntimeException("Participant does not belong to tournament: " + tournamentId);
            }
            
            participant.delete();
        } catch (Exception e) {
            throw new RuntimeException("Error removing tournament participant: " + e.getMessage(), e);
        }
    }

    /**
     * Update tournament participant rating.
     * Note: This method now updates the user's rating in the user table, not the participant table.
     */
    @Transactional
    public void updateParticipantRating(String tournamentId, String participantId, Integer rating) {
        try {
            UUID participantUuid = UUID.fromString(participantId);
            TournamentParticipant participant = TournamentParticipant.findById(participantUuid);
            
            if (participant == null) {
                throw new RuntimeException("Participant not found: " + participantId);
            }
            
            // Verify the participant belongs to the specified tournament
            if (!participant.tournament.getTournamentId().toString().equals(tournamentId)) {
                throw new RuntimeException("Participant does not belong to tournament: " + tournamentId);
            }
            
            // Update the user's rating in the user table
            String updateUserQuery = "UPDATE core.user SET rating = ? WHERE firebase_uid = ?";
            int updatedRows = entityManager.createNativeQuery(updateUserQuery)
                    .setParameter(1, rating)
                    .setParameter(2, participant.firebaseUid)
                    .executeUpdate();
            
            if (updatedRows == 0) {
                throw new RuntimeException("User not found for participant: " + participantId);
            }
        } catch (Exception e) {
            throw new RuntimeException("Error updating participant rating: " + e.getMessage(), e);
        }
    }

    // ==================== TOURNAMENT GROUPS ====================

    /**
     * Get tournament groups.
     */
    @Transactional
    public List<Object> getTournamentGroups(String tournamentId) {
        try {
            UUID id = UUID.fromString(tournamentId);
            List<TournamentGroup> groups = TournamentGroup.find("tournament.tournamentId", id).list();
            
            return groups.stream().map(group -> {
                Map<String, Object> groupDto = new HashMap<>();
                groupDto.put("id", group.groupId.toString());
                groupDto.put("tournamentId", tournamentId);
                groupDto.put("name", group.name);
                groupDto.put("maxTeams", group.maxTeams);
                groupDto.put("currentTeams", group.currentTeams);
                groupDto.put("venueId", group.venueId);

                return groupDto;
            }).collect(Collectors.toList());
        } catch (Exception e) {
            throw new RuntimeException("Error retrieving tournament groups: " + e.getMessage(), e);
        }
    }

    /**
     * Create tournament groups.
     */
    @Transactional
    public List<Object> createTournamentGroups(String tournamentId, Object groupData) {
        try {
            // Find the tournament
            Tournament tournament = Tournament.findById(UUID.fromString(tournamentId));
            if (tournament == null) {
                throw new RuntimeException("Tournament not found: " + tournamentId);
            }

            // Parse group data from JSON
            ObjectMapper mapper = new ObjectMapper();
            JsonNode jsonNode = mapper.valueToTree(groupData);
            
            int maxParticipants = jsonNode.get("maxParticipants").asInt();
            int noOfGroups = jsonNode.get("noOfGroups").asInt();
            
            // Calculate teams per group
            int teamsPerGroup = maxParticipants / 2 / noOfGroups;
            
            List<Object> createdGroups = new ArrayList<>();
            
            // Create groups
            for (int i = 1; i <= noOfGroups; i++) {
                TournamentGroup group = new TournamentGroup();
                group.tournament = tournament;
                group.name = "Group " + i;
                group.maxTeams = teamsPerGroup;
                group.currentTeams = 0;

                
                // Set venue if provided
                if (jsonNode.has("venue") && !jsonNode.get("venue").isNull()) {
                    JsonNode venueNode = jsonNode.get("venue");
                    if (venueNode.has("id")) {
                        group.venueId = venueNode.get("id").asText();
                    }
                }
                
                group.persist();
                
                // Convert to DTO for response
                Map<String, Object> groupDto = new HashMap<>();
                groupDto.put("id", group.groupId.toString());
                groupDto.put("tournamentId", tournamentId);
                groupDto.put("name", group.name);
                groupDto.put("maxTeams", group.maxTeams);
                groupDto.put("currentTeams", group.currentTeams);
                groupDto.put("venueId", group.venueId);

                
                createdGroups.add(groupDto);
            }
            
            return createdGroups;
        } catch (Exception e) {
            throw new RuntimeException("Error creating tournament groups: " + e.getMessage(), e);
        }
    }

    /**
     * Delete all tournament groups.
     */
    @Transactional
    public void deleteAllTournamentGroups(String tournamentId) {
        try {
            UUID id = UUID.fromString(tournamentId);
            TournamentGroup.delete("tournament.tournamentId", id);
        } catch (Exception e) {
            throw new RuntimeException("Error deleting tournament groups: " + e.getMessage(), e);
        }
    }

    /**
     * Update a specific tournament group.
     */
    @Transactional
    public Object updateTournamentGroup(String tournamentId, String groupId, Object groupData) {
        try {
            UUID tournamentUuid = UUID.fromString(tournamentId);
            UUID groupUuid = UUID.fromString(groupId);
            
            // Find the group
            TournamentGroup group = TournamentGroup.findById(groupUuid);
            if (group == null) {
                throw new RuntimeException("Tournament group not found: " + groupId);
            }
            
            // Verify the group belongs to the specified tournament
            if (!group.tournament.getTournamentId().equals(tournamentUuid)) {
                throw new RuntimeException("Group does not belong to tournament: " + tournamentId);
            }
            
            // Parse group data from JSON
            ObjectMapper mapper = new ObjectMapper();
            JsonNode jsonNode = mapper.valueToTree(groupData);
            
            // Update fields if provided
            if (jsonNode.has("name") && !jsonNode.get("name").isNull()) {
                group.name = jsonNode.get("name").asText();
            }
            if (jsonNode.has("maxTeams") && !jsonNode.get("maxTeams").isNull()) {
                group.maxTeams = jsonNode.get("maxTeams").asInt();
            }
            if (jsonNode.has("venueId") && !jsonNode.get("venueId").isNull()) {
                group.venueId = jsonNode.get("venueId").asText();
            }
            
            // Persist the changes
            group.persist();
            
            // Convert to DTO for response
            Map<String, Object> groupDto = new HashMap<>();
            groupDto.put("id", group.groupId.toString());
            groupDto.put("tournamentId", tournamentId);
            groupDto.put("name", group.name);
            groupDto.put("maxTeams", group.maxTeams);
            groupDto.put("currentTeams", group.currentTeams);
            groupDto.put("venueId", group.venueId);
            
            return groupDto;
        } catch (Exception e) {
            throw new RuntimeException("Error updating tournament group: " + e.getMessage(), e);
        }
    }

    /**
     * Delete a specific tournament group.
     */
    @Transactional
    public void deleteTournamentGroup(String tournamentId, String groupId) {
        try {
            UUID tournamentUuid = UUID.fromString(tournamentId);
            UUID groupUuid = UUID.fromString(groupId);
            
            // Find the group
            TournamentGroup group = TournamentGroup.findById(groupUuid);
            if (group == null) {
                throw new RuntimeException("Tournament group not found: " + groupId);
            }
            
            // Verify the group belongs to the specified tournament
            if (!group.tournament.getTournamentId().equals(tournamentUuid)) {
                throw new RuntimeException("Group does not belong to tournament: " + tournamentId);
            }
            
            // Delete the group
            group.delete();
        } catch (Exception e) {
            throw new RuntimeException("Error deleting tournament group: " + e.getMessage(), e);
        }
    }

    // ==================== TOURNAMENT TEAMS ====================

    /**
     * Get all tournament teams.
     */
    @Transactional
    public List<List<Object>> getAllTournamentTeams(String tournamentId) {
        // TODO: Implement team retrieval
        return List.of();
    }

    /**
     * Get tournament teams for a specific group.
     */
    @Transactional
    public List<Object> getTournamentTeams(String tournamentId, String groupId) {
        try {
            UUID tournamentUuid = UUID.fromString(tournamentId);
            UUID groupUuid = UUID.fromString(groupId);
            
            List<TournamentTeam> teams = TournamentTeam.find("tournament.tournamentId = ?1 and group.groupId = ?2", tournamentUuid, groupUuid).list();
            
            return teams.stream().map(team -> {
                Map<String, Object> teamDto = new HashMap<>();
                teamDto.put("id", team.teamId.toString());
                teamDto.put("tournamentId", tournamentId);
                teamDto.put("groupId", groupId);
                teamDto.put("name", team.name);
                teamDto.put("playerUids", team.getPlayerUids());
                
                // Convert player UIDs to player objects by fetching from participants and users
                List<Map<String, Object>> players = new ArrayList<>();
                if (team.getPlayerUids() != null) {
                    for (String uid : team.getPlayerUids()) {
                        // Find participant with this UID and join with user table
                        String query = """
                            SELECT tp.participant_id, tp.firebase_uid, tp.added_by,
                                   u.firebase_uid, u.email, u.display_name, u.first_name, u.last_name, 
                                   u.mobile, u.rating
                            FROM core.tournament_participant tp
                            JOIN core.user u ON tp.firebase_uid = u.firebase_uid
                            WHERE tp.tournament_id = ? AND tp.firebase_uid = ?
                            """;
                        
                        List<Object[]> results = entityManager.createNativeQuery(query)
                                .setParameter(1, tournamentUuid)
                                .setParameter(2, uid)
                                .getResultList();
                        
                        if (!results.isEmpty()) {
                            Object[] row = results.get(0);
                            Map<String, Object> player = new HashMap<>();
                            player.put("uid", row[1]); // firebase_uid (from tp.firebase_uid)
                            player.put("email", row[4]); // email
                            player.put("displayName", row[5]); // display_name
                            player.put("firstName", row[6]); // first_name
                            player.put("lastName", row[7]); // last_name
                            player.put("mobile", row[8]); // mobile
                            player.put("rating", row[9]); // rating
                            players.add(player);
                        } else {
                            // Fallback if participant not found
                            Map<String, Object> player = new HashMap<>();
                            player.put("uid", uid);
                            players.add(player);
                        }
                    }
                }
                teamDto.put("players", players);
                
                return teamDto;
            }).collect(Collectors.toList());
        } catch (Exception e) {
            throw new RuntimeException("Error retrieving tournament teams: " + e.getMessage(), e);
        }
    }

    /**
     * Create tournament team.
     */
    @Transactional
    public Object createTournamentTeam(String tournamentId, String groupId, Object teamData) {
        try {
            // Find the tournament and group
            Tournament tournament = Tournament.findById(UUID.fromString(tournamentId));
            if (tournament == null) {
                throw new RuntimeException("Tournament not found: " + tournamentId);
            }
            
            TournamentGroup group = TournamentGroup.findById(UUID.fromString(groupId));
            if (group == null) {
                throw new RuntimeException("Group not found: " + groupId);
            }
            
            // Verify the group belongs to the tournament
            if (!group.tournament.getTournamentId().toString().equals(tournamentId)) {
                throw new RuntimeException("Group does not belong to tournament: " + tournamentId);
            }
            
            // Check if group is full
            if (group.currentTeams >= group.maxTeams) {
                throw new RuntimeException("Group is full. Cannot add more teams.");
            }
            
            // Parse team data from JSON
            ObjectMapper mapper = new ObjectMapper();
            JsonNode jsonNode = mapper.valueToTree(teamData);
            
            // Create new team
            TournamentTeam team = new TournamentTeam();
            team.tournament = tournament;
            team.group = group;
            team.name = jsonNode.get("name").asText();
            
            // Parse players
            JsonNode playersNode = jsonNode.get("players");
            List<String> playerUids = new ArrayList<>();
            for (JsonNode playerNode : playersNode) {
                playerUids.add(playerNode.get("uid").asText());
            }
            team.setPlayerUids(playerUids);
            
            // Calculate combined rating from participants by joining with user table
            int combinedRating = 0;
            for (String uid : playerUids) {
                String query = """
                    SELECT u.rating
                    FROM core.tournament_participant tp
                    JOIN core.user u ON tp.firebase_uid = u.firebase_uid
                    WHERE tp.tournament_id = ? AND tp.firebase_uid = ?
                    """;
                
                List<Object> results = entityManager.createNativeQuery(query)
                        .setParameter(1, UUID.fromString(tournamentId))
                        .setParameter(2, uid)
                        .getResultList();
                
                if (!results.isEmpty() && results.get(0) != null) {
                    combinedRating += ((Number) results.get(0)).intValue();
                }
            }
            team.combinedRating = combinedRating;
            
            team.persist();
            
            // Update group team count
            group.currentTeams++;
            group.persist();
            
            // Convert to DTO for response
            Map<String, Object> teamDto = new HashMap<>();
            teamDto.put("id", team.teamId.toString());
            teamDto.put("tournamentId", tournamentId);
            teamDto.put("groupId", groupId);
            teamDto.put("name", team.name);
            teamDto.put("playerUids", team.getPlayerUids());
            teamDto.put("combinedRating", team.combinedRating);
            
            return teamDto;
        } catch (Exception e) {
            throw new RuntimeException("Error creating tournament team: " + e.getMessage(), e);
        }
    }

    /**
     * Update tournament team.
     */
    @Transactional
    public Object updateTournamentTeam(String tournamentId, String groupId, String teamId, Object teamData) {
        try {
            // Find the tournament, group, and team
            Tournament tournament = Tournament.findById(UUID.fromString(tournamentId));
            if (tournament == null) {
                throw new RuntimeException("Tournament not found: " + tournamentId);
            }
            
            TournamentGroup group = TournamentGroup.findById(UUID.fromString(groupId));
            if (group == null) {
                throw new RuntimeException("Group not found: " + groupId);
            }
            
            TournamentTeam team = TournamentTeam.findById(UUID.fromString(teamId));
            if (team == null) {
                throw new RuntimeException("Team not found: " + teamId);
            }
            
            // Verify the team belongs to the tournament and group
            if (!team.tournament.getTournamentId().toString().equals(tournamentId)) {
                throw new RuntimeException("Team does not belong to tournament: " + tournamentId);
            }
            if (!team.group.getGroupId().toString().equals(groupId)) {
                throw new RuntimeException("Team does not belong to group: " + groupId);
            }
            
            // Parse team data from JSON
            ObjectMapper mapper = new ObjectMapper();
            JsonNode jsonNode = mapper.valueToTree(teamData);
            
            // Update team name
            if (jsonNode.has("name")) {
                team.name = jsonNode.get("name").asText();
            }
            
            // Update players
            if (jsonNode.has("players")) {
                JsonNode playersNode = jsonNode.get("players");
                List<String> playerUids = new ArrayList<>();
                for (JsonNode playerNode : playersNode) {
                    playerUids.add(playerNode.get("uid").asText());
                }
                team.setPlayerUids(playerUids);
                
                // Recalculate combined rating
                int combinedRating = 0;
                for (String uid : playerUids) {
                    String query = """
                        SELECT u.rating
                        FROM core.tournament_participant tp
                        JOIN core.user u ON tp.firebase_uid = u.firebase_uid
                        WHERE tp.tournament_id = ? AND tp.firebase_uid = ?
                        """;
                    
                    List<Object> results = entityManager.createNativeQuery(query)
                            .setParameter(1, UUID.fromString(tournamentId))
                            .setParameter(2, uid)
                            .getResultList();
                    
                    if (!results.isEmpty() && results.get(0) != null) {
                        combinedRating += ((Number) results.get(0)).intValue();
                    }
                }
                team.combinedRating = combinedRating;
            }
            
            team.persist();
            
            // Convert to DTO for response
            Map<String, Object> teamDto = new HashMap<>();
            teamDto.put("id", team.teamId.toString());
            teamDto.put("tournamentId", tournamentId);
            teamDto.put("groupId", groupId);
            teamDto.put("name", team.name);
            teamDto.put("playerUids", team.getPlayerUids());
            teamDto.put("combinedRating", team.combinedRating);
            
            return teamDto;
        } catch (Exception e) {
            throw new RuntimeException("Error updating tournament team: " + e.getMessage(), e);
        }
    }

    // ==================== TOURNAMENT MATCHES ====================

    /**
     * Get tournament matches.
     */
    @Transactional
    public List<Object> getTournamentMatches(String tournamentId) {
        try {
            UUID id = UUID.fromString(tournamentId);
            
            // Find all matches for this tournament
            List<TournamentMatch> matches = TournamentMatch.find("tournament.tournamentId", id).list();
            
            return matches.stream().map(match -> {
                Map<String, Object> matchDto = new HashMap<>();
                matchDto.put("id", match.matchId.toString());
                matchDto.put("tournamentId", tournamentId);
                matchDto.put("groupId", match.group != null ? match.group.groupId.toString() : null);
                matchDto.put("phase", match.phase);
                matchDto.put("round", match.round);
                matchDto.put("team1Id", match.team1 != null ? match.team1.teamId.toString() : null);
                matchDto.put("team2Id", match.team2 != null ? match.team2.teamId.toString() : null);
                matchDto.put("team1Score", match.team1Score);
                matchDto.put("team2Score", match.team2Score);
                matchDto.put("team1Set1", match.team1Set1);
                matchDto.put("team2Set1", match.team2Set1);
                matchDto.put("team1Set2", match.team1Set2);
                matchDto.put("team2Set2", match.team2Set2);
                matchDto.put("team1Set3", match.team1Set3);
                matchDto.put("team2Set3", match.team2Set3);
                matchDto.put("winnerId", match.winner != null ? match.winner.teamId.toString() : null);
                matchDto.put("status", match.status);
                matchDto.put("scheduledTime", match.scheduledTime);
                matchDto.put("venueId", match.venueId);
                
                return matchDto;
            }).collect(Collectors.toList());
        } catch (Exception e) {
            throw new RuntimeException("Error retrieving tournament matches: " + e.getMessage(), e);
        }
    }

    /**
     * Update match score.
     */
    @Transactional
    public void updateMatchScore(String matchId, Object matchData) {
        try {
            UUID id = UUID.fromString(matchId);
            
            // Find the match
            TournamentMatch match = TournamentMatch.findById(id);
            if (match == null) {
                throw new RuntimeException("Match not found: " + matchId);
            }
            
            // Parse the match data from JSON
            ObjectMapper mapper = new ObjectMapper();
            JsonNode jsonNode = mapper.valueToTree(matchData);
            
            // Update match fields if provided
            boolean hasScores = false;
            
            if (jsonNode.has("team1Score")) {
                match.team1Score = jsonNode.get("team1Score").asInt();
                hasScores = true;
            }
            if (jsonNode.has("team2Score")) {
                match.team2Score = jsonNode.get("team2Score").asInt();
                hasScores = true;
            }
            if (jsonNode.has("team1Set1")) {
                match.team1Set1 = jsonNode.get("team1Set1").asInt();
                hasScores = true;
            }
            if (jsonNode.has("team2Set1")) {
                match.team2Set1 = jsonNode.get("team2Set1").asInt();
                hasScores = true;
            }
            if (jsonNode.has("team1Set2")) {
                match.team1Set2 = jsonNode.get("team1Set2").asInt();
                hasScores = true;
            }
            if (jsonNode.has("team2Set2")) {
                match.team2Set2 = jsonNode.get("team2Set2").asInt();
                hasScores = true;
            }
            if (jsonNode.has("team1Set3")) {
                match.team1Set3 = jsonNode.get("team1Set3").asInt();
                hasScores = true;
            }
            if (jsonNode.has("team2Set3")) {
                match.team2Set3 = jsonNode.get("team2Set3").asInt();
                hasScores = true;
            }
            if (jsonNode.has("winnerId")) {
                String winnerId = jsonNode.get("winnerId").asText();
                if (winnerId != null && !winnerId.isEmpty()) {
                    UUID winnerTeamId = UUID.fromString(winnerId);
                    match.winner = TournamentTeam.findById(winnerTeamId);
                } else {
                    match.winner = null;
                }
            }
            if (jsonNode.has("status")) {
                match.status = jsonNode.get("status").asText();
            }
            if (jsonNode.has("scheduledTime")) {
                String scheduledTimeStr = jsonNode.get("scheduledTime").asText();
                if (scheduledTimeStr != null && !scheduledTimeStr.isEmpty()) {
                    try {
                        // Handle different datetime formats
                        if (scheduledTimeStr.contains("T")) {
                            // ISO format like "2025-08-04T20:00:00.000Z" or "2025-08-04T20:00"
                            String cleanTime = scheduledTimeStr.replace("Z", "").replace(".000", "");
                            if (cleanTime.length() == 16) {
                                // Format: "2025-08-04T20:00" - add seconds
                                cleanTime += ":00";
                            }
                            match.scheduledTime = LocalDateTime.parse(cleanTime);
                        } else {
                            // Handle other formats if needed
                            match.scheduledTime = LocalDateTime.parse(scheduledTimeStr);
                        }
                    } catch (Exception e) {
                        // Don't update if parsing fails
                    }
                } else {
                    match.scheduledTime = null;
                }
            }
            if (jsonNode.has("venueId")) {
                String venueId = jsonNode.get("venueId").asText();
                if (venueId != null && !venueId.isEmpty()) {
                    match.venueId = venueId;
                } else {
                    match.venueId = null;
                }
            }
            
            // Update match status based on whether the match is actually completed
            if (hasScores) {
                // For knockout matches, only set to completed if we have enough sets to determine a winner
                if (match.phase != null && !match.phase.equals("group")) {
                    // Knockout match - check if we have at least 2 sets with scores to determine winner
                    int completedSets = 0;
                    if (match.team1Set1 != null && match.team2Set1 != null && 
                        !(match.team1Set1 == 0 && match.team2Set1 == 0)) {
                        completedSets++;
                    }
                    if (match.team1Set2 != null && match.team2Set2 != null && 
                        !(match.team1Set2 == 0 && match.team2Set2 == 0)) {
                        completedSets++;
                    }
                    if (match.team1Set3 != null && match.team2Set3 != null && 
                        !(match.team1Set3 == 0 && match.team2Set3 == 0)) {
                        completedSets++;
                    }
                    
                    // Only set to completed if we have at least 2 sets and can determine a winner
                    if (completedSets >= 2) {
                        match.status = "completed";
                    } else {
                        match.status = "in_progress";
                    }
                } else {
                    // Group match - set to completed if scores are provided
                    match.status = "completed";
                }
            }
            
            // Use merge to ensure the entity is properly managed and changes are persisted
            entityManager.merge(match);
            
            // Force flush to ensure the data is written to the database
            entityManager.flush();
            
            // Check for auto-generation opportunities (but do it in a separate transaction to avoid interference)
            if (match.status != null && match.status.equals("completed")) {
                try {
                    checkAndAutoGenerateNextRound(match);
                } catch (Exception e) {
                    // Don't let auto-generation errors break match updates
                    System.err.println("Error in auto-generation: " + e.getMessage());
                }
            }
            
            // Recalculate standings for the group (only for group matches, not knockout matches)
            if (match.group != null) {
                calculateAndUpdateStandings(match.tournament.tournamentId.toString(), match.group.groupId.toString());
            }
            
        } catch (Exception e) {
            throw new RuntimeException("Error updating match score: " + e.getMessage(), e);
        }
    }

    /**
     * Generate all group matches for a tournament.
     */
    @Transactional
    public List<Object> generateAllGroupMatches(String tournamentId) {
        try {
            UUID id = UUID.fromString(tournamentId);
            
            // Find the tournament
            Tournament tournament = Tournament.findById(id);
            if (tournament == null) {
                throw new RuntimeException("Tournament not found: " + tournamentId);
            }
            
            // Get all groups for this tournament
            List<TournamentGroup> groups = TournamentGroup.find("tournament.tournamentId", id).list();
            if (groups.isEmpty()) {
                throw new RuntimeException("No groups found for tournament: " + tournamentId);
            }
            
            List<Object> generatedMatches = new ArrayList<>();
            
            // Generate matches for each group
            for (TournamentGroup group : groups) {
                List<TournamentTeam> teams = TournamentTeam.find("group.groupId", group.groupId).list();
                
                if (teams.size() < 2) {
                    continue;
                }
                
                // Generate round-robin matches for this group
                List<TournamentMatch> groupMatches = generateRoundRobinMatches(tournament, group, teams);
                
                // Convert matches to DTOs for response
                for (TournamentMatch match : groupMatches) {
                    Map<String, Object> matchDto = new HashMap<>();
                    matchDto.put("id", match.matchId.toString());
                    matchDto.put("tournamentId", tournamentId);
                    matchDto.put("groupId", group.groupId.toString());
                    matchDto.put("phase", match.phase);
                    matchDto.put("round", match.round);
                    matchDto.put("team1Id", match.team1.teamId.toString());
                    matchDto.put("team2Id", match.team2.teamId.toString());
                    matchDto.put("team1Score", match.team1Score);
                    matchDto.put("team2Score", match.team2Score);
                    matchDto.put("status", match.status);
                    matchDto.put("scheduledTime", match.scheduledTime);
                    matchDto.put("venueId", match.venueId);
                    
                    generatedMatches.add(matchDto);
                }
            }
            
            return generatedMatches;
        } catch (Exception e) {
            throw new RuntimeException("Error generating group matches: " + e.getMessage(), e);
        }
    }

    /**
     * Generate round-robin matches for a group.
     */
    private List<TournamentMatch> generateRoundRobinMatches(Tournament tournament, TournamentGroup group, List<TournamentTeam> teams) {
        List<TournamentMatch> matches = new ArrayList<>();
        
        int numTeams = teams.size();
        if (numTeams < 2) {
            return matches;
        }
        
        // For round-robin, we need (n-1) rounds where n is the number of teams
        int numRounds = numTeams - 1;
        int matchesPerRound = numTeams / 2;
        
        // Create a copy of teams list to manipulate
        List<TournamentTeam> teamList = new ArrayList<>(teams);
        
        // If odd number of teams, add a "bye" team (null)
        if (numTeams % 2 != 0) {
            teamList.add(null);
            numTeams++;
            numRounds = numTeams - 1;
            matchesPerRound = numTeams / 2;
        }
        
        // Generate matches for each round
        for (int round = 1; round <= numRounds; round++) {
            // Generate matches for this round
            for (int i = 0; i < matchesPerRound; i++) {
                int team1Index = i;
                int team2Index = numTeams - 1 - i;
                
                // Skip if either team is "bye"
                if (teamList.get(team1Index) != null && teamList.get(team2Index) != null) {
                    TournamentMatch match = new TournamentMatch();
                    match.tournament = tournament;
                    match.group = group;
                    match.phase = "group";
                    match.round = round;
                    match.team1 = teamList.get(team1Index);
                    match.team2 = teamList.get(team2Index);
                    match.team1Score = null;
                    match.team2Score = null;
                    match.status = "scheduled";
                    match.scheduledTime = null; // Will be set later
                    match.venueId = group.venueId;
                    
                    match.persist();
                    matches.add(match);
                }
            }
            
            // Rotate teams for next round (keep first team fixed, rotate the rest)
            if (round < numRounds) {
                TournamentTeam lastTeam = teamList.remove(teamList.size() - 1);
                teamList.add(1, lastTeam);
            }
        }
        
        return matches;
    }

    /**
     * Calculate and update standings for a tournament group.
     */
    @Transactional
    public void calculateAndUpdateStandings(String tournamentId, String groupId) {
        try {
            // Get all teams in the group
            List<TournamentTeam> teams = TournamentTeam.find("tournament.tournamentId = ?1 and group.groupId = ?2", UUID.fromString(tournamentId), UUID.fromString(groupId)).list();
            
            // Get all matches for the group
            List<TournamentMatch> matches = TournamentMatch.find("tournament.tournamentId = ?1 and group.groupId = ?2", UUID.fromString(tournamentId), UUID.fromString(groupId)).list();
            
            // Initialize standings for all teams
            Map<String, TournamentStanding> standingsMap = new HashMap<>();
            
            for (TournamentTeam team : teams) {
                TournamentStanding standing = TournamentStanding.findByTournamentGroupAndTeam(tournamentId, groupId, team.teamId.toString());
                if (standing == null) {
                    standing = new TournamentStanding();
                    standing.tournamentId = tournamentId;
                    standing.groupId = groupId;
                    standing.teamId = team.teamId.toString();
                }
                
                // Reset stats
                standing.matchesPlayed = 0;
                standing.matchesWon = 0;
                standing.matchesLost = 0;
                standing.matchesDrawn = 0;
                standing.goalsFor = 0;
                standing.goalsAgainst = 0;
                standing.goalDifference = 0;
                standing.points = 0;
                
                standingsMap.put(team.teamId.toString(), standing);
            }
            
            // Calculate standings from matches
            for (TournamentMatch match : matches) {
                if (match.team1Set1 == null || match.team2Set1 == null) {
                    continue; // Skip incomplete matches
                }
                
                // Calculate match result using the new set-based scoring system
                MatchResult result = calculateMatchResult(match);
                
                if (result.isComplete) {
                    TournamentStanding team1Standing = standingsMap.get(match.team1.teamId.toString());
                    TournamentStanding team2Standing = standingsMap.get(match.team2.teamId.toString());
                    
                    if (team1Standing != null && team2Standing != null) {
                        // Update goals (total points from sets)
                        team1Standing.goalsFor += result.team1Total;
                        team1Standing.goalsAgainst += result.team2Total;
                        team2Standing.goalsFor += result.team2Total;
                        team2Standing.goalsAgainst += result.team1Total;
                        
                        // Update match results
                        if (result.winner.equals(match.team1.teamId.toString())) {
                            team1Standing.matchesWon++;
                            team2Standing.matchesLost++;
                        } else if (result.winner.equals(match.team2.teamId.toString())) {
                            team2Standing.matchesWon++;
                            team1Standing.matchesLost++;
                        } else {
                            // Draw (shouldn't happen in padel, but just in case)
                            team1Standing.matchesDrawn++;
                            team2Standing.matchesDrawn++;
                        }
                    }
                }
            }
            
            // Calculate derived fields and save standings
            for (TournamentStanding standing : standingsMap.values()) {
                standing.calculateMatchesPlayed();
                standing.calculateGoalDifference();
                standing.calculatePoints();
                standing.persist();
            }
            
            // Calculate positions
            calculatePositions(tournamentId, groupId);
            
        } catch (Exception e) {
            throw new RuntimeException("Error calculating standings: " + e.getMessage(), e);
        }
    }
    
    /**
     * Calculate match result based on set scores.
     */
    private MatchResult calculateMatchResult(TournamentMatch match) {
        List<SetScore> sets = Arrays.asList(
            new SetScore(match.team1Set1, match.team2Set1),
            new SetScore(match.team1Set2, match.team2Set2),
            new SetScore(match.team1Set3, match.team2Set3)
        );
        
        List<SetScore> completedSets = sets.stream()
            .filter(set -> set.team1Score != null && set.team2Score != null && !(set.team1Score == 0 && set.team2Score == 0))
            .collect(Collectors.toList());
        
        if (completedSets.isEmpty()) {
            return new MatchResult(false, null, 0, 0);
        }
        
        int team1Wins = (int) completedSets.stream().filter(s -> s.team1Score > s.team2Score).count();
        int team2Wins = (int) completedSets.stream().filter(s -> s.team2Score > s.team1Score).count();
        
        int team1Total = completedSets.stream().mapToInt(s -> s.team1Score).sum();
        int team2Total = completedSets.stream().mapToInt(s -> s.team2Score).sum();
        
        String winner = null;
        boolean isComplete = false;
        
        if (team1Wins > team2Wins && team1Wins >= 2) {
            winner = match.team1.teamId.toString();
            isComplete = true;
        } else if (team2Wins > team1Wins && team2Wins >= 2) {
            winner = match.team2.teamId.toString();
            isComplete = true;
        }
        
        return new MatchResult(isComplete, winner, team1Total, team2Total);
    }
    
    /**
     * Calculate positions for teams in a group.
     */
    @Transactional
    public void calculatePositions(String tournamentId, String groupId) {
        List<TournamentStanding> standings = TournamentStanding.findByTournamentAndGroup(tournamentId, groupId);
        
        // Sort by points (desc), goal difference (desc), goals for (desc)
        // Add deterministic fallbacks to avoid unstable ordering when fully tied
        standings.sort((a, b) -> {
            int pointsCompare = Integer.compare(b.points, a.points);
            if (pointsCompare != 0) return pointsCompare;

            int goalDiffCompare = Integer.compare(b.goalDifference, a.goalDifference);
            if (goalDiffCompare != 0) return goalDiffCompare;

            int goalsForCompare = Integer.compare(b.goalsFor, a.goalsFor);
            if (goalsForCompare != 0) return goalsForCompare;

            // Fallback: sort by team name if available, otherwise by teamId
            String aTeamName = getTeamNameSafe(a.teamId);
            String bTeamName = getTeamNameSafe(b.teamId);
            int nameCompare = aTeamName.compareToIgnoreCase(bTeamName);
            if (nameCompare != 0) return nameCompare;

            return a.teamId.compareTo(b.teamId);
        });
        
        // Update positions
        for (int i = 0; i < standings.size(); i++) {
            standings.get(i).position = i + 1;
            standings.get(i).persist();
        }
    }

    private String getTeamNameSafe(String teamId) {
        try {
            if (teamId == null) return "";
            TournamentTeam team = TournamentTeam.findById(UUID.fromString(teamId));
            if (team != null && team.name != null) {
                return team.name;
            }
        } catch (Exception ignored) {}
        return "";
    }
    
    /**
     * Get standings for a tournament group.
     */
    @Transactional
    public List<Object> getTournamentStandings(String tournamentId, String groupId) {
        try {
            List<TournamentStanding> standings = TournamentStanding.findByTournamentAndGroup(tournamentId, groupId);
            
            return standings.stream().map(standing -> {
                Map<String, Object> standingDto = new HashMap<>();
                standingDto.put("id", standing.standingId);
                standingDto.put("tournamentId", standing.tournamentId);
                standingDto.put("groupId", standing.groupId);
                standingDto.put("teamId", standing.teamId);
                standingDto.put("matchesPlayed", standing.matchesPlayed);
                standingDto.put("matchesWon", standing.matchesWon);
                standingDto.put("matchesLost", standing.matchesLost);
                standingDto.put("matchesDrawn", standing.matchesDrawn);
                standingDto.put("goalsFor", standing.goalsFor);
                standingDto.put("goalsAgainst", standing.goalsAgainst);
                standingDto.put("goalDifference", standing.goalDifference);
                standingDto.put("points", standing.points);
                standingDto.put("position", standing.position);
                
                // Get team name
                TournamentTeam team = TournamentTeam.findById(UUID.fromString(standing.teamId));
                if (team != null) {
                    standingDto.put("teamName", team.name);
                }
                
                return standingDto;
            }).collect(Collectors.toList());
        } catch (Exception e) {
            System.err.println("Service: Error in getTournamentStandings: " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("Error retrieving tournament standings: " + e.getMessage(), e);
        }
    }
    
    /**
     * Get all standings for a tournament.
     */
    @Transactional
    public List<Object> getAllTournamentStandings(String tournamentId) {
        try {
            List<TournamentStanding> standings = TournamentStanding.findByTournament(tournamentId);
            
            return standings.stream().map(standing -> {
                Map<String, Object> standingDto = new HashMap<>();
                standingDto.put("id", standing.standingId);
                standingDto.put("tournamentId", standing.tournamentId);
                standingDto.put("groupId", standing.groupId);
                standingDto.put("teamId", standing.teamId);
                standingDto.put("matchesPlayed", standing.matchesPlayed);
                standingDto.put("matchesWon", standing.matchesWon);
                standingDto.put("matchesLost", standing.matchesLost);
                standingDto.put("matchesDrawn", standing.matchesDrawn);
                standingDto.put("goalsFor", standing.goalsFor);
                standingDto.put("goalsAgainst", standing.goalsAgainst);
                standingDto.put("goalDifference", standing.goalDifference);
                standingDto.put("points", standing.points);
                standingDto.put("position", standing.position);
                
                // Add unique identifier to prevent duplicate key warnings in Angular
                standingDto.put("uniqueId", standing.standingId + "-" + standing.teamId + "-" + standing.position);
                
                // Get team name
                TournamentTeam team = TournamentTeam.findById(UUID.fromString(standing.teamId));
                if (team != null) {
                    standingDto.put("teamName", team.name);
                }
                
                return standingDto;
            }).collect(Collectors.toList());
        } catch (Exception e) {
            throw new RuntimeException("Error retrieving tournament standings: " + e.getMessage(), e);
        }
    }
    
    /**
     * Validate that a user is an admin of a club
     */
    private void validateUserIsClubAdmin(String firebaseUid, String clubId) {
        if (firebaseUid == null || firebaseUid.trim().isEmpty()) {
            System.err.println("ERROR: Firebase UID is null or empty");
            throw new RuntimeException("User authentication required to create tournament");
        }
        
        if (clubId == null || clubId.trim().isEmpty()) {
            System.err.println("ERROR: Club ID is null or empty");
            throw new RuntimeException("Club ID is required to create tournament");
        }
        
        try {
            UUID clubUuid = UUID.fromString(clubId);
            
            // Check if user exists
            Optional<za.cf.cp.user.User> userOpt = userService.findByFirebaseUid(firebaseUid);
            if (userOpt.isEmpty()) {
                System.err.println("ERROR: User not found with Firebase UID: " + firebaseUid);
                throw new RuntimeException("User not found with Firebase UID: " + firebaseUid);
            }
            
            // Check if user is admin of the club using the new method
            boolean isAdmin = userService.isUserClubAdmin(firebaseUid, clubUuid);
            
            if (!isAdmin) {
                System.err.println("ERROR: User is not admin of club: " + clubId);
                throw new RuntimeException("Only club admins can create tournaments. User is not an admin of club: " + clubId);
            }
            
        } catch (IllegalArgumentException e) {
            System.err.println("ERROR: Invalid club ID format: " + clubId);
            throw new RuntimeException("Invalid club ID format: " + clubId, e);
        } catch (Exception e) {
            System.err.println("ERROR: Error validating user permissions: " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("Error validating user permissions: " + e.getMessage(), e);
        }
    }
    
    // Helper classes
    private static class MatchResult {
        final boolean isComplete;
        final String winner;
        final int team1Total;
        final int team2Total;
        
        MatchResult(boolean isComplete, String winner, int team1Total, int team2Total) {
            this.isComplete = isComplete;
            this.winner = winner;
            this.team1Total = team1Total;
            this.team2Total = team2Total;
        }
    }
    
    private static class SetScore {
        final Integer team1Score;
        final Integer team2Score;
        
        SetScore(Integer team1Score, Integer team2Score) {
            this.team1Score = team1Score;
            this.team2Score = team2Score;
        }
    }

    // ==================== KNOCKOUT BRACKET METHODS ====================

    /**
     * Generate knockout bracket matches based on round robin standings
     */
    @Transactional
    public List<Object> generateKnockoutBracket(String tournamentId) {
        try {
            UUID id = UUID.fromString(tournamentId);
            
            // Find the tournament
            Tournament tournament = Tournament.findById(id);
            if (tournament == null) {
                throw new RuntimeException("Tournament not found: " + tournamentId);
            }

            // Check if tournament is round robin type
            if (!"ROUND_ROBIN".equals(tournament.getTournamentType())) {
                throw new RuntimeException("Knockout bracket can only be generated for round robin tournaments");
            }

            // Check if all group matches are completed
            if (!areAllGroupMatchesCompleted(tournamentId)) {
                throw new RuntimeException("All group matches must be completed before generating knockout bracket");
            }

            // Get all groups for this tournament
            List<TournamentGroup> groups = TournamentGroup.find("tournament.tournamentId", id).list();
            if (groups.isEmpty()) {
                throw new RuntimeException("No groups found for tournament: " + tournamentId);
            }

            // Get advancing teams based on standings
            List<TournamentTeam> advancingTeams = getAdvancingTeams(tournament, groups);
            
            if (advancingTeams.size() < 2) {
                throw new RuntimeException("At least 2 teams must advance to generate knockout bracket");
            }

            // Generate knockout matches
            List<TournamentMatch> knockoutMatches = generateKnockoutMatches(tournament, advancingTeams);
            
            // Convert matches to DTOs for response
            List<Object> matchDtos = new ArrayList<>();
            for (TournamentMatch match : knockoutMatches) {
                Map<String, Object> matchDto = new HashMap<>();
                matchDto.put("id", match.matchId.toString());
                matchDto.put("tournamentId", tournamentId);
                matchDto.put("groupId", null); // Knockout matches don't have groups
                matchDto.put("phase", match.phase);
                matchDto.put("round", match.round);
                matchDto.put("team1Id", match.team1.teamId.toString());
                matchDto.put("team2Id", match.team2.teamId.toString());
                matchDto.put("team1Score", match.team1Score);
                matchDto.put("team2Score", match.team2Score);
                matchDto.put("status", match.status);
                matchDto.put("scheduledTime", match.scheduledTime);
                matchDto.put("venueId", match.venueId);
                
                matchDtos.add(matchDto);
            }
            
            return matchDtos;
        } catch (Exception e) {
            throw new RuntimeException("Error generating knockout bracket: " + e.getMessage(), e);
        }
    }

    /**
     * Get knockout bracket matches for a tournament
     */
    public List<Object> getKnockoutMatches(String tournamentId) {
        try {
            UUID id = UUID.fromString(tournamentId);
            
            // Get all knockout matches for this tournament (exclude group phase)
            List<TournamentMatch> matches = TournamentMatch.find(
                "tournament.tournamentId = ?1 and phase != ?2", 
                id, 
                "group"
            ).list();
            
            // Convert matches to DTOs for response
            List<Object> matchDtos = new ArrayList<>();
            for (TournamentMatch match : matches) {
                
                Map<String, Object> matchDto = new HashMap<>();
                matchDto.put("id", match.matchId.toString());
                matchDto.put("tournamentId", tournamentId);
                matchDto.put("groupId", match.group != null ? match.group.groupId.toString() : null);
                matchDto.put("phase", match.phase);
                matchDto.put("round", match.round);
                matchDto.put("team1Id", match.team1.teamId.toString());
                matchDto.put("team2Id", match.team2.teamId.toString());
                matchDto.put("team1Score", match.team1Score);
                matchDto.put("team2Score", match.team2Score);
                matchDto.put("team1Set1", match.team1Set1);
                matchDto.put("team2Set1", match.team2Set1);
                matchDto.put("team1Set2", match.team1Set2);
                matchDto.put("team2Set2", match.team2Set2);
                matchDto.put("team1Set3", match.team1Set3);
                matchDto.put("team2Set3", match.team2Set3);
                matchDto.put("status", match.status);
                matchDto.put("scheduledTime", match.scheduledTime);
                matchDto.put("venueId", match.venueId);
                
                matchDtos.add(matchDto);
            }
            
            return matchDtos;
        } catch (Exception e) {
            throw new RuntimeException("Error getting knockout matches: " + e.getMessage(), e);
        }
    }

    /**
     * Check if all group matches are completed
     */
    public boolean areAllGroupMatchesCompleted(String tournamentId) {
        try {
            UUID id = UUID.fromString(tournamentId);
            
            // Get all group matches for this tournament
            List<TournamentMatch> groupMatches = TournamentMatch.find(
                "tournament.tournamentId = ?1 and phase = ?2", 
                id, 
                "group"
            ).list();
            
            if (groupMatches.isEmpty()) {
                return false; // No group matches found
            }
            
            // Check if all matches are completed
            int completedCount = 0;
            for (TournamentMatch match : groupMatches) {
                if ("completed".equals(match.status)) {
                    completedCount++;
                } else {
                    return false;
                }
            }
            
            return true;
        } catch (Exception e) {
            System.err.println("Error checking group match completion: " + e.getMessage());
            e.printStackTrace();
            return false;
        }
    }

    /**
     * Get advancing teams based on standings and tournament configuration
     * Uses proper tournament seeding: group winners vs runners-up from different groups
     */
    private List<TournamentTeam> getAdvancingTeams(Tournament tournament, List<TournamentGroup> groups) {
        List<TournamentTeam> advancingTeams = new ArrayList<>();
        
        // Get teams to advance per group from tournament configuration
        int teamsToAdvancePerGroup = 2; // Default to 2 teams per group
        
        // If it's a RoundRobinTournament, get the teamsToAdvance value
        if (tournament instanceof RoundRobinTournament) {
            RoundRobinTournament roundRobinTournament = (RoundRobinTournament) tournament;
            if (roundRobinTournament.getTeamsToAdvance() != null) {
                teamsToAdvancePerGroup = roundRobinTournament.getTeamsToAdvance();
            }
        }
        
        // Collect group winners and runners-up separately
        List<TournamentTeam> groupWinners = new ArrayList<>();
        List<TournamentTeam> runnersUp = new ArrayList<>();
        
        for (TournamentGroup group : groups) {
            // Get standings for this group
            List<TournamentStanding> standings = TournamentStanding.find(
                "tournamentId = ?1 and groupId = ?2 order by position asc", 
                tournament.tournamentId.toString(), 
                group.groupId.toString()
            ).list();
            
            // Add group winner (1st place)
            if (standings.size() > 0) {
                TournamentStanding winnerStanding = standings.get(0);
                TournamentTeam winner = TournamentTeam.find("teamId", UUID.fromString(winnerStanding.teamId)).firstResult();
                if (winner != null) {
                    groupWinners.add(winner);
                }
            }
            
            // Add runner-up (2nd place) if advancing 2 teams per group
            if (teamsToAdvancePerGroup >= 2 && standings.size() > 1) {
                TournamentStanding runnerUpStanding = standings.get(1);
                TournamentTeam runnerUp = TournamentTeam.find("teamId", UUID.fromString(runnerUpStanding.teamId)).firstResult();
                if (runnerUp != null) {
                    runnersUp.add(runnerUp);
                }
            }
        }
        
        // Apply proper tournament seeding based on tournament type
        if (teamsToAdvancePerGroup == 2) {
            // Standard group-based elimination: group winners vs runners-up from different groups
            advancingTeams = createGroupBasedEliminationBracket(groupWinners, runnersUp);
        } else {
            // Combined elimination: all advancing teams seeded by overall performance
            advancingTeams = createCombinedEliminationBracket(groupWinners, runnersUp, tournament, groups);
        }        
        return advancingTeams;
    }

    /**
     * Create bracket for Group-Based Elimination (standard tournament format)
     * Group winners face runners-up from different groups
     * Uses FIFA/UEFA style bracket to ensure same-group teams are on opposite sides
     */
    private List<TournamentTeam> createGroupBasedEliminationBracket(List<TournamentTeam> groupWinners, List<TournamentTeam> runnersUp) {
        List<TournamentTeam> bracket = new ArrayList<>();
        
        int numGroups = Math.min(groupWinners.size(), runnersUp.size());
        
        // FIFA/UEFA style bracket structure to avoid same-group matchups
        // For 4 groups: A1 vs B2, C1 vs D2, B1 vs A2, D1 vs C2
        // This ensures same-group teams are on opposite sides of the bracket
        
        for (int i = 0; i < numGroups; i++) {
            // Add group winner
            TournamentTeam winner = groupWinners.get(i);
            bracket.add(winner);
            
            // Calculate runner-up index to avoid same-group matchups
            // Use a pattern that ensures different group pairings
            int runnerUpIndex;
            if (numGroups == 4) {
                // Standard 4-group bracket: A1 vs B2, C1 vs D2, B1 vs A2, D1 vs C2
                if (i == 0) runnerUpIndex = 1;      // A1 vs B2
                else if (i == 1) runnerUpIndex = 0; // B1 vs A2  
                else if (i == 2) runnerUpIndex = 3; // C1 vs D2
                else runnerUpIndex = 2;             // D1 vs C2
            } else if (numGroups == 3) {
                // 3-group bracket: A1 vs B2, B1 vs C2, C1 vs A2
                runnerUpIndex = (i + 1) % numGroups;
            } else if (numGroups == 2) {
                // 2-group bracket: A1 vs B2, B1 vs A2
                runnerUpIndex = (i + 1) % numGroups;
            } else {
                // For other numbers, use a simple offset but ensure no same-group matchups
                runnerUpIndex = (i + 1) % numGroups;
            }
            
            TournamentTeam runnerUp = runnersUp.get(runnerUpIndex);
            bracket.add(runnerUp);
        }
        
        return bracket;
    }

    /**
     * Create bracket for Combined Elimination (all teams seeded by overall performance)
     * Teams are ranked by their overall performance across all groups and seeded accordingly
     */
    private List<TournamentTeam> createCombinedEliminationBracket(List<TournamentTeam> groupWinners, List<TournamentTeam> runnersUp, Tournament tournament, List<TournamentGroup> groups) {
        List<TournamentTeam> allAdvancingTeams = new ArrayList<>();
        allAdvancingTeams.addAll(groupWinners);
        allAdvancingTeams.addAll(runnersUp);
        
        // Create a comprehensive ranking of all advancing teams based on overall performance
        List<TeamPerformance> teamPerformances = new ArrayList<>();
        
        for (TournamentTeam team : allAdvancingTeams) {
            TeamPerformance performance = calculateOverallPerformance(team, tournament);
            teamPerformances.add(performance);
        }
        
        // Sort by overall performance (points, goal difference, goals scored, etc.)
        teamPerformances.sort((a, b) -> {
            // Primary: Points
            int pointsComparison = Integer.compare(b.points, a.points);
            if (pointsComparison != 0) return pointsComparison;
            
            // Secondary: Goal difference
            int goalDiffComparison = Integer.compare(b.goalDifference, a.goalDifference);
            if (goalDiffComparison != 0) return goalDiffComparison;
            
            // Tertiary: Goals scored
            int goalsScoredComparison = Integer.compare(b.goalsScored, a.goalsScored);
            if (goalsScoredComparison != 0) return goalsScoredComparison;
            
            // Quaternary: Goals conceded (fewer is better)
            return Integer.compare(a.goalsConceded, b.goalsConceded);
        });
        
        // Extract teams in performance order
        List<TournamentTeam> seededTeams = new ArrayList<>();
        for (TeamPerformance performance : teamPerformances) {
            seededTeams.add(performance.team);
        }
        
        return seededTeams;
    }
    
    /**
     * Calculate overall performance metrics for a team across all group matches
     */
    private TeamPerformance calculateOverallPerformance(TournamentTeam team, Tournament tournament) {
        TeamPerformance performance = new TeamPerformance();
        performance.team = team;
        performance.points = 0;
        performance.goalsScored = 0;
        performance.goalsConceded = 0;
        performance.matchesPlayed = 0;
        
        // Get all group matches for this team
        List<TournamentMatch> teamMatches = TournamentMatch.find(
            "tournament.tournamentId = ?1 and (team1.teamId = ?2 or team2.teamId = ?2) and phase = 'group'", 
            tournament.tournamentId, 
            team.teamId
        ).list();
        
        for (TournamentMatch match : teamMatches) {
            if (match.team1Score != null && match.team2Score != null) {
                performance.matchesPlayed++;
                
                if (match.team1.teamId.equals(team.teamId)) {
                    // Team is team1
                    performance.goalsScored += match.team1Score;
                    performance.goalsConceded += match.team2Score;
                    
                    if (match.team1Score > match.team2Score) {
                        performance.points += 3; // Win
                    } else if (match.team1Score.equals(match.team2Score)) {
                        performance.points += 1; // Draw
                    }
                } else {
                    // Team is team2
                    performance.goalsScored += match.team2Score;
                    performance.goalsConceded += match.team1Score;
                    
                    if (match.team2Score > match.team1Score) {
                        performance.points += 3; // Win
                    } else if (match.team2Score.equals(match.team1Score)) {
                        performance.points += 1; // Draw
                    }
                }
            }
        }
        
        performance.goalDifference = performance.goalsScored - performance.goalsConceded;
        return performance;
    }
    
    /**
     * Helper class to hold team performance metrics
     */
    private static class TeamPerformance {
        TournamentTeam team;
        int points;
        int goalsScored;
        int goalsConceded;
        int goalDifference;
        int matchesPlayed;
    }

    /**
     * Generate knockout matches for advancing teams - only the first round
     */
    private List<TournamentMatch> generateKnockoutMatches(Tournament tournament, List<TournamentTeam> advancingTeams) {
        List<TournamentMatch> matches = new ArrayList<>();
        
        int numTeams = advancingTeams.size();
        if (numTeams < 2) {
            return matches;
        }
        
        // Only generate the first round of matches
        // Subsequent rounds will be generated as previous rounds are completed
        String firstPhase = determineFirstKnockoutPhase(numTeams);
        
        // Generate first round matches
        // For group-based elimination, pair teams sequentially as they come from bracket creation
        // For combined elimination, use 1st vs last seeding
        for (int i = 0; i < numTeams / 2; i++) {
            TournamentMatch match = new TournamentMatch();
            match.tournament = tournament;
            match.group = null; // Knockout matches don't have groups
            match.phase = firstPhase;
            match.round = 1;
            
            int team1Index, team2Index;
            
            // Check if this is group-based elimination (teams are already properly paired)
            // or combined elimination (need 1st vs last seeding)
            if (isGroupBasedElimination(tournament)) {
                // Group-based elimination: pair teams sequentially (already properly paired)
                team1Index = i * 2;
                team2Index = i * 2 + 1;
            } else {
                // Combined elimination: 1st vs last, 2nd vs second-to-last, etc.
                team1Index = i;
                team2Index = numTeams - 1 - i;
            }
            
            match.team1 = advancingTeams.get(team1Index);
            match.team2 = advancingTeams.get(team2Index);
            match.team1Score = null;
            match.team2Score = null;
            match.status = "scheduled";
            match.scheduledTime = null; // Will be set later
            match.venueId = null; // Will be set later            
            match.persist();
            matches.add(match);
        }
        
        return matches;
    }

    /**
     * Check if this is group-based elimination (2 teams per group) or combined elimination
     */
    private boolean isGroupBasedElimination(Tournament tournament) {
        if (tournament instanceof RoundRobinTournament) {
            RoundRobinTournament roundRobinTournament = (RoundRobinTournament) tournament;
            return roundRobinTournament.getTeamsToAdvance() != null && roundRobinTournament.getTeamsToAdvance() == 2;
        }
        return true; // Default to group-based elimination
    }

    /**
     * Determine the first knockout phase based on number of teams
     */
    private String determineFirstKnockoutPhase(int numTeams) {
        if (numTeams <= 2) {
            return "final";
        } else if (numTeams <= 4) {
            return "semifinal";
        } else if (numTeams <= 8) {
            return "quarterfinal";
        } else {
            // For more than 8 teams, start with round_1
            return "round_1";
        }
    }

    /**
     * Determine knockout phases based on number of teams
     */
    private String[] determineKnockoutPhases(int numTeams) {
        if (numTeams <= 2) {
            return new String[]{"final"};
        } else if (numTeams <= 4) {
            return new String[]{"semifinal", "final"};
        } else if (numTeams <= 8) {
            return new String[]{"quarterfinal", "semifinal", "final"};
        } else {
            // For more than 8 teams, we need additional rounds
            int totalRounds = (int) Math.ceil(Math.log(numTeams) / Math.log(2));
            String[] phases = new String[totalRounds];
            phases[totalRounds - 1] = "final";
            if (totalRounds > 1) {
                phases[totalRounds - 2] = "semifinal";
            }
            if (totalRounds > 2) {
                phases[totalRounds - 3] = "quarterfinal";
            }
            // Add additional rounds as needed
            for (int i = 0; i < totalRounds - 3; i++) {
                phases[i] = "round_" + (i + 1);
            }
            return phases;
        }
    }

    /**
     * Generate next round of knockout matches when a round is completed
     */
    @Transactional
    public List<Object> generateNextKnockoutRound(String tournamentId) {
        try {
            UUID id = UUID.fromString(tournamentId);
            
            // Find the tournament
            Tournament tournament = Tournament.findById(id);
            if (tournament == null) {
                throw new RuntimeException("Tournament not found: " + tournamentId);
            }

            // Find the highest completed round
            List<TournamentMatch> allKnockoutMatches = TournamentMatch.find(
                "tournament.tournamentId = ?1 and phase != ?2", 
                id, 
                "group"
            ).list();

            if (allKnockoutMatches.isEmpty()) {
                throw new RuntimeException("No knockout matches found for tournament: " + tournamentId);
            }

            // Find the highest round number
            int maxRound = allKnockoutMatches.stream()
                .mapToInt(match -> match.round)
                .max()
                .orElse(0);

            // Check if the highest round is completed
            List<TournamentMatch> currentRoundMatches = allKnockoutMatches.stream()
                .filter(match -> match.round == maxRound)
                .collect(java.util.stream.Collectors.toList());

            boolean allCompleted = currentRoundMatches.stream()
                .allMatch(match -> "completed".equals(match.status));

            if (!allCompleted) {
                throw new RuntimeException("Current round must be completed before generating next round");
            }

            // Get winners from current round using set-based scoring
            List<TournamentTeam> winners = new ArrayList<>();
            for (TournamentMatch match : currentRoundMatches) {
                // Use the same logic as calculateMatchResult to determine winner
                MatchResult result = calculateMatchResult(match);
                if (result.isComplete && result.winner != null) {
                    if (result.winner.equals(match.team1.teamId.toString())) {
                        winners.add(match.team1);
                    } else if (result.winner.equals(match.team2.teamId.toString())) {
                        winners.add(match.team2);
                    }
                }
            }

            if (winners.size() < 2) {
                throw new RuntimeException("Not enough winners to generate next round");
            }

            // Determine next phase
            String nextPhase = determineNextKnockoutPhase(maxRound, winners.size());
            int nextRound = maxRound + 1;

            // Generate next round matches
            List<TournamentMatch> newMatches = new ArrayList<>();
            for (int i = 0; i < winners.size() / 2; i++) {
                TournamentMatch match = new TournamentMatch();
                match.tournament = tournament;
                match.group = null;
                match.phase = nextPhase;
                match.round = nextRound;
                match.team1 = winners.get(i * 2);
                match.team2 = winners.get(i * 2 + 1);
                match.team1Score = null;
                match.team2Score = null;
                match.status = "scheduled";
                match.scheduledTime = null;
                match.venueId = null;
                
                match.persist();
                newMatches.add(match);
            }

            // Convert to DTOs
            List<Object> matchDtos = new ArrayList<>();
            for (TournamentMatch match : newMatches) {
                Map<String, Object> matchDto = new HashMap<>();
                matchDto.put("id", match.matchId.toString());
                matchDto.put("tournamentId", tournamentId);
                matchDto.put("groupId", null);
                matchDto.put("phase", match.phase);
                matchDto.put("round", match.round);
                matchDto.put("team1Id", match.team1.teamId.toString());
                matchDto.put("team2Id", match.team2.teamId.toString());
                matchDto.put("team1Score", match.team1Score);
                matchDto.put("team2Score", match.team2Score);
                matchDto.put("status", match.status);
                matchDto.put("scheduledTime", match.scheduledTime);
                matchDto.put("venueId", match.venueId);
                
                matchDtos.add(matchDto);
            }

            return matchDtos;
        } catch (Exception e) {
            throw new RuntimeException("Error generating next knockout round: " + e.getMessage(), e);
        }
    }

    /**
     * Determine the next knockout phase based on current round and number of teams
     */
    private String determineNextKnockoutPhase(int currentRound, int numTeams) {
        if (numTeams == 2) {
            return "final";
        } else if (numTeams == 4) {
            return "semifinal";
        } else if (numTeams == 8) {
            return "quarterfinal";
        } else {
            // For other cases, continue with round numbering
            return "round_" + (currentRound + 1);
        }
    }

    /**
     * Check if auto-generation should be triggered and generate next round if needed
     */
    private void checkAndAutoGenerateNextRound(TournamentMatch completedMatch) {
        try {
            String tournamentId = completedMatch.tournament.tournamentId.toString();
            
            // Check if this was a group match and all group matches are now completed
            if (completedMatch.phase != null && completedMatch.phase.equals("group")) {
                if (areAllGroupMatchesCompleted(tournamentId)) {
                    generateKnockoutBracket(tournamentId);
                }
            }
            // Check if this was a knockout match and all matches in current round are completed
            else if (completedMatch.phase != null && !completedMatch.phase.equals("group")) {
                if (areAllMatchesInCurrentRoundCompleted(tournamentId, completedMatch.round)) {
                    generateNextKnockoutRound(tournamentId);
                }
            }
        } catch (Exception e) {
            System.err.println("Error in auto-generation check: " + e.getMessage());
            // Don't throw - auto-generation failure shouldn't break match updates
        }
    }
    
    /**
     * Check if all matches in a specific round are completed
     */
    private boolean areAllMatchesInCurrentRoundCompleted(String tournamentId, int round) {
        UUID id = UUID.fromString(tournamentId);
        
        List<TournamentMatch> roundMatches = TournamentMatch.find(
            "tournament.tournamentId = ?1 and round = ?2 and phase != ?3", 
            id, 
            round,
            "group"
        ).list();
        
        if (roundMatches.isEmpty()) {
            return false;
        }
        
        return roundMatches.stream().allMatch(match -> "completed".equals(match.status));
    }

    /**
     * Determine number of teams per phase
     */
    private int[] determineTeamsPerPhase(int numTeams) {
        int totalRounds = (int) Math.ceil(Math.log(numTeams) / Math.log(2));
        int[] teamsPerPhase = new int[totalRounds];
        
        int currentTeams = numTeams;
        for (int i = 0; i < totalRounds; i++) {
            teamsPerPhase[i] = currentTeams;
            currentTeams = currentTeams / 2;
        }
        
        return teamsPerPhase;
    }
} 