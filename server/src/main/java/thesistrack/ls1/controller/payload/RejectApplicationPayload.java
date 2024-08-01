package thesistrack.ls1.controller.payload;

public record RejectApplicationPayload (
        String comment,
        Boolean notifyUser
) { }
