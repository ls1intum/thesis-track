package thesistrack.ls1.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.UpdateTimestamp;
import thesistrack.ls1.entity.key.NotificationSettingId;

import java.time.Instant;

@Getter
@Setter
@Entity
@Table(name = "notification_settings")
public class NotificationSetting {
    @EmbeddedId
    private NotificationSettingId id;

    @MapsId("userId")
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @NotNull
    @Column(name = "email", nullable = false)
    private String email;

    @UpdateTimestamp
    @NotNull
    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;
}