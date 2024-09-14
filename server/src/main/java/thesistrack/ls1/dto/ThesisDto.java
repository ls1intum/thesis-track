package thesistrack.ls1.dto;

import thesistrack.ls1.constants.*;
import thesistrack.ls1.entity.*;

import java.time.Instant;
import java.util.*;

public record ThesisDto (
        UUID thesisId,
        String title,
        String type,
        ThesisVisibility visibility,
        Set<String> keywords,
        String infoText,
        String abstractText,
        ThesisState state,
        UUID applicationId,
        Instant startDate,
        Instant endDate,
        Instant createdAt,

        ThesisAssessmentDto assessment,
        ThesisProposalDto proposal,
        ThesisFilesDto files,
        ThesisGradeDto grade,

        List<ThesisPresentationDto> presentations,

        List<LightUserDto> students,
        List<LightUserDto> advisors,
        List<LightUserDto> supervisors,

        List<ThesisStateChangeDto> states
) {
    public record ThesisAssessmentDto(
            String summary,
            String positives,
            String negatives,
            String gradeSuggestion,
            String createdAt,
            LightUserDto createdBy
    ) {
        public static ThesisAssessmentDto fromAssessmentEntity(ThesisAssessment assessment) {
            if (assessment == null) {
                return null;
            }

            return new ThesisAssessmentDto(
                    assessment.getSummary(),
                    assessment.getPositives(),
                    assessment.getNegatives(),
                    assessment.getGradeSuggestion(),
                    assessment.getCreatedAt().toString(),
                    LightUserDto.fromUserEntity(assessment.getCreatedBy())
            );
        }
    }

    public record ThesisProposalDto(
            Instant createdAt,
            LightUserDto createdBy,
            Instant approvedAt,
            LightUserDto approvedBy
    ) {
        public static ThesisProposalDto fromProposalEntity(ThesisProposal proposal) {
            if (proposal == null) {
                return null;
            }

            return new ThesisProposalDto(
                    proposal.getCreatedAt(),
                    LightUserDto.fromUserEntity(proposal.getCreatedBy()),
                    proposal.getApprovedAt(),
                    LightUserDto.fromUserEntity(proposal.getApprovedBy())
            );
        }
    }

    public record ThesisPresentationDto(
            UUID presentationId,
            ThesisPresentationState state,
            ThesisPresentationType type,
            ThesisPresentationVisibility visibility,
            String location,
            String streamUrl,
            String language,
            Instant scheduledAt,
            Instant createdAt,
            LightUserDto createdBy
    ) {
        public static ThesisPresentationDto fromPresentationEntity(ThesisPresentation presentation) {
            if (presentation == null) {
                return null;
            }

            return new ThesisPresentationDto(
                    presentation.getId(),
                    presentation.getState(),
                    presentation.getType(),
                    presentation.getVisibility(),
                    presentation.getLocation(),
                    presentation.getStreamUrl(),
                    presentation.getLanguage(),
                    presentation.getScheduledAt(),
                    presentation.getCreatedAt(),
                    LightUserDto.fromUserEntity(presentation.getCreatedBy())
            );
        }
    }

    public record ThesisFilesDto(
            String thesis,
            String presentation,
            String proposal
    ) { }

    public record ThesisGradeDto(
            String finalGrade,
            String feedback
    ) { }

    public record ThesisStateChangeDto(
            ThesisState state,
            Instant startedAt,
            Instant endedAt
    ) {
        public static ThesisStateChangeDto fromStateChangeEntity(ThesisStateChange stateChange, Instant endedAt) {
            if (stateChange == null) {
                return null;
            }

            return new ThesisStateChangeDto(
                    stateChange.getId().getState(),
                    stateChange.getChangedAt(),
                    endedAt
            );
        }
    }

    public static ThesisDto fromThesisEntity(Thesis thesis, boolean protectedAccess) {
        if (thesis == null) {
            return null;
        }

        List<LightUserDto> students = thesis.getStudents().stream().map(LightUserDto::fromUserEntity).toList();
        List<LightUserDto> advisors = thesis.getAdvisors().stream().map(LightUserDto::fromUserEntity).toList();
        List<LightUserDto> supervisors = thesis.getSupervisors().stream().map(LightUserDto::fromUserEntity).toList();

        List<ThesisStateChangeDto> states = new ArrayList<>();
        List<ThesisStateChange> stateChanges = thesis.getStates().stream().sorted(Comparator.comparing(ThesisStateChange::getChangedAt)).toList();

        for (int i = 0; i < stateChanges.size(); i++) {
            ThesisStateChange stateChange = stateChanges.get(i);
            Instant endedAt = i + 1 < stateChanges.size() ? stateChanges.get(i + 1).getChangedAt() : Instant.now();

            if (stateChange.getId().getState() == ThesisState.FINISHED || stateChange.getId().getState() == ThesisState.DROPPED_OUT) {
                endedAt = stateChange.getChangedAt();
            }

            states.add(ThesisStateChangeDto.fromStateChangeEntity(stateChange, endedAt));
        }

        List<ThesisProposal> proposals = thesis.getProposals();
        List<ThesisAssessment> assessments = thesis.getAssessments();
        List<ThesisPresentation> presentations = thesis.getPresentations();

        return new ThesisDto(
                thesis.getId(),
                thesis.getTitle(),
                thesis.getType(),
                thesis.getVisibility(),
                thesis.getKeywords(),
                thesis.getInfo(),
                thesis.getAbstractField(),
                thesis.getState(),
                thesis.getApplication() == null ? null : thesis.getApplication().getId(),
                thesis.getStartDate(),
                thesis.getEndDate(),
                thesis.getCreatedAt(),
                protectedAccess && !assessments.isEmpty() ? ThesisAssessmentDto.fromAssessmentEntity(assessments.getFirst()) : null,
                ThesisProposalDto.fromProposalEntity(!proposals.isEmpty() ? proposals.getFirst() : null),
                new ThesisFilesDto(
                        thesis.getFinalThesisFilename(),
                        thesis.getFinalPresentationFilename(),
                        !proposals.isEmpty() ? proposals.getFirst().getProposalFilename() : null
                ),
                thesis.getFinalGrade() != null ? new ThesisGradeDto(
                        thesis.getFinalGrade(),
                        thesis.getFinalFeedback()
                ) : null,
                presentations.stream().map(ThesisPresentationDto::fromPresentationEntity).toList(),
                students,
                advisors,
                supervisors,
                states
        );
    }
}
