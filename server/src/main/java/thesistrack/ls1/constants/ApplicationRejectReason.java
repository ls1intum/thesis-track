package thesistrack.ls1.constants;

import lombok.AllArgsConstructor;
import lombok.Getter;

@AllArgsConstructor
@Getter
public enum ApplicationRejectReason {
    TOPIC_FILLED("TOPIC_FILLED"),
    TOPIC_OUTDATED("TOPIC_OUTDATED"),
    BAD_GRADES("BAD_GRADES"),
    FAILED_REQUIREMENTS("FAILED_REQUIREMENTS"),
    TITLE_NOT_INTERESTING("TITLE_NOT_INTERESTING");
    NO_CAPACITY("NO_CAPACITY");

    private final String value;

    public String getMailTemplate() {
        if (value.equals(TOPIC_FILLED.getValue())) {
            return "application-rejected-topic-filled";
        }

        if (value.equals(TOPIC_OUTDATED.getValue())) {
            return "application-rejected-topic-outdated";
        }

        if (value.equals(BAD_GRADES.getValue())) {
            return "application-rejected-bad-grades";
        }

        if (value.equals(FAILED_REQUIREMENTS.getValue())) {
            return "application-rejected-failed-requirements";
        }

        if (value.equals(TITLE_NOT_INTERESTING.getValue())) {
            return "application-rejected-title-not-interesting";
        }

        return "application-rejected";
    }
}
