package thesistrack.ls1.constants;

import lombok.AllArgsConstructor;
import lombok.Getter;

@AllArgsConstructor
@Getter
public enum ThesisVisibility {
    PRIVATE("PRIVATE"),
    INTERNAL("INTERNAL"),
    PUBLIC("PUBLIC");

    private final String value;
}
