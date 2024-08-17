package thesistrack.ls1.controller.payload;

import java.time.Instant;
import java.util.UUID;

public record CreateApplicationPayload (
        UUID topicId,
        String thesisTitle,
        Instant desiredStartDate,
        String motivation
) {
}
