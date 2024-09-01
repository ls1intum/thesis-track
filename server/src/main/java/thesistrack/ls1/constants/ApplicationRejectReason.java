package thesistrack.ls1.constants;

import lombok.AllArgsConstructor;
import lombok.Getter;

@AllArgsConstructor
@Getter
public enum ApplicationRejectReason {
    TOPIC_FILLED("TOPIC_FILLED"),
    TOPIC_OUTDATED("TOPIC_OUTDATED"),
    REJECTED("REJECTED");

    private final String value;

    public String getMailTemplate() {
        if (value.equals(TOPIC_FILLED.getValue())) {
            return "application-rejected-topic-filled";
        }

        if (value.equals(TOPIC_OUTDATED.getValue())) {
            return "application-rejected-topic-outdated";
        }

        return "application-rejected";
    }
}
