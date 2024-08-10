package thesistrack.ls1.controller.payload;

import thesistrack.ls1.constants.ThesisPresentationType;

import java.time.Instant;

public record CreatePresentationPayload(
        ThesisPresentationType type,
        String location,
        String streamUrl,
        Instant date
) { }
