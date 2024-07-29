package thesistrack.ls1.constants;

import lombok.AllArgsConstructor;
import lombok.Getter;

@AllArgsConstructor
@Getter
public enum ThesisRoleName {
    STUDENT("student"),
    ADVISOR("advisor"),
    SUPERVISOR("supervisor");

    private final String value;
}
