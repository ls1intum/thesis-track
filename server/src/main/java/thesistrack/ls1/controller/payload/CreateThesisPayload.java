package thesistrack.ls1.controller.payload;

import java.util.List;
import java.util.UUID;

public record CreateThesisPayload(
        String thesisTitle,
        String thesisType,
        List<UUID> studentIds,
        List<UUID> advisorIds,
        List<UUID> supervisorIds
) {
}
