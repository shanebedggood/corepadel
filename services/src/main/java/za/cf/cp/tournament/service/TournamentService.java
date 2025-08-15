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
    za.cf.cp.venue.service.VenueService venueService;
    
    /**
     * Get all tournaments ordered by creation date (newest first).
     */
    @Transactional
    public List<TournamentDto> getAllTournaments() {
        try {
            System.out.println("Getting all tournaments from database...");
            List<Tournament> tournaments = Tournament.listAll();
            System.out.println("Found " + tournaments.size() + " tournaments in database");
            
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
            
            System.out.println("Successfully converted " + dtos.size() + " tournaments to DTOs");
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
            System.out.println("Converting tournament to DTO: " + tournament.getTournamentId());
            TournamentDto dto = new TournamentDto();
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
            dto.setNoOfGroups(tournament.getNoOfGroups());
            dto.setClubId(tournament.getClubId());
            dto.setUserId(tournament.getUserId());

            dto.setVenueId(tournament.getVenueId());
            
            // Add venue information if venueId is provided
            if (tournament.getVenueId() != null) {
                try {
                    za.cf.cp.venue.dto.VenueDto venue = venueService.getVenueById(tournament.getVenueId());
                    if (venue != null) {
                        // Create a venue object that matches the frontend interface
                        Map<String, Object> venueObject = new HashMap<>();
                        venueObject.put("id", venue.id);
                        venueObject.put("name", venue.name);
                        venueObject.put("website", venue.website);
                        venueObject.put("facilities", venue.facilities);
                        
                        // Add address information
                        Map<String, Object> address = new HashMap<>();
                        address.put("street", venue.address.street);
                        address.put("suburb", venue.address.suburb);
                        address.put("city", venue.address.city);
                        address.put("province", venue.address.province);
                        address.put("postalCode", venue.address.postalCode);
                        address.put("country", venue.address.country);
                        venueObject.put("address", address);
                        
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
            if (tournament.getProgressionType() != null) {
                dto.setProgressionOption(tournamentConfigService.convertProgressionTypeToDto(tournament.getProgressionType()));
            }
            if (tournament.getAdvancementModel() != null) {
                dto.setAdvancementModel(tournamentConfigService.convertAdvancementModelToDto(tournament.getAdvancementModel()));
            }
            if (tournament.getEliminationBracketSize() != null) {
                dto.setEliminationBracketSize(tournamentConfigService.convertEliminationBracketSizeToDto(tournament.getEliminationBracketSize()));
            }
            
            System.out.println("Successfully converted tournament to DTO: " + tournament.getTournamentId());
            return dto;
        } catch (Exception e) {
            System.err.println("Error converting tournament " + tournament.getTournamentId() + " to DTO: " + e.getMessage());
            e.printStackTrace();
            throw e;
        }
    }
    
    /**
     * Convert DTO to Tournament entity.
     */
    private Tournament convertToEntity(TournamentDto dto) {
        try {
            System.out.println("Converting DTO to entity: " + dto);
            System.out.println("DTO format: " + dto.getFormat());
            System.out.println("DTO category: " + dto.getCategory());
            System.out.println("DTO registrationType: " + dto.getRegistrationType());
            System.out.println("DTO venueType: " + dto.getVenueType());
            System.out.println("DTO status: " + dto.getStatus());
            Tournament tournament = new Tournament();
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
            tournament.setNoOfGroups(dto.getNoOfGroups());
            tournament.setClubId(dto.getClubId());
            System.out.println("Setting userId: " + dto.getUserId());
            tournament.setUserId(dto.getUserId());

            tournament.setVenueId(dto.getVenueId());
            
            // Set related entities if IDs are provided
            if (dto.getFormat() != null && dto.getFormat().getId() != null) {
                System.out.println("Looking up format with ID: " + dto.getFormat().getId());
                Format format = Format.findById(UUID.fromString(dto.getFormat().getId()));
                if (format == null) {
                    throw new RuntimeException("Format not found with ID: " + dto.getFormat().getId());
                }
                System.out.println("Found format: " + format.getName());
                tournament.setFormat(format);
            } else {
                System.out.println("Format is null or has no ID: " + dto.getFormat());
            }
            if (dto.getCategory() != null && dto.getCategory().getId() != null) {
                System.out.println("Looking up category with ID: " + dto.getCategory().getId());
                Category category = Category.findById(UUID.fromString(dto.getCategory().getId()));
                if (category == null) {
                    throw new RuntimeException("Category not found with ID: " + dto.getCategory().getId());
                }
                System.out.println("Found category: " + category.getName());
                tournament.setCategory(category);
            } else {
                System.out.println("Category is null or has no ID: " + dto.getCategory());
            }
            if (dto.getRegistrationType() != null && dto.getRegistrationType().getId() != null) {
                System.out.println("Looking up registration type with ID: " + dto.getRegistrationType().getId());
                RegistrationType registrationType = RegistrationType.findById(UUID.fromString(dto.getRegistrationType().getId()));
                if (registrationType == null) {
                    throw new RuntimeException("RegistrationType not found with ID: " + dto.getRegistrationType().getId());
                }
                System.out.println("Found registration type: " + registrationType.getName());
                tournament.setRegistrationType(registrationType);
            } else {
                System.out.println("Registration type is null or has no ID: " + dto.getRegistrationType());
            }
            if (dto.getStatus() != null && dto.getStatus().getId() != null) {
                System.out.println("Looking up status with ID: " + dto.getStatus().getId());
                TournamentStatus status = TournamentStatus.findById(UUID.fromString(dto.getStatus().getId()));
                if (status == null) {
                    throw new RuntimeException("TournamentStatus not found with ID: " + dto.getStatus().getId());
                }
                tournament.setStatus(status);
            }
            if (dto.getVenueType() != null && dto.getVenueType().getId() != null) {
                System.out.println("Looking up venue type with ID: " + dto.getVenueType().getId());
                VenueType venueType = VenueType.findById(UUID.fromString(dto.getVenueType().getId()));
                if (venueType == null) {
                    throw new RuntimeException("VenueType not found with ID: " + dto.getVenueType().getId());
                }
                System.out.println("Found venue type: " + venueType.getName());
                tournament.setVenueType(venueType);
            }
            if (dto.getProgressionOption() != null && dto.getProgressionOption().getId() != null) {
                System.out.println("Looking up progression option with ID: " + dto.getProgressionOption().getId());
                ProgressionType progressionType = ProgressionType.findById(UUID.fromString(dto.getProgressionOption().getId()));
                if (progressionType == null) {
                    throw new RuntimeException("ProgressionType not found with ID: " + dto.getProgressionOption().getId());
                }
                tournament.setProgressionType(progressionType);
            }
            if (dto.getAdvancementModel() != null && dto.getAdvancementModel().getId() != null) {
                System.out.println("Looking up advancement model with ID: " + dto.getAdvancementModel().getId());
                AdvancementModel advancementModel = AdvancementModel.findById(UUID.fromString(dto.getAdvancementModel().getId()));
                if (advancementModel == null) {
                    throw new RuntimeException("AdvancementModel not found with ID: " + dto.getAdvancementModel().getId());
                }
                tournament.setAdvancementModel(advancementModel);
            }
            if (dto.getEliminationBracketSize() != null && dto.getEliminationBracketSize().getId() != null) {
                System.out.println("Looking up elimination bracket size with ID: " + dto.getEliminationBracketSize().getId());
                EliminationBracketSize eliminationBracketSize = EliminationBracketSize.findById(UUID.fromString(dto.getEliminationBracketSize().getId()));
                if (eliminationBracketSize == null) {
                    throw new RuntimeException("EliminationBracketSize not found with ID: " + dto.getEliminationBracketSize().getId());
                }
                tournament.setEliminationBracketSize(eliminationBracketSize);
            }
            
            System.out.println("Successfully converted DTO to entity");
            return tournament;
        } catch (Exception e) {
            System.err.println("Error converting DTO to entity: " + e.getMessage());
            e.printStackTrace();
            throw e;
        }
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
        if (dto.getNoOfGroups() != null) tournament.setNoOfGroups(dto.getNoOfGroups());
        if (dto.getVenueId() != null) tournament.setVenueId(dto.getVenueId());
        
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
        if (dto.getProgressionOption() != null && dto.getProgressionOption().getId() != null) {
            ProgressionType progressionType = ProgressionType.findById(UUID.fromString(dto.getProgressionOption().getId()));
            tournament.setProgressionType(progressionType);
        }
        if (dto.getAdvancementModel() != null && dto.getAdvancementModel().getId() != null) {
            AdvancementModel advancementModel = AdvancementModel.findById(UUID.fromString(dto.getAdvancementModel().getId()));
            tournament.setAdvancementModel(advancementModel);
        }
        if (dto.getEliminationBracketSize() != null && dto.getEliminationBracketSize().getId() != null) {
            EliminationBracketSize eliminationBracketSize = EliminationBracketSize.findById(UUID.fromString(dto.getEliminationBracketSize().getId()));
            tournament.setEliminationBracketSize(eliminationBracketSize);
        }
    }

    // ==================== TOURNAMENT PARTICIPANTS ====================

    /**
     * Get tournament participants.
     */
    @Transactional
    public List<Object> getTournamentParticipants(String tournamentId) {
        try {
            System.out.println("Getting participants for tournament: " + tournamentId);
            
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
                System.out.println("Tournament not found with ID: " + tournamentId);
                return new ArrayList<>();
            }
            
            // Use a native query to join with the user table
            // Use LEFT JOIN to handle cases where user might not exist
            String query = """
                SELECT tp.participant_id, tp.tournament_id, tp.user_id, tp.added_by,
                       u.firebase_uid, u.email, u.display_name, u.first_name, u.last_name, 
                       u.mobile, u.rating
                FROM core.tournament_participant tp
                LEFT JOIN core.user u ON tp.user_id = u.firebase_uid
                WHERE tp.tournament_id = ?
                """;
            
            System.out.println("Executing query: " + query);
            System.out.println("Tournament ID parameter: " + id);
            
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
            
            System.out.println("Found " + results.size() + " participants for tournament " + tournamentId);
            
            return results.stream().map(row -> {
                try {
                    Map<String, Object> participantDto = new HashMap<>();
                    participantDto.put("id", row[0] != null ? row[0].toString() : null); // participant_id
                    participantDto.put("tournamentId", tournamentId);
                    participantDto.put("uid", row[4] != null ? row[4] : row[2]); // firebase_uid or user_id as fallback
                    participantDto.put("email", row[5]); // email
                    participantDto.put("displayName", row[6] != null ? row[6] : "Unknown User"); // display_name
                    participantDto.put("firstName", row[7]); // first_name
                    participantDto.put("lastName", row[8]); // last_name
                    participantDto.put("mobile", row[9]); // mobile
                    participantDto.put("rating", row[10] != null ? row[10] : 0); // rating
                    participantDto.put("addedBy", row[3]); // added_by

                    System.out.println("Participant " + (row[6] != null ? row[6] : "Unknown") + " (UID: " + (row[4] != null ? row[4] : row[2]) + ") has rating: " + (row[10] != null ? row[10] : 0));

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
            long existingCount = TournamentParticipant.count("tournament.tournamentId = ?1 and userId = ?2", UUID.fromString(tournamentId), uid);
            if (existingCount > 0) {
                throw new RuntimeException("Participant already exists in tournament");
            }
            
            // Create new participant
            TournamentParticipant participant = new TournamentParticipant();
            participant.tournament = tournament;
            participant.userId = uid;
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
                    .setParameter(2, participant.userId)
                    .executeUpdate();
            
            if (updatedRows == 0) {
                throw new RuntimeException("User not found for participant: " + participantId);
            }
            
            System.out.println("Updated participant " + participant.userId + " rating to: " + rating);
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
                            SELECT tp.participant_id, tp.user_id, tp.added_by,
                                   u.firebase_uid, u.email, u.display_name, u.first_name, u.last_name, 
                                   u.mobile, u.rating
                            FROM core.tournament_participant tp
                            JOIN core.user u ON tp.user_id = u.firebase_uid
                            WHERE tp.tournament_id = ? AND tp.user_id = ?
                            """;
                        
                        List<Object[]> results = entityManager.createNativeQuery(query)
                                .setParameter(1, tournamentUuid)
                                .setParameter(2, uid)
                                .getResultList();
                        
                        if (!results.isEmpty()) {
                            Object[] row = results.get(0);
                            Map<String, Object> player = new HashMap<>();
                            player.put("uid", row[3]); // firebase_uid
                            player.put("email", row[4]); // email
                            player.put("displayName", row[5]); // display_name
                            player.put("firstName", row[6]); // first_name
                            player.put("lastName", row[7]); // last_name
                            player.put("mobile", row[8]); // mobile
                            player.put("rating", row[9]); // rating
                            players.add(player);
                            
                            System.out.println("Team player " + row[5] + " (UID: " + row[3] + ") has rating: " + row[9]);
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
                    JOIN core.user u ON tp.user_id = u.firebase_uid
                    WHERE tp.tournament_id = ? AND tp.user_id = ?
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
                        JOIN core.user u ON tp.user_id = u.firebase_uid
                        WHERE tp.tournament_id = ? AND tp.user_id = ?
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
            System.out.println("Updating match score for matchId: " + matchId);
            UUID id = UUID.fromString(matchId);
            
            // Find the match
            TournamentMatch match = TournamentMatch.findById(id);
            if (match == null) {
                throw new RuntimeException("Match not found: " + matchId);
            }
            
            // Parse the match data from JSON
            ObjectMapper mapper = new ObjectMapper();
            JsonNode jsonNode = mapper.valueToTree(matchData);
            System.out.println("Match data received: " + jsonNode.toString());
            
            // Update match fields if provided
            if (jsonNode.has("team1Score")) {
                match.team1Score = jsonNode.get("team1Score").asInt();
            }
            if (jsonNode.has("team2Score")) {
                match.team2Score = jsonNode.get("team2Score").asInt();
            }
            if (jsonNode.has("team1Set1")) {
                match.team1Set1 = jsonNode.get("team1Set1").asInt();
            }
            if (jsonNode.has("team2Set1")) {
                match.team2Set1 = jsonNode.get("team2Set1").asInt();
            }
            if (jsonNode.has("team1Set2")) {
                match.team1Set2 = jsonNode.get("team1Set2").asInt();
            }
            if (jsonNode.has("team2Set2")) {
                match.team2Set2 = jsonNode.get("team2Set2").asInt();
            }
            if (jsonNode.has("team1Set3")) {
                match.team1Set3 = jsonNode.get("team1Set3").asInt();
            }
            if (jsonNode.has("team2Set3")) {
                match.team2Set3 = jsonNode.get("team2Set3").asInt();
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
                        System.err.println("Error parsing scheduledTime: " + scheduledTimeStr + " - " + e.getMessage());
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
            
            // Persist the changes
            match.persist();
            
            // Recalculate standings for the group
            calculateAndUpdateStandings(match.tournament.tournamentId.toString(), match.group.groupId.toString());
            
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
                    System.out.println("Group " + group.name + " has less than 2 teams, skipping match generation");
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
        standings.sort((a, b) -> {
            int pointsCompare = Integer.compare(b.points, a.points);
            if (pointsCompare != 0) return pointsCompare;
            
            int goalDiffCompare = Integer.compare(b.goalDifference, a.goalDifference);
            if (goalDiffCompare != 0) return goalDiffCompare;
            
            return Integer.compare(b.goalsFor, a.goalsFor);
        });
        
        // Update positions
        for (int i = 0; i < standings.size(); i++) {
            standings.get(i).position = i + 1;
            standings.get(i).persist();
        }
    }
    
    /**
     * Get standings for a tournament group.
     */
    @Transactional
    public List<Object> getTournamentStandings(String tournamentId, String groupId) {
        try {
            System.out.println("Service: Getting standings for tournament: " + tournamentId + ", group: " + groupId);
            List<TournamentStanding> standings = TournamentStanding.findByTournamentAndGroup(tournamentId, groupId);
            System.out.println("Service: Found " + standings.size() + " standings records");
            
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
} 