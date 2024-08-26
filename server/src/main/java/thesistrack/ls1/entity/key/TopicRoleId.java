package thesistrack.ls1.entity.key;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.Hibernate;
import thesistrack.ls1.constants.ThesisRoleName;

import java.util.Objects;
import java.util.UUID;

@Getter
@Setter
@Embeddable
public class TopicRoleId implements java.io.Serializable {
    @NotNull
    @Column(name = "topic_id", nullable = false)
    private UUID topicId;

    @NotNull
    @Column(name = "user_id", nullable = false)
    private UUID userId;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(name = "role", nullable = false)
    private ThesisRoleName role;

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || Hibernate.getClass(this) != Hibernate.getClass(o)) return false;
        TopicRoleId entity = (TopicRoleId) o;
        return Objects.equals(this.topicId, entity.topicId) &&
                Objects.equals(this.role, entity.role) &&
                Objects.equals(this.userId, entity.userId);
    }

    @Override
    public int hashCode() {
        return Objects.hash(topicId, role, userId);
    }

}