package thesistrack.ls1.controller.payload;

import java.time.Instant;
import java.util.Set;

public record LegacyCreateApplicationPayload (
        String universityId,
        String matriculationNumber,
        String firstName,
        String lastName,
        String gender,
        String nationality,
        String email,
        String studyDegree,
        String studyProgram,
        Instant enrolledAt,
        String specialSkills,
        String motivation,
        String interests,
        String projects,
        String thesisTitle,
        String thesisType,
        Instant desiredStartDate
) {

}
