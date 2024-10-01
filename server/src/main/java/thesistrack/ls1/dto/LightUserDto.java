package thesistrack.ls1.dto;

import thesistrack.ls1.entity.User;

import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.UUID;

public record LightUserDto (
    UUID userId,
    String avatar,
    String universityId,
    String matriculationNumber,
    String firstName,
    String lastName,
    String email,
    String studyDegree,
    String studyProgram,
    Map<String, String> customData,
    Instant joinedAt,
    List<String> groups
) {
    public static LightUserDto fromUserEntity(User user) {
        if (user == null) {
            return null;
        }

        return new LightUserDto(
                user.getId(), user.getAdjustedAvatar(), user.getUniversityId(), user.getMatriculationNumber(),
                user.getFirstName(), user.getLastName(), user.getEmail().toString(), user.getStudyDegree(), user.getStudyProgram(),
                user.getCustomData(),
                user.getJoinedAt(), user.getGroups().stream().map(x -> x.getId().getGroup()).toList()
        );
    }
}
