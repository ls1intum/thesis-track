package thesistrack.ls1.controller.payload;

import thesistrack.ls1.constants.ApplicationRejectReason;

public record CloseTopicPayload(
        ApplicationRejectReason reason,
        Boolean notifyUser
) {
}
