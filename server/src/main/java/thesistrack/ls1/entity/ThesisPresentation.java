package thesistrack.ls1.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;

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
    @Column(name = "type", nullable = false, length = 100)
    private String type;

    @Column(name = "location", length = 200)
    private String location;

    @Column(name = "stream_url", length = 200)
    private String streamUrl;

    @NotNull
    @Column(name = "scheduledAt", nullable = false)
    private Instant scheduledAt;

    @CreationTimestamp
    @NotNull
    @Column(name = "created_at", nullable = false)
    private Instant createdAt;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "created_by", nullable = false)
    private User createdBy;

}