package thesistrack.ls1.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import thesistrack.ls1.entity.key.UserGroupId;

@Getter
@Setter
@Entity
@Table(name = "user_groups")
public class UserGroup {
    @EmbeddedId
    private UserGroupId id;

    @MapsId("userId")
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;
}