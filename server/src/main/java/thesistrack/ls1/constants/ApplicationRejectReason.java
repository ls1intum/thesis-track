package thesistrack.ls1.constants;

import lombok.AllArgsConstructor;
import lombok.Getter;

@AllArgsConstructor
@Getter
public enum ApplicationRejectReason {
    TOPIC_FILLED("TOPIC_FILLED"),
    TOPIC_OUTDATED("TOPIC_OUTDATED"),
    FAILED_STUDENT_REQUIREMENTS("FAILED_STUDENT_REQUIREMENTS"),
    FAILED_TOPIC_REQUIREMENTS("FAILED_TOPIC_REQUIREMENTS"),
    TITLE_NOT_INTERESTING("TITLE_NOT_INTERESTING"),
    NO_CAPACITY("NO_CAPACITY");

    private final String value;

    public String getMailTemplate() {
        if (value.equals(TOPIC_FILLED.getValue())) {
            return "application-rejected-topic-filled";
        }

        if (value.equals(TOPIC_OUTDATED.getValue())) {
            return "application-rejected-topic-outdated";
        }

        if (value.equals(FAILED_STUDENT_REQUIREMENTS.getValue())) {
            return "application-rejected-student-requirements";
        }

        if (value.equals(FAILED_TOPIC_REQUIREMENTS.getValue())) {
            return "application-rejected-topic-requirements";
        }

        if (value.equals(TITLE_NOT_INTERESTING.getValue())) {
            return "application-rejected-title-not-interesting";
        }

        return "application-rejected";
    }
}
