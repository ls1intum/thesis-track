package thesistrack.ls1.constants;

import lombok.AllArgsConstructor;
import lombok.Getter;

@AllArgsConstructor
@Getter
public enum ThesisState {
    PROPOSAL("Proposal"),
    ACCEPTED("Accepted"),
    REJECTED("Rejected");

    private final String value;
}
