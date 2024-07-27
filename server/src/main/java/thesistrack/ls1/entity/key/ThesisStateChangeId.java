package thesistrack.ls1.entity.key;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.Hibernate;

import java.io.Serial;
import java.io.Serializable;
import java.util.Objects;
import java.util.UUID;

@Getter
@Setter
@Embeddable
public class ThesisStateChangeId implements Serializable {
    @Serial
    private static final long serialVersionUID = 6850016269035279870L;

    @NotNull
    @Column(name = "thesis_id", nullable = false)
    private UUID thesisId;

    @NotNull
    @Column(name = "state", nullable = false, length = 100)
    private String state;

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
        return Objects.hash(thesisId, state);
    }

}