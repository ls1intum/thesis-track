package thesistrack.ls1.constants;

import lombok.AllArgsConstructor;
import lombok.Getter;

@AllArgsConstructor
@Getter
public enum ApplicationState {
    NOT_ASSESSED("Not assessed"),
    ACCEPTED("Accepted"),
    REJECTED("Rejected");

    private final String value;
}
