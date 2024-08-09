package thesistrack.ls1.controller.payload;

import java.util.Set;
import java.util.UUID;

public record AcceptApplicationPayload (
        String thesisTitle,
        String thesisType,
        Set<UUID> advisorIds,
        Set<UUID> supervisorIds,
        String comment,
        Boolean notifyUser,
        Boolean closeTopic
) { }
