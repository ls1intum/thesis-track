package thesistrack.ls1.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;
import thesistrack.ls1.constants.ThesisRoleName;
import thesistrack.ls1.entity.key.ThesisRoleId;

import java.time.Instant;

@Getter
@Setter
@Entity
@Table(name = "thesis_roles")
public class ThesisRole {
    @EmbeddedId
    private ThesisRoleId id;

    @MapsId("thesisId")
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "thesis_id", nullable = false)
    private Thesis thesis;

    @MapsId("userId")
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @NotNull
    @Column(name = "position", nullable = false)
    private Integer position;

    @CreationTimestamp
    @NotNull
    @Column(name = "assigned_at", nullable = false)
    private Instant assignedAt;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "assigned_by", nullable = false)
    private User assignedBy;

}