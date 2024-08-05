package thesistrack.ls1.dto;

import thesistrack.ls1.constants.ThesisRoleName;
import thesistrack.ls1.constants.ThesisState;
import thesistrack.ls1.constants.ThesisVisibility;
import thesistrack.ls1.entity.Thesis;
import thesistrack.ls1.entity.ThesisRole;
import thesistrack.ls1.entity.ThesisStateChange;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;


public record ThesisDto (
        UUID thesisId,
        String title,
        ThesisVisibility visibility,
        String infoText,
        String abstractText,
        ThesisState state,
        UUID applicationId,
        boolean hasThesisFile,
        boolean hasPresentationFile,
        String finalGrade,
        Instant startDate,
        Instant endDate,
        Instant createdAt,

        ThesisAssessmentDto assessment,
        ThesisProposalDto proposal,

        List<LightUserDto> students,
        List<LightUserDto> advisors,
        List<LightUserDto> supervisors,

        List<ThesisStateChangeDto> states
) {
    public static ThesisDto fromThesisEntity(Thesis thesis, boolean protectedAccess) {
        if (thesis == null) {
            return null;
        }

        List<LightUserDto> students = new ArrayList<>();
        List<LightUserDto> advisors = new ArrayList<>();
        List<LightUserDto> supervisors = new ArrayList<>();

        List<ThesisRole> roles = thesis.getRoles();

        if (roles != null) {
            for (ThesisRole role : roles) {
                if (role.getId().getRole() == ThesisRoleName.STUDENT) {
                    students.add(LightUserDto.fromUserEntity(role.getUser()));
                }

                if (role.getId().getRole() == ThesisRoleName.ADVISOR) {
                    advisors.add(LightUserDto.fromUserEntity(role.getUser()));
                }

                if (role.getId().getRole() == ThesisRoleName.SUPERVISOR) {
                    supervisors.add(LightUserDto.fromUserEntity(role.getUser()));
                }
            }
        }

        List<ThesisStateChangeDto> states = new ArrayList<>();
        List<ThesisStateChange> stateChanges = thesis.getStates();

        if (stateChanges != null) {
            for (int i = 0; i < stateChanges.size(); i++) {
                ThesisStateChange stateChange = stateChanges.get(i);
                Instant endedAt = i + 1 < stateChanges.size() ? stateChanges.get(i + 1).getChangedAt() : Instant.now();

                if (stateChange.getId().getState() == ThesisState.FINISHED || stateChange.getId().getState() == ThesisState.DROPPED_OUT) {
                    endedAt = null;
                }

                states.add(ThesisStateChangeDto.fromStateChangeEntity(stateChange, endedAt));
            }
        }

        return new ThesisDto(
                thesis.getId(),
                thesis.getTitle(),
                thesis.getVisibility(),
                thesis.getInfo(),
                thesis.getAbstractField(),
                thesis.getState(),
                thesis.getApplication() == null ? null : thesis.getApplication().getId(),
                thesis.getFinalThesisFilename() != null,
                thesis.getFinalPresentationFilename() != null,
                thesis.getFinalGrade(),
                thesis.getStartDate(),
                thesis.getEndDate(),
                thesis.getCreatedAt(),
                protectedAccess ? ThesisAssessmentDto.fromAssessmentEntity(thesis.getAssessment()) : null,
                ThesisProposalDto.fromProposalEntity(thesis.getProposal()),
                students,
                advisors,
                supervisors,
                states
        );
    }
}
