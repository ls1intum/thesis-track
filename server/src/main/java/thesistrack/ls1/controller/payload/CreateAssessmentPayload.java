package thesistrack.ls1.controller.payload;

public record CreateAssessmentPayload(
        String summary,
        String positives,
        String negatives,
        String gradeSuggestion
) {
}
