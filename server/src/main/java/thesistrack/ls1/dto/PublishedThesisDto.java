package thesistrack.ls1.dto;

import thesistrack.ls1.constants.ThesisState;
import thesistrack.ls1.entity.Thesis;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

public record PublishedThesisDto(
        UUID thesisId,
        ThesisState state,
        String title,
        String type,
        Instant startDate,
        Instant endDate,
        String abstractText,
        List<LightUserDto> students,
        List<LightUserDto> advisors,
        List<LightUserDto> supervisors
) {
    public static PublishedThesisDto fromThesisEntity(Thesis thesis) {
        if (thesis == null) {
            return null;
        }

        return new PublishedThesisDto(
                thesis.getId(),
                thesis.getState(),
                thesis.getTitle(),
                thesis.getType(),
                thesis.getStartDate(),
                thesis.getEndDate(),
                thesis.getAbstractField(),
                thesis.getStudents().stream().map(LightUserDto::fromUserEntity).toList(),
                thesis.getAdvisors().stream().map(LightUserDto::fromUserEntity).toList(),
                thesis.getSupervisors().stream().map(LightUserDto::fromUserEntity).toList()
        );
    }
}
