package thesistrack.ls1.dto;

import thesistrack.ls1.constants.ThesisRoleName;
import thesistrack.ls1.entity.Topic;
import thesistrack.ls1.entity.TopicRole;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

public record TopicDto (
        UUID topicId,
        String title,
        String problemStatement,
        String goals,
        String references,
        String requiredDegree,
        Instant closedAt,
        Instant updatedAt,
        Instant createdAt,
        LightUserDto createdBy,

        List<LightUserDto> advisors,
        List<LightUserDto> supervisors
) {
    public static TopicDto fromTopicEntity(Topic topic) {
        if (topic == null) {
            return null;
        }

        List<LightUserDto> advisors = new ArrayList<>();
        List<LightUserDto> supervisors = new ArrayList<>();

        for (TopicRole role : topic.getRoles()) {
            if (role.getId().getRole() == ThesisRoleName.ADVISOR) {
                advisors.add(LightUserDto.fromUserEntity(role.getUser()));
            } else if (role.getId().getRole() == ThesisRoleName.SUPERVISOR) {
                supervisors.add(LightUserDto.fromUserEntity(role.getUser()));
            }
        }

        return new TopicDto(
                topic.getId(),
                topic.getTitle(),
                topic.getProblemStatement(),
                topic.getGoals(),
                topic.getReferences(),
                topic.getRequiredDegree(),
                topic.getClosedAt(),
                topic.getUpdatedAt(),
                topic.getCreatedAt(),
                LightUserDto.fromUserEntity(topic.getCreatedBy()),
                advisors,
                supervisors
        );
    }
}
