package thesistrack.ls1.controller.payload;

import java.time.Instant;

public record UpdateUserInformationPayload(
        String matriculationNumber,
        Boolean isExchangeStudent,
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
        String projects
) { }
