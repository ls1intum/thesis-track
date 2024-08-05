package thesistrack.ls1.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.Instant;
import java.util.UUID;

@Getter
@Setter
@Entity
@Table(name = "thesis_proposal_feedback")
public class ThesisProposalFeedback {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "proposal_feedback_id", nullable = false)
    private UUID id;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "proposal_id", nullable = false)
    private ThesisProposal proposal;

    @NotNull
    @Column(name = "feedback", nullable = false, length = 200)
    private String feedback;

    @UpdateTimestamp
    @Column(name = "completed_at")
    private Instant completedAt;

    @CreationTimestamp
    @NotNull
    @Column(name = "requested_at", nullable = false)
    private Instant requestedAt;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "requested_by", nullable = false)
    private User requestedBy;

}