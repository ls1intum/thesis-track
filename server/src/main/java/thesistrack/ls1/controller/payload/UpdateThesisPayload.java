package thesistrack.ls1.controller.payload;

import thesistrack.ls1.constants.ThesisVisibility;

import java.time.Instant;
import java.util.List;
import java.util.Set;
import java.util.UUID;

public record UpdateThesisPayload(
        String thesisTitle,
        String thesisType,
        ThesisVisibility visibility,
        Set<String> keywords,
        Instant startDate,
        Instant endDate,
        Set<UUID> studentIds,
        Set<UUID> advisorIds,
        Set<UUID> supervisorIds,
        List<ThesisStatePayload> states
) {

}
