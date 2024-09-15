package thesistrack.ls1.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;
import thesistrack.ls1.constants.ApplicationRejectReason;
import thesistrack.ls1.constants.ApplicationState;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Getter
@Setter
@Entity
@Table(name = "applications")
public class Application {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "application_id", nullable = false)
    private UUID id;

    @NotNull
    @ManyToOne(fetch = FetchType.EAGER, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "topic_id")
    private Topic topic;

    @Column(name = "thesis_title")
    private String thesisTitle;

    @Column(name = "thesis_type")
    private String thesisType;

    @NotNull
    @Column(name = "motivation", nullable = false)
    private String motivation;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(name = "state", nullable = false)
    private ApplicationState state;

    @NotNull
    @Column(name = "desired_start_date", nullable = false)
    private Instant desiredStartDate;

    @NotNull
    @Column(name = "comment")
    private String comment;

    @Enumerated(EnumType.STRING)
    @Column(name = "reject_reason")
    private ApplicationRejectReason rejectReason;

    @CreationTimestamp
    @NotNull
    @Column(name = "created_at", nullable = false)
    private Instant createdAt;

    @Column(name = "reviewed_at")
    private Instant reviewedAt;

    @OneToMany(mappedBy = "application", fetch = FetchType.EAGER)
    @OrderBy("reviewedAt ASC")
    private List<ApplicationReviewer> reviewers = new ArrayList<>();

    public boolean hasReadAccess(User user) {
        if (user.hasAnyGroup("admin", "advisor", "supervisor")) {
            return true;
        }

        return this.user.getId().equals(user.getId());
    }

    public boolean hasEditAccess(User user) {
        if (user.hasAnyGroup("admin")) {
            return true;
        }

        return this.user.getId().equals(user.getId());
    }

    public boolean hasManagementAccess(User user) {
        return user.hasAnyGroup("admin", "advisor", "supervisor");
    }

    public Optional<ApplicationReviewer> getReviewer(User user) {
        for (ApplicationReviewer reviewer : getReviewers()) {
            if (reviewer.getUser().getId().equals(user.getId())) {
                return Optional.of(reviewer);
            }
        }

        return Optional.empty();
    }
}