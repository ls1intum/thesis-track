package thesistrack.ls1.constants;

import lombok.AllArgsConstructor;
import lombok.Getter;

@AllArgsConstructor
@Getter
public enum ApplicationReviewReason {
    INTERESTED("INTERESTED"),
    NOT_INTERESTED("NOT_INTERESTED");

    private final String value;
}
