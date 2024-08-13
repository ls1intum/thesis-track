package thesistrack.ls1.dto;

import java.time.Instant;

public record ErrorDto (
    Instant timestamp,
    String message,
    String exception
) {
    public static ErrorDto fromRuntimeException(RuntimeException error) {
        return new ErrorDto(
            Instant.now(),
            error.getMessage(),
            error.getClass().getName()
        );
    }
}
