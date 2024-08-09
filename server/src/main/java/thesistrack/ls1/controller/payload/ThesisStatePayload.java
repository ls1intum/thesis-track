package thesistrack.ls1.controller.payload;

import thesistrack.ls1.constants.ThesisState;

import java.time.Instant;

public record ThesisStatePayload(
        ThesisState state,
        Instant changedAt
) { }
