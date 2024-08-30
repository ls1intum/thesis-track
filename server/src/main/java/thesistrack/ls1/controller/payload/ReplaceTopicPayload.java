package thesistrack.ls1.controller.payload;

import java.util.List;
import java.util.Set;
import java.util.UUID;

public record ReplaceTopicPayload(
        String title,
        Set<String> thesisTypes,
        String problemStatement,
        String goals,
        String references,
        List<UUID> supervisorIds,
        List<UUID> advisorIds
) { }
