package thesistrack.ls1.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import thesistrack.ls1.entity.User;
import thesistrack.ls1.entity.UserGroup;

import java.io.Serializable;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Getter
@AllArgsConstructor
@NoArgsConstructor
public class LightUserDto implements Serializable {
    private UUID userId;
    private String universityId;
    private String matriculationNumber;
    private String firstName;
    private String lastName;
    private Instant joinedAt;
    private List<String> groups;

    static public LightUserDto fromUserEntity(User user) {
        return new LightUserDto(
                user.getId(), user.getUniversityId(), user.getMatriculationNumber(),
                user.getFirstName(), user.getLastName(), user.getJoinedAt(),
                user.getGroups().stream().map(x -> x.getId().getGroup()).toList()
        );
    }
}
