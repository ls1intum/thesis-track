package thesistrack.ls1.controller.payload;

import java.util.Map;
import java.util.UUID;

public record UpdateThesisCreditsPayload(
        Map<UUID, Number> credits
) { }
