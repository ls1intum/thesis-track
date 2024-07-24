package thesistrack.ls1.entity.keys;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.Hibernate;

import java.util.Objects;
import java.util.UUID;

@Getter
@Setter
@Embeddable
public class ThesisRoleId implements java.io.Serializable {
    private static final long serialVersionUID = 5049781780615072922L;
    @NotNull
    @Column(name = "thesis_id", nullable = false)
    private UUID thesisId;

    @NotNull
    @Column(name = "user_id", nullable = false)
    private UUID userId;

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || Hibernate.getClass(this) != Hibernate.getClass(o)) return false;
        ThesisRoleId entity = (ThesisRoleId) o;
        return Objects.equals(this.thesisId, entity.thesisId) &&
                Objects.equals(this.userId, entity.userId);
    }

    @Override
    public int hashCode() {
        return Objects.hash(thesisId, userId);
    }

}