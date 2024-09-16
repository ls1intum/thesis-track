package thesistrack.ls1.controller.payload;

import thesistrack.ls1.constants.ApplicationReviewReason;

public record ReviewApplicationPayload(
        ApplicationReviewReason reason
) {
}
