package thesistrack.ls1.constants;

import lombok.AllArgsConstructor;
import lombok.Getter;

@AllArgsConstructor
@Getter
public enum ThesisState {
    PROPOSAL("Proposal"),
    WRITING("Writing"),
    SUBMITTED("Submitted"),
    ASSESSED("Assessed"),
    GRADED("Graded"),
    FINISHED("Finished"),
    DROPPED_OUT("Dropped out");

    private final String value;
}
