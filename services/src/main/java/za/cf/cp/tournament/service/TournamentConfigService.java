package za.cf.cp.tournament.service;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.persistence.EntityManager;
import jakarta.transaction.Transactional;
import za.cf.cp.tournament.*;
import za.cf.cp.tournament.dto.*;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Service for managing tournament configuration data.
 * Provides methods to retrieve and manage all tournament configuration entities.
 */
@ApplicationScoped
public class TournamentConfigService {
    
    @Inject
    EntityManager entityManager;
    
    /**
     * Get complete tournament configuration.
     * Returns all configuration data in the format expected by the frontend.
     */
    @Transactional
    public TournamentConfigDto getTournamentConfig() {
        List<TournamentFormatDto> formats = getFormats();
        List<TournamentStatusDto> statuses = getStatuses();
        List<TournamentCategoryDto> categories = getCategories();
        List<TournamentRegistrationTypeDto> registrationTypes = getRegistrationTypes();
        List<TournamentVenueTypeDto> venueTypes = getVenueTypes();
        
        String lastUpdated = LocalDateTime.now().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME);
        
        return new TournamentConfigDto(formats, statuses, categories, registrationTypes, venueTypes, lastUpdated);
    }
    
    /**
     * Get round-robin specific configuration.
     * Returns round-robin configuration data in the format expected by the frontend.
     */
    @Transactional
    public RoundRobinConfigDto getRoundRobinConfig() {
        List<TournamentProgressionOptionDto> progressionTypes = getProgressionTypes();
        RoundRobinConfigDto.GroupAdvancementSettingsDto groupAdvancementSettings = getGroupAdvancementSettings();
        RoundRobinConfigDto.CombinedAdvancementSettingsDto combinedAdvancementSettings = getCombinedAdvancementSettings();
        
        String lastUpdated = LocalDateTime.now().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME);
        
        return new RoundRobinConfigDto(progressionTypes, groupAdvancementSettings, combinedAdvancementSettings, lastUpdated);
    }
    
    /**
     * Get all tournament formats.
     */
    @Transactional
    public List<TournamentFormatDto> getFormats() {
        List<Format> formats = Format.listAll();
        return formats.stream()
                .map(this::convertFormatToDto)
                .collect(Collectors.toList());
    }
    
    /**
     * Get all tournament statuses.
     */
    @Transactional
    public List<TournamentStatusDto> getStatuses() {
        List<TournamentStatus> statuses = TournamentStatus.listAll();
        return statuses.stream()
                .map(this::convertStatusToDto)
                .collect(Collectors.toList());
    }
    
    /**
     * Get all tournament categories.
     */
    @Transactional
    public List<TournamentCategoryDto> getCategories() {
        List<Category> categories = Category.listAll();
        return categories.stream()
                .map(this::convertCategoryToDto)
                .collect(Collectors.toList());
    }
    
    /**
     * Get all registration types.
     */
    @Transactional
    public List<TournamentRegistrationTypeDto> getRegistrationTypes() {
        List<RegistrationType> registrationTypes = RegistrationType.listAll();
        return registrationTypes.stream()
                .map(this::convertRegistrationTypeToDto)
                .collect(Collectors.toList());
    }
    
    /**
     * Get all venue types.
     */
    @Transactional
    public List<TournamentVenueTypeDto> getVenueTypes() {
        List<VenueType> venueTypes = VenueType.listAll();
        return venueTypes.stream()
                .map(this::convertVenueTypeToDto)
                .collect(Collectors.toList());
    }
    
    /**
     * Get all progression types.
     */
    @Transactional
    public List<TournamentProgressionOptionDto> getProgressionTypes() {
        List<ProgressionType> progressionTypes = ProgressionType.listAll();
        return progressionTypes.stream()
                .map(this::convertProgressionTypeToDto)
                .collect(Collectors.toList());
    }
    
    /**
     * Get group advancement settings.
     */
    @Transactional
    public RoundRobinConfigDto.GroupAdvancementSettingsDto getGroupAdvancementSettings() {
        List<AdvancementModelDto> advancementModels = getAdvancementModels();
        List<EliminationBracketSizeDto> eliminationBracketSizes = getEliminationBracketSizes();
        
        return new RoundRobinConfigDto.GroupAdvancementSettingsDto(advancementModels, eliminationBracketSizes);
    }
    
    /**
     * Get combined advancement settings.
     */
    @Transactional
    public RoundRobinConfigDto.CombinedAdvancementSettingsDto getCombinedAdvancementSettings() {
        List<TeamsToAdvanceDto> teamsToAdvance = getTeamsToAdvance();
        List<EliminationBracketSizeDto> eliminationBracketSizes = getEliminationBracketSizes();
        
        return new RoundRobinConfigDto.CombinedAdvancementSettingsDto(teamsToAdvance, eliminationBracketSizes);
    }
    
    /**
     * Get all advancement models.
     */
    @Transactional
    public List<AdvancementModelDto> getAdvancementModels() {
        List<AdvancementModel> advancementModels = AdvancementModel.listAll();
        return advancementModels.stream()
                .map(this::convertAdvancementModelToDto)
                .collect(Collectors.toList());
    }
    
    /**
     * Get all elimination bracket sizes.
     */
    @Transactional
    public List<EliminationBracketSizeDto> getEliminationBracketSizes() {
        List<EliminationBracketSize> bracketSizes = EliminationBracketSize.listAll();
        return bracketSizes.stream()
                .map(this::convertEliminationBracketSizeToDto)
                .collect(Collectors.toList());
    }
    
    /**
     * Get all teams to advance settings.
     */
    @Transactional
    public List<TeamsToAdvanceDto> getTeamsToAdvance() {
        List<TeamsToAdvance> teamsToAdvance = TeamsToAdvance.listAll();
        return teamsToAdvance.stream()
                .map(this::convertTeamsToAdvanceToDto)
                .collect(Collectors.toList());
    }
    
    // Conversion methods
    public TournamentFormatDto convertFormatToDto(Format format) {
        return new TournamentFormatDto(
                format.formatId.toString(),
                format.name,
                format.description,
                true, // All formats are active by default
                format.maxParticipants,
                format.minParticipants,
                format.rules,
                format.category
        );
    }
    
    public TournamentStatusDto convertStatusToDto(TournamentStatus status) {
        return new TournamentStatusDto(
                status.statusId.toString(),
                status.name,
                status.description,
                status.color,
                status.textColor,
                true, // All statuses are active by default
                1 // Default order
        );
    }
    
    public TournamentCategoryDto convertCategoryToDto(Category category) {
        return new TournamentCategoryDto(
                category.categoryId.toString(),
                category.name,
                category.description,
                true // All categories are active by default
        );
    }
    
    public TournamentRegistrationTypeDto convertRegistrationTypeToDto(RegistrationType registrationType) {
        return new TournamentRegistrationTypeDto(
                registrationType.registrationTypeId.toString(),
                registrationType.name,
                registrationType.description,
                true // All registration types are active by default
        );
    }
    
    public TournamentVenueTypeDto convertVenueTypeToDto(VenueType venueType) {
        return new TournamentVenueTypeDto(
                venueType.venueTypeId.toString(),
                venueType.name,
                venueType.description,
                true // All venue types are active by default
        );
    }
    
    public TournamentProgressionOptionDto convertProgressionTypeToDto(ProgressionType progressionType) {
        return new TournamentProgressionOptionDto(
                progressionType.progressionTypeId.toString(),
                progressionType.name,
                progressionType.description,
                true // All progression types are active by default
        );
    }
    
    public AdvancementModelDto convertAdvancementModelToDto(AdvancementModel advancementModel) {
        return new AdvancementModelDto(
                advancementModel.advancementModelId.toString(),
                advancementModel.name,
                advancementModel.description,
                true // All advancement models are active by default
        );
    }
    
    public EliminationBracketSizeDto convertEliminationBracketSizeToDto(EliminationBracketSize bracketSize) {
        return new EliminationBracketSizeDto(
                bracketSize.bracketSizeId.toString(),
                bracketSize.name,
                bracketSize.description,
                bracketSize.teams,
                true // All bracket sizes are active by default
        );
    }
    
    public TeamsToAdvanceDto convertTeamsToAdvanceToDto(TeamsToAdvance teamsToAdvance) {
        return new TeamsToAdvanceDto(
                teamsToAdvance.teamsAdvanceId.toString(),
                teamsToAdvance.name,
                teamsToAdvance.description,
                true // All teams to advance settings are active by default
        );
    }
} 