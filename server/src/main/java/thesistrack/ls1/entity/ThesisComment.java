package thesistrack.ls1.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;
import thesistrack.ls1.constants.ThesisCommentType;

import java.time.Instant;
import java.util.UUID;

@Getter
@Setter
@Entity
@Table(name = "thesis_comments")
public class ThesisComment {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "comment_id", nullable = false)
    private UUID id;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "thesis_id", nullable = false)
    private Thesis thesis;

    @NotNull
    @Enumerated(EnumType.STRING)
    @JoinColumn(name = "type", nullable = false)
    private ThesisCommentType type;

    @NotNull
    @Column(name = "message", nullable = false)
    private String message;

    @Column(name = "filename")
    private String filename;

    @Column(name = "upload_name")
    private String uploadName;

    @CreationTimestamp
    @NotNull
    @Column(name = "created_at", nullable = false)
    private Instant createdAt;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "created_by", nullable = false)
    private User createdBy;

    public boolean hasManagementAccess(User user) {
        return user.hasAnyGroup("admin") || createdBy.getId().equals(user.getId());
    }
}