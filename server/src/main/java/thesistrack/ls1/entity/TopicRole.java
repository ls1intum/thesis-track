package thesistrack.ls1.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;
import thesistrack.ls1.constants.ThesisRoleName;
import thesistrack.ls1.entity.key.TopicReviewerId;

import java.time.Instant;

@Getter
@Setter
@Entity
@Table(name = "topic_roles")
public class TopicRole {
    @EmbeddedId
    private TopicReviewerId id;

    @MapsId("topicId")
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "topic_id", nullable = false)
    private Topic topic;

    @MapsId("userId")
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Enumerated(EnumType.STRING)
    @Column(name = "role", nullable = false)
    private ThesisRoleName role;

    @CreationTimestamp
    @NotNull
    @Column(name = "assigned_at", nullable = false)
    private Instant assignedAt;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "assigned_by", nullable = false)
    private User assignedBy;

}