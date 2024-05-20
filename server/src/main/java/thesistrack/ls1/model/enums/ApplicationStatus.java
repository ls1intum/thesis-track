package thesistrack.ls1.model.enums;

import lombok.AllArgsConstructor;
import lombok.Getter;

@AllArgsConstructor
@Getter
public enum ApplicationStatus {
    NOT_ASSESSED("Not assessed"),
    ACCEPTED("Accepted"),
    REJECTED("Rejected");

    private final String value;
}
