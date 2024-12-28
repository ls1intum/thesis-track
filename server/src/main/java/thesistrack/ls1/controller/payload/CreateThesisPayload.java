package thesistrack.ls1.controller.payload;

import java.util.List;
import java.util.UUID;

public record CreateThesisPayload(
        String thesisTitle,
        String thesisType,
        String language,
        List<UUID> studentIds,
        List<UUID> advisorIds,
        List<UUID> supervisorIds
) {
}
