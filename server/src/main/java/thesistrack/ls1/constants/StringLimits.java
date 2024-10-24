package thesistrack.ls1.constants;

import lombok.Getter;

@Getter
public enum StringLimits {
    THESIS_TITLE(500),
    THESIS_GRADE(10),
    SHORTTEXT(100),
    LONGTEXT(3000);

    private final int limit;

    StringLimits(int limit) {
        this.limit = limit;
    }
}
