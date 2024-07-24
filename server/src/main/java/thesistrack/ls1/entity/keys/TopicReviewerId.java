package thesistrack.ls1.entity.keys;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.Hibernate;

import java.util.Objects;
import java.util.UUID;

@Getter
@Setter
@Embeddable
public class TopicReviewerId implements java.io.Serializable {
    private static final long serialVersionUID = 2792466625447855280L;
    @NotNull
    @Column(name = "topic_id", nullable = false)
    private UUID topicId;

    @NotNull
    @Column(name = "user_id", nullable = false)
    private UUID userId;

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || Hibernate.getClass(this) != Hibernate.getClass(o)) return false;
        TopicReviewerId entity = (TopicReviewerId) o;
        return Objects.equals(this.topicId, entity.topicId) &&
                Objects.equals(this.userId, entity.userId);
    }

    @Override
    public int hashCode() {
        return Objects.hash(topicId, userId);
    }

}