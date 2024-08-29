package thesistrack.ls1.dto;

import java.time.Instant;

public record TaskDto(
        String message,
        String link,
        Instant startDate,
        Instant endDate,
        Number priority
) { }
