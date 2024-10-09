package thesistrack.ls1.entity.key;

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
public class ThesisPresentationInviteId implements java.io.Serializable {
    @NotNull
    @Column(name = "presentation_id", nullable = false)
    private UUID presentationId;

    @NotNull
    @Column(name = "email", nullable = false, length = Integer.MAX_VALUE)
    private String email;

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || Hibernate.getClass(this) != Hibernate.getClass(o)) return false;
        ThesisPresentationInviteId entity = (ThesisPresentationInviteId) o;
        return Objects.equals(this.presentationId, entity.presentationId) &&
                Objects.equals(this.email, entity.email);
    }

    @Override
    public int hashCode() {
        return Objects.hash(presentationId, email);
    }

}