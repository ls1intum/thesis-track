package thesistrack.ls1.dto;

import java.time.Instant;

public record TaskDto(
        String message,
        Instant startDate,
        Instant endDate,
        Number priority
) { }
