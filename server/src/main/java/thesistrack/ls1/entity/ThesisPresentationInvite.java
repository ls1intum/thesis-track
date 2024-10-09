package thesistrack.ls1.entity;

import jakarta.mail.internet.AddressException;
import jakarta.mail.internet.InternetAddress;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;
import thesistrack.ls1.entity.key.ThesisPresentationInviteId;

import java.time.Instant;

@Getter
@Setter
@Entity
@Table(name = "thesis_presentation_invites")
public class ThesisPresentationInvite {
    @EmbeddedId
    private ThesisPresentationInviteId id;

    @MapsId("presentationId")
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "presentation_id", nullable = false)
    private ThesisPresentation presentation;

    @NotNull
    @Column(name = "invited_at", nullable = false, length = Integer.MAX_VALUE)
    private Instant invitedAt;

    public InternetAddress getEmail() {
        try {
            return new InternetAddress(id.getEmail());
        } catch (AddressException e) {
            return null;
        }
    }
}