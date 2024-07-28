package thesistrack.ls1.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import thesistrack.ls1.entity.User;

import java.io.Serializable;
import java.time.Instant;
import java.util.*;

@Getter
@AllArgsConstructor
@NoArgsConstructor
public class UserDto implements Serializable {
    private UUID userId;
    private String universityId;
    private String matriculationNumber;
    private String email;
    private String firstName;
    private String lastName;
    private String gender;
    private String nationality;
    private Boolean isExchangeStudent;
    private List<String> focusTopics;
    private List<String> researchAreas;
    private String studyDegree;
    private String studyProgram;
    private String projects;
    private String interests;
    private String specialSkills;
    private Instant enrolledAt;
    private Instant updatedAt;
    private Instant joinedAt;
    private List<String> groups;

    static public UserDto fromUserEntity(User user) {
        if (user == null) {
            return null;
        }

        return new UserDto(
                user.getId(), user.getUniversityId(), user.getMatriculationNumber(), user.getEmail(),
                user.getFirstName(), user.getLastName(), user.getGender(), user.getNationality(), user.getIsExchangeStudent(),
                user.getFocusTopics(), user.getResearchAreas(),
                user.getStudyDegree(), user.getStudyProgram(), user.getProjects(), user.getInterests(),
                user.getSpecialSkills(), user.getEnrolledAt(), user.getUpdatedAt(), user.getJoinedAt(),
                user.getGroups().stream().map(x -> x.getId().getGroup()).toList()
        );
    }
}
