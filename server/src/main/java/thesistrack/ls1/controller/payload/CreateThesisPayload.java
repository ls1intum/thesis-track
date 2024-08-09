package thesistrack.ls1.controller.payload;

import java.util.Set;
import java.util.UUID;

public record CreateThesisPayload(
        String thesisTitle,
        Set<UUID> studentIds,
        Set<UUID> advisorIds,
        Set<UUID> supervisorIds
) {
}
