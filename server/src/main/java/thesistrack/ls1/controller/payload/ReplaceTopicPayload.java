package thesistrack.ls1.controller.payload;

import java.util.Set;
import java.util.UUID;

public record ReplaceTopicPayload(
        String title,
        String problemStatement,
        String goals,
        String references,
        String requiredDegree,
        Set<UUID> supervisorIds,
        Set<UUID> advisorIds
) { }
