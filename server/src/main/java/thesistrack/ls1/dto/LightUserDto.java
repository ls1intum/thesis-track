package thesistrack.ls1.dto;

import thesistrack.ls1.entity.User;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

public record LightUserDto (
    UUID userId,
    String universityId,
    String matriculationNumber,
    String firstName,
    String lastName,
    String studyDegree,
    String studyProgram,
    Instant joinedAt,
    List<String> groups
) {
    static public LightUserDto fromUserEntity(User user) {
        if (user == null) {
            return null;
        }

        return new LightUserDto(
                user.getId(), user.getUniversityId(), user.getMatriculationNumber(),
                user.getFirstName(), user.getLastName(), user.getStudyDegree(), user.getStudyProgram(),
                user.getJoinedAt(), user.getGroups().stream().map(x -> x.getId().getGroup()).toList()
        );
    }
}
