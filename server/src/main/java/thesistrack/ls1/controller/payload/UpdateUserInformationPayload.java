package thesistrack.ls1.controller.payload;

import java.time.Instant;
import java.util.Map;

public record UpdateUserInformationPayload(
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
        String interests,
        String projects,
        Map<String, String> customData
) { }
