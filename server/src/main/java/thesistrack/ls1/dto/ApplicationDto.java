package thesistrack.ls1.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import thesistrack.ls1.constants.ApplicationState;
import thesistrack.ls1.entity.Application;

import java.io.Serializable;
import java.time.Instant;
import java.util.UUID;

@Getter
@AllArgsConstructor
@NoArgsConstructor
public class ApplicationDto implements Serializable {
    private UUID applicationId;
    private UserDto user;
    private TopicDto topic;
    private String thesisTitle;
    private String motivation;
    private ApplicationState state;
    private Instant desiredStartDate;
    private String comment;
    private Instant createdAt;
    private LightUserDto reviewedBy;
    private Instant reviewedAt;

    static public ApplicationDto fromApplicationEntity(Application application) {
        if (application == null) {
            return null;
        }

        return new ApplicationDto(
                application.getId(), UserDto.fromUserEntity(application.getUser()),
                TopicDto.fromTopicEntity(application.getTopic()), application.getThesisTitle(),
                application.getMotivation(), application.getState(),
                application.getDesiredStartDate(), application.getComment(), application.getCreatedAt(),
                LightUserDto.fromUserEntity(application.getReviewedBy()), application.getReviewedAt()
        );
    }
}
