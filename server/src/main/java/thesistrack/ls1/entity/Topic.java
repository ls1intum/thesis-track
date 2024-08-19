package thesistrack.ls1.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.Instant;
import java.util.HashSet;
import java.util.Set;
import java.util.UUID;

@Getter
@Setter
@Entity
@Table(name = "topics")
public class Topic {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "topic_id", nullable = false)
    private UUID id;

    @NotNull
    @Column(name = "title", nullable = false, length = 500)
    private String title;

    @Column(name = "type", length = 100)
    private String type;

    @NotNull
    @Column(name = "problem_statement", nullable = false, length = 2000)
    private String problemStatement;

    @NotNull
    @Column(name = "goals", nullable = false, length = 2000)
    private String goals;

    @NotNull
    @Column(name = "\"references\"", nullable = false, length = 2000)
    private String references;

    @Column(name = "closed_at")
    private Instant closedAt;

    @UpdateTimestamp
    @NotNull
    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    @CreationTimestamp
    @NotNull
    @Column(name = "created_at", nullable = false)
    private Instant createdAt;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "created_by", nullable = false)
    private User createdBy;

    @OneToMany(mappedBy = "topic", fetch = FetchType.EAGER)
    private Set<TopicRole> roles = new HashSet<>();
}