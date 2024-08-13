package thesistrack.ls1.dto;

import thesistrack.ls1.entity.Topic;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

public record TopicDto (
        UUID topicId,
        String title,
        String problemDescription,
        String goals,
        String references,
        Instant closedAt,
        Instant updatedAt,
        Instant createdAt,
        LightUserDto createdBy,

        List<LightUserDto> advisors,
        List<LightUserDto> supervisors
) {
    public static TopicDto fromTopicEntity(Topic topic) {
        return null;
    }
}
