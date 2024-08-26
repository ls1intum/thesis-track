package thesistrack.ls1.entity.key;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.Hibernate;
import thesistrack.ls1.constants.ThesisState;

import java.io.Serial;
import java.io.Serializable;
import java.util.Objects;
import java.util.UUID;

@Getter
@Setter
@Embeddable
public class ThesisStateChangeId implements Serializable {
    @NotNull
    @Column(name = "thesis_id", nullable = false)
    private UUID thesisId;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(name = "state", nullable = false)
    private ThesisState state;

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || Hibernate.getClass(this) != Hibernate.getClass(o)) return false;
        ThesisStateChangeId entity = (ThesisStateChangeId) o;
        return Objects.equals(this.thesisId, entity.thesisId) &&
                Objects.equals(this.state, entity.state);
    }

    @Override
    public int hashCode() {
        return Objects.hash("thesis-state-changes", thesisId, state);
    }

}