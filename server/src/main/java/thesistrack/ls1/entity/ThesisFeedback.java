package thesistrack.ls1.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;
import thesistrack.ls1.constants.ThesisFeedbackType;

import java.time.Instant;
import java.util.UUID;

@Getter
@Setter
@Entity
@Table(name = "thesis_feedback")
public class ThesisFeedback {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "feedback_id", nullable = false)
    private UUID id;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "thesis_id", nullable = false)
    private Thesis thesis;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(name = "type", nullable = false)
    private ThesisFeedbackType type;

    @NotNull
    @Column(name = "feedback", nullable = false)
    private String feedback;

    @Column(name = "completed_at")
    private Instant completedAt;

    @NotNull
    @Column(name = "requested_at", nullable = false)
    private Instant requestedAt;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "requested_by", nullable = false)
    private User requestedBy;
}