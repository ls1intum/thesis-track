package thesistrack.ls1.controller.payload;

import thesistrack.ls1.constants.ThesisVisibility;

public record AddThesisGradePayload(
        String finalGrade,
        String finalFeedback,
        ThesisVisibility visibility
) {
}
