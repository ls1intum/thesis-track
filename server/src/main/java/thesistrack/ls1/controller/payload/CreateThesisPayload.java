package thesistrack.ls1.controller.payload;

import java.util.Set;
import java.util.UUID;

public record CreateThesisPayload(
        String thesisTitle,
        String thesisType,
        Set<UUID> studentIds,
        Set<UUID> advisorIds,
        Set<UUID> supervisorIds
) {
}
