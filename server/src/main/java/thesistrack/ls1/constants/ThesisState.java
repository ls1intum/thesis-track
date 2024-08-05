package thesistrack.ls1.constants;

import lombok.AllArgsConstructor;
import lombok.Getter;

@AllArgsConstructor
@Getter
public enum ThesisState {
    PROPOSAL("PROPOSAL"),
    WRITING("WRITING"),
    SUBMITTED("SUBMITTED"),
    ASSESSED("ASSESSED"),
    GRADED("GRADED"),
    FINISHED("FINISHED"),
    DROPPED_OUT("DROPPED_OUT");

    private final String value;
}
