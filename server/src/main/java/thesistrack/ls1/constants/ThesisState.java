package thesistrack.ls1.constants;

import lombok.AllArgsConstructor;
import lombok.Getter;

@AllArgsConstructor
@Getter
public enum ThesisState {
    PROPOSAL("proposal"),
    WRITING("writing"),
    SUBMITTED("submitted"),
    ASSESSED("assessed"),
    GRADED("graded"),
    FINISHED("finished"),
    DROPPED_OUT("dropped_out");

    private final String value;
}
