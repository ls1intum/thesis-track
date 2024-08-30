package thesistrack.ls1.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.annotations.UpdateTimestamp;
import org.hibernate.type.SqlTypes;

import java.time.Instant;
import java.util.*;

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
    @Column(name = "title", nullable = false)
    private String title;

    @JdbcTypeCode(SqlTypes.ARRAY)
    @Column(name = "thesis_types", columnDefinition = "text[]")
    private Set<String> thesisTypes = new HashSet<>();

    @NotNull
    @Column(name = "problem_statement", nullable = false)
    private String problemStatement;

    @NotNull
    @Column(name = "goals", nullable = false)
    private String goals;

    @NotNull
    @Column(name = "\"references\"", nullable = false)
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
    @OrderBy("position ASC")
    private List<TopicRole> roles = new ArrayList<>();
}