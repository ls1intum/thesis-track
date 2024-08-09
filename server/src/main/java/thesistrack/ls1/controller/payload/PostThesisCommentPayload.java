package thesistrack.ls1.controller.payload;

import thesistrack.ls1.constants.ThesisCommentType;

public record PostThesisCommentPayload(
        String message,
        ThesisCommentType commentType
) {
}
