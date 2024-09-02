package thesistrack.ls1.controller.payload;

import thesistrack.ls1.constants.ApplicationRejectReason;

public record RejectApplicationPayload (
        ApplicationRejectReason reason,
        Boolean notifyUser
) { }
