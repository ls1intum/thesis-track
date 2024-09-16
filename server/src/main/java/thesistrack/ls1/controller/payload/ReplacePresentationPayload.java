package thesistrack.ls1.controller.payload;

import thesistrack.ls1.constants.ThesisPresentationType;
import thesistrack.ls1.constants.ThesisPresentationVisibility;

import java.time.Instant;

public record ReplacePresentationPayload(
        ThesisPresentationType type,
        ThesisPresentationVisibility visibility,
        String location,
        String streamUrl,
        String language,
        Instant date
) { }
