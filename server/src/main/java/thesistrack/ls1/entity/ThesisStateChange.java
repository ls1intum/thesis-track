package thesistrack.ls1.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;
import thesistrack.ls1.entity.keys.ThesisStateChangeId;

import java.time.Instant;

@Getter
@Setter
@Entity
@Table(name = "thesis_state_changes")
public class ThesisStateChange {
    @EmbeddedId
    private ThesisStateChangeId id;

    @MapsId("thesisId")
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "thesis_id", nullable = false)
    private Thesis thesis;

    @NotNull
    @Column(name = "changed_at", nullable = false)
    private Instant changedAt;

}