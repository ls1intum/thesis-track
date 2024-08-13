package thesistrack.ls1.constants;

import lombok.AllArgsConstructor;
import lombok.Getter;

@AllArgsConstructor
@Getter
public enum ThesisPresentationVisibility {
    PUBLIC("PUBLIC"),
    PRIVATE("PRIVATE");

    private final String value;
}
