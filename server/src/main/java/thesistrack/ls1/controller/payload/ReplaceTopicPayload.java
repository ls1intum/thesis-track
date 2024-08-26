package thesistrack.ls1.controller.payload;

import java.util.Set;
import java.util.UUID;

public record ReplaceTopicPayload(
        String title,
        String type,
        String problemStatement,
        String goals,
        String references,
        Set<UUID> supervisorIds,
        Set<UUID> advisorIds
) { }
