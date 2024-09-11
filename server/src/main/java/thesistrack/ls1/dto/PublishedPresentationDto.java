package thesistrack.ls1.dto;

import thesistrack.ls1.constants.ThesisPresentationType;
import thesistrack.ls1.entity.ThesisPresentation;

import java.time.Instant;
import java.util.UUID;

public record PublishedPresentationDto (
        UUID presentationId,
        ThesisPresentationType type,
        String location,
        String streamUrl,
        String language,
        Instant scheduledAt,
        PublishedThesisDto thesis
) {
    public static PublishedPresentationDto fromPresentationEntity(ThesisPresentation presentation) {
        if (presentation == null) {
            return null;
        }

        return new PublishedPresentationDto(
                presentation.getId(),
                presentation.getType(),
                presentation.getLocation(),
                presentation.getStreamUrl(),
                presentation.getLanguage(),
                presentation.getScheduledAt(),
                PublishedThesisDto.fromThesisEntity(presentation.getThesis())
        );
    }
}
