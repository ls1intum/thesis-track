package thesistrack.ls1.dto;

import jakarta.mail.internet.InternetAddress;
import thesistrack.ls1.entity.User;

import java.time.Instant;
import java.util.*;

public record UserDto (
        UUID userId,
        String universityId,
        String matriculationNumber,
        String email,
        String firstName,
        String lastName,
        String gender,
        String nationality,
        Boolean isExchangeStudent,
        Set<String> focusTopics,
        Set<String> researchAreas,
        String studyDegree,
        String studyProgram,
        String projects,
        String interests,
        String specialSkills,
        Instant enrolledAt,
        Instant updatedAt,
        Instant joinedAt,
        Set<String> groups,
        boolean hasCv,
        boolean hasExaminationReport,
        boolean hasDegreeReport
) {
    public static UserDto fromUserEntity(User user) {
        if (user == null) {
            return null;
        }

        return new UserDto(
                user.getId(), user.getUniversityId(), user.getMatriculationNumber(), user.getEmail() != null ? user.getEmail().toString() : null,
                user.getFirstName(), user.getLastName(), user.getGender(), user.getNationality(), user.getIsExchangeStudent(),
                user.getFocusTopics(), user.getResearchAreas(),
                user.getStudyDegree(), user.getStudyProgram(), user.getProjects(), user.getInterests(),
                user.getSpecialSkills(), user.getEnrolledAt(), user.getUpdatedAt(), user.getJoinedAt(),
                user.getGroups() == null ? Collections.emptySet() : new HashSet<>(user.getGroups().stream().map(x -> x.getId().getGroup()).toList()),
                user.getCvFilename() != null, user.getExaminationFilename() != null, user.getDegreeFilename() != null
        );
    }
}
