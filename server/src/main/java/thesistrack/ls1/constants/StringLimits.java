package thesistrack.ls1.constants;

import lombok.Getter;

@Getter
public enum StringLimits {
    THESIS_TITLE(500),
    THESIS_TYPE(100),
    THESIS_GRADE(10),
    LONGTEXT(2000);

    private final int limit;

    StringLimits(int limit) {
        this.limit = limit;
    }
}
