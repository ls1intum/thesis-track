package thesistrack.ls1.dto;

import thesistrack.ls1.entity.ThesisAssessment;

public record ThesisAssessmentDto(
        String summary,
        String positives,
        String negatives,
        String gradeSuggestion,
        String createdAt,
        LightUserDto createdBy
) {
    public static ThesisAssessmentDto fromAssessmentEntity(ThesisAssessment assessment) {
        if (assessment == null) {
            return null;
        }

        return new ThesisAssessmentDto(
                assessment.getSummary(),
                assessment.getPositives(),
                assessment.getNegatives(),
                assessment.getGradeSuggestion(),
                assessment.getCreatedAt().toString(),
                LightUserDto.fromUserEntity(assessment.getCreatedBy())
        );
    }
}
