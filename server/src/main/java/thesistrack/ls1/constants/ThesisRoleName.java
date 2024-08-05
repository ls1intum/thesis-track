package thesistrack.ls1.constants;

import lombok.AllArgsConstructor;
import lombok.Getter;

@AllArgsConstructor
@Getter
public enum ThesisRoleName {
    STUDENT("STUDENT"),
    ADVISOR("ADVISOR"),
    SUPERVISOR("SUPERVISOR");

    private final String value;
}
