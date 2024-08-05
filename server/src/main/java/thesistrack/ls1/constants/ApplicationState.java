package thesistrack.ls1.constants;

import lombok.AllArgsConstructor;
import lombok.Getter;

@AllArgsConstructor
@Getter
public enum ApplicationState {
    NOT_ASSESSED("NOT_ASSESSED"),
    ACCEPTED("ACCEPTED"),
    REJECTED("REJECTED");

    private final String value;
}
