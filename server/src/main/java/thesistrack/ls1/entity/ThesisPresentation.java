package thesistrack.ls1.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;
import thesistrack.ls1.constants.ThesisPresentationType;
import thesistrack.ls1.constants.ThesisPresentationVisibility;

import java.time.Instant;
import java.util.UUID;

@Getter
@Setter
@Entity
@Table(name = "thesis_presentations")
public class ThesisPresentation {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "presentation_id", nullable = false)
    private UUID id;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "thesis_id", nullable = false)
    private Thesis thesis;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(name = "type", nullable = false)
    private ThesisPresentationType type;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(name = "visibility", nullable = false)
    private ThesisPresentationVisibility visibility;

    @Column(name = "location")
    private String location;

    @Column(name = "stream_url")
    private String streamUrl;

    @Column(name = "calendar_event")
    private String calendarEvent;

    @NotNull
    @Column(name = "scheduled_at", nullable = false)
    private Instant scheduledAt;

    @CreationTimestamp
    @NotNull
    @Column(name = "created_at", nullable = false)
    private Instant createdAt;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "created_by", nullable = false)
    private User createdBy;

    public boolean hasManagementAccess(User user) {
        return thesis.hasAdvisorAccess(user) || createdBy.getId().equals(user.getId());
    }
}