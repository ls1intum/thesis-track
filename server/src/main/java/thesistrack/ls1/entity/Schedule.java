package thesistrack.ls1.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

import java.time.Instant;

@Getter
@Setter
@Entity
@Table(name = "schedules")
public class Schedule {
    @Id
    @Column(name = "schedule_name", nullable = false, length = 100)
    private String scheduleName;

    @NotNull
    @Column(name = "last_received", nullable = false)
    private Instant lastReceived;

}